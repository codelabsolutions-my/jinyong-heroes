import { Container, Graphics, Text } from "pixi.js";

export interface MenuItem {
  key: string;
  label: string;
  /** 置灰不可选（如内力不足的武学） */
  disabled?: boolean;
}

const ITEM_H = 30;
const WIDTH = 180;
const PAD = 12;

/** 战斗行动菜单（攻击 / 武学 / 待机，或武学子菜单）。交互由 controller 驱动。 */
export class BattleMenu {
  readonly view: Container;
  private readonly bg: Graphics;
  private readonly rows: Container;
  private items: MenuItem[] = [];
  private selected = 0;

  constructor(screenWidth: number, screenHeight: number) {
    this.view = new Container();
    this.view.visible = false;
    this.bg = new Graphics();
    this.rows = new Container();
    this.view.addChild(this.bg, this.rows);
    // 左下角
    this.view.position.set(16, screenHeight - 16);
    void screenWidth;
  }

  open(items: MenuItem[]): void {
    this.items = items;
    const first = this.firstEnabled(0, 1);
    this.selected = first >= 0 ? first : 0;
    this.view.visible = true;
    this.redraw();
  }

  close(): void {
    this.view.visible = false;
  }

  get isOpen(): boolean {
    return this.view.visible;
  }

  /** 上下移动选择，跳过禁用项 */
  move(delta: 1 | -1): void {
    if (this.items.length === 0) return;
    const next = this.firstEnabled(this.selected + delta, delta);
    if (next >= 0) this.selected = next;
    this.redraw();
  }

  /** 当前选中项（禁用则返回 null） */
  current(): MenuItem | null {
    const item = this.items[this.selected];
    if (!item || item.disabled) return null;
    return item;
  }

  /** 从 from 起朝 dir 找第一个可选项的下标；界内找不到返回 -1（调用方保持原选中） */
  private firstEnabled(from: number, dir: 1 | -1): number {
    const n = this.items.length;
    for (let i = 0; i < n; i++) {
      const idx = from + i * dir;
      if (idx < 0 || idx >= n) break;
      if (!this.items[idx]!.disabled) return idx;
    }
    return -1;
  }

  private redraw(): void {
    const h = this.items.length * ITEM_H + PAD * 2;
    this.bg.clear();
    this.bg
      .rect(0, -h, WIDTH, h)
      .fill({ color: 0x14100a, alpha: 0.94 })
      .stroke({ color: 0x8a744a, width: 2 });

    this.rows.removeChildren();
    this.items.forEach((item, i) => {
      const y = -h + PAD + i * ITEM_H;
      if (i === this.selected) {
        const hl = new Graphics();
        hl.rect(4, y - 2, WIDTH - 8, ITEM_H).fill({
          color: 0x8a744a,
          alpha: 0.5,
        });
        this.rows.addChild(hl);
      }
      const prefix = i === this.selected ? "▶ " : "  ";
      const t = new Text({
        text: prefix + item.label,
        style: {
          fontFamily: "sans-serif",
          fontSize: 16,
          fill: item.disabled ? 0x6f6350 : 0xf0e6d2,
        },
      });
      t.position.set(PAD, y);
      this.rows.addChild(t);
    });
  }
}
