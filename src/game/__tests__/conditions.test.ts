import { describe, expect, it } from "vitest";
import { evaluate } from "../conditions";
import { newGame, setFlag } from "../state";
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
});
