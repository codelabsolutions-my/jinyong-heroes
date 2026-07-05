/**
 * 菜单光标导航的纯逻辑（无 Pixi，可单测）。抽出来供 ChoiceBox 等复用，
 * 满足 CLAUDE §1.2「逻辑脱离渲染层可测」。
 */

/** 在 [0, n) 里按 delta 环形移动光标；n<=0 返回 0。 */
export function wrapIndex(current: number, delta: number, n: number): number {
  if (n <= 0) return 0;
  return (((current + delta) % n) + n) % n;
}
