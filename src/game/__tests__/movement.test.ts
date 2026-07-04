import { describe, expect, it } from "vitest";
import { canEnter } from "../movement";
import type { MapData } from "@/data/maps/types";

const MAP: MapData = {
  id: "t",
  name: "测试",
  spawn: { x: 1, y: 1 },
  terrains: {
    ".": { color: 0, walkable: true, name: "grass" },
    "#": { color: 0, walkable: false, name: "rock" },
  },
  grid: ["###", "#..", "###"],
  exits: [],
  npcs: [{ npcId: "x", x: 2, y: 1 }],
};

describe("canEnter", () => {
  it("walkable free tile → yes", () => {
    expect(canEnter(MAP, 1, 1)).toBe(true);
  });

  it("unwalkable terrain → no", () => {
    expect(canEnter(MAP, 0, 0)).toBe(false);
  });

  it("NPC-occupied tile → no", () => {
    expect(canEnter(MAP, 2, 1)).toBe(false);
  });

  it("out of bounds → no", () => {
    expect(canEnter(MAP, -1, 0)).toBe(false);
    expect(canEnter(MAP, 99, 99)).toBe(false);
  });
});
