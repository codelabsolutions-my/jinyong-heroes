import { Container, Graphics, Text } from "pixi.js";
import type { NpcDef } from "@/data/npcs";
import { TILE_SIZE } from "@/world/TileMap";

/** 地图上的 NPC（占位形象 + 头顶名字）。 */
export class NpcSprite {
  readonly view: Container;

  constructor(
    readonly def: NpcDef,
    gridX: number,
    gridY: number,
  ) {
    this.view = new Container();

    const g = new Graphics();
    g.rect(6, 4, 20, 12).fill(0xd9b38c); // 头
    g.rect(4, 16, 24, 14).fill(def.color); // 身
    this.view.addChild(g);

    const label = new Text({
      text: def.name,
      style: {
        fontFamily: "sans-serif",
        fontSize: 11,
        fill: 0xf0e6d2,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    label.anchor.set(0.5, 1);
    label.position.set(TILE_SIZE / 2, 2);
    this.view.addChild(label);

    this.view.position.set(gridX * TILE_SIZE, gridY * TILE_SIZE);
  }
}
