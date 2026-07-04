import { Container, Graphics } from "pixi.js";
import {
  type MapData,
  mapHeight,
  mapWidth,
  terrainAt,
} from "@/data/maps/types";

export const TILE_SIZE = 32;

/** 把地图数据渲染成一个静态图层（像素素材接入前用纯色块占位）。 */
export function buildTileMapLayer(map: MapData): Container {
  const layer = new Container();
  const g = new Graphics();

  const w = mapWidth(map);
  const h = mapHeight(map);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const terrain = terrainAt(map, x, y);
      if (!terrain) continue;
      g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(
        terrain.color,
      );
      // 简单的棋盘明暗变化，让占位地形有格子感
      if ((x + y) % 2 === 0) {
        g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill({
          color: 0x000000,
          alpha: 0.05,
        });
      }
    }
  }

  layer.addChild(g);
  return layer;
}
