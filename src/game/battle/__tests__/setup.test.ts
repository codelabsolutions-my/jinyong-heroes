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
