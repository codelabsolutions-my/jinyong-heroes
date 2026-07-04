import { describe, expect, it } from "vitest";
import { makeRng } from "@/game/rng";
import { CHARACTERS } from "@/data/characters";
import { ENCOUNTERS } from "@/data/battles";
import { SKILLS } from "@/data/skills";
import { resolve } from "../resolve";
import { setupBattle } from "../setup";
import { type BattleAction, type BattleState, combatantById } from "../types";
import { battle, combatant } from "./fixtures";

/** 按 active 方选动作，驱动到分出胜负（或步数上限）。 */
function drive(
  s0: BattleState,
  allyAction: (s: BattleState) => BattleAction,
  enemyAction: (s: BattleState) => BattleAction,
  maxSteps = 60,
): BattleState {
  let s = s0;
  for (let i = 0; i < maxSteps && s.outcome === "ongoing"; i++) {
    const active = combatantById(s, s.activeId!)!;
    const act = active.side === "ally" ? allyAction(s) : enemyAction(s);
    s = resolve(s, act, makeRng(1));
  }
  return s;
}

const wait = (): BattleAction => ({ type: "wait" });

describe("战斗目标 — surviveRounds（打不过也能过）", () => {
  it("我方存活满 N 回合即判胜（无需歼敌）", () => {
    const a = combatant({ id: "a", side: "ally", x: 0, y: 0, speed: 20 });
    const e = combatant({ id: "e", side: "enemy", x: 9, y: 7, speed: 1 });
    const s0 = battle([a, e]);
    s0.objective = { surviveRounds: 2 };

    const end = drive(s0, wait, wait);
    expect(end.outcome).toBe("victory");
    expect(end.round).toBeGreaterThan(2);
    // 双方都还活着——不是靠歼灭赢的
    expect(combatantById(end, "e")!.hp).toBeGreaterThan(0);
  });

  it("撑不到 N 回合就全灭 → 判负（onLose 路线）", () => {
    const a = combatant({
      id: "a",
      side: "ally",
      x: 0,
      y: 0,
      hp: 3,
      maxHp: 3,
      speed: 20,
    });
    const e = combatant({
      id: "e",
      side: "enemy",
      x: 1,
      y: 0,
      attack: 30,
      speed: 1,
    });
    const s0 = battle([a, e]);
    s0.objective = { surviveRounds: 5 };

    const end = drive(s0, wait, () => ({ type: "attack", targetId: "a" }));
    expect(end.outcome).toBe("defeat");
    expect(end.round).toBeLessThanOrEqual(5);
  });

  it("有目标时歼灭全部敌人仍照常判胜（歼灭优先）", () => {
    const a = combatant({
      id: "a",
      side: "ally",
      x: 0,
      y: 0,
      attack: 40,
      speed: 20,
    });
    const e = combatant({
      id: "e",
      side: "enemy",
      x: 1,
      y: 0,
      hp: 3,
      maxHp: 3,
      speed: 1,
    });
    const s0 = battle([a, e]);
    s0.objective = { surviveRounds: 99 };

    const end = drive(s0, () => ({ type: "attack", targetId: "e" }), wait);
    expect(end.outcome).toBe("victory");
    expect(combatantById(end, "e")!.hp).toBe(0);
  });

  it("无目标时不会因回合数自动判胜（默认规则不变）", () => {
    const a = combatant({ id: "a", side: "ally", x: 0, y: 0, speed: 20 });
    const e = combatant({ id: "e", side: "enemy", x: 9, y: 7, speed: 1 });
    const end = drive(battle([a, e]), wait, wait, 30);
    expect(end.outcome).toBe("ongoing");
    expect(end.round).toBeGreaterThan(2);
  });
});

describe("setupBattle 透传 objective", () => {
  it("把 encounter.objective 拷进 state（独立副本）", () => {
    const base = ENCOUNTERS["houshan-bandits"]!;
    const encounter = { ...base, objective: { surviveRounds: 3 } };
    const state = setupBattle({
      encounter,
      party: [CHARACTERS["player"]!],
      characterTable: CHARACTERS,
      skillTable: SKILLS,
      seed: 1,
    });
    expect(state.objective).toEqual({ surviveRounds: 3 });
    expect(state.objective).not.toBe(encounter.objective); // 深拷贝，不别名内容源
  });

  it("无 objective 的遭遇 state.objective 为 undefined", () => {
    const state = setupBattle({
      encounter: ENCOUNTERS["houshan-bandits"]!,
      party: [CHARACTERS["player"]!],
      characterTable: CHARACTERS,
      skillTable: SKILLS,
      seed: 1,
    });
    expect(state.objective).toBeUndefined();
  });
});
