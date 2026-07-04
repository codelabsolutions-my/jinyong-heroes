import type { TerrainDef } from "@/data/maps/types";
import {
  type BattleState,
  type Battlefield,
  type Combatant,
  type SkillRuntime,
} from "../types";
import { turnOrder } from "../turnOrder";

/** 测试用素材：可控地建 Combatant / Battlefield / BattleState。 */

const TERRAINS: Record<string, TerrainDef> = {
  ".": { color: 0, walkable: true, name: "grass" },
  "#": { color: 0, walkable: false, name: "rock" },
};

/** 用字符网格建战场：. 可走 # 障碍 */
export function field(grid: string[]): Battlefield {
  return { grid, terrains: TERRAINS };
}

/** 全开阔 w×h 战场 */
export function openField(w: number, h: number): Battlefield {
  return field(Array.from({ length: h }, () => ".".repeat(w)));
}

export function combatant(
  partial: Partial<Combatant> & Pick<Combatant, "id" | "side" | "x" | "y">,
): Combatant {
  return {
    name: partial.id,
    color: 0,
    hp: 30,
    maxHp: 30,
    mp: 10,
    maxMp: 10,
    attack: 10,
    defense: 5,
    speed: 10,
    move: 4,
    skills: [],
    ...partial,
  };
}

export function skill(
  partial: Partial<SkillRuntime> & Pick<SkillRuntime, "id">,
): SkillRuntime {
  return {
    name: partial.id,
    school: null,
    power: 5,
    range: 1,
    mpCost: 0,
    ...partial,
  };
}

/** 建一个已就绪的 BattleState（首行动者按 turnOrder 定） */
export function battle(
  combatants: Combatant[],
  battlefield: Battlefield = openField(10, 8),
): BattleState {
  const state: BattleState = {
    battleId: "test",
    seed: 1,
    field: battlefield,
    combatants,
    round: 1,
    turnQueue: [],
    activeId: null,
    turnMoved: false,
    outcome: "ongoing",
    log: [],
  };
  const order = turnOrder(state);
  state.activeId = order[0] ?? null;
  state.turnQueue = order.slice(1);
  return state;
}
