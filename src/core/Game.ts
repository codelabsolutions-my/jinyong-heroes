import { Container } from "pixi.js";
import type { Input } from "./Input";
import { BattleController } from "./BattleController";
import { ExplorationScene } from "@/scenes/ExplorationScene";
import { DialogueBox } from "@/ui/DialogueBox";
import { HintBar } from "@/ui/HintBar";
import { JournalPanel } from "@/ui/JournalPanel";
import { Toast } from "@/ui/Toast";
import { CLUES } from "@/data/clues";
import { DIALOGUES } from "@/data/dialogues";
import { NPCS } from "@/data/npcs";
import { CHARACTERS } from "@/data/characters";
import { SKILLS } from "@/data/skills";
import { ENCOUNTERS } from "@/data/battles";
import { MAPS, START_MAP_ID, getMap } from "@/data/maps";
import { exitAt } from "@/data/maps/types";
import { canEnter } from "@/game/movement";
import { setupBattle } from "@/game/battle/setup";
import {
  type ActiveDialogue,
  advanceDialogue,
  currentLine,
  startDialogue,
} from "@/game/dialogue";
import { SaveLoadError, type KVStorage, loadGame, saveGame } from "@/game/save";
import { type GameState, newGame, setFlag } from "@/game/state";

export type GameMode = "explore" | "dialogue" | "journal" | "battle";

/** 胜利后置的 flag 约定（对话变体据此不再重复触发同一场战斗） */
export const battleWonFlag = (battleId: string): string =>
  `battle-won:${battleId}`;

const EXPLORE_HINT = "空格 对话 · J 日志 · K 存档 · L 读档";

/**
 * 游戏总控：持有 GameState、场景与 UI，按模式路由输入。
 * 渲染层读状态；状态变更全部走 game/ 层的函数（CLAUDE.md §5.1）。
 */
export class Game {
  readonly view: Container;

  state: GameState;
  mode: GameMode = "explore";

  private scene!: ExplorationScene;
  private readonly worldSlot = new Container();
  private readonly dialogueBox: DialogueBox;
  private readonly journal: JournalPanel;
  private readonly toast: Toast;
  private readonly hintBar: HintBar;
  private activeDialogue: ActiveDialogue | null = null;
  private battle: BattleController | null = null;
  private battleId: string | null = null;

  constructor(
    private readonly input: Input,
    private readonly storage: KVStorage,
    private readonly screenWidth: number,
    private readonly screenHeight: number,
  ) {
    const startMap = getMap(START_MAP_ID);
    this.state = newGame({
      mapId: startMap.id,
      x: startMap.spawn.x,
      y: startMap.spawn.y,
    });

    this.view = new Container();
    this.dialogueBox = new DialogueBox(screenWidth, screenHeight);
    this.journal = new JournalPanel(screenWidth, screenHeight);
    this.toast = new Toast(screenWidth);
    this.hintBar = new HintBar(screenWidth, screenHeight);
    this.hintBar.set(EXPLORE_HINT);

    this.view.addChild(
      this.worldSlot,
      this.hintBar.view,
      this.dialogueBox.view,
      this.journal.view,
      this.toast.view,
    );

    this.rebuildScene();
  }

  /** 按当前 state.player 重建地图场景（切图/读档共用） */
  private rebuildScene() {
    this.worldSlot.removeChildren();
    const { mapId, x, y, facing } = this.state.player;
    this.scene = new ExplorationScene(
      getMap(mapId),
      x,
      y,
      facing,
      this.screenWidth,
      this.screenHeight,
    );
    this.worldSlot.addChild(this.scene.view);
  }

  update(deltaMS: number) {
    // 探索场景的到格/出口检查只在非战斗模式跑（战斗时主角不在大地图上移动）。
    if (this.mode !== "battle") {
      const arrived = this.scene.update(deltaMS);
      if (arrived) {
        this.syncPlayerState();
        const exit = exitAt(
          this.scene.map,
          this.scene.player.gridX,
          this.scene.player.gridY,
        );
        if (exit) {
          this.switchMap(exit.toMap, exit.toX, exit.toY);
        }
      }
    }

    switch (this.mode) {
      case "explore":
        this.updateExplore();
        break;
      case "dialogue":
        this.updateDialogue();
        break;
      case "journal":
        this.updateJournal();
        break;
      case "battle":
        this.updateBattle(deltaMS);
        break;
    }
    this.toast.update(deltaMS);
    this.input.endFrame();
  }

  private updateExplore() {
    const moving = this.scene.player.isMoving;

    const dir = this.input.direction;
    if (dir && !moving) {
      this.scene.tryMove(dir);
      this.syncPlayerState();
    }

    // 功能键只在站定时生效：移动中存档会把"半步"写进档，
    // 移动中开菜单会把到格/出口检查挤到别的模式里。
    if (moving) return;

    if (this.input.takePress("Space", "Enter")) {
      this.tryStartDialogue();
    } else if (this.input.takePress("KeyJ")) {
      this.journal.open(this.state, CLUES);
      this.mode = "journal";
      this.hintBar.set("J / Esc 关闭");
    } else if (this.input.takePress("KeyK")) {
      saveGame(this.storage, this.state);
      this.toast.show("已存档");
    } else if (this.input.takePress("KeyL")) {
      this.loadFromStorage();
    }
  }

  private updateDialogue() {
    if (!this.activeDialogue) return;

    if (this.input.takePress("Space", "Enter")) {
      const result = advanceDialogue(this.state, this.activeDialogue);
      if (result.done) {
        this.dialogueBox.hide();
        this.activeDialogue = null;
        if (result.newClues.length > 0) {
          const titles = result.newClues
            .map((id) => CLUES[id]?.title ?? id)
            .join("、");
          this.toast.show(`获得线索：「${titles}」`);
        }
        if (result.startBattle) {
          this.enterBattle(result.startBattle);
        } else {
          this.mode = "explore";
          this.hintBar.set(EXPLORE_HINT);
        }
      } else {
        const line = currentLine(this.activeDialogue);
        this.dialogueBox.show(line.speaker, line.text);
      }
    }
  }

  private updateBattle(deltaMS: number) {
    if (!this.battle) return;
    this.battle.update(deltaMS);
    const outcome = this.battle.result;
    if (outcome) this.endBattle(outcome);
  }

  private enterBattle(battleId: string) {
    const encounter = ENCOUNTERS[battleId];
    if (!encounter) {
      // 数据完整性由 content.test 保证；运行时容错回探索
      this.mode = "explore";
      this.hintBar.set(EXPLORE_HINT);
      return;
    }
    const player = CHARACTERS["player"]!;
    try {
      const state = setupBattle({
        encounter,
        party: [player],
        characterTable: CHARACTERS,
        skillTable: SKILLS,
        seed: Math.floor(Math.random() * 0x7fffffff),
      });
      this.battle = new BattleController(
        this.input,
        state,
        this.screenWidth,
        this.screenHeight,
      );
    } catch (err) {
      // 遭遇数据有坏链（应被 content.test 拦下）；运行时兜底回探索，不冻死循环
      console.error("battle setup failed", err);
      this.mode = "explore";
      this.hintBar.set(EXPLORE_HINT);
      return;
    }
    this.battleId = battleId;

    // 隐藏探索层，显示战斗层（toast 保持在最上）
    this.worldSlot.visible = false;
    this.hintBar.view.visible = false;
    this.view.addChild(this.battle.view);
    this.view.setChildIndex(this.toast.view, this.view.children.length - 1);
    this.mode = "battle";
  }

  private endBattle(outcome: "victory" | "defeat") {
    if (this.battle) {
      this.view.removeChild(this.battle.view);
      this.battle = null;
    }
    this.worldSlot.visible = true;
    this.hintBar.view.visible = true;
    this.hintBar.set(EXPLORE_HINT);
    this.mode = "explore";

    if (outcome === "victory") {
      if (this.battleId) setFlag(this.state, battleWonFlag(this.battleId));
      this.toast.show("旗开得胜！");
    } else {
      // 战败：**不动存档、不重置进度**——退回探索原地，玩家可再挑战（胜利 flag 未置）。
      // 战败读档/死亡惩罚等留到 M3（有持久队伍状态时再设计），避免这里静默丢档。
      this.toast.show("战败……重整旗鼓，再来！");
    }
    this.battleId = null;
  }

  private updateJournal() {
    if (this.input.takePress("KeyJ", "Escape")) {
      this.journal.close();
      this.mode = "explore";
      this.hintBar.set(EXPLORE_HINT);
    }
  }

  private tryStartDialogue() {
    const placement = this.scene.npcInFront();
    if (!placement) return;
    const npc = NPCS[placement.npcId];
    const dialogue = npc && DIALOGUES[npc.dialogueId];
    if (!dialogue) return;

    this.activeDialogue = startDialogue(this.state, dialogue);
    const line = currentLine(this.activeDialogue);
    this.dialogueBox.show(line.speaker, line.text);
    this.mode = "dialogue";
    this.hintBar.set("空格 继续");
  }

  private switchMap(mapId: string, x: number, y: number) {
    this.state.player.mapId = mapId;
    this.state.player.x = x;
    this.state.player.y = y;
    this.rebuildScene();
    this.toast.show(`—— ${getMap(mapId).name} ——`);
  }

  /** 存档指向的位置必须在当前世界里落得了脚（地图存在、可走、没被 NPC 占） */
  private readonly worldCheck = (state: GameState): string | null => {
    const map = MAPS[state.player.mapId];
    if (!map) return `存档指向未知地图（${state.player.mapId}），无法读取`;
    if (!canEnter(map, state.player.x, state.player.y)) {
      return "存档位置在当前版本地图上无法站立，无法读取";
    }
    return null;
  };

  private loadFromStorage() {
    try {
      const loaded = loadGame(this.storage, this.worldCheck);
      if (!loaded) {
        this.toast.show("没有存档");
        return;
      }
      this.state = loaded;
      this.rebuildScene();
      this.toast.show("已读档");
    } catch (err) {
      if (err instanceof SaveLoadError) {
        this.toast.show(err.message);
      } else {
        throw err;
      }
    }
  }

  private syncPlayerState() {
    this.state.player.x = this.scene.player.gridX;
    this.state.player.y = this.scene.player.gridY;
    this.state.player.facing = this.scene.player.facing;
  }

  /** e2e / 调试探针：当前战斗快照（非战斗时为 null） */
  battleSnapshot() {
    return this.battle?.debugSnapshot() ?? null;
  }
}
