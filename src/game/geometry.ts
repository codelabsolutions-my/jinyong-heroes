/** 方向与网格几何 — 游戏逻辑层共享，渲染层与输入层都从这里引用。 */

export type Direction = "up" | "down" | "left" | "right";

export const DIRECTION_DELTA: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

/** 从 (x, y) 朝 direction 走一格后的坐标 */
export function stepFrom(
  x: number,
  y: number,
  direction: Direction,
): { x: number; y: number } {
  const { dx, dy } = DIRECTION_DELTA[direction];
  return { x: x + dx, y: y + dy };
}
