import { describe, expect, it } from "vitest";
import { type ClueDef, cluesByCategory, grantClue, hasClue } from "../journal";
import { newGame } from "../state";

const DEFS: Record<string, ClueDef> = {
  c1: { id: "c1", category: "传闻", title: "后山怪老头", text: "..." },
  c2: { id: "c2", category: "主线", title: "十四天书", text: "..." },
  c3: { id: "c3", category: "传闻", title: "村口少年", text: "..." },
};

function freshState() {
  return newGame({ mapId: "m", x: 0, y: 0 });
}

describe("journal", () => {
  it("grantClue adds once and reports duplicates", () => {
    const s = freshState();
    expect(grantClue(s, "c1")).toBe(true);
    expect(grantClue(s, "c1")).toBe(false);
    expect(s.clues).toEqual(["c1"]);
    expect(hasClue(s, "c1")).toBe(true);
    expect(hasClue(s, "c2")).toBe(false);
  });

  it("cluesByCategory groups in acquisition order", () => {
    const s = freshState();
    grantClue(s, "c3");
    grantClue(s, "c2");
    grantClue(s, "c1");
    const grouped = cluesByCategory(s, DEFS);
    expect(grouped.get("传闻")?.map((c) => c.id)).toEqual(["c3", "c1"]);
    expect(grouped.get("主线")?.map((c) => c.id)).toEqual(["c2"]);
  });

  it("cluesByCategory skips unknown ids without crashing", () => {
    const s = freshState();
    grantClue(s, "ghost");
    grantClue(s, "c1");
    const grouped = cluesByCategory(s, DEFS);
    expect(grouped.get("传闻")?.map((c) => c.id)).toEqual(["c1"]);
  });
});
