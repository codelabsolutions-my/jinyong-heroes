import { describe, expect, it } from "vitest";
import { MAPS, START_MAP_ID, getMap } from "../maps";
import { exitAt, isWalkable, mapWidth, npcAt } from "../maps/types";
import { NPCS } from "../npcs";
import { DIALOGUES } from "../dialogues";
import { CLUES } from "../clues";
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
