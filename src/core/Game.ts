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
import { CHARACTERS, type CharacterDef } from "@/data/characters";
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
import { STORY_EVENTS } from "@/data/story";
import { BOOKS } from "@/data/books";
import { applyStoryEffects } from "@/game/progression";
import {
  eventDoneFlag,
  runEvent,
  selectTriggeredEvent,
  startEvent,
} from "@/game/story/runner";
import type {
  StoryEffect,
  StoryEvent,
  StoryInput,
  StoryRunState,
} from "@/game/story/types";

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
  // 剧情事件播放（M3）：非 null 表示正在演一条剧情线
  private storyEvent: StoryEvent | null = null;
  private storyRun: StoryRunState | null = null;
  // 当前战斗是否由剧情驱动（结果要回喂 story，而非走 M1/M2 的 battleWonFlag 路径）
  private storyBattle = false;

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

    // 剧情点火：某入口 flag 满足即自动开演对应剧情线（不重复触发靠 eventDoneFlag）
    if (this.mode === "explore" && this.storyRun === null) {
      const event = selectTriggeredEvent(STORY_EVENTS, this.state);
      if (event) this.beginStory(event);
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
        if (this.storyRun) {
          // 剧情对话演完 → 继续推进剧情事件（下一步可能是对话/战斗/落幕）
          this.advanceStory(undefined);
        } else if (result.startBattle) {
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
    // 出战阵容 = 主角 + 已招募队友（state.party），按 allySpawns 数量截断（超额上不了场）。
    // encounter.allies（剧情战友军）另算，走友方 AI。
    const companions = this.state.party
      .map((id) => CHARACTERS[id])
      .filter((c): c is CharacterDef => c != null);
    const roster = [player, ...companions].slice(
      0,
      encounter.allySpawns.length,
    );
    try {
      const state = setupBattle({
        encounter,
        party: roster,
        characterTable: CHARACTERS,
        skillTable: SKILLS,
        seed: Math.floor(Math.random() * 0x7fffffff),
      });
      this.battle = new BattleController(
        this.input,
        state,
        this.screenWidth,
        this.screenHeight,
        // 出战队伍全部由玩家操控；encounter.allies（剧情战友军）走友方 AI
        roster.map((c) => c.id),
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

    const wasStoryBattle = this.storyBattle;
    this.storyBattle = false;
    const finishedBattleId = this.battleId;
    this.battleId = null;

    if (wasStoryBattle && this.storyEvent && this.storyRun) {
      // 剧情战：把胜负回喂剧情事件，由 story 决定下一步（不置 battleWonFlag）
      this.advanceStory({ type: "battle", outcome });
      return;
    }

    // 非剧情战（M1/M2 路径）
    this.hintBar.set(EXPLORE_HINT);
    this.mode = "explore";
    if (outcome === "victory") {
      if (finishedBattleId)
        setFlag(this.state, battleWonFlag(finishedBattleId));
      this.toast.show("旗开得胜！");
    } else {
      // 战败：**不动存档、不重置进度**——退回探索原地，玩家可再挑战（胜利 flag 未置）。
      this.toast.show("战败……重整旗鼓，再来！");
    }
  }

  // ── 剧情事件播放（M3）──

  private beginStory(event: StoryEvent) {
    this.storyEvent = event;
    this.storyRun = startEvent(event);
    this.advanceStory(undefined);
  }

  /** 推进剧情：应用奖励，按 yield 转到对话/战斗/落幕。 */
  private advanceStory(input: StoryInput) {
    if (!this.storyEvent || !this.storyRun) return;
    const res = runEvent(this.storyEvent, this.state, this.storyRun, input);
    this.storyRun = res.run;
    this.applyStoryResultEffects(res.effects);

    switch (res.yield.kind) {
      case "dialogue":
        this.showStoryDialogue(res.yield.dialogueId);
        break;
      case "battle":
        this.storyBattle = true;
        this.enterBattle(res.yield.battleId);
        if (this.mode !== "battle") {
          // 遭遇启动失败（坏链，应被 content.test 拦下）：安全落幕，不卡死。
          // 必须先置事件完成 flag，否则回到探索后 selectTriggeredEvent 会每帧重触发、
          // 重复发奖，且坏状态被 endStory 存档固化（review 发现的无限重演 bug）。
          this.storyBattle = false;
          if (this.storyEvent) {
            setFlag(this.state, eventDoneFlag(this.storyEvent.id));
          }
          this.endStory();
        }
        break;
      case "choice":
        // M3 射雕线无 choice；出现则自动选第一个可选项，避免卡住（选择 UI 留待后续）
        this.advanceStory({
          type: "choice",
          option: res.yield.options[0]?.option ?? 0,
        });
        break;
      case "end":
        this.endStory();
        break;
    }
  }

  private showStoryDialogue(dialogueId: string) {
    const dialogue = DIALOGUES[dialogueId];
    if (!dialogue) {
      // 坏链（应被测试拦下）：跳过这句，继续推进
      this.advanceStory(undefined);
      return;
    }
    this.activeDialogue = startDialogue(this.state, dialogue);
    const line = currentLine(this.activeDialogue);
    this.dialogueBox.show(line.speaker, line.text);
    this.mode = "dialogue";
    this.hintBar.set("空格 继续");
  }

  private applyStoryResultEffects(effects: StoryEffect[]) {
    if (effects.length === 0) return;
    const report = applyStoryEffects(this.state, effects, { player: "player" });
    for (const bookId of report.books) {
      this.toast.show(`获得天书《${BOOKS[bookId]?.name ?? bookId}》！`);
    }
    for (const charId of report.recruited) {
      this.toast.show(`${CHARACTERS[charId]?.name ?? charId} 加入了队伍！`);
    }
    if (report.switchedMap) {
      // 过场切图：玩家新位置已写入 state.player，重建探索场景
      this.rebuildScene();
      this.toast.show(`—— ${getMap(this.state.player.mapId).name} ——`);
    }
    if (report.moralityDelta > 0) {
      this.toast.show("行侠仗义，侠名远播。");
    } else if (report.moralityDelta < 0) {
      this.toast.show("行事狠辣，恶名在外。");
    }
    if (
      report.books.length === 0 &&
      report.recruited.length === 0 &&
      report.exp.some((e) => e.leveledUp)
    ) {
      this.toast.show("修为精进，等级提升！");
    }
  }

  private endStory() {
    this.storyEvent = null;
    this.storyRun = null;
    this.storyBattle = false;
    this.mode = "explore";
    this.hintBar.set(EXPLORE_HINT);
    saveGame(this.storage, this.state); // 天书/历练进度落盘
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

  /** e2e / 调试探针：是否正在演一条剧情线 */
  get isStoryActive(): boolean {
    return this.storyRun !== null;
  }
}
