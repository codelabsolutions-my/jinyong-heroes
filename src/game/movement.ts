import { type MapData, isWalkable, npcAt } from "@/data/maps/types";

/**
 * 移动/占位规则（纯逻辑，渲染层只调用不实现）：
 * 一格可进入 = 地形可走 且 没有 NPC 占位。
 */
export function canEnter(map: MapData, x: number, y: number): boolean {
  return isWalkable(map, x, y) && npcAt(map, x, y) === null;
}
