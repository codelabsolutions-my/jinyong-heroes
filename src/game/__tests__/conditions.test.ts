import { describe, expect, it } from "vitest";
import { evaluate } from "../conditions";
import {
  addCompanion,
  addReputation,
  adjustMorality,
  getReputation,
  hasCompanion,
  MORALITY_MAX,
  MORALITY_MIN,
  newGame,
  setFlag,
} from "../state";
import { grantClue } from "../journal";

function freshState() {
  return newGame({ mapId: "m", x: 0, y: 0 });
}

describe("evaluate", () => {
  it("undefined condition is always true", () => {
    expect(evaluate(freshState(), undefined)).toBe(true);
  });

  it("empty condition is always true", () => {
    expect(evaluate(freshState(), {})).toBe(true);
  });

  it("hasFlag requires the flag", () => {
    const s = freshState();
    expect(evaluate(s, { hasFlag: "met-sweeper" })).toBe(false);
    setFlag(s, "met-sweeper");
    expect(evaluate(s, { hasFlag: "met-sweeper" })).toBe(true);
  });

  it("notFlag requires the flag absent", () => {
    const s = freshState();
    expect(evaluate(s, { notFlag: "met-sweeper" })).toBe(true);
    setFlag(s, "met-sweeper");
    expect(evaluate(s, { notFlag: "met-sweeper" })).toBe(false);
  });

  it("hasClue requires the clue", () => {
    const s = freshState();
    expect(evaluate(s, { hasClue: "c1" })).toBe(false);
    grantClue(s, "c1");
    expect(evaluate(s, { hasClue: "c1" })).toBe(true);
  });

  it("multiple fields AND together", () => {
    const s = freshState();
    setFlag(s, "a");
    expect(evaluate(s, { hasFlag: "a", hasClue: "c1" })).toBe(false);
    grantClue(s, "c1");
    expect(evaluate(s, { hasFlag: "a", hasClue: "c1" })).toBe(true);
    expect(evaluate(s, { hasFlag: "a", notFlag: "a" })).toBe(false);
  });

  it("minBooks 按天书数量门槛", () => {
    const s = freshState();
    expect(evaluate(s, { minBooks: 1 })).toBe(false);
    s.books.push("book-shediao");
    expect(evaluate(s, { minBooks: 1 })).toBe(true);
    expect(evaluate(s, { minBooks: 2 })).toBe(false);
  });

  it("minMorality / maxMorality 正邪值区间（含端点）", () => {
    const s = freshState(); // morality 0
    expect(evaluate(s, { minMorality: 1 })).toBe(false);
    expect(evaluate(s, { maxMorality: 0 })).toBe(true);
    adjustMorality(s, 30);
    expect(evaluate(s, { minMorality: 30 })).toBe(true);
    expect(evaluate(s, { maxMorality: 29 })).toBe(false);
    // 邪线区间
    adjustMorality(s, -80); // → -50
    expect(evaluate(s, { maxMorality: -40 })).toBe(true);
  });

  it("hasCompanion 需队伍含该队友", () => {
    const s = freshState();
    expect(evaluate(s, { hasCompanion: "guojing" })).toBe(false);
    addCompanion(s, "guojing");
    expect(evaluate(s, { hasCompanion: "guojing" })).toBe(true);
  });

  it("minReputation 门派声望门槛", () => {
    const s = freshState();
    expect(evaluate(s, { minReputation: { sect: "shaolin", value: 10 } })).toBe(
      false,
    );
    addReputation(s, "shaolin", 15);
    expect(evaluate(s, { minReputation: { sect: "shaolin", value: 10 } })).toBe(
      true,
    );
  });
});

describe("state 助手（正邪值/声望/队友）", () => {
  it("adjustMorality clamp 在上下限", () => {
    const s = newGame({ mapId: "m", x: 0, y: 0 });
    expect(adjustMorality(s, 999)).toBe(MORALITY_MAX);
    expect(adjustMorality(s, -9999)).toBe(MORALITY_MIN);
    expect(adjustMorality(s, 10)).toBe(MORALITY_MIN + 10);
  });

  it("reputation 未记录默认 0，可累加", () => {
    const s = newGame({ mapId: "m", x: 0, y: 0 });
    expect(getReputation(s, "wudang")).toBe(0);
    expect(addReputation(s, "wudang", 5)).toBe(5);
    expect(addReputation(s, "wudang", -2)).toBe(3);
  });

  it("addCompanion 去重、排除主角", () => {
    const s = newGame({ mapId: "m", x: 0, y: 0 });
    expect(addCompanion(s, "guojing")).toBe(true);
    expect(addCompanion(s, "guojing")).toBe(false); // 重复
    expect(addCompanion(s, "player")).toBe(false); // 主角恒在，不入队列
    expect(s.party).toEqual(["guojing"]);
    expect(hasCompanion(s, "guojing")).toBe(true);
  });
});
