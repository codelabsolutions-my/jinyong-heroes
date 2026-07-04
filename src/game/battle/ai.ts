import {
  BASIC_ATTACK,
  type BattleAction,
  type BattleState,
  type Combatant,
  type Coord,
  combatantById,
  livingOf,
} from "./types";
import { inAttackRange, manhattan, reachableTiles } from "./range";

/**
 * 敌方 AI：**确定性**（不使用 RNG），保证战斗可回放。
 * 策略：已在攻击范围内→攻击；否则朝最近敌人移动，移动后能打就打，否则待机。
 * 返回本回合要依次执行的动作（move 后接 attack/wait）。
 */

const ENEMY_ATTACK_RANGE = BASIC_ATTACK.range; // M2 敌人只用普攻

/** 确定性挑选：最近 → hp 最低 → id 字典序最小 */
function pickTarget(from: Coord, candidates: Combatant[]): Combatant | null {
  let best: Combatant | null = null;
  for (const c of candidates) {
    if (best === null) {
      best = c;
      continue;
    }
    const dc = manhattan(from, c);
    const db = manhattan(from, best);
    if (dc < db) best = c;
    else if (dc === db && c.hp < best.hp) best = c;
    else if (dc === db && c.hp === best.hp && c.id < best.id) best = c;
  }
  return best;
}

function attackableFrom(pos: Coord, allies: Combatant[]): Combatant | null {
  const inRange = allies.filter((a) =>
    inAttackRange(pos, a, ENEMY_ATTACK_RANGE),
  );
  return pickTarget(pos, inRange);
}

export function enemyTurnActions(state: BattleState): BattleAction[] {
  const self = state.activeId
    ? combatantById(state, state.activeId)
    : undefined;
  if (!self || self.side !== "enemy") return [{ type: "wait" }];

  const allies = livingOf(state, "ally");
  if (allies.length === 0) return [{ type: "wait" }];

  // 原地已能攻击
  const hereTarget = attackableFrom(self, allies);
  if (hereTarget) return [{ type: "attack", targetId: hereTarget.id }];

  // 朝最近敌人移动到最优可达格
  const target = pickTarget(self, allies);
  if (!target) return [{ type: "wait" }];

  const reachable = reachableTiles(state, self);
  let bestTile: Coord = { x: self.x, y: self.y };
  let bestDist = manhattan(self, target);
  // 稳定遍历：按 key 排序
  for (const key of [...reachable].sort()) {
    const parts = key.split(",");
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    const d = manhattan({ x, y }, target);
    if (d < bestDist) {
      bestDist = d;
      bestTile = { x, y };
    }
  }

  const actions: BattleAction[] = [];
  if (bestTile.x !== self.x || bestTile.y !== self.y) {
    actions.push({ type: "move", to: bestTile });
  }
  const afterMove = attackableFrom(bestTile, allies);
  actions.push(
    afterMove ? { type: "attack", targetId: afterMove.id } : { type: "wait" },
  );
  return actions;
}
