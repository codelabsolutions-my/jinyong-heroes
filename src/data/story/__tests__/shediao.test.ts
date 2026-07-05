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
import { shediaoLine } from "../shediao";
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
  for (let guard = 0; guard < 200; guard++) {
    yields.push(res.yield);
    effects.push(...res.effects);
    run = res.run;
    if (res.yield.kind === "end") break;
    res = runEvent(event, state, run, policy(res.yield));
  }
  return { effects, yields };
}

const winAll = (y: StoryYield): StoryInput =>
  y.kind === "battle" ? { type: "battle", outcome: "victory" } : undefined;

describe("射雕线 story — 引用完整性", () => {
  it("注册进 STORY_EVENTS 且可按 id 查", () => {
    expect(STORY_EVENTS).toContain(shediaoLine);
    expect(STORY_BY_ID["shediao-line"]).toBe(shediaoLine);
  });

  it("所有跳转目标(goto/onWin/onLose)都指向存在的 step id", () => {
    const ids = new Set(
      shediaoLine.steps.map((s) => s.id).filter((x): x is string => !!x),
    );
    for (const ref of collectStepRefs(shediaoLine)) {
      expect(ids.has(ref), `坏跳转目标 ${ref}`).toBe(true);
    }
  });

  it("battle step 的 battleId 都在 ENCOUNTERS", () => {
    for (const step of shediaoLine.steps) {
      if (step.kind === "battle") {
        expect(
          ENCOUNTERS[step.battleId],
          `未知遭遇 ${step.battleId}`,
        ).toBeDefined();
      }
    }
  });

  it("dialogue step 的 dialogueId 都在 DIALOGUES", () => {
    for (const step of shediaoLine.steps) {
      if (step.kind === "dialogue") {
        expect(
          DIALOGUES[step.dialogueId],
          `未知对话 ${step.dialogueId}`,
        ).toBeDefined();
      }
    }
  });
});

describe("射雕线 story — 触发与走通", () => {
  it("未点火不触发，置 sd-line-start 后可触发", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    expect(selectTriggeredEvent(STORY_EVENTS, state)).toBeUndefined();
    setFlag(state, "sd-line-start");
    expect(selectTriggeredEvent(STORY_EVENTS, state)?.id).toBe("shediao-line");
  });

  it("全胜走通：拿到天书 book-shediao + 历练 + sd-done", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    const { effects, yields } = playStory(shediaoLine, state, winAll);

    expect(yields[yields.length - 1]?.kind).toBe("end");
    expect(effects).toContainEqual({
      type: "grantBook",
      bookId: "book-shediao",
    });
    // 胜利含额外奖励：应有多笔 gainExp（150 + 100 + 250）
    const exp = effects.filter((e) => e.type === "gainExp");
    expect(exp).toHaveLength(3);
    expect(state.flags["sd-done"]).toBe(true);
    expect(state.flags["sd-ch1-done"]).toBe(true);
    // 走完招募郭靖/黄蓉（recruit effect 在主链，由 Game 的 applyStoryEffects 应用）
    expect(effects).toContainEqual({ type: "recruit", charId: "guojing" });
    expect(effects).toContainEqual({ type: "recruit", charId: "huangrong" });
  });

  it("第 1 章战败会回到该战重来，最终仍可走通", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    let huangheSeen = 0;
    const policy = (y: StoryYield): StoryInput => {
      if (y.kind !== "battle") return undefined;
      if (y.battleId === "sd-huanghe") {
        huangheSeen++;
        // 第一次故意战败，之后取胜
        return {
          type: "battle",
          outcome: huangheSeen === 1 ? "defeat" : "victory",
        };
      }
      return { type: "battle", outcome: "victory" };
    };
    const { effects } = playStory(shediaoLine, state, policy);
    expect(huangheSeen).toBeGreaterThanOrEqual(2); // 打了不止一次
    expect(effects).toContainEqual({
      type: "grantBook",
      bookId: "book-shediao",
    });
    expect(state.flags["sd-done"]).toBe(true);
  });

  it("欧阳锋战败也能过：洪七公救场仍授天书（无额外奖励）", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    const policy = (y: StoryYield): StoryInput => {
      if (y.kind !== "battle") return undefined;
      // 黄河四鬼赢，欧阳锋输
      return {
        type: "battle",
        outcome: y.battleId === "sd-ouyangfeng" ? "defeat" : "victory",
      };
    };
    const { effects } = playStory(shediaoLine, state, policy);
    expect(effects).toContainEqual({
      type: "grantBook",
      bookId: "book-shediao",
    });
    expect(state.flags["sd-done"]).toBe(true);
    // 输掉欧阳锋 → 没有那笔 100 的额外奖励，只有 150 + 250
    const exp = effects.filter((e) => e.type === "gainExp");
    expect(exp).toHaveLength(2);
  });
});
