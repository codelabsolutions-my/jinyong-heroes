import type { Rng } from "@/game/rng";
import type { School } from "./types";

/**
 * 伤害与三系克制（GAME_DESIGN §4、CHARACTERS_AND_SKILLS §1）。
 * 克制环：刚→奇→柔→刚。克制 ×1.25，被克 ×0.75，同系/无系 ×1.0。
 */

/** X 克 BEATS[X]（X 对 BEATS[X] 造成克制加成） */
const BEATS: Record<"刚" | "柔" | "奇", School> = {
  刚: "奇",
  奇: "柔",
  柔: "刚",
};

export function counterMod(attacker: School, defender: School): number {
  if (attacker === null || defender === null) return 1.0;
  if (attacker === defender) return 1.0;
  if (BEATS[attacker] === defender) return 1.25;
  if (BEATS[defender] === attacker) return 0.75;
  return 1.0;
}

export interface DamageInput {
  attack: number;
  /** 招式威力；普攻为 0 */
  power: number;
  defense: number;
  attackerSchool: School;
  defenderSchool: School;
}

/**
 * damage = max(1, round((attack + power - defense) × counterMod × variance))
 * variance = 0.9 + rng.next() × 0.2（±10%）
 */
export function computeDamage(input: DamageInput, rng: Rng): number {
  const base = input.attack + input.power - input.defense;
  const mod = counterMod(input.attackerSchool, input.defenderSchool);
  const variance = 0.9 + rng.next() * 0.2;
  return Math.max(1, Math.round(base * mod * variance));
}
