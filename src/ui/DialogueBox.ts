import { Container, Graphics, Text } from "pixi.js";

const BOX_HEIGHT = 140;
const PADDING = 20;

/** 屏幕底部对话框：说话人 + 正文 + 继续提示。 */
export class DialogueBox {
  readonly view: Container;

  private readonly speakerText: Text;
  private readonly bodyText: Text;

  constructor(screenWidth: number, screenHeight: number) {
    this.view = new Container();
    this.view.visible = false;

    const bg = new Graphics();
    bg.rect(8, screenHeight - BOX_HEIGHT - 8, screenWidth - 16, BOX_HEIGHT)
      .fill({ color: 0x14100a, alpha: 0.92 })
      .stroke({ color: 0x8a744a, width: 2 });
    this.view.addChild(bg);

    this.speakerText = new Text({
      text: "",
      style: {
        fontFamily: "sans-serif",
        fontSize: 17,
        fontWeight: "bold",
        fill: 0xe8c66a,
      },
    });
    this.speakerText.position.set(
      8 + PADDING,
      screenHeight - BOX_HEIGHT - 8 + 14,
    );
    this.view.addChild(this.speakerText);

    this.bodyText = new Text({
      text: "",
      style: {
        fontFamily: "sans-serif",
        fontSize: 16,
        fill: 0xf0e6d2,
        wordWrap: true,
        wordWrapWidth: screenWidth - 16 - PADDING * 2,
        lineHeight: 24,
        breakWords: true, // 中文无空格换行
      },
    });
    this.bodyText.position.set(8 + PADDING, screenHeight - BOX_HEIGHT - 8 + 44);
    this.view.addChild(this.bodyText);

    const hint = new Text({
      text: "▼ 空格",
      style: { fontFamily: "sans-serif", fontSize: 12, fill: 0x8a744a },
    });
    hint.anchor.set(1, 1);
    hint.position.set(screenWidth - 8 - 14, screenHeight - 8 - 10);
    this.view.addChild(hint);
  }

  show(speaker: string, text: string) {
    this.speakerText.text = speaker;
    this.bodyText.text = text;
    this.view.visible = true;
  }

  hide() {
    this.view.visible = false;
  }
}
