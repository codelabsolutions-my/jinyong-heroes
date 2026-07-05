import { type BattleState, type Combatant, effectiveStat } from "./types";

/**
 * 回合行动序：每回合按**有效** speed 降序排（含增益/减益）；同速用**稳定**次序
 * （combatants 数组内的原始下标），保证可回放。死亡单位不入队。
 */
export function turnOrder(state: BattleState): string[] {
  const living: Array<{ c: Combatant; index: number; spd: number }> = [];
  state.combatants.forEach((c, index) => {
    if (c.hp > 0) living.push({ c, index, spd: effectiveStat(c, "speed") });
  });
  living.sort((a, b) => {
    if (b.spd !== a.spd) return b.spd - a.spd;
    return a.index - b.index; // 同速稳定
  });
  return living.map((e) => e.c.id);
}
