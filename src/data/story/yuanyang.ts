import type { StoryEvent } from "@/game/story/types";

/**
 * 鸳鸯刀线（M4，STORY_BIBLE §2.1，T1 教学线 1 章）。喜剧护镖 + 正邪抉择。
 * 入口=无名小村「镖师」点火 flag `yy-start`。以对话+战斗叠加演出（本线无专属地图，
 * 不 switchMap；地图行走范式见射雕线）。
 *
 * 正邪抉择：战胜太岳四侠后「放走 / 扭送」——放走 +8 侠名、扭送 -5。
 * ⚠️ Game 目前 choice 自动选 option[0]（无选择 UI，M3 遗留），故游戏内默认走「放走」；
 * story 数据两支俱全（runner/单测可验两条），交互选择 UI 是后续 chunk。
 */
export const yuanyangLine: StoryEvent = {
  id: "yuanyang-line",
  trigger: { hasFlag: "yy-start" },
  steps: [
    { kind: "dialogue", dialogueId: "yy-intro" },
    // 官道遇劫（教学战，敌方极弱）
    {
      kind: "battle",
      id: "fight-taiyue",
      battleId: "yy-taiyue",
      onWin: "taiyue-win",
      onLose: "taiyue-lose",
    },
    { kind: "dialogue", id: "taiyue-lose", dialogueId: "yy-taiyue-lose" },
    { kind: "goto", target: "fight-taiyue" },

    // 战胜 → 处置抉择（放走=option0 侠义 / 扭送=option1）
    { kind: "dialogue", id: "taiyue-win", dialogueId: "yy-choice-prompt" },
    {
      kind: "choice",
      id: "decide",
      prompt: "如何处置太岳四侠？",
      options: [
        { label: "侠义放走", goto: "let-go" },
        { label: "扭送官府", goto: "turn-in" },
      ],
    },
    // 放走支：+侠名
    { kind: "dialogue", id: "let-go", dialogueId: "yy-let-go" },
    { kind: "adjustMorality", delta: 8 },
    { kind: "setFlag", flag: "yy-kind" },
    { kind: "goto", target: "to-zhuo" },
    // 扭送支：-侠名，随后 fall-through 到 to-zhuo
    { kind: "dialogue", id: "turn-in", dialogueId: "yy-turn-in" },
    { kind: "adjustMorality", delta: -5 },
    { kind: "setFlag", flag: "yy-turnin" },

    // 汇合：寿宴风波，卓天雄决战
    { kind: "dialogue", id: "to-zhuo", dialogueId: "yy-zhuo-pre" },
    {
      kind: "battle",
      battleId: "yy-zhuo",
      onWin: "zhuo-win",
      onLose: "zhuo-lose",
    },
    { kind: "dialogue", id: "zhuo-lose", dialogueId: "yy-zhuo-lose" },
    { kind: "goto", target: "to-zhuo" },

    // 通关：授天书 + 落幕
    { kind: "gainExp", id: "zhuo-win", amount: 120 },
    { kind: "grantBook", bookId: "book-yuanyang" },
    { kind: "setFlag", flag: "yy-done" },
    { kind: "dialogue", dialogueId: "yy-outro" },
    { kind: "end" },
  ],
};
