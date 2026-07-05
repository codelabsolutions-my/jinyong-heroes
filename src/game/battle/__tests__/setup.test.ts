import { describe, expect, it } from "vitest";
import { CHARACTERS } from "@/data/characters";
import { ENCOUNTERS } from "@/data/battles";
import { SKILLS } from "@/data/skills";
import { setupBattle } from "../setup";

function setupHoushan() {
  return setupBattle({
    encounter: ENCOUNTERS["houshan-bandits"]!,
    party: [CHARACTERS["player"]!],
    characterTable: CHARACTERS,
    skillTable: SKILLS,
    seed: 42,
  });
}

describe("setupBattle", () => {
  it("按出生点放置我方、按定义放置敌方", () => {
    const s = setupHoushan();
    const player = s.combatants.find((c) => c.id === "player")!;
    expect(player.side).toBe("ally");
    expect(player).toMatchObject({ x: 1, y: 4 });
    const enemies = s.combatants.filter((c) => c.side === "enemy");
    expect(enemies).toHaveLength(2);
    expect(enemies.map((e) => e.id)).toEqual(["enemy-0", "enemy-1"]);
  });

  it("展开武学 id → SkillRuntime 嵌进单位", () => {
    const player = setupHoushan().combatants.find((c) => c.id === "player")!;
    expect(player.skills.map((s) => s.id)).toEqual(["yeqiuquan", "changquan"]);
    const changquan = player.skills.find((s) => s.id === "changquan")!;
    expect(changquan).toMatchObject({ school: "刚", power: 6, mpCost: 3 });
  });

  it("首行动者按 speed（player spd10 > bandit spd8）", () => {
    const s = setupHoushan();
    expect(s.activeId).toBe("player");
    expect(s.round).toBe(1);
    expect(s.outcome).toBe("ongoing");
  });

  it("hp/mp 初始化为满值", () => {
    const player = setupHoushan().combatants.find((c) => c.id === "player")!;
    expect(player.hp).toBe(player.maxHp);
    expect(player.mp).toBe(player.maxMp);
    expect(player.maxHp).toBe(50);
  });

  it("剧情战友军登场：ally 侧、固定坐标、id 前缀 ally-", () => {
    const s = setupBattle({
      encounter: {
        ...ENCOUNTERS["houshan-bandits"]!,
        allies: [{ charId: "bandit", x: 2, y: 5 }],
      },
      party: [CHARACTERS["player"]!],
      characterTable: CHARACTERS,
      skillTable: SKILLS,
      seed: 1,
    });
    const ally = s.combatants.find((c) => c.id === "ally-bandit")!;
    expect(ally).toBeDefined();
    expect(ally.side).toBe("ally");
    expect(ally).toMatchObject({ x: 2, y: 5 });
    // 我方 = 队伍(player) + 战友(ally-bandit) = 2
    expect(s.combatants.filter((c) => c.side === "ally")).toHaveLength(2);
    // 战友进入回合序
    const ids = [s.activeId, ...s.turnQueue];
    expect(ids).toContain("ally-bandit");
  });

  it("无 allies 字段时不产生额外我方单位", () => {
    const s = setupHoushan();
    expect(s.combatants.filter((c) => c.side === "ally")).toHaveLength(1);
  });

  it("未知战友 charId 抛错", () => {
    expect(() =>
      setupBattle({
        encounter: {
          ...ENCOUNTERS["houshan-bandits"]!,
          allies: [{ charId: "ghost-ally", x: 2, y: 5 }],
        },
        party: [CHARACTERS["player"]!],
        characterTable: CHARACTERS,
        skillTable: SKILLS,
        seed: 1,
      }),
    ).toThrow(/未知战友/);
  });

  it("多人出战按 allySpawns 顺序摆位（M4 队伍）", () => {
    const s = setupBattle({
      encounter: {
        ...ENCOUNTERS["houshan-bandits"]!,
        allySpawns: [
          { x: 1, y: 3 },
          { x: 1, y: 5 },
        ],
      },
      party: [CHARACTERS["player"]!, CHARACTERS["guojing"]!],
      characterTable: CHARACTERS,
      skillTable: SKILLS,
      seed: 1,
    });
    const player = s.combatants.find((c) => c.id === "player")!;
    const guo = s.combatants.find((c) => c.id === "guojing")!;
    expect(player).toMatchObject({ x: 1, y: 3, side: "ally" });
    expect(guo).toMatchObject({ x: 1, y: 5, side: "ally" });
    expect(s.combatants.filter((c) => c.side === "ally")).toHaveLength(2);
  });

  it("setup 展开带 status 的武学（黄蓉·乱阵）", () => {
    const s = setupBattle({
      encounter: {
        ...ENCOUNTERS["houshan-bandits"]!,
        allySpawns: [{ x: 1, y: 4 }],
      },
      party: [CHARACTERS["huangrong"]!],
      characterTable: CHARACTERS,
      skillTable: SKILLS,
      seed: 1,
    });
    const huang = s.combatants.find((c) => c.id === "huangrong")!;
    const luanzhen = huang.skills.find((sk) => sk.id === "jimou-luanzhen")!;
    expect(luanzhen.status).toEqual({
      stat: "speed",
      amount: -4,
      duration: 3,
    });
    expect(huang.statuses).toEqual([]); // 初始无状态
  });

  it("未知 charId / 武学抛错", () => {
    expect(() =>
      setupBattle({
        encounter: {
          ...ENCOUNTERS["houshan-bandits"]!,
          enemies: [{ charId: "ghost", x: 0, y: 0 }],
        },
        party: [CHARACTERS["player"]!],
        characterTable: CHARACTERS,
        skillTable: SKILLS,
        seed: 1,
      }),
    ).toThrow(/未知敌方/);
  });
});
