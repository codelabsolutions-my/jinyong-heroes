import type { MapData } from "./types";

/**
 * 华山之巅（射雕线 第 3 章 · 华山论剑，STORY_BIBLE §2.9）。
 * 华山论剑旁观 → 欧阳锋抢经的决战之地（欧阳锋一战「打不过也能过」）。
 * 玩家由剧情事件带入（E1 集成），西侧崖径可步行回后山。
 * . 石台/可站  = 崖径  T 松  # 岩壁  ^ 断崖(不可走)
 */
export const huashanSummit: MapData = {
  id: "huashan-summit",
  name: "华山之巅",
  spawn: { x: 3, y: 6 },
  terrains: {
    ".": { color: 0x8f8b80, walkable: true, name: "stone" },
    "=": { color: 0xa8926b, walkable: true, name: "path" },
    T: { color: 0x2d5426, walkable: false, name: "pine" },
    "#": { color: 0x5a5148, walkable: false, name: "cliff-wall" },
    "^": { color: 0x3b3630, walkable: false, name: "chasm" },
  },
  grid: [
    "####################",
    "#^^^..........^^^^^#",
    "#^^............^^^^#",
    "#^................^#",
    "#..................#",
    "#.......TTTT.......#",
    "=..................#",
    "#..................#",
    "#^^..............^^#",
    "#^^^............^^^#",
    "#^^^^..........^^^^#",
    "####################",
  ],
  // 西侧崖径 → 回后山小径（单向；剧情事件负责把玩家带上华山）
  exits: [{ x: 0, y: 6, toMap: "houshan-path", toX: 3, toY: 5 }],
  npcs: [],
};
