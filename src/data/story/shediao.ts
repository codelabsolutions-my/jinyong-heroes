import type { StoryEvent } from "@/game/story/types";

/**
 * 射雕英雄传线（M3 首发线，STORY_BIBLE §2.9，只做第 1、3 章）。
 * 跑通"剧情事件链 → 战斗 → 奖励 → 天书"闭环：
 *   牛家村遇黄河四鬼（第 1 章）→ 华山之巅战欧阳锋（第 3 章，打不过也能过）
 *   → 洪七公授天书 book-shediao → sd-done。
 *
 * 触发靠 flag `sd-line-start`（E1 决定怎么点火：入口 NPC / 地图落点）。
 * dialogue step 引用 data/dialogues 里的对话；battle step 引用 data/battles 的 encounter；
 * 奖励/flag/天书全走 story runner 的 Step（不塞进对话 effect）。
 */
export const shediaoLine: StoryEvent = {
  id: "shediao-line",
  trigger: { hasFlag: "sd-line-start" },
  steps: [
    // —— 第 1 章 · 风雪惊变（牛家村） ——
    { kind: "switchMap", mapId: "niujia-village", x: 3, y: 6 },
    { kind: "dialogue", dialogueId: "sd-intro" },
    {
      kind: "battle",
      id: "fight-huanghe",
      battleId: "sd-huanghe",
      onWin: "huanghe-win",
      onLose: "huanghe-lose",
    },
    // 战败：宽慰一句后回到该战重来（黄河四鬼是常规战，须打赢方能推进）
    { kind: "dialogue", id: "huanghe-lose", dialogueId: "sd-huanghe-lose" },
    { kind: "goto", target: "fight-huanghe" },
    // 战胜：发历练，进第 3 章
    { kind: "gainExp", id: "huanghe-win", amount: 150 },
    { kind: "setFlag", flag: "sd-ch1-done" },

    // —— 第 3 章 · 华山之巅（欧阳锋，打不过也能过） ——
    { kind: "switchMap", mapId: "huashan-summit", x: 3, y: 6 },
    { kind: "dialogue", dialogueId: "sd-huashan-intro" },
    {
      kind: "battle",
      battleId: "sd-ouyangfeng",
      onWin: "ouyang-win-bonus",
      onLose: "hong-rescue",
    },
    // 打赢（歼灭/撑住皆算胜）额外奖励，随后落到洪七公救场
    { kind: "gainExp", id: "ouyang-win-bonus", amount: 100 },
    // 洪七公救场：无论胜负都到这里授天书（"打不过也能过"）
    { kind: "dialogue", id: "hong-rescue", dialogueId: "sd-hong-rescue" },
    { kind: "gainExp", amount: 250 },
    { kind: "grantBook", bookId: "book-shediao" },
    { kind: "setFlag", flag: "sd-done" },
    // 郭靖/黄蓉就此结为同道，入常驻队伍（主链，胜负皆招募）
    { kind: "recruit", charId: "guojing" },
    { kind: "recruit", charId: "huangrong" },
    { kind: "dialogue", dialogueId: "sd-outro" },
    { kind: "end" },
  ],
};
