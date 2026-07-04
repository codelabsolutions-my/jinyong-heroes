import { describe, expect, it } from "vitest";
import { isWalkable, mapHeight, mapWidth, terrainAt } from "../types";
import { xiaKeIsland } from "../xiaKeIsland";

describe("map data helpers", () => {
  it("reports grid dimensions", () => {
    expect(mapWidth(xiaKeIsland)).toBe(30);
    expect(mapHeight(xiaKeIsland)).toBe(25);
  });

  it("every row has equal length", () => {
    const w = mapWidth(xiaKeIsland);
    for (const row of xiaKeIsland.grid) {
      expect(row.length).toBe(w);
    }
  });

  it("every grid character has a terrain definition", () => {
    for (const row of xiaKeIsland.grid) {
      for (const ch of row) {
        expect(
          xiaKeIsland.terrains[ch],
          `undefined terrain for '${ch}'`,
        ).toBeDefined();
      }
    }
  });

  it("spawn point is walkable", () => {
    const { x, y } = xiaKeIsland.spawn;
    expect(isWalkable(xiaKeIsland, x, y)).toBe(true);
  });

  it("water blocks movement, road allows it", () => {
    expect(terrainAt(xiaKeIsland, 0, 0)?.name).toBe("water");
    expect(isWalkable(xiaKeIsland, 0, 0)).toBe(false);
  });

  it("out-of-bounds is not walkable", () => {
    expect(isWalkable(xiaKeIsland, -1, 0)).toBe(false);
    expect(isWalkable(xiaKeIsland, 0, -1)).toBe(false);
    expect(isWalkable(xiaKeIsland, 999, 0)).toBe(false);
    expect(isWalkable(xiaKeIsland, 0, 999)).toBe(false);
  });
});
