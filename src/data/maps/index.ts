import type { MapData } from "./types";
import { xiaKeIsland } from "./xiaKeIsland";
import { houshanPath } from "./houshanPath";
import { niujiaVillage } from "./niujiaVillage";
import { huashanSummit } from "./huashanSummit";

export const MAPS: Record<string, MapData> = {
  [xiaKeIsland.id]: xiaKeIsland,
  [houshanPath.id]: houshanPath,
  [niujiaVillage.id]: niujiaVillage,
  [huashanSummit.id]: huashanSummit,
};

/** 新游戏的起始地图 */
export const START_MAP_ID = xiaKeIsland.id;

export function getMap(id: string): MapData {
  const map = MAPS[id];
  if (!map) throw new Error(`未知地图 id: ${id}`);
  return map;
}
