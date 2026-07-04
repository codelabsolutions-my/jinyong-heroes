import type { BattleState, Combatant } from "./types";

/**
 * 回合行动序：每回合按 speed 降序排；同速用**稳定**次序
 * （combatants 数组内的原始下标），保证可回放。死亡单位不入队。
 */
export function turnOrder(state: BattleState): string[] {
  const living: Array<{ c: Combatant; index: number }> = [];
  state.combatants.forEach((c, index) => {
    if (c.hp > 0) living.push({ c, index });
  });
  living.sort((a, b) => {
    if (b.c.speed !== a.c.speed) return b.c.speed - a.c.speed;
    return a.index - b.index; // 同速稳定
  });
  return living.map((e) => e.c.id);
}
