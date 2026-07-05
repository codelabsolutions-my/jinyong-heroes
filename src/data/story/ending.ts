import type { StoryEvent } from "@/game/story/types";

/**
 * 「纵向切片」结局事件（M5，ADR #33）：集齐两部天书（射雕 + 鸳鸯刀）即触发。
 * trigger `minBooks: 2` 只在两条线都通关后成立，故不会早触发；注册在 STORY_EVENTS 末位。
 * 完成后经 `end` 步置 eventDoneFlag，不重复触发（selectTriggeredEvent 去重）。
 *
 * 这是第一个"能通关"的结局：从新游戏 → 射雕线 + 鸳鸯刀线 → 集齐 2 天书 → 本结局。
 */
export const endingFirstArc: StoryEvent = {
  id: "ending-first-arc",
  trigger: { minBooks: 2 },
  steps: [{ kind: "ending", endingId: "jianghu-chucheng" }, { kind: "end" }],
};
