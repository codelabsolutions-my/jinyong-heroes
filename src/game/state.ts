import type { Direction } from "./geometry";

/**
 * 全部游戏状态收敛在这一个可 JSON 序列化的对象里（CLAUDE.md §5.4）。
 * 渲染层只读它；改动通过 game/ 层的函数进行。
 */

// v1: player/flags/clues。v2(M3): 加 books（天书）+ progress（历练/武学熟练度）。
// v3(M4): 加 morality（正邪值）+ reputation（门派声望）+ party（常驻队友）。
export const SAVE_VERSION = 3;

/** 正邪值上下限（越正越大）。行为累加，clamp 在此区间。 */
export const MORALITY_MIN = -100;
export const MORALITY_MAX = 100;

/** 出战上限（含主角）。主角恒在，故 party（不含主角）最多 OUT_LIMIT-1 人。 */
export const PARTY_OUT_LIMIT = 5;

export interface PlayerState {
  mapId: string;
  x: number;
  y: number;
  facing: Direction;
}

/**
 * 角色养成进度（M3+）。战后延续的数值挂这里，不散落进 data 层的静态人物表。
 * 等级由 exp 经曲线反推（`100×lv^1.5`，见 CHARACTERS §2.1）——只存 exp，等级不落盘避免不同步。
 */
export interface CharProgress {
  /** 累计历练值 */
  exp: number;
  /** 武学熟练度，按 skill id */
  proficiency: Record<string, number>;
}

export interface GameState {
  version: number;
  player: PlayerState;
  /** 剧情 flag（只增） */
  flags: Record<string, true>;
  /** 已获得的线索 id，按获得顺序 */
  clues: string[];
  /** 已获得的天书 id，按获得顺序（M3+） */
  books: string[];
  /** 角色养成进度，按角色 id（M3+） */
  progress: Record<string, CharProgress>;
  /** 正邪值（M4+）：负=邪，正=侠，clamp 在 [MORALITY_MIN, MORALITY_MAX] */
  morality: number;
  /** 门派声望（M4+），按门派 id；未记录视为 0 */
  reputation: Record<string, number>;
  /** 已招募的常驻队友 charId（M4+，不含主角——主角恒在） */
  party: string[];
}

export function newGame(spawn: {
  mapId: string;
  x: number;
  y: number;
}): GameState {
  return {
    version: SAVE_VERSION,
    player: { mapId: spawn.mapId, x: spawn.x, y: spawn.y, facing: "down" },
    flags: {},
    clues: [],
    books: [],
    progress: {},
    morality: 0,
    reputation: {},
    party: [],
  };
}

export function setFlag(state: GameState, flag: string): void {
  state.flags[flag] = true;
}

export function hasFlag(state: GameState, flag: string): boolean {
  return state.flags[flag] === true;
}

/**
 * 正邪值 → 称号档位（M5，状态页展示用）。档位名与阈值见
 * CHARACTERS_AND_SKILLS §5：大侠 ≥60 / 侠士 ≥20 / 无名 / 枭雄 ≤-20 / 魔头 ≤-60。
 * 纯函数，无副作用；UI 只读。（后续按称号挂 NPC 闲聊池须复用此档名。）
 */
export function moralityLabel(morality: number): string {
  if (morality >= 60) return "大侠";
  if (morality >= 20) return "侠士";
  if (morality > -20) return "无名";
  if (morality > -60) return "枭雄";
  return "魔头";
}

/** 调整正邪值（clamp 在 [MORALITY_MIN, MORALITY_MAX]）。返回调整后的值。 */
export function adjustMorality(state: GameState, delta: number): number {
  state.morality = Math.max(
    MORALITY_MIN,
    Math.min(MORALITY_MAX, state.morality + delta),
  );
  return state.morality;
}

export function getReputation(state: GameState, sect: string): number {
  return state.reputation[sect] ?? 0;
}

export function addReputation(
  state: GameState,
  sect: string,
  delta: number,
): number {
  state.reputation[sect] = getReputation(state, sect) + delta;
  return state.reputation[sect];
}

/** 招募队友（不含主角、不重复）。返回是否新招募。 */
export function addCompanion(state: GameState, charId: string): boolean {
  if (charId === "player" || state.party.includes(charId)) return false;
  state.party.push(charId);
  return true;
}

export function hasCompanion(state: GameState, charId: string): boolean {
  return state.party.includes(charId);
}
