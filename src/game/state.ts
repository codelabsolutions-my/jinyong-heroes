import type { Direction } from "./geometry";

/**
 * 全部游戏状态收敛在这一个可 JSON 序列化的对象里（CLAUDE.md §5.4）。
 * 渲染层只读它；改动通过 game/ 层的函数进行。
 */

export const SAVE_VERSION = 1;

export interface PlayerState {
  mapId: string;
  x: number;
  y: number;
  facing: Direction;
}

export interface GameState {
  version: number;
  player: PlayerState;
  /** 剧情 flag（只增） */
  flags: Record<string, true>;
  /** 已获得的线索 id，按获得顺序 */
  clues: string[];
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
  };
}

export function setFlag(state: GameState, flag: string): void {
  state.flags[flag] = true;
}

export function hasFlag(state: GameState, flag: string): boolean {
  return state.flags[flag] === true;
}
