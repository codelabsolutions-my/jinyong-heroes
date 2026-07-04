import { grantClue } from "./journal";
import { type GameState, type CharProgress, setFlag } from "./state";
import type { StoryEffect } from "./story/types";

/**
 * 养成/奖励纯逻辑（NEXT_STEPS §2.3，数值见 CHARACTERS §2.1）。零 Pixi、零 I/O。
 *
 * 设计原则：**只落盘 exp / 熟练度点数，等级由曲线反推**——避免升级后等级与经验不同步。
 * - 历练：从 lv 升到 lv+1 需 `round(100 × lv^1.5)`，上限 30 级。
 * - 武学熟练度：从 lv 升到 lv+1 需 `20 × lv` 点，上限 10 级，每级 power +10%。
 *   读秘籍 = 解锁武学 + 直升 3 级。
 */

export const MAX_LEVEL = 30;
export const MAX_SKILL_LEVEL = 10;

/** 从 level 升到 level+1 所需历练；满级返回 null。 */
export function expToNext(level: number): number | null {
  if (level >= MAX_LEVEL) return null;
  return Math.round(100 * Math.pow(level, 1.5));
}

/** 到达某等级所需的累计历练（level=1 → 0）。 */
export function expForLevel(level: number): number {
  let acc = 0;
  for (let lv = 1; lv < level; lv++) {
    const need = expToNext(lv);
    if (need === null) break;
    acc += need;
  }
  return acc;
}

/** 累计历练 → 等级（1..MAX_LEVEL）。 */
export function levelFromExp(exp: number): number {
  let level = 1;
  let acc = 0;
  while (level < MAX_LEVEL) {
    const need = expToNext(level);
    if (need === null) break;
    if (exp < acc + need) break;
    acc += need;
    level++;
  }
  return level;
}

/** 累计熟练度点数达到某等级所需（level=1 → 0，公式 10·L·(L-1)）。 */
export function skillPointsForLevel(level: number): number {
  return 10 * level * (level - 1);
}

/** 熟练度点数 → 武学等级（1..MAX_SKILL_LEVEL）。 */
export function skillLevelFromPoints(points: number): number {
  let lv = 1;
  while (lv < MAX_SKILL_LEVEL && points >= skillPointsForLevel(lv + 1)) lv++;
  return lv;
}

/** 武学 power 倍率：每级 +10%。 */
export function skillPowerMultiplier(level: number): number {
  return 1 + 0.1 * (level - 1);
}

function ensureProgress(state: GameState, charId: string): CharProgress {
  let p = state.progress[charId];
  if (!p) {
    p = { exp: 0, proficiency: {} };
    state.progress[charId] = p;
  }
  return p;
}

/** 角色当前历练等级（无记录默认 1 级）。 */
export function charLevel(state: GameState, charId: string): number {
  const p = state.progress[charId];
  return p ? levelFromExp(p.exp) : 1;
}

/** 角色某武学当前熟练等级（未习得默认 1 级基准；用 hasSkill 判是否习得）。 */
export function skillLevel(
  state: GameState,
  charId: string,
  skillId: string,
): number {
  const pts = state.progress[charId]?.proficiency[skillId] ?? 0;
  return skillLevelFromPoints(pts);
}

export interface ExpGain {
  charId: string;
  before: number;
  after: number;
  leveledUp: boolean;
}

/** 给角色发历练值，返回升级信息（before/after 等级）。 */
export function gainExp(
  state: GameState,
  charId: string,
  amount: number,
): ExpGain {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`gainExp: 非法历练值 ${amount}`);
  }
  const p = ensureProgress(state, charId);
  const before = levelFromExp(p.exp);
  p.exp += amount;
  const after = levelFromExp(p.exp);
  return { charId, before, after, leveledUp: after > before };
}

/** 练一次武学：熟练度 +1 点（战斗中用招时调用），返回等级变化。 */
export function practiceSkill(
  state: GameState,
  charId: string,
  skillId: string,
): { before: number; after: number } {
  const p = ensureProgress(state, charId);
  const cap = skillPointsForLevel(MAX_SKILL_LEVEL);
  const pts = p.proficiency[skillId] ?? 0;
  const before = skillLevelFromPoints(pts);
  p.proficiency[skillId] = Math.min(pts + 1, cap);
  return { before, after: skillLevelFromPoints(p.proficiency[skillId]) };
}

/** 读秘籍：解锁武学并直升 3 级（已达则不降）。返回是否**首次**习得。 */
export function learnSkill(
  state: GameState,
  charId: string,
  skillId: string,
): boolean {
  const p = ensureProgress(state, charId);
  const newly = !(skillId in p.proficiency);
  const target = skillPointsForLevel(3);
  const cur = p.proficiency[skillId] ?? 0;
  p.proficiency[skillId] = Math.max(cur, target);
  return newly;
}

/** 是否已习得某武学。 */
export function hasSkill(
  state: GameState,
  charId: string,
  skillId: string,
): boolean {
  return skillId in (state.progress[charId]?.proficiency ?? {});
}

/** 发天书（幂等，已有则不重复）。返回是否**新**获得。 */
export function grantBook(state: GameState, bookId: string): boolean {
  if (state.books.includes(bookId)) return false;
  state.books.push(bookId);
  return true;
}

export interface StoryEffectReport {
  /** 本批新获得的天书 id */
  books: string[];
  /** 本批历练变化 */
  exp: ExpGain[];
  /** 本批新习得的武学 */
  learned: { charId: string; skillId: string }[];
}

/**
 * 把 runner 产出的 StoryEffect 落到 state（NEXT_STEPS §2.3）。
 * setFlag/grantClue 幂等（runner 通常已应用，这里重复无害）；grantBook/gainExp/learnSkill
 * 在此真正生效。gainExp 无显式对象时发给 `opts.player`；learnSkill 用 `effect.who ?? player`。
 */
export function applyStoryEffects(
  state: GameState,
  effects: readonly StoryEffect[],
  opts: { player: string },
): StoryEffectReport {
  const report: StoryEffectReport = { books: [], exp: [], learned: [] };
  for (const e of effects) {
    switch (e.type) {
      case "setFlag":
        setFlag(state, e.flag);
        break;
      case "grantClue":
        grantClue(state, e.clueId);
        break;
      case "grantBook":
        if (grantBook(state, e.bookId)) report.books.push(e.bookId);
        break;
      case "gainExp":
        report.exp.push(gainExp(state, opts.player, e.amount));
        break;
      case "learnSkill": {
        const who = e.who ?? opts.player;
        if (learnSkill(state, who, e.skillId)) {
          report.learned.push({ charId: who, skillId: e.skillId });
        }
        break;
      }
    }
  }
  return report;
}
