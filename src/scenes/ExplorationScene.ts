import { Container, Text } from "pixi.js";
import type { Input } from "@/core/Input";
import { Player } from "@/entities/Player";
import { type MapData, mapHeight, mapWidth } from "@/data/maps/types";
import { TILE_SIZE, buildTileMapLayer } from "@/world/TileMap";

/** 大地图/城镇探索场景：地图 + 主角逐格移动 + 摄像机跟随。 */
export class ExplorationScene {
  readonly view: Container;

  private readonly world: Container;
  private readonly player: Player;

  constructor(
    private readonly map: MapData,
    private readonly input: Input,
    private readonly screenWidth: number,
    private readonly screenHeight: number,
  ) {
    this.view = new Container();
    this.world = new Container();
    this.view.addChild(this.world);

    this.world.addChild(buildTileMapLayer(map));

    this.player = new Player(map.spawn.x, map.spawn.y);
    this.world.addChild(this.player.view);

    const label = new Text({
      text: map.name,
      style: { fontFamily: "sans-serif", fontSize: 16, fill: 0xf0e6d2 },
    });
    label.position.set(12, 10);
    this.view.addChild(label);
  }

  update(deltaMS: number) {
    const dir = this.input.direction;
    if (dir && !this.player.isMoving) {
      this.player.tryMove(dir, this.map);
    }
    this.player.update(deltaMS);
    this.updateCamera();
  }

  /** 摄像机跟随主角，并夹在地图边界内 */
  private updateCamera() {
    const worldW = mapWidth(this.map) * TILE_SIZE;
    const worldH = mapHeight(this.map) * TILE_SIZE;

    let camX = this.player.view.x + TILE_SIZE / 2 - this.screenWidth / 2;
    let camY = this.player.view.y + TILE_SIZE / 2 - this.screenHeight / 2;
    camX = Math.max(0, Math.min(camX, worldW - this.screenWidth));
    camY = Math.max(0, Math.min(camY, worldH - this.screenHeight));

    this.world.position.set(-Math.round(camX), -Math.round(camY));
  }
}
