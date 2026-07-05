import { Container, Graphics, Text } from "pixi.js";
import { wrapIndex } from "./menuNav";

const WIDTH = 420;
const PAD = 20;
const GAP = 14; // prompt 与选项列表之间的间距
const ITEM_H = 34;

/**
 * 剧情抉择菜单（M5，补 ADR #27②）：居中弹窗，顶部 prompt + 若干选项，
 * ↑↓ 选（环形）、空格确认。交互由 Game 的 storyChoice 模式驱动；runner 已按 when 过滤好可选项，
 * 这里只渲染 + 报告当前选中下标，选中项对应的原始 option 由 Game 回喂 runner。
 *
 * 布局按 prompt 实测高度自适应（prompt 可换行不会盖住首个选项）；重画时销毁旧节点防纹理泄漏。
 */
export class ChoiceBox {
  readonly view: Container;
  private readonly bg: Graphics;
  private readonly body: Container;
  private readonly screenWidth: number;
  private readonly screenHeight: number;
  private labels: string[] = [];
  private selected = 0;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.view = new Container();
    this.view.visible = false;
    this.bg = new Graphics();
    this.body = new Container();
    this.view.addChild(this.bg, this.body);
  }

  open(prompt: string, labels: string[]): void {
    this.labels = labels;
    this.selected = 0;
    this.view.visible = true;
    this.redraw(prompt);
  }

  close(): void {
    this.view.visible = false;
  }

  get isOpen(): boolean {
    return this.view.visible;
  }

  /** 当前选中下标（与 runner 的 options 顺序一致）。 */
  get selectedIndex(): number {
    return this.selected;
  }

  /** 上下移动（环形）。prompt 需回传以重画（Game 持有当前 prompt）。 */
  move(delta: 1 | -1, prompt: string): void {
    if (this.labels.length === 0) return;
    this.selected = wrapIndex(this.selected, delta, this.labels.length);
    this.redraw(prompt);
  }

  private redraw(prompt: string): void {
    // 销毁旧节点再重建（removeChildren 不释放 GPU 纹理，code review 发现的泄漏）
    this.body.removeChildren().forEach((c) => c.destroy());

    const promptText = new Text({
      text: prompt,
      style: {
        fontFamily: "sans-serif",
        fontSize: 18,
        fontWeight: "bold",
        fill: 0xe8c66a,
        wordWrap: true,
        wordWrapWidth: WIDTH - PAD * 2,
      },
    });
    // 按 prompt 实测高度自适应弹窗高度与列表起点（换行不再盖住首选项）
    const promptH = promptText.height;
    const h = PAD * 2 + promptH + GAP + this.labels.length * ITEM_H;
    const x = (this.screenWidth - WIDTH) / 2;
    const y = (this.screenHeight - h) / 2;

    this.bg.clear();
    this.bg
      .rect(x, y, WIDTH, h)
      .fill({ color: 0x14100a, alpha: 0.96 })
      .stroke({ color: 0x8a744a, width: 2 });

    promptText.position.set(x + PAD, y + PAD);
    this.body.addChild(promptText);

    const listTop = y + PAD + promptH + GAP;
    this.labels.forEach((label, i) => {
      const rowY = listTop + i * ITEM_H;
      if (i === this.selected) {
        const hl = new Graphics();
        hl.rect(x + 8, rowY - 2, WIDTH - 16, ITEM_H).fill({
          color: 0x8a744a,
          alpha: 0.5,
        });
        this.body.addChild(hl);
      }
      const t = new Text({
        text: `${i === this.selected ? "▶ " : "  "}${label}`,
        style: { fontFamily: "sans-serif", fontSize: 16, fill: 0xf0e6d2 },
      });
      t.position.set(x + PAD, rowY);
      this.body.addChild(t);
    });
  }
}
