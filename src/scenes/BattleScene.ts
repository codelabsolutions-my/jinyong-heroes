import { Container, Graphics, Text } from "pixi.js";
import type { BattleState, Combatant, Coord } from "@/game/battle/types";
import { TILE_SIZE } from "@/world/TileMap";

/** 战斗渲染叠层描述：交互层每帧传入，BattleScene 据此重画高亮。 */
export interface BattleOverlay {
  /** 可移动到的格子（move 阶段）key 集合 */
  reachable?: Set<string>;
  /** 可选目标所在格（选目标阶段） */
  targetTiles?: Coord[];
  /** 当前光标格 */
  cursor?: Coord | null;
  /** 顶部横幅（回合 / 提示） */
  banner?: string;
}

/** 每个单位一份持久渲染对象；每帧只更新，不重建（避免每帧新建 Text/Graphics 泄漏纹理）。 */
interface UnitView {
  container: Container;
  body: Graphics;
}

/**
 * 战斗场景（纯渲染，读 BattleState）。战场居中。
 * 单位精灵与高亮 Graphics 在构造时建好，`render()` 只更新几何/文本/可见性——
 * 不在渲染循环里 new Text/Graphics（否则每帧上传纹理，长战斗掉帧/涨显存）。
 */
export class BattleScene {
  readonly view: Container;

  private readonly field: Container;
  /** 复用的单个高亮 Graphics，每帧 clear + 重绘 */
  private readonly highlightG = new Graphics();
  private readonly unitLayer = new Container();
  private readonly unitViews = new Map<string, UnitView>();
  private readonly bannerText: Text;
  private readonly logText: Text;

  constructor(state: BattleState, screenWidth: number, screenHeight: number) {
    this.view = new Container();

    const cols = state.field.grid[0]?.length ?? 0;
    const rows = state.field.grid.length;
    const fieldW = cols * TILE_SIZE;
    const fieldH = rows * TILE_SIZE;

    // 战场容器居中
    this.field = new Container();
    this.field.position.set(
      Math.round((screenWidth - fieldW) / 2),
      Math.round((screenHeight - fieldH) / 2),
    );
    this.view.addChild(this.field);

    this.field.addChild(this.buildTerrain(state));
    this.field.addChild(this.highlightG);
    this.field.addChild(this.unitLayer);

    // 单位精灵一次性建好（M2 战斗中不增减单位）
    for (const c of state.combatants) {
      this.unitViews.set(c.id, this.buildUnitView(c));
    }

    this.bannerText = new Text({
      text: "",
      style: {
        fontFamily: "sans-serif",
        fontSize: 20,
        fontWeight: "bold",
        fill: 0xe8c66a,
        stroke: { color: 0x000000, width: 4 },
      },
    });
    this.bannerText.anchor.set(0.5, 0);
    this.bannerText.position.set(screenWidth / 2, 16);
    this.view.addChild(this.bannerText);

    this.logText = new Text({
      text: "",
      style: {
        fontFamily: "sans-serif",
        fontSize: 15,
        fill: 0xf0e6d2,
        stroke: { color: 0x000000, width: 3 },
        wordWrap: true,
        wordWrapWidth: screenWidth - 40,
        breakWords: true,
      },
    });
    this.logText.anchor.set(0.5, 1);
    this.logText.position.set(screenWidth / 2, screenHeight - 12);
    this.view.addChild(this.logText);
  }

  private buildTerrain(state: BattleState): Container {
    const layer = new Container();
    const g = new Graphics();
    state.field.grid.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const terrain = state.field.terrains[row[x]!];
        if (!terrain) continue;
        g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(
          terrain.color,
        );
        g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).stroke({
          color: 0x000000,
          alpha: 0.18,
          width: 1,
        });
      }
    });
    layer.addChild(g);
    return layer;
  }

  private buildUnitView(c: Combatant): UnitView {
    const container = new Container();
    const body = new Graphics();
    container.addChild(body);

    const name = new Text({
      text: c.name, // 静态，只建一次
      style: {
        fontFamily: "sans-serif",
        fontSize: 10,
        fill: 0xf0e6d2,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    name.anchor.set(0.5, 1);
    name.position.set(TILE_SIZE / 2, 4);
    container.addChild(name);

    this.unitLayer.addChild(container);
    return { container, body };
  }

  /** 每帧根据 state + overlay 更新（不重建对象） */
  render(state: BattleState, overlay: BattleOverlay): void {
    this.drawHighlights(overlay);
    for (const c of state.combatants) {
      this.updateUnitView(c, state.activeId);
    }
    this.bannerText.text = overlay.banner ?? "";
    const tail = state.log[state.log.length - 1];
    this.logText.text = tail?.text ?? "";
  }

  private drawHighlights(overlay: BattleOverlay): void {
    const g = this.highlightG;
    g.clear();

    if (overlay.reachable) {
      for (const key of overlay.reachable) {
        const [x, y] = key.split(",").map(Number) as [number, number];
        g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill({
          color: 0x3d7bd9,
          alpha: 0.35,
        });
      }
    }
    for (const t of overlay.targetTiles ?? []) {
      g.rect(t.x * TILE_SIZE, t.y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill({
        color: 0xd94a3d,
        alpha: 0.4,
      });
    }
    if (overlay.cursor) {
      g.rect(
        overlay.cursor.x * TILE_SIZE,
        overlay.cursor.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
      ).stroke({ color: 0xf0e6d2, width: 3 });
    }
  }

  private updateUnitView(c: Combatant, activeId: string | null): void {
    const view = this.unitViews.get(c.id);
    if (!view) return;
    if (c.hp <= 0) {
      view.container.visible = false;
      return;
    }
    view.container.visible = true;
    view.container.position.set(c.x * TILE_SIZE, c.y * TILE_SIZE);

    const g = view.body;
    g.clear();
    if (c.id === activeId) {
      g.rect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2).stroke({
        color: 0xffe08a,
        width: 3,
      });
    }
    g.rect(6, 6, TILE_SIZE - 12, TILE_SIZE - 14).fill(c.color);
    g.rect(6, 6, TILE_SIZE - 12, TILE_SIZE - 14).stroke({
      color: c.side === "ally" ? 0x9ecbff : 0xff9e9e,
      width: 2,
    });
    const barW = TILE_SIZE - 8;
    g.rect(4, TILE_SIZE - 6, barW, 4).fill(0x330000);
    g.rect(4, TILE_SIZE - 6, Math.max(0, barW * (c.hp / c.maxHp)), 4).fill(
      0x54d24a,
    );
  }
}
