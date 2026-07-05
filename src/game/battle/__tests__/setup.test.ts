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

  // M5 §2.1：我方按主角等级/队友系数折算，敌方静态（补 M4 简化 ADR #27①）
  describe("按等级/系数折算属性", () => {
    it("省略 playerLevel = lv1，主角向后兼容旧发布数值", () => {
      const player = setupHoushan().combatants.find((c) => c.id === "player")!;
      expect(player).toMatchObject({
        maxHp: 50,
        maxMp: 20,
        attack: 10,
        defense: 5,
        speed: 10,
        move: 4,
      });
    });

    it("主角属性随等级上升（lv5 基准）", () => {
      const s = setupBattle({
        encounter: ENCOUNTERS["houshan-bandits"]!,
        party: [CHARACTERS["player"]!],
        characterTable: CHARACTERS,
        skillTable: SKILLS,
        seed: 42,
        playerLevel: 5,
      });
      const player = s.combatants.find((c) => c.id === "player")!;
      // baseStatsAtLevel(5): hp50+8*4=82, mp20+16=36, atk10+8=18, def5+4=9, spd10+2=12
      expect(player).toMatchObject({
        maxHp: 82,
        maxMp: 36,
        attack: 18,
        defense: 9,
        speed: 12,
        move: 4,
      });
    });

    it("带 coeff 的队友按主角同级基准×系数折算（郭靖 lv1）", () => {
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
        playerLevel: 1,
      });
      const guo = s.combatants.find((c) => c.id === "guojing")!;
      // coeff {hp:1.3,defense:1.2,speed:0.8} × base lv1 {50,20,10,5,10,4}
      // → hp65, mp20, atk10, def6, spd8, move4（不再用静态 hp90）
      expect(guo).toMatchObject({
        maxHp: 65,
        maxMp: 20,
        attack: 10,
        defense: 6,
        speed: 8,
        move: 4,
      });
      expect(guo.maxHp).not.toBe(CHARACTERS["guojing"]!.hp); // 已脱离静态值
    });

    it("敌方保持静态 CharacterDef，不随主角等级变", () => {
      const s = setupBattle({
        encounter: ENCOUNTERS["houshan-bandits"]!,
        party: [CHARACTERS["player"]!],
        characterTable: CHARACTERS,
        skillTable: SKILLS,
        seed: 42,
        playerLevel: 20,
      });
      // houshan-bandits 敌方是拦路强盗（bandit）
      const bandit = CHARACTERS["bandit"]!;
      const enemy = s.combatants.find((c) => c.side === "enemy")!;
      expect(enemy.maxHp).toBe(bandit.hp);
      expect(enemy.attack).toBe(bandit.attack);
    });

    it("无 coeff 的我方单位走静态属性", () => {
      // bandit 作我方战友（无 coeff）→ 静态 hp14，不受 playerLevel 影响
      const s = setupBattle({
        encounter: {
          ...ENCOUNTERS["houshan-bandits"]!,
          allies: [{ charId: "bandit", x: 2, y: 5 }],
        },
        party: [CHARACTERS["player"]!],
        characterTable: CHARACTERS,
        skillTable: SKILLS,
        seed: 1,
        playerLevel: 20,
      });
      const ally = s.combatants.find((c) => c.id === "ally-bandit")!;
      expect(ally.maxHp).toBe(CHARACTERS["bandit"]!.hp);
    });
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
