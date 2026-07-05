import { Container, Graphics, Text } from "pixi.js";
import type { EndingDef } from "@/data/endings";

/**
 * 结局画面（M5，ADR #33）：全屏黑底 + 居中标题 + 数行结局文字 + 「空格 继续」。
 * 纯展示；由 Game 的 ending 模式驱动，玩家确认后退回探索（结局是里程碑标记，非硬 game-over）。
 */
export class EndingScreen {
  readonly view: Container;
  private readonly body: Container;
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.view = new Container();
    this.view.visible = false;

    const bg = new Graphics();
    bg.rect(0, 0, screenWidth, screenHeight).fill({
      color: 0x0a0906,
      alpha: 1,
    });
    this.view.addChild(bg);

    this.body = new Container();
    this.view.addChild(this.body);
  }

  show(ending: EndingDef): void {
    this.body.removeChildren().forEach((c) => c.destroy());

    const title = new Text({
      text: ending.title,
      style: {
        fontFamily: "sans-serif",
        fontSize: 34,
        fontWeight: "bold",
        fill: 0xe8c66a,
      },
    });
    title.anchor.set(0.5, 0.5);
    title.position.set(this.screenWidth / 2, this.screenHeight / 2 - 130);
    this.body.addChild(title);

    ending.lines.forEach((line, i) => {
      const t = new Text({
        text: line,
        style: { fontFamily: "sans-serif", fontSize: 18, fill: 0xd8cdb4 },
      });
      t.anchor.set(0.5, 0.5);
      t.position.set(this.screenWidth / 2, this.screenHeight / 2 - 50 + i * 32);
      this.body.addChild(t);
    });

    const hint = new Text({
      text: "空格 继续",
      style: { fontFamily: "sans-serif", fontSize: 14, fill: 0x8a744a },
    });
    hint.anchor.set(0.5, 1);
    hint.position.set(this.screenWidth / 2, this.screenHeight - 40);
    this.body.addChild(hint);

    this.view.visible = true;
  }

  hide(): void {
    this.view.visible = false;
  }

  get isOpen(): boolean {
    return this.view.visible;
  }
}
