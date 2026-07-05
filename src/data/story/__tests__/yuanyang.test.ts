import { describe, expect, it } from "vitest";
import { newGame, setFlag, type GameState } from "@/game/state";
import {
  collectStepRefs,
  runEvent,
  selectTriggeredEvent,
  startEvent,
} from "@/game/story/runner";
import type {
  StoryEffect,
  StoryEvent,
  StoryInput,
  StoryYield,
} from "@/game/story/types";
import { ENCOUNTERS } from "@/data/battles";
import { DIALOGUES } from "@/data/dialogues";
import { yuanyangLine } from "../yuanyang";
import { STORY_EVENTS, STORY_BY_ID } from "../index";

function playStory(
  event: StoryEvent,
  state: GameState,
  policy: (y: StoryYield) => StoryInput,
): { effects: StoryEffect[]; yields: StoryYield[] } {
  let run = startEvent(event);
  const effects: StoryEffect[] = [];
  const yields: StoryYield[] = [];
  let res = runEvent(event, state, run);
  for (let guard = 0; guard < 300; guard++) {
    yields.push(res.yield);
    effects.push(...res.effects);
    run = res.run;
    if (res.yield.kind === "end") break;
    res = runEvent(event, state, run, policy(res.yield));
  }
  return { effects, yields };
}

/** 全胜 + 指定处置选项（0=放走 / 1=扭送）。 */
const winWith =
  (choiceOption: number) =>
  (y: StoryYield): StoryInput => {
    if (y.kind === "battle") return { type: "battle", outcome: "victory" };
    if (y.kind === "choice") return { type: "choice", option: choiceOption };
    return undefined;
  };

describe("鸳鸯刀线 — 引用完整性", () => {
  it("注册进 STORY_EVENTS 且可按 id 查", () => {
    expect(STORY_EVENTS).toContain(yuanyangLine);
    expect(STORY_BY_ID["yuanyang-line"]).toBe(yuanyangLine);
  });

  it("跳转目标都指向存在的 step id", () => {
    const ids = new Set(
      yuanyangLine.steps.map((s) => s.id).filter((x): x is string => !!x),
    );
    for (const ref of collectStepRefs(yuanyangLine)) {
      expect(ids.has(ref), `坏跳转 ${ref}`).toBe(true);
    }
  });

  it("battle/dialogue 引用都存在", () => {
    for (const step of yuanyangLine.steps) {
      if (step.kind === "battle") {
        expect(
          ENCOUNTERS[step.battleId],
          `未知遭遇 ${step.battleId}`,
        ).toBeDefined();
      } else if (step.kind === "dialogue") {
        expect(
          DIALOGUES[step.dialogueId],
          `未知对话 ${step.dialogueId}`,
        ).toBeDefined();
      }
    }
  });
});

describe("鸳鸯刀线 — 触发与两条抉择", () => {
  it("未点火不触发，置 yy-start 后可触发", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    // 注意 shediao 也在 STORY_EVENTS，但其 trigger 需 sd-line-start，未置
    setFlag(state, "yy-start");
    expect(selectTriggeredEvent(STORY_EVENTS, state)?.id).toBe("yuanyang-line");
  });

  it("放走（option 0）：+8 侠名，拿天书鸳鸯刀，yy-kind/yy-done", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    const { effects } = playStory(yuanyangLine, state, winWith(0));
    expect(effects).toContainEqual({
      type: "grantBook",
      bookId: "book-yuanyang",
    });
    expect(effects).toContainEqual({ type: "adjustMorality", delta: 8 });
    expect(effects).not.toContainEqual({ type: "adjustMorality", delta: -5 });
    expect(state.flags["yy-kind"]).toBe(true);
    expect(state.flags["yy-turnin"]).toBeUndefined();
    expect(state.flags["yy-done"]).toBe(true);
  });

  it("扭送（option 1）：-5 侠名，仍拿天书，yy-turnin/yy-done", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    const { effects } = playStory(yuanyangLine, state, winWith(1));
    expect(effects).toContainEqual({
      type: "grantBook",
      bookId: "book-yuanyang",
    });
    expect(effects).toContainEqual({ type: "adjustMorality", delta: -5 });
    expect(effects).not.toContainEqual({ type: "adjustMorality", delta: 8 });
    expect(state.flags["yy-turnin"]).toBe(true);
    expect(state.flags["yy-kind"]).toBeUndefined();
    expect(state.flags["yy-done"]).toBe(true);
  });

  it("第一场教学战战败会回炉重来", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    let taiyueSeen = 0;
    const policy = (y: StoryYield): StoryInput => {
      if (y.kind === "choice") return { type: "choice", option: 0 };
      if (y.kind === "battle") {
        if (y.battleId === "yy-taiyue") {
          taiyueSeen++;
          return {
            type: "battle",
            outcome: taiyueSeen === 1 ? "defeat" : "victory",
          };
        }
        return { type: "battle", outcome: "victory" };
      }
      return undefined;
    };
    playStory(yuanyangLine, state, policy);
    expect(taiyueSeen).toBeGreaterThanOrEqual(2);
    expect(state.flags["yy-done"]).toBe(true);
  });
});
