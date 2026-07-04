import { describe, expect, it } from "vitest";
import { MAPS, START_MAP_ID, getMap } from "../maps";
import { exitAt, isWalkable, mapWidth, npcAt } from "../maps/types";
import { NPCS } from "../npcs";
import { DIALOGUES } from "../dialogues";
import { CLUES } from "../clues";
import { SKILLS } from "../skills";
import { CHARACTERS } from "../characters";
import { ENCOUNTERS } from "../battles";
import { BOOKS } from "../books";
import { STORY_EVENTS } from "../story";
import { collectStepRefs } from "@/game/story/runner";
import type { Effect } from "@/game/dialogue";

/** 内容完整性：所有跨文件引用（地图↔NPC↔对话↔线索）不允许坏链。 */

function allEffects(): Effect[] {
  return Object.values(DIALOGUES).flatMap((d) => [
    ...(d.effects ?? []),
    ...(d.variants ?? []).flatMap((v) => v.effects ?? []),
  ]);
}

describe("maps", () => {
  it("start map exists", () => {
    expect(MAPS[START_MAP_ID]).toBeDefined();
  });

  it("getMap throws on unknown id", () => {
    expect(() => getMap("nope")).toThrow(/未知地图/);
  });

  for (const map of Object.values(MAPS)) {
    describe(map.id, () => {
      it("rows are equal length and all chars defined", () => {
        const w = mapWidth(map);
        for (const row of map.grid) {
          expect(row.length).toBe(w);
          for (const ch of row) {
            expect(map.terrains[ch], `'${ch}' 无地形定义`).toBeDefined();
          }
        }
      });

      it("spawn is walkable and not on an exit", () => {
        expect(isWalkable(map, map.spawn.x, map.spawn.y)).toBe(true);
        expect(exitAt(map, map.spawn.x, map.spawn.y)).toBeNull();
      });

      it("exits are walkable, target valid coords, no ping-pong", () => {
        for (const exit of map.exits) {
          expect(isWalkable(map, exit.x, exit.y)).toBe(true);
          const target = MAPS[exit.toMap];
          expect(target, `exit → 未知地图 ${exit.toMap}`).toBeDefined();
          expect(isWalkable(target!, exit.toX, exit.toY)).toBe(true);
          // 落点不能本身又是出口，否则来回瞬移
          expect(exitAt(target!, exit.toX, exit.toY)).toBeNull();
        }
      });

      it("spawn and exit landing tiles are free of NPCs", () => {
        expect(npcAt(map, map.spawn.x, map.spawn.y)).toBeNull();
        for (const exit of map.exits) {
          const target = MAPS[exit.toMap]!;
          expect(
            npcAt(target, exit.toX, exit.toY),
            `NPC 占了 ${exit.toMap} 的落点 (${exit.toX},${exit.toY})`,
          ).toBeNull();
        }
      });

      it("npc placements reference known NPCs on free walkable tiles", () => {
        const seen = new Set<string>();
        for (const p of map.npcs) {
          expect(NPCS[p.npcId], `未知 NPC ${p.npcId}`).toBeDefined();
          expect(isWalkable(map, p.x, p.y)).toBe(true);
          expect(exitAt(map, p.x, p.y)).toBeNull();
          const key = `${p.x},${p.y}`;
          expect(seen.has(key), `NPC 重叠于 ${key}`).toBe(false);
          seen.add(key);
        }
      });
    });
  }
});

describe("npcs / dialogues / clues", () => {
  it("every NPC has an existing dialogue", () => {
    for (const npc of Object.values(NPCS)) {
      expect(
        DIALOGUES[npc.dialogueId],
        `NPC ${npc.id} → 未知对话 ${npc.dialogueId}`,
      ).toBeDefined();
    }
  });

  it("every grantClue effect references a defined clue", () => {
    for (const effect of allEffects()) {
      if (effect.type === "grantClue") {
        expect(CLUES[effect.clueId], `未知线索 ${effect.clueId}`).toBeDefined();
      }
    }
  });

  it("every startBattle effect references a defined encounter", () => {
    for (const effect of allEffects()) {
      if (effect.type === "startBattle") {
        expect(
          ENCOUNTERS[effect.battleId],
          `未知遭遇 ${effect.battleId}`,
        ).toBeDefined();
      }
    }
  });

  it("clue record keys match their ids", () => {
    for (const [key, def] of Object.entries(CLUES)) {
      expect(def.id).toBe(key);
    }
  });

  it("variants never make default clues permanently missable", () => {
    // 变体一旦条件满足会永久遮蔽默认对话。若变体的触发 flag 不是
    // 本对话自己 setFlag 的（即默认支线可能从未走过），
    // 变体必须补发默认支线的全部 grantClue。
    for (const d of Object.values(DIALOGUES)) {
      const ownFlags = new Set(
        (d.effects ?? [])
          .filter((e) => e.type === "setFlag")
          .map((e) => (e as { flag: string }).flag),
      );
      const defaultClues = (d.effects ?? [])
        .filter((e) => e.type === "grantClue")
        .map((e) => (e as { clueId: string }).clueId);

      for (const v of d.variants ?? []) {
        const gatedByOwnFlag =
          v.when.hasFlag !== undefined && ownFlags.has(v.when.hasFlag);
        if (gatedByOwnFlag) continue; // 触发前默认支线必已走过
        const variantClues = new Set(
          (v.effects ?? [])
            .filter((e) => e.type === "grantClue")
            .map((e) => (e as { clueId: string }).clueId),
        );
        for (const clueId of defaultClues) {
          expect(
            variantClues.has(clueId),
            `对话 ${d.id} 的变体遮蔽了线索 ${clueId} 且未补发`,
          ).toBe(true);
        }
      }
    }
  });

  it("dialogue record keys match their ids", () => {
    for (const [key, d] of Object.entries(DIALOGUES)) {
      expect(d.id).toBe(key);
      expect(d.lines.length).toBeGreaterThan(0);
      for (const v of d.variants ?? []) {
        expect(v.lines.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("skills / characters / encounters", () => {
  it("record keys match their ids", () => {
    for (const [key, s] of Object.entries(SKILLS)) expect(s.id).toBe(key);
    for (const [key, c] of Object.entries(CHARACTERS)) expect(c.id).toBe(key);
    for (const [key, e] of Object.entries(ENCOUNTERS)) expect(e.id).toBe(key);
  });

  it("every character skill references a defined skill", () => {
    for (const c of Object.values(CHARACTERS)) {
      for (const skillId of c.skills) {
        expect(
          SKILLS[skillId],
          `角色 ${c.id} → 未知武学 ${skillId}`,
        ).toBeDefined();
      }
    }
  });

  it("skill ranges are >= 1", () => {
    for (const s of Object.values(SKILLS)) {
      expect(s.range, `武学 ${s.id} range 须 ≥1`).toBeGreaterThanOrEqual(1);
    }
  });

  for (const enc of Object.values(ENCOUNTERS)) {
    describe(enc.id, () => {
      const { grid, terrains } = enc.field;
      const w = grid[0]?.length ?? 0;
      const h = grid.length;
      const walkable = (x: number, y: number) =>
        terrains[grid[y]?.[x] ?? ""]?.walkable ?? false;

      it("战场网格等宽且字符都有地形定义", () => {
        for (const row of grid) {
          expect(row.length).toBe(w);
          for (const ch of row) {
            expect(terrains[ch], `'${ch}' 无地形定义`).toBeDefined();
          }
        }
      });

      it("敌方 / 战友军 charId 都存在", () => {
        for (const e of enc.enemies) {
          expect(CHARACTERS[e.charId], `未知敌方 ${e.charId}`).toBeDefined();
        }
        for (const a of enc.allies ?? []) {
          expect(CHARACTERS[a.charId], `未知战友 ${a.charId}`).toBeDefined();
        }
      });

      it("出生点/敌位/战友位都在界内、可站、不重叠", () => {
        const seen = new Set<string>();
        const positions = [
          ...enc.allySpawns.map((s) => ({ x: s.x, y: s.y, who: "ally" })),
          ...(enc.allies ?? []).map((a) => ({ x: a.x, y: a.y, who: a.charId })),
          ...enc.enemies.map((e) => ({ x: e.x, y: e.y, who: e.charId })),
        ];
        for (const p of positions) {
          expect(
            p.x >= 0 && p.x < w && p.y >= 0 && p.y < h,
            `${p.who} 越界`,
          ).toBe(true);
          expect(walkable(p.x, p.y), `${p.who} 站在不可走格`).toBe(true);
          const key = `${p.x},${p.y}`;
          expect(seen.has(key), `位置重叠 ${key}`).toBe(false);
          seen.add(key);
        }
      });

      it("至少 1 名敌人、1 个我方出生点", () => {
        expect(enc.enemies.length).toBeGreaterThan(0);
        expect(enc.allySpawns.length).toBeGreaterThan(0);
      });
    });
  }
});

describe("story events 引用完整性", () => {
  it("record 的 id 唯一", () => {
    const ids = STORY_EVENTS.map((e) => e.id);
    expect(new Set(ids).size, `事件 id 有重复：${ids.join()}`).toBe(ids.length);
  });

  for (const event of STORY_EVENTS) {
    describe(event.id, () => {
      const stepIds = new Set(
        event.steps.map((s) => s.id).filter((x): x is string => !!x),
      );

      it("跳转目标(goto/onWin/onLose/choice)都指向存在的 step id", () => {
        for (const ref of collectStepRefs(event)) {
          expect(stepIds.has(ref), `${event.id}: 坏跳转目标 ${ref}`).toBe(true);
        }
      });

      it("dialogue/battle/grantBook/learnSkill 的引用都存在", () => {
        for (const step of event.steps) {
          if (step.kind === "dialogue") {
            expect(
              DIALOGUES[step.dialogueId],
              `${event.id}: 未知对话 ${step.dialogueId}`,
            ).toBeDefined();
          } else if (step.kind === "battle") {
            expect(
              ENCOUNTERS[step.battleId],
              `${event.id}: 未知遭遇 ${step.battleId}`,
            ).toBeDefined();
          } else if (step.kind === "grantBook") {
            expect(
              BOOKS[step.bookId],
              `${event.id}: 未知天书 ${step.bookId}`,
            ).toBeDefined();
          } else if (step.kind === "learnSkill") {
            expect(
              SKILLS[step.skillId],
              `${event.id}: 未知武学 ${step.skillId}`,
            ).toBeDefined();
          } else if (step.kind === "gainExp") {
            expect(step.amount, `${event.id}: gainExp 须为正`).toBeGreaterThan(
              0,
            );
          }
        }
      });

      it("以 end 或跳转终止（存在 end 步或最后一步是 goto/battle 分支）", () => {
        const hasEnd = event.steps.some((s) => s.kind === "end");
        expect(hasEnd, `${event.id}: 建议显式 end 步`).toBe(true);
      });
    });
  }
});
