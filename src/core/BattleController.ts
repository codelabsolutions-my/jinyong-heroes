import { Container } from "pixi.js";
import type { Input } from "./Input";
import { BattleScene, type BattleOverlay } from "@/scenes/BattleScene";
import { BattleMenu, type MenuItem } from "@/ui/BattleMenu";
import { makeRng, type Rng } from "@/game/rng";
import { autoTurnActions } from "@/game/battle/ai";
import { coordKey, reachableTiles, targetsInRange } from "@/game/battle/range";
import { basicAttackTargets, resolve } from "@/game/battle/resolve";
import {
  BASIC_ATTACK,
  type BattleAction,
  type BattleState,
  type Combatant,
  type Coord,
  type SkillRuntime,
  combatantById,
} from "@/game/battle/types";

type Phase =
  | "selectMove"
  | "actionMenu"
  | "skillMenu"
  | "selectTarget"
  | "autoTurn"
  | "ending";

const AUTO_STEP_MS = 420; // 自动行动（敌方/战友军）每步停顿，便于观看
const END_HOLD_MS = 1200; // 胜负横幅停留后再交还控制权

/**
 * 战斗交互总控（core 层胶水）：持有战斗渲染与菜单、活的注入式 RNG，
 * 驱动我方回合的选格/选招/选敌子状态机，并自动播放敌方回合。
 * 规则全在 game/battle（纯函数）；这里只做输入路由与呈现。
 */
export class BattleController {
  readonly view: Container;

  private state: BattleState;
  private readonly rng: Rng;
  private readonly scene: BattleScene;
  private readonly menu: BattleMenu;

  private phase: Phase = "selectMove";
  private cursor: Coord = { x: 0, y: 0 };
  private reachable = new Set<string>();
  private targets: Combatant[] = [];
  private targetIdx = 0;
  private pendingSkill: SkillRuntime = BASIC_ATTACK;
  private timer = 0;
  /** 玩家亲自操控的单位 id（通常是出战队伍）；其余 ally 单位（战友军）走友方 AI。 */
  private readonly playerIds: Set<string>;

  constructor(
    private readonly input: Input,
    initial: BattleState,
    screenWidth: number,
    screenHeight: number,
    playerIds: string[] = [],
  ) {
    this.state = initial;
    this.playerIds = new Set(playerIds);
    this.rng = makeRng(initial.seed);
    this.view = new Container();
    this.scene = new BattleScene(initial, screenWidth, screenHeight);
    this.menu = new BattleMenu(screenWidth, screenHeight);
    this.view.addChild(this.scene.view, this.menu.view);
    this.dispatchTurn();
    this.renderFrame();
  }

  /** 战斗结束且胜负横幅停留完毕后返回 outcome；否则 null（Game 据此交还控制权）。 */
  get result(): "victory" | "defeat" | null {
    const outcome = this.state.outcome;
    if (this.phase === "ending" && this.timer <= 0 && outcome !== "ongoing") {
      return outcome;
    }
    return null;
  }

  update(deltaMS: number): void {
    if (this.phase === "ending") {
      this.timer -= deltaMS;
      this.renderFrame();
      return;
    }
    if (this.phase === "autoTurn") {
      this.timer -= deltaMS;
      if (this.timer <= 0) {
        this.runAutoTurn();
      }
      this.renderFrame();
      return;
    }
    // 我方交互
    switch (this.phase) {
      case "selectMove":
        this.updateSelectMove();
        break;
      case "actionMenu":
        this.updateActionMenu();
        break;
      case "skillMenu":
        this.updateSkillMenu();
        break;
      case "selectTarget":
        this.updateSelectTarget();
        break;
    }
    this.renderFrame();
  }

  // ── 回合分派 ──

  private active(): Combatant | null {
    return this.state.activeId
      ? (combatantById(this.state, this.state.activeId) ?? null)
      : null;
  }

  private dispatchTurn(): void {
    if (this.state.outcome !== "ongoing") {
      this.phase = "ending";
      this.timer = END_HOLD_MS;
      this.menu.close();
      return;
    }
    const active = this.active();
    if (!active) return;
    // 玩家亲操的 ally 单位 → 交互回合；敌方与战友军(非玩家 ally) → 自动回合
    if (active.side === "ally" && this.playerIds.has(active.id)) {
      this.beginPlayerTurn(active);
    } else {
      this.phase = "autoTurn";
      this.timer = AUTO_STEP_MS;
      this.menu.close();
    }
  }

  private beginPlayerTurn(active: Combatant): void {
    this.phase = "selectMove";
    this.cursor = { x: active.x, y: active.y };
    this.reachable = reachableTiles(this.state, active);
    this.menu.close();
  }

  private runAutoTurn(): void {
    // side 无关：敌方与战友军都走确定性自动 AI（attack 对方阵营）
    const actions = autoTurnActions(this.state);
    for (const action of actions) {
      this.state = resolve(this.state, action, this.rng);
      if (this.state.outcome !== "ongoing") break;
    }
    this.dispatchTurn();
    if (this.phase === "autoTurn") this.timer = AUTO_STEP_MS;
  }

  // ── 我方子状态 ──

  private updateSelectMove(): void {
    const active = this.active();
    if (!active) return;
    this.moveCursorWithin(this.reachable);
    if (this.input.takePress("Space", "Enter")) {
      if (this.cursor.x !== active.x || this.cursor.y !== active.y) {
        this.state = resolve(
          this.state,
          { type: "move", to: { ...this.cursor } },
          this.rng,
        );
      }
      this.openActionMenu();
    }
  }

  private openActionMenu(): void {
    const active = this.active();
    if (!active) return;
    const hasBasicTarget = basicAttackTargets(this.state).length > 0;
    const items: MenuItem[] = [
      { key: "attack", label: "攻击", disabled: !hasBasicTarget },
    ];
    if (active.skills.length > 0) {
      items.push({ key: "skill", label: "武学" });
    }
    items.push({ key: "wait", label: "待机" });
    this.menu.open(items);
    this.phase = "actionMenu";
  }

  private updateActionMenu(): void {
    if (this.input.takePress("ArrowUp", "KeyW")) this.menu.move(-1);
    if (this.input.takePress("ArrowDown", "KeyS")) this.menu.move(1);
    if (this.input.takePress("Space", "Enter")) {
      const item = this.menu.current();
      if (!item) return;
      if (item.key === "attack") {
        this.enterTargeting(BASIC_ATTACK);
      } else if (item.key === "skill") {
        this.openSkillMenu();
      } else if (item.key === "wait") {
        this.commitAction({ type: "wait" });
      }
    }
  }

  private openSkillMenu(): void {
    const active = this.active();
    if (!active || !this.state.activeId) return;
    const activeId = this.state.activeId;
    const items: MenuItem[] = active.skills.map((s) => {
      const noMp = active.mp < s.mpCost;
      const noTarget =
        targetsInRange(this.state, activeId, s.range).length === 0;
      return {
        key: s.id,
        // 禁用原因标出来，避免"按了没反应"（内力不足 / 射程内无敌）
        label:
          `${s.name}（内力 ${s.mpCost}）` +
          (noMp ? " 内力不足" : noTarget ? " 无目标" : ""),
        disabled: noMp || noTarget,
      };
    });
    items.push({ key: "back", label: "返回" });
    this.menu.open(items);
    this.phase = "skillMenu";
  }

  private updateSkillMenu(): void {
    if (this.input.takePress("ArrowUp", "KeyW")) this.menu.move(-1);
    if (this.input.takePress("ArrowDown", "KeyS")) this.menu.move(1);
    if (this.input.takePress("Escape")) {
      this.openActionMenu();
      return;
    }
    if (this.input.takePress("Space", "Enter")) {
      const item = this.menu.current();
      if (!item) return;
      if (item.key === "back") {
        this.openActionMenu();
        return;
      }
      const active = this.active();
      const skill = active?.skills.find((s) => s.id === item.key);
      if (skill) this.enterTargeting(skill);
    }
  }

  private enterTargeting(skill: SkillRuntime): void {
    if (!this.state.activeId) return;
    const targets = targetsInRange(
      this.state,
      this.state.activeId,
      skill.range,
    );
    if (targets.length === 0) return; // 无目标：留在原菜单
    this.pendingSkill = skill;
    this.targets = targets;
    this.targetIdx = 0;
    this.phase = "selectTarget";
    this.menu.close();
  }

  private updateSelectTarget(): void {
    if (this.input.takePress("ArrowDown", "ArrowRight", "KeyS", "KeyD")) {
      this.targetIdx = (this.targetIdx + 1) % this.targets.length;
    }
    if (this.input.takePress("ArrowUp", "ArrowLeft", "KeyW", "KeyA")) {
      this.targetIdx =
        (this.targetIdx - 1 + this.targets.length) % this.targets.length;
    }
    if (this.input.takePress("Escape")) {
      this.openActionMenu();
      return;
    }
    if (this.input.takePress("Space", "Enter")) {
      const target = this.targets[this.targetIdx];
      if (!target) return;
      if (this.pendingSkill === BASIC_ATTACK) {
        this.commitAction({ type: "attack", targetId: target.id });
      } else {
        this.commitAction({
          type: "skill",
          skillId: this.pendingSkill.id,
          targetId: target.id,
        });
      }
    }
  }

  private commitAction(action: BattleAction): void {
    this.state = resolve(this.state, action, this.rng);
    this.dispatchTurn();
  }

  // ── 光标 ──

  private moveCursorWithin(allowed: Set<string>): void {
    const tryMove = (dx: number, dy: number) => {
      const nx = this.cursor.x + dx;
      const ny = this.cursor.y + dy;
      if (allowed.has(coordKey(nx, ny))) this.cursor = { x: nx, y: ny };
    };
    if (this.input.takePress("ArrowUp", "KeyW")) tryMove(0, -1);
    if (this.input.takePress("ArrowDown", "KeyS")) tryMove(0, 1);
    if (this.input.takePress("ArrowLeft", "KeyA")) tryMove(-1, 0);
    if (this.input.takePress("ArrowRight", "KeyD")) tryMove(1, 0);
  }

  // ── 渲染 ──

  private renderFrame(): void {
    const overlay: BattleOverlay = { banner: this.bannerText() };
    if (this.phase === "selectMove") {
      overlay.reachable = this.reachable;
      overlay.cursor = this.cursor;
    } else if (this.phase === "selectTarget") {
      overlay.targetTiles = this.targets.map((t) => ({ x: t.x, y: t.y }));
      const t = this.targets[this.targetIdx];
      if (t) overlay.cursor = { x: t.x, y: t.y };
    }
    this.scene.render(this.state, overlay);
  }

  private bannerText(): string {
    if (this.phase === "ending") {
      return this.state.outcome === "victory" ? "战斗胜利！" : "战败……";
    }
    const active = this.active();
    const who =
      this.phase === "autoTurn"
        ? active?.side === "ally"
          ? "战友行动"
          : "敌方行动"
        : "我方行动";
    const hint =
      this.phase === "selectMove"
        ? "　方向键选位 · 空格确认"
        : this.phase === "selectTarget"
          ? "　方向键选敌 · 空格出手 · Esc 返回"
          : "";
    return `第 ${this.state.round} 回合 · ${who}${hint}`;
  }

  /** e2e / 调试探针用：当前战斗快照摘要 */
  debugSnapshot() {
    const active = this.active();
    return {
      round: this.state.round,
      outcome: this.state.outcome,
      phase: this.phase,
      activeId: this.state.activeId,
      activeSide: active?.side ?? null,
      // 是否轮到玩家亲操（e2e 据此决定何时发按键）
      playerTurn:
        active != null &&
        active.side === "ally" &&
        this.playerIds.has(active.id),
      canAttack: basicAttackTargets(this.state).length > 0,
      combatants: this.state.combatants.map((c) => ({
        id: c.id,
        side: c.side,
        hp: c.hp,
        maxHp: c.maxHp,
      })),
    };
  }
}
