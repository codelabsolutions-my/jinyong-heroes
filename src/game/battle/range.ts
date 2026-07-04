import { DIRECTION_DELTA } from "@/game/geometry";
import {
  type BattleState,
  type Battlefield,
  type Combatant,
  type Coord,
  combatantById,
} from "./types";

/** 移动/攻击范围计算（纯函数，曼哈顿 / 四连通，与探索层移动模型一致）。 */

export function fieldWidth(field: Battlefield): number {
  return field.grid[0]?.length ?? 0;
}

export function fieldHeight(field: Battlefield): number {
  return field.grid.length;
}

export function terrainWalkable(
  field: Battlefield,
  x: number,
  y: number,
): boolean {
  const row = field.grid[y];
  if (!row) return false;
  const ch = row[x];
  if (!ch) return false;
  return field.terrains[ch]?.walkable ?? false;
}

export function manhattan(a: Coord, b: Coord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export const coordKey = (x: number, y: number): string => `${x},${y}`;

/** (x,y) 是否被某个活着的、且不是 self 的单位占据 */
function occupiedByOther(
  state: BattleState,
  selfId: string,
  x: number,
  y: number,
): boolean {
  return state.combatants.some(
    (c) => c.id !== selfId && c.hp > 0 && c.x === x && c.y === y,
  );
}

/**
 * 单位可移动到的格子（含原地）。BFS 上限 unit.move 步，
 * 越过不可走地形与他人占位皆阻挡。返回 key 集合（用 coordKey）。
 */
export function reachableTiles(
  state: BattleState,
  unit: Combatant,
): Set<string> {
  const reached = new Set<string>();
  const start = coordKey(unit.x, unit.y);
  reached.add(start);
  // BFS，记录到每格的步数
  let frontier: Array<{ x: number; y: number; steps: number }> = [
    { x: unit.x, y: unit.y, steps: 0 },
  ];
  while (frontier.length > 0) {
    const next: typeof frontier = [];
    for (const cell of frontier) {
      if (cell.steps >= unit.move) continue;
      for (const { dx, dy } of Object.values(DIRECTION_DELTA)) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        const key = coordKey(nx, ny);
        if (reached.has(key)) continue;
        if (!terrainWalkable(state.field, nx, ny)) continue;
        if (occupiedByOther(state, unit.id, nx, ny)) continue;
        reached.add(key);
        next.push({ x: nx, y: ny, steps: cell.steps + 1 });
      }
    }
    frontier = next;
  }
  return reached;
}

export function canMoveTo(
  state: BattleState,
  unit: Combatant,
  to: Coord,
): boolean {
  return reachableTiles(state, unit).has(coordKey(to.x, to.y));
}

/** from 能否以 range 攻击到 to（曼哈顿，range≥1；同格不算） */
export function inAttackRange(from: Coord, to: Coord, range: number): boolean {
  const d = manhattan(from, to);
  return d >= 1 && d <= range;
}

/** 当前行动者以给定攻击范围可命中的敌对单位 */
export function targetsInRange(
  state: BattleState,
  attackerId: string,
  range: number,
): Combatant[] {
  const attacker = combatantById(state, attackerId);
  if (!attacker) return [];
  return state.combatants.filter(
    (c) =>
      c.hp > 0 && c.side !== attacker.side && inAttackRange(attacker, c, range),
  );
}
