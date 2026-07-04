import { describe, expect, it } from "vitest";
import type { Rng } from "@/game/rng";
import { computeDamage, counterMod } from "../damage";
import type { School } from "../types";

/** variance 固定为 1.0 的假 rng（0.9 + 0.5×0.2 = 1.0），便于断言确定值 */
const fixedRng: Rng = { next: () => 0.5 };

describe("counterMod — 三系克制矩阵（刚→奇→柔→刚）", () => {
  const schools: Exclude<School, null>[] = ["刚", "柔", "奇"];
  // 期望：行=攻，列=防
  const expected: Record<string, Record<string, number>> = {
    刚: { 刚: 1.0, 柔: 0.75, 奇: 1.25 },
    柔: { 刚: 1.25, 柔: 1.0, 奇: 0.75 },
    奇: { 刚: 0.75, 柔: 1.25, 奇: 1.0 },
  };
  for (const atk of schools) {
    for (const def of schools) {
      it(`${atk} 打 ${def} = ${expected[atk]![def]}`, () => {
        expect(counterMod(atk, def)).toBe(expected[atk]![def]);
      });
    }
  }

  it("无系（null）任一方 → 1.0", () => {
    expect(counterMod(null, "刚")).toBe(1.0);
    expect(counterMod("刚", null)).toBe(1.0);
    expect(counterMod(null, null)).toBe(1.0);
  });
});

describe("computeDamage", () => {
  it("基础公式：(atk+power-def)×mod×variance，variance=1.0", () => {
    // (10+6-3)=13, 刚打无系=1.0, ×1.0 = 13
    const d = computeDamage(
      {
        attack: 10,
        power: 6,
        defense: 3,
        attackerSchool: "刚",
        defenderSchool: null,
      },
      fixedRng,
    );
    expect(d).toBe(13);
  });

  it("克制加成生效：刚打奇 ×1.25", () => {
    // (10+6-3)=13 ×1.25 = 16.25 → round 16
    const d = computeDamage(
      {
        attack: 10,
        power: 6,
        defense: 3,
        attackerSchool: "刚",
        defenderSchool: "奇",
      },
      fixedRng,
    );
    expect(d).toBe(16);
  });

  it("最低 1 点（防御碾压也至少 1）", () => {
    const d = computeDamage(
      {
        attack: 1,
        power: 0,
        defense: 99,
        attackerSchool: null,
        defenderSchool: null,
      },
      fixedRng,
    );
    expect(d).toBe(1);
  });

  it("variance 上下界：0.9×base 到 1.1×base", () => {
    const low = computeDamage(
      {
        attack: 10,
        power: 0,
        defense: 0,
        attackerSchool: null,
        defenderSchool: null,
      },
      { next: () => 0 },
    );
    const high = computeDamage(
      {
        attack: 10,
        power: 0,
        defense: 0,
        attackerSchool: null,
        defenderSchool: null,
      },
      { next: () => 0.999999 },
    );
    expect(low).toBe(Math.round(10 * 0.9)); // 9
    expect(high).toBe(Math.round(10 * 1.0999998)); // 11
  });
});
