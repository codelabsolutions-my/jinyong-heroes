import type { MapData } from "./types";
import { xiaKeIsland } from "./xiaKeIsland";
import { houshanPath } from "./houshanPath";
import { niujiaVillage } from "./niujiaVillage";
import { huashanSummit } from "./huashanSummit";
import { jianghu } from "./jianghu";
import { WORLD_MAPS } from "./world";

export const MAPS: Record<string, MapData> = {
  [xiaKeIsland.id]: xiaKeIsland,
  [houshanPath.id]: houshanPath,
  [niujiaVillage.id]: niujiaVillage,
  [huashanSummit.id]: huashanSummit,
  [jianghu.id]: jianghu,
  // 世界地图集（比照《金庸群侠传》1996 的 ~42 张互联区域/城镇/门派/秘境，见 world.ts）
  ...WORLD_MAPS,
};

/** 新游戏的起始地图 */
export const START_MAP_ID = xiaKeIsland.id;

export function getMap(id: string): MapData {
  const map = MAPS[id];
  if (!map) throw new Error(`未知地图 id: ${id}`);
  return map;
}
