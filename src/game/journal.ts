import type { GameState } from "./state";

/** 线索/传闻系统 — 无箭头开放世界的可玩性支柱（GAME_DESIGN §3.2）。 */

export type ClueCategory = "主线" | "传闻";

export interface ClueDef {
  id: string;
  category: ClueCategory;
  title: string;
  text: string;
}

/** 获得线索。已有则不重复，返回是否新获得。 */
export function grantClue(state: GameState, clueId: string): boolean {
  if (state.clues.includes(clueId)) return false;
  state.clues.push(clueId);
  return true;
}

export function hasClue(state: GameState, clueId: string): boolean {
  return state.clues.includes(clueId);
}

/** 日志界面用：按分类整理已获得的线索（保持获得顺序）。 */
export function cluesByCategory(
  state: GameState,
  defs: Record<string, ClueDef>,
): Map<ClueCategory, ClueDef[]> {
  const grouped = new Map<ClueCategory, ClueDef[]>();
  for (const id of state.clues) {
    const def = defs[id];
    if (!def) continue; // 数据完整性由内容测试保证；运行时容错跳过
    const list = grouped.get(def.category) ?? [];
    list.push(def);
    grouped.set(def.category, list);
  }
  return grouped;
}
