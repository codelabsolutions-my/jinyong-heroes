import type { CharacterDef } from "@/data/characters";
import type { EncounterDef } from "@/data/battles";
import type { SkillDef } from "@/data/skills";
import { turnOrder } from "./turnOrder";
import { type BattleState, type Combatant, type SkillRuntime } from "./types";

/**
 * 从遭遇定义 + 我方阵容组装 BattleState。**唯一的 data→state 翻译点**——
 * 之后 resolve/ai/range 完全不碰 data 层。tables 注入，setup 保持可测。
 */
export interface SetupInput {
  encounter: EncounterDef;
  /** 我方出战单位（按 allySpawns 顺序放置），M2 = [player] */
  party: CharacterDef[];
  /** 敌方 charId → CharacterDef */
  characterTable: Record<string, CharacterDef>;
  /** 武学 id → SkillDef */
  skillTable: Record<string, SkillDef>;
  seed: number;
}

function expandSkills(
  ids: string[],
  skillTable: Record<string, SkillDef>,
): SkillRuntime[] {
  return ids.map((id) => {
    const def = skillTable[id];
    if (!def) throw new Error(`setup: 未知武学 ${id}`);
    return {
      id: def.id,
      name: def.name,
      school: def.school,
      power: def.power,
      range: def.range,
      mpCost: def.mpCost,
      ...(def.status ? { status: { ...def.status } } : {}),
    };
  });
}

function makeCombatant(
  def: CharacterDef,
  side: Combatant["side"],
  id: string,
  x: number,
  y: number,
  skillTable: Record<string, SkillDef>,
): Combatant {
  return {
    id,
    name: def.name,
    side,
    color: def.color,
    x,
    y,
    hp: def.hp,
    maxHp: def.hp,
    mp: def.mp,
    maxMp: def.mp,
    attack: def.attack,
    defense: def.defense,
    speed: def.speed,
    move: def.move,
    skills: expandSkills(def.skills, skillTable),
    statuses: [],
  };
}

export function setupBattle(input: SetupInput): BattleState {
  const { encounter, party, characterTable, skillTable, seed } = input;

  if (party.length > encounter.allySpawns.length) {
    throw new Error(
      `setup: 出战单位 ${party.length} 超过战场出生点 ${encounter.allySpawns.length}`,
    );
  }

  const combatants: Combatant[] = [];
  party.forEach((def, i) => {
    const spawn = encounter.allySpawns[i]!;
    combatants.push(
      makeCombatant(def, "ally", def.id, spawn.x, spawn.y, skillTable),
    );
  });
  // 剧情战友军（郭靖/黄蓉等）：ally 侧，固定坐标，id 前缀 ally- 避免与队伍撞
  (encounter.allies ?? []).forEach((a) => {
    const def = characterTable[a.charId];
    if (!def) throw new Error(`setup: 未知战友 charId ${a.charId}`);
    combatants.push(
      makeCombatant(def, "ally", `ally-${a.charId}`, a.x, a.y, skillTable),
    );
  });
  encounter.enemies.forEach((e, i) => {
    const def = characterTable[e.charId];
    if (!def) throw new Error(`setup: 未知敌方 charId ${e.charId}`);
    combatants.push(
      makeCombatant(def, "enemy", `enemy-${i}`, e.x, e.y, skillTable),
    );
  });

  const state: BattleState = {
    battleId: encounter.id,
    seed,
    // 深拷贝，避免 BattleState 别名到共享的 ENCOUNTERS 数据（战斗绝不可污染内容源）
    field: structuredClone(encounter.field),
    combatants,
    round: 1,
    turnQueue: [],
    activeId: null,
    turnMoved: false,
    outcome: "ongoing",
    // 深拷贝，避免别名到共享的 ENCOUNTERS 数据
    objective: encounter.objective ? { ...encounter.objective } : undefined,
    log: [{ text: `${encounter.name}——战斗开始！` }],
  };

  const order = turnOrder(state);
  state.activeId = order[0] ?? null;
  state.turnQueue = order.slice(1);
  return state;
}
