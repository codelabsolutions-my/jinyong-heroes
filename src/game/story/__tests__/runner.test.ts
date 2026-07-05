import { describe, expect, it } from "vitest";
import { newGame, setFlag, type GameState } from "../../state";
import {
  collectStepRefs,
  eventDoneFlag,
  runEvent,
  selectTriggeredEvent,
  startEvent,
} from "../runner";
import type {
  StoryEffect,
  StoryEvent,
  StoryInput,
  StoryStepResult,
} from "../types";

function freshState(): GameState {
  return newGame({ mapId: "test", x: 0, y: 0 });
}

/** 把一个事件按脚本输入序列跑到结束，收集每一步的 yield 与全部 effects。 */
function play(
  event: StoryEvent,
  state: GameState,
  inputs: StoryInput[],
): { yields: StoryStepResult["yield"][]; effects: StoryEffect[] } {
  let run = startEvent(event);
  const yields: StoryStepResult["yield"][] = [];
  const effects: StoryEffect[] = [];
  let i = 0;
  // 第一次不带输入；之后依次喂 inputs
  let res = runEvent(event, state, run);
  for (;;) {
    yields.push(res.yield);
    effects.push(...res.effects);
    run = res.run;
    if (run.done || res.yield.kind === "end") break;
    const input = inputs[i++];
    res = runEvent(event, state, run, input);
  }
  return { yields, effects };
}

describe("story runner — 线性推进", () => {
  const event: StoryEvent = {
    id: "linear",
    steps: [
      { kind: "dialogue", dialogueId: "d1" },
      { kind: "setFlag", flag: "met-guo" },
      { kind: "grantClue", clueId: "clue-a" },
      { kind: "end" },
    ],
  };

  it("对话让出后继续，末尾应用 flag/clue 并结束", () => {
    const state = freshState();
    let res = runEvent(event, state, startEvent(event));
    expect(res.yield).toEqual({ kind: "dialogue", dialogueId: "d1" });
    expect(res.run.awaiting).toBe("dialogue");
    expect(res.run.done).toBe(false);

    // 对话看完，continue（无输入）
    res = runEvent(event, state, res.run);
    expect(res.yield.kind).toBe("end");
    expect(res.run.done).toBe(true);
    expect(res.effects).toEqual([
      { type: "setFlag", flag: "met-guo" },
      { type: "grantClue", clueId: "clue-a" },
    ]);
    expect(state.flags["met-guo"]).toBe(true);
    expect(state.clues).toContain("clue-a");
  });

  it("结束时置 done flag，selectTriggeredEvent 不再选中", () => {
    const state = freshState();
    play(event, state, [undefined]);
    expect(state.flags[eventDoneFlag("linear")]).toBe(true);
    expect(selectTriggeredEvent([event], state)).toBeUndefined();
  });
});

describe("story runner — choice 分支", () => {
  const event: StoryEvent = {
    id: "choice-ev",
    steps: [
      {
        kind: "choice",
        id: "ask",
        prompt: "帮不帮？",
        options: [
          { label: "帮（需侠义）", when: { hasFlag: "kind" }, goto: "help" },
          { label: "不帮", goto: "refuse" },
        ],
      },
      { kind: "setFlag", id: "help", flag: "helped" },
      { kind: "goto", target: "done" },
      { kind: "setFlag", id: "refuse", flag: "refused" },
      { kind: "end", id: "done" },
    ],
  };

  it("条件不满足的分支不出现在可选项里", () => {
    const state = freshState();
    const res = runEvent(event, state, startEvent(event));
    expect(res.yield).toEqual({
      kind: "choice",
      prompt: "帮不帮？",
      options: [{ label: "不帮", option: 1 }],
    });
  });

  it("满足条件时两个分支都可选，选中走对应支", () => {
    const state = freshState();
    setFlag(state, "kind");
    let res = runEvent(event, state, startEvent(event));
    expect(res.yield.kind).toBe("choice");
    if (res.yield.kind !== "choice") throw new Error("unreachable");
    expect(res.yield.options).toHaveLength(2);

    res = runEvent(event, state, res.run, { type: "choice", option: 0 });
    expect(res.yield.kind).toBe("end");
    expect(state.flags["helped"]).toBe(true);
    expect(state.flags["refused"]).toBeUndefined();
  });

  it("选另一支走另一条路", () => {
    const state = freshState();
    let res = runEvent(event, state, startEvent(event));
    res = runEvent(event, state, res.run, { type: "choice", option: 1 });
    expect(res.yield.kind).toBe("end");
    expect(state.flags["refused"]).toBe(true);
    expect(state.flags["helped"]).toBeUndefined();
  });
});

describe("story runner — battle 分支", () => {
  const event: StoryEvent = {
    id: "battle-ev",
    steps: [
      { kind: "battle", battleId: "b1", onWin: "win", onLose: "lose" },
      { kind: "grantBook", id: "win", bookId: "book-shediao" },
      { kind: "goto", target: "fin" },
      { kind: "setFlag", id: "lose", flag: "lost-once" },
      { kind: "end", id: "fin" },
    ],
  };

  it("胜利走 onWin", () => {
    const state = freshState();
    let res = runEvent(event, state, startEvent(event));
    expect(res.yield).toEqual({ kind: "battle", battleId: "b1" });
    res = runEvent(event, state, res.run, {
      type: "battle",
      outcome: "victory",
    });
    expect(res.effects).toContainEqual({
      type: "grantBook",
      bookId: "book-shediao",
    });
    expect(res.yield.kind).toBe("end");
  });

  it("战败走 onLose（打不过也能过）", () => {
    const state = freshState();
    let res = runEvent(event, state, startEvent(event));
    res = runEvent(event, state, res.run, {
      type: "battle",
      outcome: "defeat",
    });
    expect(state.flags["lost-once"]).toBe(true);
    expect(res.yield.kind).toBe("end");
  });

  it("onLose 省略时战败顺序落到下一步", () => {
    const ev: StoryEvent = {
      id: "no-lose",
      steps: [
        { kind: "battle", battleId: "b", onWin: "w" },
        { kind: "setFlag", flag: "fell-through" },
        { kind: "end" },
        { kind: "setFlag", id: "w", flag: "won" },
      ],
    };
    const state = freshState();
    let res = runEvent(ev, state, startEvent(ev));
    res = runEvent(ev, state, res.run, { type: "battle", outcome: "defeat" });
    expect(res.yield.kind).toBe("end");
    expect(state.flags["fell-through"]).toBe(true);
    expect(state.flags["won"]).toBeUndefined();
  });
});

describe("story runner — 奖励 effect 只列出不改 state", () => {
  it("grantBook/gainExp/learnSkill 作为 effect 返回", () => {
    const event: StoryEvent = {
      id: "rewards",
      steps: [
        { kind: "gainExp", amount: 120 },
        { kind: "learnSkill", skillId: "changquan", who: "player" },
        { kind: "grantBook", bookId: "book-1" },
        { kind: "recruit", charId: "guojing" },
        { kind: "switchMap", mapId: "niujia-village", x: 3, y: 6 },
        { kind: "adjustMorality", delta: 5 },
        { kind: "end" },
      ],
    };
    const state = freshState();
    const { effects } = play(event, state, []);
    expect(effects).toEqual([
      { type: "gainExp", amount: 120 },
      { type: "learnSkill", skillId: "changquan", who: "player" },
      { type: "grantBook", bookId: "book-1" },
      { type: "recruit", charId: "guojing" },
      { type: "switchMap", mapId: "niujia-village", x: 3, y: 6 },
      { type: "adjustMorality", delta: 5 },
    ]);
    // runner 不就地应用（像 grantBook/recruit：由 Game/applyStoryEffects 应用）
    expect(state.party).toEqual([]);
    expect(state.player.mapId).toBe("test"); // switchMap 未在 runner 里改位置
    expect(state.morality).toBe(0); // adjustMorality 未在 runner 里改
  });
});

describe("story runner — 回放确定性", () => {
  const event: StoryEvent = {
    id: "replay",
    steps: [
      { kind: "dialogue", dialogueId: "d" },
      {
        kind: "choice",
        options: [
          { label: "a", goto: "pa" },
          { label: "b", goto: "pb" },
        ],
      },
      { kind: "setFlag", id: "pa", flag: "chose-a" },
      { kind: "grantClue", clueId: "clue-x" },
      { kind: "end" },
      { kind: "setFlag", id: "pb", flag: "chose-b" },
      { kind: "end" },
    ],
  };
  const inputs: StoryInput[] = [undefined, { type: "choice", option: 0 }];

  it("同一事件+同一输入序列两次运行 → 相同 effects 与终态", () => {
    const s1 = freshState();
    const r1 = play(event, s1, inputs);
    const s2 = freshState();
    const r2 = play(event, s2, inputs);
    expect(r1.effects).toEqual(r2.effects);
    expect(r1.yields).toEqual(r2.yields);
    expect(s1).toEqual(s2);
  });
});

describe("story runner — 守护与坏链", () => {
  it("跳转到不存在的 step id 抛错", () => {
    const event: StoryEvent = {
      id: "bad-ref",
      steps: [{ kind: "goto", target: "nowhere" }],
    };
    expect(() => runEvent(event, freshState(), startEvent(event))).toThrow(
      /找不到 step id/,
    );
  });

  it("goto 死循环被守护拦截", () => {
    const event: StoryEvent = {
      id: "loop",
      steps: [
        { kind: "goto", id: "a", target: "b" },
        { kind: "goto", id: "b", target: "a" },
      ],
    };
    expect(() => runEvent(event, freshState(), startEvent(event))).toThrow(
      /死循环/,
    );
  });

  it("choice 全部分支条件不满足时抛错（不静默卡死）", () => {
    const event: StoryEvent = {
      id: "dead-choice",
      steps: [
        {
          kind: "choice",
          options: [
            { label: "甲", when: { hasFlag: "a" }, goto: "end" },
            { label: "乙", when: { hasFlag: "b" }, goto: "end" },
          ],
        },
        { kind: "end", id: "end" },
      ],
    };
    // 既没 a 也没 b → 无可选项
    expect(() => runEvent(event, freshState(), startEvent(event))).toThrow(
      /无可选项/,
    );
  });

  it("resume 时选了不可选(被 when 过滤)的分支会抛错", () => {
    const event: StoryEvent = {
      id: "gated-choice",
      steps: [
        {
          kind: "choice",
          options: [
            { label: "总能选", goto: "a" }, // option 0：无条件
            { label: "需侠义", when: { hasFlag: "kind" }, goto: "b" }, // option 1：门控
          ],
        },
        { kind: "setFlag", id: "a", flag: "picked-a" },
        { kind: "end" },
        { kind: "setFlag", id: "b", flag: "picked-b" },
        { kind: "end" },
      ],
    };
    const state = freshState(); // 没有 kind flag → option 1 不可选
    const res = runEvent(event, state, startEvent(event));
    if (res.yield.kind !== "choice") throw new Error("unreachable");
    expect(res.yield.options).toEqual([{ label: "总能选", option: 0 }]);
    // 坏输入：硬喂被过滤掉的 option 1 → 应抛错，而非走进禁用分支
    expect(() =>
      runEvent(event, state, res.run, { type: "choice", option: 1 }),
    ).toThrow(/不可选分支/);
    // 合法输入 option 0 正常
    const ok = runEvent(event, state, res.run, { type: "choice", option: 0 });
    expect(ok.yield.kind).toBe("end");
    expect(state.flags["picked-a"]).toBe(true);
  });

  it("用错事件的游标推进会抛错", () => {
    const a: StoryEvent = { id: "a", steps: [{ kind: "end" }] };
    const b: StoryEvent = { id: "b", steps: [{ kind: "end" }] };
    expect(() => runEvent(b, freshState(), startEvent(a))).toThrow(/游标属于/);
  });

  it("collectStepRefs 收齐所有跳转目标", () => {
    const event: StoryEvent = {
      id: "refs",
      steps: [
        { kind: "battle", battleId: "b", onWin: "w", onLose: "l" },
        {
          kind: "choice",
          options: [
            { label: "x", goto: "cx" },
            { label: "y", goto: "cy" },
          ],
        },
        { kind: "goto", target: "g" },
      ],
    };
    expect(collectStepRefs(event).sort()).toEqual(
      ["cx", "cy", "g", "l", "w"].sort(),
    );
  });
});

describe("story runner — selectTriggeredEvent", () => {
  it("选第一个触发条件满足且未完成的事件", () => {
    const state = freshState();
    const evs: StoryEvent[] = [
      { id: "locked", trigger: { hasFlag: "never" }, steps: [{ kind: "end" }] },
      { id: "open", steps: [{ kind: "end" }] },
    ];
    expect(selectTriggeredEvent(evs, state)?.id).toBe("open");
  });
});
