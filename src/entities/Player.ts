import { Container, Graphics } from "pixi.js";
import { DIRECTION_DELTA, type Direction } from "@/game/geometry";
import { TILE_SIZE } from "@/world/TileMap";

const MOVE_DURATION_MS = 180; // 走一格所需时间，对齐原版的逐格移动手感

/** 主角"小虾米"。逐格移动，移动中带插值，支持连续按键。 */
export class Player {
  readonly view: Container;

  /** 当前所在格 */
  gridX: number;
  gridY: number;
  facing: Direction = "down";

  /** 移动插值状态 */
  private moving = false;
  private fromX = 0;
  private fromY = 0;
  private toX = 0;
  private toY = 0;
  private moveElapsed = 0;

  constructor(spawnX: number, spawnY: number, facing: Direction = "down") {
    this.gridX = spawnX;
    this.gridY = spawnY;
    this.facing = facing;
    this.view = new Container();

    // 占位形象：披蓝衣的小人，接入像素 spritesheet 后替换
    const g = new Graphics();
    g.rect(6, 4, 20, 12).fill(0xd9b38c); // 头
    g.rect(4, 16, 24, 14).fill(0x3355aa); // 身
    this.view.addChild(g);

    this.view.position.set(spawnX * TILE_SIZE, spawnY * TILE_SIZE);
  }

  get isMoving(): boolean {
    return this.moving;
  }

  /** 瞬移（切地图/读档用），清掉移动插值。 */
  teleport(x: number, y: number) {
    this.moving = false;
    this.gridX = x;
    this.gridY = y;
    this.view.position.set(x * TILE_SIZE, y * TILE_SIZE);
  }

  /**
   * 尝试朝某方向走一格；被阻挡时只转向。
   * 阻挡判定由调用方注入（地形 + NPC 占位等）。
   */
  tryMove(direction: Direction, isBlocked: (x: number, y: number) => boolean) {
    if (this.moving) return;
    this.facing = direction;
    const { dx, dy } = DIRECTION_DELTA[direction];
    const nx = this.gridX + dx;
    const ny = this.gridY + dy;
    if (isBlocked(nx, ny)) return;

    this.moving = true;
    this.moveElapsed = 0;
    this.fromX = this.gridX * TILE_SIZE;
    this.fromY = this.gridY * TILE_SIZE;
    this.toX = nx * TILE_SIZE;
    this.toY = ny * TILE_SIZE;
    this.gridX = nx;
    this.gridY = ny;
  }

  /** 返回本帧是否刚好走完一格（到格瞬间做出口/遇敌检查用） */
  update(deltaMS: number): boolean {
    if (!this.moving) return false;
    this.moveElapsed += deltaMS;
    const t = Math.min(this.moveElapsed / MOVE_DURATION_MS, 1);
    this.view.position.set(
      this.fromX + (this.toX - this.fromX) * t,
      this.fromY + (this.toY - this.fromY) * t,
    );
    if (t >= 1) {
      this.moving = false;
      return true;
    }
    return false;
  }
}
