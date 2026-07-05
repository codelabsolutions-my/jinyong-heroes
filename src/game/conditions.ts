import { type GameState, getReputation, hasCompanion, hasFlag } from "./state";

/**
 * 声明式剧情触发条件（CLAUDE.md §5.3）。所有条件字段是 AND 关系。
 * 后续里程碑按需扩展字段，求值只在这里加分支 — 不散落 if/else。
 */
export interface Condition {
  hasFlag?: string;
  notFlag?: string;
  hasClue?: string;
  /** 已获得天书数量下限（M4+） */
  minBooks?: number;
  /** 正邪值下限（含）：state.morality >= minMorality（M4+） */
  minMorality?: number;
  /** 正邪值上限（含）：state.morality <= maxMorality（M4+） */
  maxMorality?: number;
  /** 队伍中须有该队友 charId（M4+） */
  hasCompanion?: string;
  /** 门派声望门槛：reputation[sect] >= value（M4+） */
  minReputation?: { sect: string; value: number };
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
  if (
    condition.minBooks !== undefined &&
    state.books.length < condition.minBooks
  ) {
    return false;
  }
  if (
    condition.minMorality !== undefined &&
    state.morality < condition.minMorality
  ) {
    return false;
  }
  if (
    condition.maxMorality !== undefined &&
    state.morality > condition.maxMorality
  ) {
    return false;
  }
  if (
    condition.hasCompanion !== undefined &&
    !hasCompanion(state, condition.hasCompanion)
  ) {
    return false;
  }
  if (
    condition.minReputation !== undefined &&
    getReputation(state, condition.minReputation.sect) <
      condition.minReputation.value
  ) {
    return false;
  }
  return true;
}
