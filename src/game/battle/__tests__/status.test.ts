import { describe, expect, it } from "vitest";
import { makeRng } from "@/game/rng";
import { resolve } from "../resolve";
import { turnOrder } from "../turnOrder";
import {
  type BattleAction,
  type BattleState,
  combatantById,
  effectiveStat,
} from "../types";
import { battle, combatant, skill } from "./fixtures";

const rng = () => makeRng(7);

/** 施放一个带 status 的武学后取回目标。 */
function castStatus(status: {
  stat: "attack" | "defense" | "speed";
  amount: number;
  duration: number;
}): { after: BattleState; targetId: string } {
  const caster = combatant({
    id: "a",
    side: "ally",
    x: 0,
    y: 0,
    speed: 20,
    skills: [skill({ id: "jimou", power: 1, mpCost: 0, status })],
  });
  const foe = combatant({ id: "e", side: "enemy", x: 1, y: 0, speed: 10 });
  const s0 = battle([caster, foe]);
  expect(s0.activeId).toBe("a");
  const after = resolve(
    s0,
    { type: "skill", skillId: "jimou", targetId: "e" },
    rng(),
  );
  return { after, targetId: "e" };
}

describe("effectiveStat", () => {
  it("累加所有匹配的状态到基础值", () => {
    const c = combatant({ id: "c", side: "ally", x: 0, y: 0, speed: 10 });
    c.statuses = [
      { stat: "speed", amount: -5, remaining: 2 },
      { stat: "speed", amount: -2, remaining: 1 },
      { stat: "attack", amount: 3, remaining: 1 },
    ];
    expect(effectiveStat(c, "speed")).toBe(3); // 10-5-2
    expect(effectiveStat(c, "attack")).toBe(c.attack + 3);
    expect(effectiveStat(c, "defense")).toBe(c.defense); // 无状态
  });
});

describe("resolve — 命中施加状态", () => {
  it("减益武学命中后给目标挂状态", () => {
    const { after, targetId } = castStatus({
      stat: "speed",
      amount: -5,
      duration: 2,
    });
    const foe = combatantById(after, targetId)!;
    expect(foe.statuses).toContainEqual({
      stat: "speed",
      amount: -5,
      remaining: 2,
    });
    expect(effectiveStat(foe, "speed")).toBe(10 - 5);
  });

  it("防御减益让后续伤害变高（有效防御下降）", () => {
    const { after } = castStatus({ stat: "defense", amount: -20, duration: 3 });
    const foe = combatantById(after, "e")!;
    // 基础 def 5，减益后有效 -15
    expect(effectiveStat(foe, "defense")).toBe(5 - 20);
  });

  it("目标已倒下不挂状态", () => {
    const caster = combatant({
      id: "a",
      side: "ally",
      x: 0,
      y: 0,
      attack: 999,
      speed: 20,
      skills: [
        skill({
          id: "k",
          power: 50,
          mpCost: 0,
          status: { stat: "speed", amount: -5, duration: 2 },
        }),
      ],
    });
    const foe = combatant({
      id: "e",
      side: "enemy",
      x: 1,
      y: 0,
      hp: 1,
      maxHp: 1,
      defense: 0,
    });
    const after = resolve(
      battle([caster, foe]),
      { type: "skill", skillId: "k", targetId: "e" },
      rng(),
    );
    const dead = combatantById(after, "e")!;
    expect(dead.hp).toBe(0);
    expect(dead.statuses).toEqual([]); // 倒下不挂
  });
});

describe("turnOrder — 用有效 speed", () => {
  it("身法减益的单位行动更靠后", () => {
    const fast = combatant({ id: "fast", side: "ally", x: 0, y: 0, speed: 12 });
    const slow = combatant({
      id: "slow",
      side: "enemy",
      x: 5,
      y: 0,
      speed: 10,
    });
    const s = battle([fast, slow]);
    expect(turnOrder(s)).toEqual(["fast", "slow"]);
    // 给 fast 挂 -5 身法 → 有效 7 < 10，行动序反转
    fast.statuses = [{ stat: "speed", amount: -5, remaining: 2 }];
    expect(turnOrder(s)).toEqual(["slow", "fast"]);
  });
});

describe("状态衰减", () => {
  it("每新回合剩余 -1，到期移除", () => {
    // duration 2：本回合挂上，撑过一个整回合，第二个新回合到期
    const { after } = castStatus({ stat: "speed", amount: -5, duration: 2 });
    // after 是 a 出手后（a 的回合结束，轮到 e）。此时同一回合内，未衰减
    let s = after;
    const wait = (): BattleAction => ({ type: "wait" });
    // e 待机 → 队列空 → round+1 → 衰减一次（remaining 2→1）
    s = resolve(s, wait(), rng());
    expect(combatantById(s, "e")!.statuses[0]?.remaining).toBe(1);
    // 再走一整回合（a 待机、e 待机）→ round+1 → 衰减（1→0 移除）
    s = resolve(s, wait(), rng()); // a
    s = resolve(s, wait(), rng()); // e → 新回合
    expect(combatantById(s, "e")!.statuses).toEqual([]);
  });
});

describe("回放确定性（含状态）", () => {
  it("同序列两次 resolve → 深度相等（含 statuses）", () => {
    const build = () => {
      const a = combatant({
        id: "a",
        side: "ally",
        x: 0,
        y: 0,
        speed: 20,
        skills: [
          skill({
            id: "jimou",
            power: 1,
            mpCost: 0,
            status: { stat: "speed", amount: -5, duration: 2 },
          }),
        ],
      });
      const e = combatant({ id: "e", side: "enemy", x: 1, y: 0, speed: 10 });
      return battle([a, e]);
    };
    const actions: BattleAction[] = [
      { type: "skill", skillId: "jimou", targetId: "e" },
      { type: "wait" },
      { type: "wait" },
    ];
    const run = (s0: BattleState) => {
      let s = s0;
      for (const a of actions) s = resolve(s, a, makeRng(3));
      return s;
    };
    expect(run(build())).toEqual(run(build()));
  });
});
