import { describe, expect, it } from "vitest";
import { newGame, type GameState } from "../state";
import {
  MAX_LEVEL,
  MAX_SKILL_LEVEL,
  applyStoryEffects,
  baseStatsAtLevel,
  companionStats,
  charLevel,
  expForLevel,
  expToNext,
  gainExp,
  grantBook,
  hasSkill,
  learnSkill,
  levelFromExp,
  practiceSkill,
  skillLevel,
  skillLevelFromPoints,
  skillPointsForLevel,
  skillPowerMultiplier,
} from "../progression";
import type { StoryEffect } from "../story/types";

function s(): GameState {
  return newGame({ mapId: "m", x: 0, y: 0 });
}

describe("历练等级曲线", () => {
  it("expToNext 遵循 100×lv^1.5，满级返回 null", () => {
    expect(expToNext(1)).toBe(100);
    expect(expToNext(2)).toBe(Math.round(100 * Math.pow(2, 1.5))); // 283
    expect(expToNext(MAX_LEVEL)).toBeNull();
  });

  it("levelFromExp 与 expForLevel 互为反函数（边界正确）", () => {
    expect(levelFromExp(0)).toBe(1);
    expect(levelFromExp(99)).toBe(1);
    expect(levelFromExp(100)).toBe(2);
    expect(levelFromExp(expForLevel(5))).toBe(5);
    expect(levelFromExp(expForLevel(5) - 1)).toBe(4);
  });

  it("历练等级封顶在 MAX_LEVEL", () => {
    expect(levelFromExp(99_999_999)).toBe(MAX_LEVEL);
  });
});

describe("队友属性折算（companionStats / baseStatsAtLevel）", () => {
  it("lv1 基准 = 主角初始裸装", () => {
    expect(baseStatsAtLevel(1)).toEqual({
      hp: 50,
      mp: 20,
      attack: 10,
      defense: 5,
      speed: 10,
      move: 4,
    });
  });

  it("按 §2.1 曲线成长，30 级锚点吻合", () => {
    const b = baseStatsAtLevel(MAX_LEVEL);
    expect(b).toMatchObject({
      hp: 282,
      mp: 136,
      attack: 68,
      defense: 34,
      speed: 24,
      move: 4,
    });
    // speed 每 2 级 +1
    expect(baseStatsAtLevel(2).speed).toBe(10);
    expect(baseStatsAtLevel(3).speed).toBe(11);
  });

  it("等级越界 clamp 到 [1, MAX_LEVEL]", () => {
    expect(baseStatsAtLevel(0)).toEqual(baseStatsAtLevel(1));
    expect(baseStatsAtLevel(999)).toEqual(baseStatsAtLevel(MAX_LEVEL));
  });

  it("缺省系数 = 同级基准原样", () => {
    expect(companionStats(5)).toEqual(baseStatsAtLevel(5));
  });

  it("郭靖系数（hp1.3 def1.2 spd0.8）四舍五入折算", () => {
    // 假设与主角同 10 级：基准 hp122 def14 spd14 atk28
    const b = baseStatsAtLevel(10);
    const guo = companionStats(10, { hp: 1.3, defense: 1.2, speed: 0.8 });
    expect(guo.hp).toBe(Math.round(b.hp * 1.3));
    expect(guo.defense).toBe(Math.round(b.defense * 1.2));
    expect(guo.speed).toBe(Math.round(b.speed * 0.8));
    expect(guo.attack).toBe(b.attack); // 未给系数 = ×1
  });

  it("弱项系数不把关键属性打到 0（下限保护）", () => {
    const s = companionStats(1, { attack: 0.05, hp: 0.001, speed: 0.01 });
    expect(s.attack).toBeGreaterThanOrEqual(1);
    expect(s.hp).toBeGreaterThanOrEqual(1);
    expect(s.speed).toBeGreaterThanOrEqual(1);
  });
});

describe("gainExp", () => {
  it("累加历练并报告升级", () => {
    const state = s();
    const g1 = gainExp(state, "player", 50);
    expect(g1).toMatchObject({ before: 1, after: 1, leveledUp: false });
    const g2 = gainExp(state, "player", 60); // 累计 110 → 2 级
    expect(g2).toMatchObject({ before: 1, after: 2, leveledUp: true });
    expect(charLevel(state, "player")).toBe(2);
    expect(state.progress["player"]?.exp).toBe(110);
  });

  it("负数历练抛错", () => {
    expect(() => gainExp(s(), "player", -1)).toThrow();
  });

  it("未记录角色默认 1 级", () => {
    expect(charLevel(s(), "nobody")).toBe(1);
  });
});

describe("武学熟练度", () => {
  it("skillPointsForLevel 累计公式 10·L·(L-1)", () => {
    expect(skillPointsForLevel(1)).toBe(0);
    expect(skillPointsForLevel(2)).toBe(20);
    expect(skillPointsForLevel(3)).toBe(60);
    expect(skillPointsForLevel(10)).toBe(900);
  });

  it("skillLevelFromPoints 边界与封顶", () => {
    expect(skillLevelFromPoints(0)).toBe(1);
    expect(skillLevelFromPoints(19)).toBe(1);
    expect(skillLevelFromPoints(20)).toBe(2);
    expect(skillLevelFromPoints(99_999)).toBe(MAX_SKILL_LEVEL);
  });

  it("每级 power +10%", () => {
    expect(skillPowerMultiplier(1)).toBeCloseTo(1.0);
    expect(skillPowerMultiplier(5)).toBeCloseTo(1.4);
    expect(skillPowerMultiplier(10)).toBeCloseTo(1.9);
  });

  it("practiceSkill 用一次涨一点，封顶不溢出", () => {
    const state = s();
    for (let i = 0; i < 20; i++) practiceSkill(state, "player", "changquan");
    expect(skillLevel(state, "player", "changquan")).toBe(2); // 20 点 = 2 级
    // 打到封顶
    for (let i = 0; i < 2000; i++) practiceSkill(state, "player", "changquan");
    expect(skillLevel(state, "player", "changquan")).toBe(MAX_SKILL_LEVEL);
    expect(state.progress["player"]?.proficiency["changquan"]).toBe(
      skillPointsForLevel(MAX_SKILL_LEVEL),
    );
  });

  it("learnSkill 解锁并直升 3 级，重复读书不降不重复解锁", () => {
    const state = s();
    expect(hasSkill(state, "player", "yeqiuquan")).toBe(false);
    expect(learnSkill(state, "player", "yeqiuquan")).toBe(true); // 首次
    expect(skillLevel(state, "player", "yeqiuquan")).toBe(3);
    expect(hasSkill(state, "player", "yeqiuquan")).toBe(true);
    // 已练到 5 级后再读书，不应降回 3
    for (let i = 0; i < 200; i++) practiceSkill(state, "player", "yeqiuquan");
    const lvBefore = skillLevel(state, "player", "yeqiuquan");
    expect(learnSkill(state, "player", "yeqiuquan")).toBe(false); // 非首次
    expect(skillLevel(state, "player", "yeqiuquan")).toBe(lvBefore);
  });
});

describe("grantBook 幂等", () => {
  it("首次发返回 true 且入库，重复发返回 false 且不重复", () => {
    const state = s();
    expect(grantBook(state, "book-shediao")).toBe(true);
    expect(grantBook(state, "book-shediao")).toBe(false);
    expect(state.books).toEqual(["book-shediao"]);
  });
});

describe("applyStoryEffects", () => {
  it("把 runner 的 effect 落到 state 并汇报", () => {
    const state = s();
    const effects: StoryEffect[] = [
      { type: "setFlag", flag: "guo-met" },
      { type: "grantClue", clueId: "clue-x" },
      { type: "gainExp", amount: 120 },
      { type: "learnSkill", skillId: "changquan" },
      { type: "learnSkill", skillId: "yeqiuquan", who: "huang" },
      { type: "grantBook", bookId: "book-shediao" },
      { type: "grantBook", bookId: "book-shediao" }, // 幂等
    ];
    const report = applyStoryEffects(state, effects, { player: "player" });

    expect(state.flags["guo-met"]).toBe(true);
    expect(state.clues).toContain("clue-x");
    expect(charLevel(state, "player")).toBe(2); // 120 exp
    expect(hasSkill(state, "player", "changquan")).toBe(true);
    expect(hasSkill(state, "huang", "yeqiuquan")).toBe(true); // who 指定
    expect(state.books).toEqual(["book-shediao"]); // 只一次

    expect(report.books).toEqual(["book-shediao"]);
    expect(report.exp).toHaveLength(1);
    expect(report.exp[0]?.leveledUp).toBe(true);
    expect(report.learned).toEqual([
      { charId: "player", skillId: "changquan" },
      { charId: "huang", skillId: "yeqiuquan" },
    ]);
  });

  it("gainExp 默认发给 player", () => {
    const state = s();
    applyStoryEffects(state, [{ type: "gainExp", amount: 100 }], {
      player: "xiaoxia",
    });
    expect(charLevel(state, "xiaoxia")).toBe(2);
  });

  it("adjustMorality 改正邪值、汇报净变化、clamp", () => {
    const state = s();
    const r1 = applyStoryEffects(
      state,
      [
        { type: "adjustMorality", delta: 10 },
        { type: "adjustMorality", delta: 5 },
      ],
      { player: "player" },
    );
    expect(state.morality).toBe(15);
    expect(r1.moralityDelta).toBe(15);
    // clamp：moralityDelta 汇报**实际**变化（到上限后为 0），不是 raw amount
    const r2 = applyStoryEffects(
      state,
      [{ type: "adjustMorality", delta: 999 }],
      { player: "player" },
    );
    expect(state.morality).toBe(100); // MORALITY_MAX
    expect(r2.moralityDelta).toBe(85); // 100 - 15，而非 999
  });

  it("switchMap 改玩家位置并置 report.switchedMap", () => {
    const state = s();
    expect(state.player.mapId).toBe("m");
    const report = applyStoryEffects(
      state,
      [{ type: "switchMap", mapId: "huashan-summit", x: 3, y: 6 }],
      { player: "player" },
    );
    expect(state.player).toMatchObject({ mapId: "huashan-summit", x: 3, y: 6 });
    expect(report.switchedMap).toBe(true);
  });

  it("无 switchMap 时 report.switchedMap 为 false", () => {
    const report = applyStoryEffects(s(), [{ type: "setFlag", flag: "a" }], {
      player: "player",
    });
    expect(report.switchedMap).toBe(false);
  });

  it("recruit 入队并汇报，幂等（重复招募不重复汇报）", () => {
    const state = s();
    const report = applyStoryEffects(
      state,
      [
        { type: "recruit", charId: "guojing" },
        { type: "recruit", charId: "huangrong" },
        { type: "recruit", charId: "guojing" }, // 幂等
      ],
      { player: "player" },
    );
    expect(state.party).toEqual(["guojing", "huangrong"]);
    expect(report.recruited).toEqual(["guojing", "huangrong"]);
  });
});
