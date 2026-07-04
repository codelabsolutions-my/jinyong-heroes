import { Container, Text } from "pixi.js";
import { NpcSprite } from "@/entities/Npc";
import { Player } from "@/entities/Player";
import type { Direction } from "@/game/geometry";
import { stepFrom } from "@/game/geometry";
import { NPCS } from "@/data/npcs";
import { canEnter } from "@/game/movement";
import {
  type MapData,
  type NpcPlacement,
  mapHeight,
  mapWidth,
  npcAt,
} from "@/data/maps/types";
import { TILE_SIZE, buildTileMapLayer } from "@/world/TileMap";

/** 单张地图的探索视图：地形 + NPC + 主角 + 摄像机。模式与剧情由 core/Game 管。 */
export class ExplorationScene {
  readonly view: Container;
  readonly player: Player;

  private readonly world: Container;

  constructor(
    readonly map: MapData,
    startX: number,
    startY: number,
    facing: Direction,
    private readonly screenWidth: number,
    private readonly screenHeight: number,
  ) {
    this.view = new Container();
    this.world = new Container();
    this.view.addChild(this.world);

    this.world.addChild(buildTileMapLayer(map));

    for (const placement of map.npcs) {
      const def = NPCS[placement.npcId];
      if (!def) continue; // 数据完整性由内容测试保证
      this.world.addChild(new NpcSprite(def, placement.x, placement.y).view);
    }

    this.player = new Player(startX, startY, facing);
    this.world.addChild(this.player.view);

    const label = new Text({
      text: map.name,
      style: {
        fontFamily: "sans-serif",
        fontSize: 16,
        fill: 0xf0e6d2,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    label.position.set(12, 10);
    this.view.addChild(label);
  }

  /** 阻挡规则在 game/movement（纯逻辑），这里只是接线 */
  private isBlocked = (x: number, y: number): boolean =>
    !canEnter(this.map, x, y);

  tryMove(direction: Direction) {
    this.player.tryMove(direction, this.isBlocked);
  }

  /** 主角面前一格的 NPC（对话目标） */
  npcInFront(): NpcPlacement | null {
    const { x, y } = stepFrom(
      this.player.gridX,
      this.player.gridY,
      this.player.facing,
    );
    return npcAt(this.map, x, y);
  }

  /** 返回本帧是否刚走完一格 */
  update(deltaMS: number): boolean {
    const arrived = this.player.update(deltaMS);
    this.updateCamera();
    return arrived;
  }

  /** 摄像机跟随主角，并夹在地图边界内 */
  private updateCamera() {
    const worldW = mapWidth(this.map) * TILE_SIZE;
    const worldH = mapHeight(this.map) * TILE_SIZE;

    let camX = this.player.view.x + TILE_SIZE / 2 - this.screenWidth / 2;
    let camY = this.player.view.y + TILE_SIZE / 2 - this.screenHeight / 2;
    camX = Math.max(0, Math.min(camX, Math.max(0, worldW - this.screenWidth)));
    camY = Math.max(0, Math.min(camY, Math.max(0, worldH - this.screenHeight)));

    this.world.position.set(-Math.round(camX), -Math.round(camY));
  }
}
