import {
  BASIC_ATTACK,
  type BattleAction,
  type BattleState,
  type Combatant,
  type Coord,
  type Side,
  combatantById,
  livingOf,
} from "./types";
import { inAttackRange, manhattan, reachableTiles } from "./range";

/**
 * 自动战斗 AI：**确定性**（不使用 RNG），保证战斗可回放。
 * 策略：已在攻击范围内→攻击对方阵营最优目标；否则朝最近敌人移动，移动后能打就打，否则待机。
 * 返回本回合要依次执行的动作（move 后接 attack/wait）。
 *
 * side 无关：既驱动敌方，也驱动"友方 AI"（郭靖/黄蓉等剧情战友军——非玩家操控的 ally 单位）。
 * M3 简化：只用普攻（不自动放武学、不管理内力）；智能升级留待后续里程碑。
 */

const AUTO_ATTACK_RANGE = BASIC_ATTACK.range;

function opposite(side: Side): Side {
  return side === "enemy" ? "ally" : "enemy";
}

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

function attackableFrom(pos: Coord, targets: Combatant[]): Combatant | null {
  const inRange = targets.filter((t) =>
    inAttackRange(pos, t, AUTO_ATTACK_RANGE),
  );
  return pickTarget(pos, inRange);
}

/**
 * 计算当前行动单位（任意阵营）的自动动作，攻击对方阵营。
 * 调用方（BattleController）决定谁走 AI：敌方全走、ally 侧仅非玩家单位走。
 */
export function autoTurnActions(state: BattleState): BattleAction[] {
  const self = state.activeId
    ? combatantById(state, state.activeId)
    : undefined;
  if (!self) return [{ type: "wait" }];

  const targets = livingOf(state, opposite(self.side));
  if (targets.length === 0) return [{ type: "wait" }];

  // 原地已能攻击
  const hereTarget = attackableFrom(self, targets);
  if (hereTarget) return [{ type: "attack", targetId: hereTarget.id }];

  // 朝最近敌人移动到最优可达格
  const target = pickTarget(self, targets);
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
  const afterMove = attackableFrom(bestTile, targets);
  actions.push(
    afterMove ? { type: "attack", targetId: afterMove.id } : { type: "wait" },
  );
  return actions;
}

/** 敌方 AI（向后兼容包装）：仅当行动者是敌方时给出动作，否则待机。 */
export function enemyTurnActions(state: BattleState): BattleAction[] {
  const self = state.activeId
    ? combatantById(state, state.activeId)
    : undefined;
  if (!self || self.side !== "enemy") return [{ type: "wait" }];
  return autoTurnActions(state);
}

/** 友方 AI（剧情战友军）：仅当行动者是 ally 时给出动作，否则待机。 */
export function allyAutoTurnActions(state: BattleState): BattleAction[] {
  const self = state.activeId
    ? combatantById(state, state.activeId)
    : undefined;
  if (!self || self.side !== "ally") return [{ type: "wait" }];
  return autoTurnActions(state);
}
