import type { MapData } from "./types";
import { xiaKeIsland } from "./xiaKeIsland";
import { houshanPath } from "./houshanPath";
import { niujiaVillage } from "./niujiaVillage";
import { huashanSummit } from "./huashanSummit";
import { jianghu } from "./jianghu";

// 世界地图集 world.ts（gen-world-maps.mjs 生成的 42 张空壳）已隔离（ADR #34）：
// 未按剧情设计、空无 NPC，暂移出可玩图谱。文件与生成器留档；照 docs/WORLD_ATLAS.md
// 逐张重画真图后，用同一 id 原地登记回来（届时恢复 import + 展开）。
export const MAPS: Record<string, MapData> = {
  [xiaKeIsland.id]: xiaKeIsland,
  [houshanPath.id]: houshanPath,
  [niujiaVillage.id]: niujiaVillage,
  [huashanSummit.id]: huashanSummit,
  [jianghu.id]: jianghu,
};

/** 新游戏的起始地图 */
export const START_MAP_ID = xiaKeIsland.id;

export function getMap(id: string): MapData {
  const map = MAPS[id];
  if (!map) throw new Error(`未知地图 id: ${id}`);
  return map;
}
