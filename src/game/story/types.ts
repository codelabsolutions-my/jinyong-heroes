import type { Condition } from "../conditions";

/**
 * 声明式剧情事件链（NEXT_STEPS §2.1）。
 *
 * M1 的对话只能线性播一段 + 末尾发 effect；M3 需要**多步、可分支、跨章**的剧情：
 * 一个 StoryEvent 由若干 Step 组成，runner（纯逻辑，零 Pixi）推进 step 指针，
 * 遇到需要外部交互的 step（对话/选择/战斗）就"让出"，由 Game 驱动 UI，再回喂结果。
 *
 * 内容即数据（CLAUDE.md §5.2 / ADR #3）：事件数据放 `src/data/story/`，
 * 加一条剧情线不改 runner。跳转目标（goto / choice.goto / battle.onWin/onLose）
 * 用 step 的 `id` 寻址，不用数组下标——插入/重排 step 不会错位。
 */

/** 一步剧情。`id` 是可选标签，供 goto / choice / battle 分支跳转寻址。 */
export type StoryStep =
  | { kind: "dialogue"; id?: string; dialogueId: string }
  | { kind: "choice"; id?: string; prompt?: string; options: StoryChoice[] }
  | {
      kind: "battle";
      id?: string;
      battleId: string;
      /** 胜利跳转到的 step id；省略则顺序进入下一步 */
      onWin?: string;
      /** 战败跳转到的 step id；省略则顺序进入下一步（"打不过也能过"用得上） */
      onLose?: string;
    }
  | { kind: "setFlag"; id?: string; flag: string }
  | { kind: "grantClue"; id?: string; clueId: string }
  | { kind: "grantBook"; id?: string; bookId: string }
  | { kind: "gainExp"; id?: string; amount: number }
  | { kind: "learnSkill"; id?: string; skillId: string; who?: string }
  | { kind: "recruit"; id?: string; charId: string }
  | { kind: "switchMap"; id?: string; mapId: string; x: number; y: number }
  | { kind: "adjustMorality"; id?: string; delta: number }
  | { kind: "goto"; id?: string; target: string }
  | { kind: "ending"; id?: string; endingId: string }
  | { kind: "end"; id?: string };

/** choice 的一个分支：条件不满足则该项对玩家不可选。 */
export interface StoryChoice {
  label: string;
  when?: Condition;
  /** 选中后跳转到的 step id */
  goto: string;
}

export interface StoryEvent {
  id: string;
  /** 触发条件；省略即恒可触发 */
  trigger?: Condition;
  steps: StoryStep[];
}

/**
 * runner 产出的副作用（数据，由 Game 应用）。
 * setFlag/grantClue 因为要影响同一事件内后续 Condition 判断，runner 会**当场应用**到
 * state（沿用 dialogue.ts 直接改 state 的先例），同时也列在这里给 UI 反应（如弹提示）。
 * grantBook/gainExp/learnSkill 只列出，交由 Game 在奖励系统落地时应用（M3 §2.3）。
 */
export type StoryEffect =
  | { type: "setFlag"; flag: string }
  | { type: "grantClue"; clueId: string }
  | { type: "grantBook"; bookId: string }
  | { type: "gainExp"; amount: number }
  | { type: "learnSkill"; skillId: string; who?: string }
  | { type: "recruit"; charId: string }
  | { type: "switchMap"; mapId: string; x: number; y: number }
  | { type: "adjustMorality"; delta: number };

/** runner 让出时告诉 Game 现在该做什么。 */
export type StoryYield =
  | { kind: "dialogue"; dialogueId: string }
  | { kind: "choice"; prompt?: string; options: StoryChoiceOption[] }
  | { kind: "battle"; battleId: string }
  | { kind: "ending"; endingId: string }
  | { kind: "end" };

/** 让给 UI 的一个可选项：只包含当前条件下**可选**的分支，附原始下标供回喂。 */
export interface StoryChoiceOption {
  label: string;
  /** 在 event.steps[cursor].options 里的原始下标，选择时回喂这个值 */
  option: number;
}

/** 战斗结果（与 battle 层 BattleOutcome 的成功态对齐）。 */
export type StoryBattleOutcome = "victory" | "defeat";

/** Game 回喂给 runner 的输入：继续（对话看完）/ 选择 / 战斗结果。 */
export type StoryInput =
  | undefined
  | { type: "choice"; option: number }
  | { type: "battle"; outcome: StoryBattleOutcome };

/**
 * 事件播放的可序列化游标。`awaiting` 记录当前停在哪种交互 step 上，
 * 决定下一次 runEvent 如何消费输入。
 */
export interface StoryRunState {
  eventId: string;
  cursor: number;
  done: boolean;
  awaiting: null | "dialogue" | "choice" | "battle" | "ending";
}

/** runEvent 的返回：新游标 + 本次产生的副作用 + 现在让 UI 做什么。 */
export interface StoryStepResult {
  run: StoryRunState;
  effects: StoryEffect[];
  yield: StoryYield;
}
