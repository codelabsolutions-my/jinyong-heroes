import type { MapData } from "./types";

/**
 * 牛家村（射雕线 第 1 章 · 风雪惊变，STORY_BIBLE §2.9）。
 * 曲三酒馆旧案的所在。玩家由射雕线剧情事件带入（E1 集成），西侧路口可步行回后山。
 * . 草地  = 道路  ~ 水  T 树  # 墙  H 屋舍(不可走)  D 门(可走)
 */
export const niujiaVillage: MapData = {
  id: "niujia-village",
  name: "牛家村",
  spawn: { x: 3, y: 6 },
  terrains: {
    ".": { color: 0x4a7c3f, walkable: true, name: "grass" },
    "=": { color: 0xa8926b, walkable: true, name: "road" },
    "~": { color: 0x2b5f8e, walkable: false, name: "water" },
    T: { color: 0x2d5426, walkable: false, name: "tree" },
    "#": { color: 0x6b6257, walkable: false, name: "wall" },
    H: { color: 0x8a6d3b, walkable: false, name: "house" },
    D: { color: 0xc9a978, walkable: true, name: "door" },
  },
  grid: [
    "####################",
    "#..................#",
    "#....HHHHH.........#",
    "#....H...H.........#",
    "#....H...H....TT...#",
    "#....HHDHH.........#",
    "#..................#",
    "=..................#",
    "#........~~~~......#",
    "#........~~~~......#",
    "#..................#",
    "#....T......T..TT..#",
    "#..................#",
    "####################",
  ],
  // 西侧路口 → 回后山小径（单向；剧情事件负责把玩家带入本村）
  exits: [{ x: 0, y: 7, toMap: "houshan-path", toX: 2, toY: 5 }],
  npcs: [],
};
