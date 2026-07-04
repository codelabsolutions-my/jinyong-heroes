import { Container, Text } from "pixi.js";

/** 右下角按键提示。 */
export class HintBar {
  readonly view: Container;
  private readonly text: Text;

  constructor(screenWidth: number, screenHeight: number) {
    this.view = new Container();
    this.text = new Text({
      text: "",
      style: {
        fontFamily: "sans-serif",
        fontSize: 12,
        fill: 0xd8cbae,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    this.text.anchor.set(1, 1);
    this.text.position.set(screenWidth - 10, screenHeight - 8);
    this.view.addChild(this.text);
  }

  set(message: string) {
    this.text.text = message;
  }
}
