import { describe, expect, it } from "vitest";
import {
  canMoveTo,
  coordKey,
  inAttackRange,
  manhattan,
  reachableTiles,
  targetsInRange,
} from "../range";
import { battle, combatant, field } from "./fixtures";

describe("manhattan / inAttackRange", () => {
  it("manhattan distance", () => {
    expect(manhattan({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
  });

  it("range 1 = 正交相邻，不含自身", () => {
    expect(inAttackRange({ x: 2, y: 2 }, { x: 2, y: 3 }, 1)).toBe(true);
    expect(inAttackRange({ x: 2, y: 2 }, { x: 3, y: 3 }, 1)).toBe(false); // 斜角
    expect(inAttackRange({ x: 2, y: 2 }, { x: 2, y: 2 }, 1)).toBe(false); // 自身
  });

  it("range 2 覆盖更远", () => {
    expect(inAttackRange({ x: 0, y: 0 }, { x: 2, y: 0 }, 2)).toBe(true);
    expect(inAttackRange({ x: 0, y: 0 }, { x: 3, y: 0 }, 2)).toBe(false);
  });
});

describe("reachableTiles (BFS)", () => {
  it("开阔地按 move 步数形成菱形", () => {
    const unit = combatant({ id: "u", side: "ally", x: 4, y: 4, move: 2 });
    const state = battle([unit]);
    const reached = reachableTiles(state, unit);
    // 曼哈顿 ≤2 的格子数（含原地）= 1+4+8 = 13
    expect(reached.size).toBe(13);
    expect(reached.has(coordKey(4, 4))).toBe(true); // 原地
    expect(reached.has(coordKey(6, 4))).toBe(true); // 2 步
    expect(reached.has(coordKey(7, 4))).toBe(false); // 3 步，超
  });

  it("障碍地形阻断且不可绕近路穿墙", () => {
    // 一堵墙把左右隔开，只留上方通道
    const state = battle(
      [combatant({ id: "u", side: "ally", x: 1, y: 2, move: 3 })],
      field(["#####", "#...#", "#.#.#", "#...#", "#####"]),
    );
    const reached = reachableTiles(state, state.combatants[0]!);
    expect(reached.has(coordKey(1, 2))).toBe(true);
    // (2,2) 是障碍 #
    expect(reached.has(coordKey(2, 2))).toBe(false);
  });

  it("他人占位阻挡移动", () => {
    const u = combatant({ id: "u", side: "ally", x: 2, y: 2, move: 3 });
    const blocker = combatant({ id: "b", side: "enemy", x: 3, y: 2 });
    const state = battle([u, blocker]);
    const reached = reachableTiles(state, u);
    expect(reached.has(coordKey(3, 2))).toBe(false); // 被占
    expect(reached.has(coordKey(4, 2))).toBe(false); // 被 (3,2) 挡住无法直达（需绕）
    expect(reached.has(coordKey(2, 4))).toBe(true); // 另一方向可达
  });

  it("canMoveTo 与 reachableTiles 一致", () => {
    const u = combatant({ id: "u", side: "ally", x: 0, y: 0, move: 2 });
    const state = battle([u], field([".....", ".....", "....."]));
    expect(canMoveTo(state, u, { x: 2, y: 0 })).toBe(true);
    expect(canMoveTo(state, u, { x: 3, y: 0 })).toBe(false);
  });
});

describe("targetsInRange", () => {
  it("只返回射程内的敌对活单位", () => {
    const me = combatant({ id: "me", side: "ally", x: 2, y: 2 });
    const near = combatant({ id: "e1", side: "enemy", x: 2, y: 3 }); // 相邻
    const far = combatant({ id: "e2", side: "enemy", x: 5, y: 5 });
    const ally = combatant({ id: "a1", side: "ally", x: 2, y: 1 }); // 友军不算
    const state = battle([me, near, far, ally]);
    state.activeId = "me";
    const targets = targetsInRange(state, "me", 1).map((c) => c.id);
    expect(targets).toEqual(["e1"]);
  });

  it("死亡敌人不在射程结果内", () => {
    const me = combatant({ id: "me", side: "ally", x: 2, y: 2 });
    const dead = combatant({ id: "e1", side: "enemy", x: 2, y: 3, hp: 0 });
    const state = battle([me, dead]);
    expect(targetsInRange(state, "me", 1)).toEqual([]);
  });
});
