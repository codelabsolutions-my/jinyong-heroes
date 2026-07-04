import type { TerrainDef } from "@/data/maps/types";
import type { Coord } from "@/game/battle/types";

/** 遭遇定义（数据）。战场复用字符网格格式（无出入口/NPC/出生点）。 */

export interface EncounterEnemy {
  /** 查 CHARACTERS */
  charId: string;
  x: number;
  y: number;
}

export interface EncounterDef {
  id: string;
  name: string;
  field: {
    grid: string[];
    terrains: Record<string, TerrainDef>;
  };
  /** 我方出生点（按入队顺序放置） */
  allySpawns: Coord[];
  enemies: EncounterEnemy[];
}

const FIELD_TERRAINS: Record<string, TerrainDef> = {
  ".": { color: 0x4a7c3f, walkable: true, name: "grass" },
  T: { color: 0x2d5426, walkable: false, name: "tree" },
  "#": { color: 0x6b6257, walkable: false, name: "rock" },
};

export const ENCOUNTERS: Record<string, EncounterDef> = {
  // 后山拦路：M2 教学战。10×8 林间空地，主角左、两名强盗右，中路开阔便于教学。
  // 角落树木/岩石作点缀，不挡正面进攻通道（第 3、4 行全通）。
  "houshan-bandits": {
    id: "houshan-bandits",
    name: "后山拦路",
    field: {
      terrains: FIELD_TERRAINS,
      grid: [
        "T........T",
        "..T....T..",
        "..........",
        "..........",
        "..........",
        "..........",
        "..#....#..",
        "T........T",
      ],
    },
    allySpawns: [{ x: 1, y: 4 }],
    enemies: [
      { charId: "bandit", x: 8, y: 3 },
      { charId: "bandit", x: 8, y: 4 },
    ],
  },
};
