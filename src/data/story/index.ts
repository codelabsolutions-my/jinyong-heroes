import type { StoryEvent } from "@/game/story/types";
import { shediaoLine } from "./shediao";
import { yuanyangLine } from "./yuanyang";
import { endingFirstArc } from "./ending";

/**
 * 全部剧情事件（数据）。selectTriggeredEvent 按顺序取第一个可触发且未完成的。
 * 加一条剧情线 = 在这里 push 一个 StoryEvent，不改 runner（ADR #3）。
 */
// 结局事件（minBooks:2）注册在末位：selectTriggeredEvent 顺序取，剧情线优先，
// 集齐两部天书后才轮到结局触发。
export const STORY_EVENTS: StoryEvent[] = [
  shediaoLine,
  yuanyangLine,
  endingFirstArc,
];

export const STORY_BY_ID: Record<string, StoryEvent> = Object.fromEntries(
  STORY_EVENTS.map((e) => [e.id, e]),
);
