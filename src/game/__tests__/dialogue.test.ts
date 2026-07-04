import { describe, expect, it } from "vitest";
import {
  type Dialogue,
  advanceDialogue,
  currentLine,
  startDialogue,
} from "../dialogue";
import { hasFlag, newGame, setFlag } from "../state";

const SWEEPER: Dialogue = {
  id: "sweeper",
  variants: [
    {
      when: { hasFlag: "met-sweeper" },
      lines: [{ speaker: "扫地老人", text: "又来了？去找天书吧。" }],
    },
  ],
  lines: [
    { speaker: "扫地老人", text: "你不是这个世界的人。" },
    { speaker: "小虾米", text: "你怎么知道？！" },
    { speaker: "扫地老人", text: "集齐十四天书，方能归去。" },
  ],
  effects: [
    { type: "grantClue", clueId: "main-fourteen-books" },
    { type: "setFlag", flag: "met-sweeper" },
  ],
};

function freshState() {
  return newGame({ mapId: "m", x: 0, y: 0 });
}

describe("dialogue", () => {
  it("uses default lines when no variant matches", () => {
    const s = freshState();
    const active = startDialogue(s, SWEEPER);
    expect(currentLine(active).text).toContain("不是这个世界");
    expect(active.lines).toHaveLength(3);
  });

  it("advances line by line, applies effects only at the end", () => {
    const s = freshState();
    const active = startDialogue(s, SWEEPER);

    expect(advanceDialogue(s, active)).toEqual({ done: false, newClues: [] });
    expect(currentLine(active).speaker).toBe("小虾米");
    expect(s.clues).toEqual([]); // 中途不应用 effects

    advanceDialogue(s, active);
    const result = advanceDialogue(s, active);
    expect(result.done).toBe(true);
    expect(result.newClues).toEqual(["main-fourteen-books"]);
    expect(hasFlag(s, "met-sweeper")).toBe(true);
  });

  it("picks the first matching variant on re-talk", () => {
    const s = freshState();
    setFlag(s, "met-sweeper");
    const active = startDialogue(s, SWEEPER);
    expect(active.lines).toHaveLength(1);
    expect(currentLine(active).text).toContain("又来了");

    // 变体没有 effects：走完不再发线索
    const result = advanceDialogue(s, active);
    expect(result).toEqual({ done: true, newClues: [] });
  });

  it("repeat of default dialogue does not duplicate clues", () => {
    const s = freshState();
    const first = startDialogue(s, { ...SWEEPER, variants: undefined });
    advanceDialogue(s, first);
    advanceDialogue(s, first);
    expect(advanceDialogue(s, first).newClues).toEqual(["main-fourteen-books"]);

    const second = startDialogue(s, { ...SWEEPER, variants: undefined });
    advanceDialogue(s, second);
    advanceDialogue(s, second);
    expect(advanceDialogue(s, second).newClues).toEqual([]);
    expect(s.clues).toEqual(["main-fourteen-books"]);
  });

  it("single-line dialogue finishes on first advance", () => {
    const s = freshState();
    const d: Dialogue = {
      id: "one",
      lines: [{ speaker: "阿牛", text: "哥哥好！" }],
    };
    const active = startDialogue(s, d);
    expect(advanceDialogue(s, active).done).toBe(true);
  });
});
