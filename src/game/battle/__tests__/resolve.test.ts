import { describe, expect, it } from "vitest";
import { makeRng } from "@/game/rng";
import { CHARACTERS } from "@/data/characters";
import { ENCOUNTERS } from "@/data/battles";
import { SKILLS } from "@/data/skills";
import { resolve } from "../resolve";
import { setupBattle } from "../setup";
import { inAttackRange, manhattan, reachableTiles } from "../range";
import { type BattleAction, type BattleState, combatantById } from "../types";
import { battle, combatant, skill } from "./fixtures";

const rng = () => makeRng(7);

describe("resolve — move", () => {
  it("合法移动改变位置、标记已移动、不结束回合", () => {
    const u = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 2,
      move: 3,
      speed: 20,
    });
    const e = combatant({ id: "e", side: "enemy", x: 9, y: 7, speed: 1 });
    const s0 = battle([u, e]);
    const s1 = resolve(s0, { type: "move", to: { x: 4, y: 2 } }, rng());
    const a = combatantById(s1, "a")!;
    expect(a).toMatchObject({ x: 4, y: 2 });
    expect(s1.turnMoved).toBe(true);
    expect(s1.activeId).toBe("a"); // 回合未结束
  });

  it("同回合二次移动无效", () => {
    const u = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 2,
      move: 3,
      speed: 20,
    });
    const e = combatant({ id: "e", side: "enemy", x: 9, y: 7, speed: 1 });
    const s1 = resolve(
      battle([u, e]),
      { type: "move", to: { x: 3, y: 2 } },
      rng(),
    );
    const s2 = resolve(s1, { type: "move", to: { x: 4, y: 2 } }, rng());
    expect(combatantById(s2, "a")).toMatchObject({ x: 3, y: 2 }); // 未再动
  });

  it("移动到不可达格无效（no-op）", () => {
    const u = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 2,
      move: 2,
      speed: 20,
    });
    const e = combatant({ id: "e", side: "enemy", x: 9, y: 7, speed: 1 });
    const s0 = battle([u, e]);
    const s1 = resolve(s0, { type: "move", to: { x: 9, y: 2 } }, rng());
    expect(s1).toBe(s0); // 原样返回
  });
});

describe("resolve — attack / skill", () => {
  it("普攻造成伤害并结束回合（切换到下一行动者）", () => {
    const a = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 2,
      speed: 20,
      attack: 10,
    });
    const e = combatant({
      id: "e",
      side: "enemy",
      x: 2,
      y: 3,
      speed: 1,
      hp: 30,
      defense: 5,
    });
    const s1 = resolve(
      battle([a, e]),
      { type: "attack", targetId: "e" },
      rng(),
    );
    expect(combatantById(s1, "e")!.hp).toBeLessThan(30);
    expect(s1.activeId).toBe("e"); // 轮到敌人
  });

  it("射程外攻击无效", () => {
    const a = combatant({ id: "a", side: "ally", x: 2, y: 2, speed: 20 });
    const e = combatant({ id: "e", side: "enemy", x: 5, y: 5, speed: 1 });
    const s0 = battle([a, e]);
    expect(resolve(s0, { type: "attack", targetId: "e" }, rng())).toBe(s0);
  });

  it("武学耗内力并按系别克制结算", () => {
    const a = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 2,
      speed: 20,
      mp: 10,
      attack: 10,
      skills: [
        skill({ id: "gang", school: "刚", power: 6, mpCost: 3, range: 1 }),
      ],
    });
    const e = combatant({
      id: "e",
      side: "enemy",
      x: 2,
      y: 3,
      speed: 1,
      hp: 40,
      defense: 3,
    });
    const s1 = resolve(
      battle([a, e]),
      { type: "skill", skillId: "gang", targetId: "e" },
      rng(),
    );
    expect(combatantById(s1, "a")!.mp).toBe(7); // 10-3
    expect(combatantById(s1, "e")!.hp).toBeLessThan(40);
  });

  it("内力不足时武学无效", () => {
    const a = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 2,
      speed: 20,
      mp: 2,
      skills: [
        skill({ id: "gang", school: "刚", power: 6, mpCost: 3, range: 1 }),
      ],
    });
    const e = combatant({ id: "e", side: "enemy", x: 2, y: 3, speed: 1 });
    const s0 = battle([a, e]);
    expect(
      resolve(s0, { type: "skill", skillId: "gang", targetId: "e" }, rng()),
    ).toBe(s0);
  });
});

describe("resolve — 回合与胜负", () => {
  it("所有单位行动后进入下一回合并重算行动序", () => {
    const a = combatant({ id: "a", side: "ally", x: 0, y: 0, speed: 20 });
    const b = combatant({ id: "b", side: "enemy", x: 9, y: 7, speed: 10 });
    let s = battle([a, b]);
    expect(s.round).toBe(1);
    s = resolve(s, { type: "wait" }, rng()); // a 行动
    expect(s.activeId).toBe("b");
    s = resolve(s, { type: "wait" }, rng()); // b 行动 → 新回合
    expect(s.round).toBe(2);
    expect(s.activeId).toBe("a");
  });

  it("击杀最后一个敌人 → victory", () => {
    const a = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 2,
      speed: 20,
      attack: 100,
    });
    const e = combatant({
      id: "e",
      side: "enemy",
      x: 2,
      y: 3,
      speed: 1,
      hp: 5,
      defense: 0,
    });
    const s1 = resolve(
      battle([a, e]),
      { type: "attack", targetId: "e" },
      rng(),
    );
    expect(combatantById(s1, "e")!.hp).toBe(0);
    expect(s1.outcome).toBe("victory");
  });

  it("我方全灭 → defeat", () => {
    const e = combatant({
      id: "e",
      side: "enemy",
      x: 2,
      y: 2,
      speed: 20,
      attack: 100,
    });
    const a = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 3,
      speed: 1,
      hp: 5,
      defense: 0,
    });
    const s1 = resolve(
      battle([e, a]),
      { type: "attack", targetId: "a" },
      rng(),
    );
    expect(s1.outcome).toBe("defeat");
  });

  it("战斗结束后 resolve 不再改变状态", () => {
    const a = combatant({
      id: "a",
      side: "ally",
      x: 2,
      y: 2,
      speed: 20,
      attack: 100,
    });
    const e = combatant({
      id: "e",
      side: "enemy",
      x: 2,
      y: 3,
      speed: 1,
      hp: 5,
      defense: 0,
    });
    const won = resolve(
      battle([a, e]),
      { type: "attack", targetId: "e" },
      rng(),
    );
    expect(resolve(won, { type: "wait" }, rng())).toBe(won);
  });
});

describe("resolve — 日志封顶", () => {
  it("战斗日志不无限增长（封顶，避免 clone 越来越贵）", () => {
    const a = combatant({ id: "a", side: "ally", x: 0, y: 0, speed: 20 });
    const b = combatant({ id: "b", side: "enemy", x: 9, y: 7, speed: 10 });
    let s = battle([a, b]);
    const r = makeRng(1);
    // 反复待机推进大量回合
    for (let i = 0; i < 100; i++) s = resolve(s, { type: "wait" }, r);
    expect(s.outcome).toBe("ongoing");
    expect(s.log.length).toBeLessThanOrEqual(12);
  });
});

describe("resolve — 纯函数性与回放", () => {
  it("不修改传入的 state", () => {
    const a = combatant({ id: "a", side: "ally", x: 2, y: 2, speed: 20 });
    const e = combatant({ id: "e", side: "enemy", x: 2, y: 3, speed: 1 });
    const s0 = battle([a, e]);
    const snapshot = structuredClone(s0);
    resolve(s0, { type: "attack", targetId: "e" }, rng());
    expect(s0).toEqual(snapshot);
  });

  it("同 seed + 同动作序列 → 完全一致的结果（回放）", () => {
    const actions: BattleAction[] = [
      { type: "move", to: { x: 3, y: 2 } },
      { type: "attack", targetId: "e" },
      { type: "wait" },
    ];
    const run = () => {
      const a = combatant({
        id: "a",
        side: "ally",
        x: 2,
        y: 2,
        speed: 20,
        attack: 10,
      });
      const e = combatant({
        id: "e",
        side: "enemy",
        x: 4,
        y: 2,
        speed: 5,
        hp: 40,
        defense: 3,
      });
      let s = battle([a, e]);
      const r = makeRng(9999);
      for (const act of actions) s = resolve(s, act, r);
      return s;
    };
    expect(run()).toEqual(run());
  });
});

// ── 全自动模拟：既是平衡测试，也验证整条 resolve 循环 ──

/** 通用自动策略：入射程则攻击，否则趋近最近敌，靠近后能打就打 */
function autoActions(state: BattleState): BattleAction[] {
  const self = combatantById(state, state.activeId!)!;
  const foes = state.combatants.filter((c) => c.hp > 0 && c.side !== self.side);
  if (foes.length === 0) return [{ type: "wait" }];

  const here = foes.filter((f) => inAttackRange(self, f, 1));
  if (here.length > 0) return [{ type: "attack", targetId: here[0]!.id }];

  const target = [...foes].sort(
    (a, b) => manhattan(self, a) - manhattan(self, b) || (a.id < b.id ? -1 : 1),
  )[0]!;
  const reachable = reachableTiles(state, self);
  let best = { x: self.x, y: self.y };
  let bestD = manhattan(self, target);
  for (const key of [...reachable].sort()) {
    const [x, y] = key.split(",").map(Number) as [number, number];
    const d = manhattan({ x, y }, target);
    if (d < bestD) {
      bestD = d;
      best = { x, y };
    }
  }
  const acts: BattleAction[] = [];
  if (best.x !== self.x || best.y !== self.y)
    acts.push({ type: "move", to: best });
  const after = foes.filter((f) => inAttackRange(best, f, 1));
  acts.push(
    after.length
      ? { type: "attack", targetId: after[0]!.id }
      : { type: "wait" },
  );
  return acts;
}

function simulate(state: BattleState, seed: number): BattleState {
  let s = state;
  const r = makeRng(seed);
  let guard = 0;
  while (s.outcome === "ongoing" && guard++ < 1000) {
    for (const act of autoActions(s)) {
      s = resolve(s, act, r);
      if (s.outcome !== "ongoing") break;
    }
  }
  return s;
}

describe("平衡性 — 后山拦路教学关", () => {
  it("自动策略稳赢，主角存活，回合数合理", () => {
    const state = setupBattle({
      encounter: ENCOUNTERS["houshan-bandits"]!,
      party: [CHARACTERS["player"]!],
      characterTable: CHARACTERS,
      skillTable: SKILLS,
      seed: 123,
    });
    const end = simulate(state, 123);
    expect(end.outcome).toBe("victory");
    expect(combatantById(end, "player")!.hp).toBeGreaterThan(0);
    expect(end.round).toBeLessThanOrEqual(12);
  });

  it("多个 seed 下均稳赢（数值不吃脸）", () => {
    for (const seed of [1, 42, 777, 2024, 99999]) {
      const state = setupBattle({
        encounter: ENCOUNTERS["houshan-bandits"]!,
        party: [CHARACTERS["player"]!],
        characterTable: CHARACTERS,
        skillTable: SKILLS,
        seed,
      });
      const end = simulate(state, seed);
      expect(end.outcome, `seed ${seed}`).toBe("victory");
      expect(combatantById(end, "player")!.hp, `seed ${seed}`).toBeGreaterThan(
        0,
      );
    }
  });
});
