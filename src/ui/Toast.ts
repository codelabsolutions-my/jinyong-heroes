import { Container, Graphics, Text } from "pixi.js";

const SHOW_MS = 1800;
const FADE_MS = 400;

/** 顶部居中的短暂提示（获得线索、已存档…）。 */
export class Toast {
  readonly view: Container;
  private elapsed = 0;
  private readonly screenWidth: number;

  constructor(screenWidth: number) {
    this.screenWidth = screenWidth;
    this.view = new Container();
    this.view.visible = false;
  }

  show(message: string) {
    this.view.removeChildren();

    const text = new Text({
      text: message,
      style: { fontFamily: "sans-serif", fontSize: 15, fill: 0xf0e6d2 },
    });
    const w = text.width + 40;
    const bg = new Graphics();
    bg.roundRect(0, 0, w, 40, 6)
      .fill({ color: 0x14100a, alpha: 0.9 })
      .stroke({ color: 0x8a744a, width: 1.5 });
    text.position.set(20, 10);

    this.view.addChild(bg, text);
    this.view.position.set((this.screenWidth - w) / 2, 44);
    this.view.alpha = 1;
    this.view.visible = true;
    this.elapsed = 0;
  }

  update(deltaMS: number) {
    if (!this.view.visible) return;
    this.elapsed += deltaMS;
    if (this.elapsed > SHOW_MS + FADE_MS) {
      this.view.visible = false;
    } else if (this.elapsed > SHOW_MS) {
      this.view.alpha = 1 - (this.elapsed - SHOW_MS) / FADE_MS;
    }
  }
}
