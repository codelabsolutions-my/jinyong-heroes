import type { Direction } from "./geometry";

/**
 * 全部游戏状态收敛在这一个可 JSON 序列化的对象里（CLAUDE.md §5.4）。
 * 渲染层只读它；改动通过 game/ 层的函数进行。
 */

// v1: player/flags/clues。v2(M3): 加 books（天书）+ progress（历练/武学熟练度）。
export const SAVE_VERSION = 2;

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
  };
}

export function setFlag(state: GameState, flag: string): void {
  state.flags[flag] = true;
}

export function hasFlag(state: GameState, flag: string): boolean {
  return state.flags[flag] === true;
}
