import { type GameState, hasFlag } from "./state";

/**
 * 声明式剧情触发条件（CLAUDE.md §5.3）。所有条件字段是 AND 关系。
 * 后续里程碑按需扩展字段（正邪值区间、队伍成员、天书数量…），
 * 求值只在这里加分支 — 不散落 if/else。
 */
export interface Condition {
  hasFlag?: string;
  notFlag?: string;
  hasClue?: string;
}

export function evaluate(
  state: GameState,
  condition: Condition | undefined,
): boolean {
  if (!condition) return true;
  if (condition.hasFlag !== undefined && !hasFlag(state, condition.hasFlag)) {
    return false;
  }
  if (condition.notFlag !== undefined && hasFlag(state, condition.notFlag)) {
    return false;
  }
  if (
    condition.hasClue !== undefined &&
    !state.clues.includes(condition.hasClue)
  ) {
    return false;
  }
  return true;
}
