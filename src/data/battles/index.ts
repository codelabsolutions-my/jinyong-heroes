import type { TerrainDef } from "@/data/maps/types";
import type { BattleObjective, Coord } from "@/game/battle/types";

/** 遭遇定义（数据）。战场复用字符网格格式（无出入口/NPC/出生点）。 */

export interface EncounterEnemy {
  /** 查 CHARACTERS */
  charId: string;
  x: number;
  y: number;
}

/**
 * 剧情战友军：随该线战斗自动登场的 NPC 盟友（如射雕线的郭靖/黄蓉），
 * 与玩家出战队伍并肩，摆在固定坐标。招募入常驻队伍是 M4；M3 只是"这一战并肩"。
 */
export interface EncounterAlly {
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
  /** 剧情战友军（可选）：随战自动登场的盟友，摆在固定坐标 */
  allies?: EncounterAlly[];
  /** 可选胜负目标；省略=歼灭全部敌人=胜。用于"打不过也能过"的剧情战 */
  objective?: BattleObjective;
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

  // 射雕第 1 章 · 牛家村：黄河四鬼拦路。主角 + 郭靖 并肩，右侧四鬼。12×9 开阔林间。
  "sd-huanghe": {
    id: "sd-huanghe",
    name: "黄河四鬼",
    field: {
      terrains: FIELD_TERRAINS,
      grid: [
        "T..........T",
        "............",
        "..T......T..",
        "............",
        "............",
        "............",
        "..T......T..",
        "............",
        "T..........T",
      ],
    },
    allySpawns: [{ x: 1, y: 4 }],
    allies: [{ charId: "guojing", x: 1, y: 3 }],
    enemies: [
      { charId: "huanghe-gui", x: 10, y: 2 },
      { charId: "huanghe-gui", x: 10, y: 3 },
      { charId: "huanghe-gui", x: 10, y: 5 },
      { charId: "huanghe-gui", x: 10, y: 6 },
    ],
  },

  // 射雕第 3 章 · 华山之巅：欧阳锋决战。主角 + 郭靖 + 黄蓉，对超模西毒。
  // 「打不过也能过」：撑满 surviveRounds 回合即胜（洪七公救场）。数值/回合数 E3 可再调。
  "sd-ouyangfeng": {
    id: "sd-ouyangfeng",
    name: "华山论剑 · 西毒欧阳锋",
    field: {
      terrains: FIELD_TERRAINS,
      grid: [
        "#.........#",
        "...........",
        "...........",
        "...........",
        "...........",
        "...........",
        "...........",
        "...........",
        "#.........#",
      ],
    },
    allySpawns: [{ x: 1, y: 4 }],
    allies: [
      { charId: "guojing", x: 1, y: 3 },
      { charId: "huangrong", x: 1, y: 5 },
    ],
    enemies: [{ charId: "ouyangfeng", x: 9, y: 4 }],
    objective: { surviveRounds: 3 },
  },
};
