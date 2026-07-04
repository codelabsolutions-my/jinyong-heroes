import { SAVE_VERSION, type GameState } from "./state";
import { DIRECTION_DELTA, type Direction } from "./geometry";

/**
 * 存档（CLAUDE.md §2.4）：带版本校验，损坏/版本不兼容/世界不认可时明确报错，
 * never 静默丢档、never 让坏档砸进游戏循环。
 * storage 注入式 — 生产用 localStorage，测试用内存实现。
 */

export interface KVStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SAVE_KEY = "jinyong-heroes:save:0";

export class SaveLoadError extends Error {}

/**
 * 世界层校验钩子：game 层不认识地图注册表（那是 data 层），
 * 调用方注入"这个存档在当前世界里是否落得了脚"的检查。
 * 返回 null = 通过；返回字符串 = 拒绝理由（会变成 SaveLoadError）。
 */
export type WorldCheck = (state: GameState) => string | null;

export function saveGame(storage: KVStorage, state: GameState): void {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isDirection(v: unknown): v is Direction {
  return typeof v === "string" && v in DIRECTION_DELTA;
}

/** 没有存档返回 null；存档损坏、版本不兼容或世界校验不通过抛 SaveLoadError。 */
export function loadGame(
  storage: KVStorage,
  worldCheck?: WorldCheck,
): GameState | null {
  const raw = storage.getItem(SAVE_KEY);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SaveLoadError("存档数据损坏（不是合法 JSON）");
  }

  if (!isRecord(parsed)) {
    throw new SaveLoadError("存档数据损坏（结构不对）");
  }

  if (parsed.version !== SAVE_VERSION) {
    // 未来版本升级在这里加迁移分支：vN → vN+1 逐级升
    throw new SaveLoadError(
      `存档版本不兼容（存档 v${String(parsed.version)}，游戏 v${SAVE_VERSION}）`,
    );
  }

  const player = parsed.player;
  if (
    !isRecord(player) ||
    typeof player.mapId !== "string" ||
    !Number.isInteger(player.x) ||
    !Number.isInteger(player.y) ||
    !isDirection(player.facing)
  ) {
    throw new SaveLoadError("存档数据损坏（player 字段无效）");
  }

  if (
    !isRecord(parsed.flags) ||
    !Array.isArray(parsed.clues) ||
    !parsed.clues.every((c) => typeof c === "string")
  ) {
    throw new SaveLoadError("存档数据损坏（flags/clues 字段无效）");
  }

  const state = parsed as unknown as GameState;

  const rejection = worldCheck?.(state) ?? null;
  if (rejection !== null) {
    throw new SaveLoadError(rejection);
  }

  return state;
}
