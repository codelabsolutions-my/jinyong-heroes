import type { MapData } from "./types";

/**
 * 后山小径：村子东边的山林小路，尽头住着扫地老人（主线引导 NPC）。
 * . 草地  ~ 水  T 树  # 山岩  = 道路
 */
export const houshanPath: MapData = {
  id: "houshan-path",
  name: "后山小径",
  spawn: { x: 2, y: 8 },
  terrains: {
    ".": { color: 0x4a7c3f, walkable: true, name: "grass" },
    "~": { color: 0x2b5f8e, walkable: false, name: "water" },
    T: { color: 0x2d5426, walkable: false, name: "tree" },
    "#": { color: 0x6b6257, walkable: false, name: "rock" },
    "=": { color: 0xa8926b, walkable: true, name: "road" },
  },
  grid: [
    "####################",
    "#TT....T......TT..T#",
    "#T..T..............#",
    "#......TT..........#",
    "#..T.......TTT.....#",
    "#..................#",
    "#.....T......~~....#",
    "#............~~....#",
    "==========.........#",
    "#..T......=====....#",
    "#..........T..=....#",
    "#......TT......=...#",
    "#..T...........=...#",
    "#.......TTT....=...#",
    "#T.............=..T#",
    "####################",
  ],
  // 西侧路口 → 回无名小村
  exits: [{ x: 0, y: 8, toMap: "xiake-island", toX: 26, toY: 10 }],
  npcs: [{ npcId: "sweeper", x: 15, y: 10 }],
};
