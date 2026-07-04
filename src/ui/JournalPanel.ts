import { Container, Graphics, Text } from "pixi.js";
import type { GameState } from "@/game/state";
import {
  cluesByCategory,
  type ClueCategory,
  type ClueDef,
} from "@/game/journal";
import { bookEntries, TOTAL_BOOKS } from "@/data/books";

const MARGIN = 60;
const PADDING = 28;

/** 江湖见闻（任务日志）：按分类列出已获得的线索。 */
export class JournalPanel {
  readonly view: Container;
  private readonly content: Container;
  private readonly screenWidth: number;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.view = new Container();
    this.view.visible = false;

    const bg = new Graphics();
    bg.rect(MARGIN, MARGIN, screenWidth - MARGIN * 2, screenHeight - MARGIN * 2)
      .fill({ color: 0x14100a, alpha: 0.96 })
      .stroke({ color: 0x8a744a, width: 2 });
    this.view.addChild(bg);

    this.content = new Container();
    this.view.addChild(this.content);
  }

  /** 打开时重建内容（线索少，全部重画即可） */
  open(state: GameState, defs: Record<string, ClueDef>) {
    this.content.removeChildren();

    const title = new Text({
      text: "江湖手札",
      style: {
        fontFamily: "sans-serif",
        fontSize: 22,
        fontWeight: "bold",
        fill: 0xe8c66a,
      },
    });
    title.anchor.set(0.5, 0);
    title.position.set(this.screenWidth / 2, MARGIN + 18);
    this.content.addChild(title);

    const closeHint = new Text({
      text: "J / Esc 关闭",
      style: { fontFamily: "sans-serif", fontSize: 12, fill: 0x8a744a },
    });
    closeHint.anchor.set(1, 0);
    closeHint.position.set(this.screenWidth - MARGIN - 14, MARGIN + 14);
    this.content.addChild(closeHint);

    const x = MARGIN + PADDING;
    const wrapWidth = this.screenWidth - (MARGIN + PADDING) * 2;
    let y = MARGIN + 56;

    // 天书分册（14 部集齐目标；已得高亮、未得显示入口线索）
    y = this.renderBooks(state, x, y, wrapWidth);

    // 江湖见闻分册
    const seenHeader = new Text({
      text: "── 江湖见闻 ──",
      style: {
        fontFamily: "sans-serif",
        fontSize: 15,
        fontWeight: "bold",
        fill: 0xc9a86a,
      },
    });
    seenHeader.position.set(x, y);
    this.content.addChild(seenHeader);
    y += 30;

    const grouped = cluesByCategory(state, defs);
    if (grouped.size === 0) {
      const empty = new Text({
        text: "还没有任何见闻。去找村里人聊聊吧。",
        style: { fontFamily: "sans-serif", fontSize: 15, fill: 0x9c8f76 },
      });
      empty.position.set(x, y);
      this.content.addChild(empty);
    }

    const categoryOrder: ClueCategory[] = ["主线", "传闻"];
    for (const category of categoryOrder) {
      const clues = grouped.get(category);
      if (!clues) continue;

      const header = new Text({
        text: `【${category}】`,
        style: {
          fontFamily: "sans-serif",
          fontSize: 16,
          fontWeight: "bold",
          fill: 0xc9a86a,
        },
      });
      header.position.set(x, y);
      this.content.addChild(header);
      y += 30;

      for (const clue of clues) {
        const titleText = new Text({
          text: `· ${clue.title}`,
          style: {
            fontFamily: "sans-serif",
            fontSize: 15,
            fontWeight: "bold",
            fill: 0xf0e6d2,
          },
        });
        titleText.position.set(x + 8, y);
        this.content.addChild(titleText);
        y += 24;

        const body = new Text({
          text: clue.text,
          style: {
            fontFamily: "sans-serif",
            fontSize: 13,
            fill: 0xbfb39a,
            wordWrap: true,
            wordWrapWidth: wrapWidth - 24,
            lineHeight: 20,
            breakWords: true,
          },
        });
        body.position.set(x + 24, y);
        this.content.addChild(body);
        y += body.height + 14;
      }
      y += 10;
    }

    this.view.visible = true;
  }

  /** 渲染「天书」分册：14 部，已得高亮显示书名，未得灰显并给入口线索。返回结束 y。 */
  private renderBooks(
    state: GameState,
    x: number,
    y: number,
    wrapWidth: number,
  ): number {
    const entries = bookEntries(state);
    const ownedCount = entries.filter((e) => e.owned).length;

    const header = new Text({
      text: `── 天书 ${ownedCount}/${TOTAL_BOOKS} ──`,
      style: {
        fontFamily: "sans-serif",
        fontSize: 15,
        fontWeight: "bold",
        fill: 0xc9a86a,
      },
    });
    header.position.set(x, y);
    this.content.addChild(header);
    y += 28;

    const hintX = x + 150;
    for (const { def, owned } of entries) {
      const row = new Text({
        text: `${def.order}. 《${def.name}》${owned ? "  ✦已得" : ""}`,
        style: {
          fontFamily: "sans-serif",
          fontSize: 13,
          fontWeight: owned ? "bold" : "normal",
          fill: owned ? 0xe8c66a : 0x7d715c,
        },
      });
      row.position.set(x + 8, y);
      this.content.addChild(row);

      let rowHeight = row.height;
      if (!owned) {
        const hint = new Text({
          text: def.hint,
          style: {
            fontFamily: "sans-serif",
            fontSize: 11,
            fill: 0x6a6152,
            wordWrap: true,
            wordWrapWidth: wrapWidth - (hintX - x) - 8,
            lineHeight: 15,
            breakWords: true,
          },
        });
        hint.position.set(hintX, y);
        this.content.addChild(hint);
        rowHeight = Math.max(rowHeight, hint.height);
      }
      y += rowHeight + 5;
    }
    return y + 14;
  }

  close() {
    this.view.visible = false;
  }

  get isOpen(): boolean {
    return this.view.visible;
  }
}
