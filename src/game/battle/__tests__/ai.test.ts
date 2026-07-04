import { describe, expect, it } from "vitest";
import { allyAutoTurnActions, autoTurnActions, enemyTurnActions } from "../ai";
import { battle, combatant, field } from "./fixtures";

describe("enemyTurnActions", () => {
  it("已相邻则直接攻击", () => {
    const enemy = combatant({ id: "enemy-0", side: "enemy", x: 3, y: 3 });
    const ally = combatant({ id: "player", side: "ally", x: 3, y: 4 });
    const state = battle([enemy, ally]);
    state.activeId = "enemy-0";
    expect(enemyTurnActions(state)).toEqual([
      { type: "attack", targetId: "player" },
    ]);
  });

  it("远处则朝最近敌人移动，靠近后攻击", () => {
    const enemy = combatant({
      id: "enemy-0",
      side: "enemy",
      x: 8,
      y: 4,
      move: 4,
    });
    const ally = combatant({ id: "player", side: "ally", x: 1, y: 4 });
    const state = battle([enemy, ally]);
    state.activeId = "enemy-0";
    const actions = enemyTurnActions(state);
    expect(actions[0]!.type).toBe("move");
    const move = actions[0] as { type: "move"; to: { x: number; y: number } };
    // 从 x=8 朝 x=1 移动 4 格 → x=4，仍未相邻，第二步待机
    expect(move.to).toEqual({ x: 4, y: 4 });
    expect(actions[1]).toEqual({ type: "wait" });
  });

  it("靠近后进入射程则移动到相邻格并攻击", () => {
    const enemy = combatant({
      id: "enemy-0",
      side: "enemy",
      x: 5,
      y: 4,
      move: 4,
    });
    const ally = combatant({ id: "player", side: "ally", x: 2, y: 4 });
    const state = battle([enemy, ally]);
    state.activeId = "enemy-0";
    const actions = enemyTurnActions(state);
    expect(actions[0]!.type).toBe("move");
    const move = actions[0] as { type: "move"; to: { x: number; y: number } };
    // 落点须与玩家正交相邻
    expect(Math.abs(move.to.x - 2) + Math.abs(move.to.y - 4)).toBe(1);
    expect(actions[1]).toEqual({ type: "attack", targetId: "player" });
  });

  it("无可达路径接近则原地待机", () => {
    // 敌人 (1,1) 四周全是墙，够不到玩家
    const enemy = combatant({
      id: "enemy-0",
      side: "enemy",
      x: 1,
      y: 1,
      move: 4,
    });
    const ally = combatant({ id: "player", side: "ally", x: 4, y: 1 });
    const state = battle(
      [enemy, ally],
      field(["#######", "#.#..#.", "#######"]),
    );
    state.activeId = "enemy-0";
    // (1,1) 四周：右(2,1)=# 下(1,2)=# 上(1,0)=# 左(0,1)=# 全封死
    expect(enemyTurnActions(state)).toEqual([{ type: "wait" }]);
  });

  it("无存活敌方目标则待机", () => {
    const enemy = combatant({ id: "enemy-0", side: "enemy", x: 3, y: 3 });
    const deadAlly = combatant({
      id: "player",
      side: "ally",
      x: 3,
      y: 4,
      hp: 0,
    });
    const state = battle([enemy, deadAlly]);
    state.activeId = "enemy-0";
    expect(enemyTurnActions(state)).toEqual([{ type: "wait" }]);
  });

  it("行动者非敌方时敌方 AI 待机（守卫）", () => {
    const ally = combatant({ id: "ally-guojing", side: "ally", x: 3, y: 3 });
    const enemy = combatant({ id: "enemy-0", side: "enemy", x: 3, y: 4 });
    const state = battle([ally, enemy]);
    state.activeId = "ally-guojing";
    expect(enemyTurnActions(state)).toEqual([{ type: "wait" }]);
  });
});

describe("友方 AI（剧情战友军）", () => {
  it("战友相邻敌人则攻击敌方（对方阵营）", () => {
    const guojing = combatant({ id: "ally-guojing", side: "ally", x: 3, y: 3 });
    const player = combatant({ id: "player", side: "ally", x: 0, y: 0 });
    const enemy = combatant({ id: "enemy-0", side: "enemy", x: 3, y: 4 });
    const state = battle([guojing, player, enemy]);
    state.activeId = "ally-guojing";
    expect(allyAutoTurnActions(state)).toEqual([
      { type: "attack", targetId: "enemy-0" },
    ]);
  });

  it("战友远离敌人则朝最近敌人移动", () => {
    const guojing = combatant({
      id: "ally-guojing",
      side: "ally",
      x: 1,
      y: 4,
      move: 4,
    });
    const enemy = combatant({ id: "enemy-0", side: "enemy", x: 8, y: 4 });
    const state = battle([guojing, enemy]);
    state.activeId = "ally-guojing";
    const actions = allyAutoTurnActions(state);
    expect(actions[0]!.type).toBe("move");
    const move = actions[0] as { type: "move"; to: { x: number; y: number } };
    expect(move.to).toEqual({ x: 5, y: 4 }); // 从 x=1 向 x=8 走 4 格
  });

  it("行动者非 ally 时友方 AI 待机（守卫）", () => {
    const enemy = combatant({ id: "enemy-0", side: "enemy", x: 3, y: 3 });
    const ally = combatant({ id: "player", side: "ally", x: 3, y: 4 });
    const state = battle([enemy, ally]);
    state.activeId = "enemy-0";
    expect(allyAutoTurnActions(state)).toEqual([{ type: "wait" }]);
  });

  it("autoTurnActions 按行动者阵营锁定对方为目标", () => {
    // ally 行动者 → 目标是 enemy；相邻则攻击
    const ally = combatant({ id: "ally-guojing", side: "ally", x: 2, y: 2 });
    const enemy = combatant({ id: "enemy-0", side: "enemy", x: 2, y: 3 });
    const state = battle([ally, enemy]);
    state.activeId = "ally-guojing";
    expect(autoTurnActions(state)).toEqual([
      { type: "attack", targetId: "enemy-0" },
    ]);
    // enemy 行动者 → 目标是 ally
    state.activeId = "enemy-0";
    expect(autoTurnActions(state)).toEqual([
      { type: "attack", targetId: "ally-guojing" },
    ]);
  });
});
