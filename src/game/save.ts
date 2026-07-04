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

  if (typeof parsed.version !== "number" || !Number.isInteger(parsed.version)) {
    throw new SaveLoadError("存档数据损坏（version 字段无效）");
  }
  if (parsed.version > SAVE_VERSION) {
    // 比游戏更新的存档：无法降级，明确报错，never 静默丢档
    throw new SaveLoadError(
      `存档版本不兼容（存档 v${parsed.version}，游戏 v${SAVE_VERSION}）`,
    );
  }
  // 旧档逐级升到当前版本（vN → vN+1），补齐新字段默认值
  const migrated = migrate(parsed);

  const player = migrated.player;
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
    !isRecord(migrated.flags) ||
    !Array.isArray(migrated.clues) ||
    !migrated.clues.every((c) => typeof c === "string")
  ) {
    throw new SaveLoadError("存档数据损坏（flags/clues 字段无效）");
  }

  if (
    !Array.isArray(migrated.books) ||
    !migrated.books.every((b) => typeof b === "string") ||
    !isValidProgress(migrated.progress)
  ) {
    throw new SaveLoadError("存档数据损坏（books/progress 字段无效）");
  }

  const state = migrated as unknown as GameState;

  const rejection = worldCheck?.(state) ?? null;
  if (rejection !== null) {
    throw new SaveLoadError(rejection);
  }

  return state;
}

/**
 * 存档迁移：把旧版本逐级升到当前版本，补齐新增字段默认值（never 静默丢档）。
 * 只处理 version < SAVE_VERSION 的情况；调用方已挡掉未来版本。返回升级后的副本。
 */
function migrate(save: Record<string, unknown>): Record<string, unknown> {
  let s = { ...save };
  // v1 → v2（M3）：新增 books（天书）与 progress（历练/熟练度）
  if (s.version === 1) {
    s = { ...s, version: 2, books: [], progress: {} };
  }
  return s;
}

function isValidProgress(v: unknown): boolean {
  if (!isRecord(v)) return false;
  return Object.values(v).every(
    (p) =>
      isRecord(p) &&
      typeof p.exp === "number" &&
      Number.isFinite(p.exp) &&
      isRecord(p.proficiency) &&
      Object.values(p.proficiency).every(
        (n) => typeof n === "number" && Number.isFinite(n),
      ),
  );
}
