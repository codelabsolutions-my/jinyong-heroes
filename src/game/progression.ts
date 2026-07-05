import { grantClue } from "./journal";
import {
  type GameState,
  type CharProgress,
  addCompanion,
  adjustMorality,
  setFlag,
} from "./state";
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

/**
 * 队友属性折算（M4，CHARACTERS §2.2/§4）：`队友属性 = 主角同级基准 × 角色系数`。
 * 主角同级基准 = 主角在该等级的裸装数值，按 §2.1 每级成长推。move 是设计资源不通胀，
 * 只靠轻功类武学提升（M4+），此处 move 系数默认 1（=4）。
 */
export interface StatBlock {
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  move: number;
}

/** 队友成长系数（各项乘数，缺省 1.0）。数据放 CharacterDef.coeff。 */
export interface CompanionCoeff {
  hp?: number;
  mp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  move?: number;
}

/**
 * 主角某等级的裸装基准（§2.1：lv1 = hp50/mp20/atk10/def5/spd10/move4；
 * 每级 hp+8 mp+4 atk+2 def+1、speed 每 2 级 +1、move 固定 4）。
 * 30 级约 hp282/mp136/atk68/def34/spd24（doc"约290"为四舍五入估值）。
 */
export function baseStatsAtLevel(level: number): StatBlock {
  const L = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  return {
    hp: 50 + 8 * (L - 1),
    mp: 20 + 4 * (L - 1),
    attack: 10 + 2 * (L - 1),
    defense: 5 + (L - 1),
    speed: 10 + Math.floor((L - 1) / 2),
    move: 4,
  };
}

/** 按系数把同级基准折算成队友有效属性（四舍五入，hp/mp 至少 1）。 */
export function companionStats(
  level: number,
  coeff: CompanionCoeff = {},
): StatBlock {
  const b = baseStatsAtLevel(level);
  const scale = (v: number, c: number | undefined) => Math.round(v * (c ?? 1));
  return {
    hp: Math.max(1, scale(b.hp, coeff.hp)),
    mp: Math.max(0, scale(b.mp, coeff.mp)),
    attack: Math.max(1, scale(b.attack, coeff.attack)),
    defense: Math.max(0, scale(b.defense, coeff.defense)),
    speed: Math.max(1, scale(b.speed, coeff.speed)),
    move: Math.max(1, scale(b.move, coeff.move)),
  };
}

/**
 * 我方单位某主角等级下的**有效属性**（M5 §2.1，队友系数/等级折算的唯一真源）：
 * 主角（id==="player"）→ 该等级裸装基准；带 `coeff` 的队友/战友军 → 基准×系数；
 * 其余（无 coeff 的我方）→ 静态。战斗 `setupBattle` 与状态页 `StatusPanel` 共用此函数，
 * 保证「状态页看到的数值」= 「战斗里用的数值」（不各算各的）。敌方不走此函数，保持静态。
 *
 * 入参按结构类型取用（`id`/`coeff` + StatBlock 字段），`CharacterDef` 天然满足，
 * 避免 game→data 的类型环依赖。
 */
export function effectiveAllyStats(
  unit: StatBlock & { id: string; coeff?: CompanionCoeff },
  playerLevel: number,
): StatBlock {
  if (unit.id === "player") return baseStatsAtLevel(playerLevel);
  if (unit.coeff) return companionStats(playerLevel, unit.coeff);
  return {
    hp: unit.hp,
    mp: unit.mp,
    attack: unit.attack,
    defense: unit.defense,
    speed: unit.speed,
    move: unit.move,
  };
}

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
  /** 本批新招募的队友 charId */
  recruited: string[];
  /** 本批是否发生过场切图（Game 据此 rebuildScene；玩家新位置已写入 state.player） */
  switchedMap: boolean;
  /** 本批正邪值净变化（正=偏侠，负=偏邪；0=无变化） */
  moralityDelta: number;
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
  const report: StoryEffectReport = {
    books: [],
    exp: [],
    learned: [],
    recruited: [],
    switchedMap: false,
    moralityDelta: 0,
  };
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
      case "recruit":
        if (addCompanion(state, e.charId)) report.recruited.push(e.charId);
        break;
      case "switchMap":
        // 过场切图：写入新位置（纯状态）；场景重建由 Game 据 report.switchedMap 处理
        state.player.mapId = e.mapId;
        state.player.x = e.x;
        state.player.y = e.y;
        report.switchedMap = true;
        break;
      case "adjustMorality": {
        // 汇报**实际**变化（clamp 后），避免已到上/下限时仍弹侠名/恶名提示
        const before = state.morality;
        adjustMorality(state, e.delta); // clamp 在 state 层
        report.moralityDelta += state.morality - before;
        break;
      }
    }
  }
  return report;
}
