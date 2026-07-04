import { describe, expect, it } from "vitest";
import { turnOrder } from "../turnOrder";
import { battle, combatant } from "./fixtures";

describe("turnOrder", () => {
  it("按 speed 降序", () => {
    const state = battle([
      combatant({ id: "slow", side: "ally", x: 0, y: 0, speed: 5 }),
      combatant({ id: "fast", side: "enemy", x: 1, y: 0, speed: 15 }),
      combatant({ id: "mid", side: "ally", x: 2, y: 0, speed: 10 }),
    ]);
    expect(turnOrder(state)).toEqual(["fast", "mid", "slow"]);
  });

  it("同速用数组下标稳定排序（可回放）", () => {
    const state = battle([
      combatant({ id: "a", side: "ally", x: 0, y: 0, speed: 10 }),
      combatant({ id: "b", side: "enemy", x: 1, y: 0, speed: 10 }),
      combatant({ id: "c", side: "ally", x: 2, y: 0, speed: 10 }),
    ]);
    expect(turnOrder(state)).toEqual(["a", "b", "c"]);
  });

  it("死亡单位不入序", () => {
    const state = battle([
      combatant({ id: "a", side: "ally", x: 0, y: 0, speed: 10 }),
      combatant({ id: "dead", side: "enemy", x: 1, y: 0, speed: 20, hp: 0 }),
      combatant({ id: "c", side: "ally", x: 2, y: 0, speed: 5 }),
    ]);
    expect(turnOrder(state)).toEqual(["a", "c"]);
  });
});
