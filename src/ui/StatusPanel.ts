import { Container, Graphics, Text } from "pixi.js";
import type { GameState } from "@/game/state";
import { moralityLabel, getReputation } from "@/game/state";
import {
  charLevel,
  effectiveAllyStats,
  expForLevel,
  expToNext,
  skillLevel,
  type StatBlock,
} from "@/game/progression";
import { CHARACTERS } from "@/data/characters";
import { SKILLS } from "@/data/skills";
import { sectName } from "@/data/sects";

const MARGIN = 60;
const PADDING = 28;

const GOLD = 0xe8c66a;
const AMBER = 0xc9a86a;
const CREAM = 0xf0e6d2;
const MUTED = 0xbfb39a;
const DIM = 0x8a744a;

/**
 * 人物状态页（M5）：主角属性/等级/正邪、已习武学、队伍、门派声望。
 * 纯展示——只读 GameState，用 progression 折算函数算有效属性（与战斗 §2.1 一致）。
 */
export class StatusPanel {
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
      .stroke({ color: DIM, width: 2 });
    this.view.addChild(bg);

    this.content = new Container();
    this.view.addChild(this.content);
  }

  /** 打开时重建内容（数据少，全部重画即可）。 */
  open(state: GameState) {
    this.content.removeChildren();

    const title = this.text("人物状态", 22, GOLD, "bold");
    title.anchor.set(0.5, 0);
    title.position.set(this.screenWidth / 2, MARGIN + 18);
    this.content.addChild(title);

    const closeHint = this.text("C / Esc 关闭", 12, DIM);
    closeHint.anchor.set(1, 0);
    closeHint.position.set(this.screenWidth - MARGIN - 14, MARGIN + 14);
    this.content.addChild(closeHint);

    const colW = (this.screenWidth - (MARGIN + PADDING) * 2 - PADDING) / 2;
    const leftX = MARGIN + PADDING;
    const rightX = leftX + colW + PADDING;
    const top = MARGIN + 56;

    this.renderHero(state, leftX, top, colW);
    let ry = this.renderSkills(state, rightX, top);
    ry = this.renderParty(state, rightX, ry + 14);
    this.renderReputation(state, rightX, ry + 14);

    this.view.visible = true;
  }

  /** 左栏：主角名/侠名/等级/历练条/属性/正邪值。 */
  private renderHero(state: GameState, x: number, y0: number, w: number) {
    const player = CHARACTERS["player"]!;
    const level = charLevel(state, "player");
    // 与战斗同源：主角 id==="player" → effectiveAllyStats 返回该等级裸装基准
    const stats = effectiveAllyStats(player, level);

    let y = y0;
    const name = this.text(`${player.name}`, 18, CREAM, "bold");
    name.position.set(x, y);
    this.content.addChild(name);
    const lvl = this.text(`Lv.${level}`, 15, GOLD, "bold");
    lvl.position.set(x + w - lvl.width, y + 2);
    this.content.addChild(lvl);
    y += 30;

    const morality = state.morality;
    const label = this.text(
      `侠名：${moralityLabel(morality)}（正邪 ${morality > 0 ? "+" : ""}${morality}）`,
      14,
      morality >= 0 ? 0x9ccf7a : 0xcf7a7a,
    );
    label.position.set(x, y);
    this.content.addChild(label);
    y += 26;

    // 历练进度
    const need = expToNext(level);
    const into = (state.progress["player"]?.exp ?? 0) - expForLevel(level);
    const expText =
      need === null ? "历练：已至化境（满级）" : `历练：${into} / ${need}`;
    const exp = this.text(expText, 13, MUTED);
    exp.position.set(x, y);
    this.content.addChild(exp);
    y += 26;

    const header = this.text("── 属性 ──", 15, AMBER, "bold");
    header.position.set(x, y);
    this.content.addChild(header);
    y += 26;
    y = this.renderStats(stats, x, y, w);

    return y;
  }

  /** 一组属性数值（两列）。返回结束 y。 */
  private renderStats(s: StatBlock, x: number, y0: number, w: number): number {
    const rows: [string, number][] = [
      ["气血", s.hp],
      ["内力", s.mp],
      ["攻击", s.attack],
      ["防御", s.defense],
      ["身法", s.speed],
      ["移动", s.move],
    ];
    const colW = w / 2;
    let y = y0;
    rows.forEach(([k, v], i) => {
      const cx = x + (i % 2) * colW;
      if (i % 2 === 0 && i > 0) y += 24;
      const row = this.text(`${k}  ${v}`, 14, CREAM);
      row.position.set(cx, y);
      this.content.addChild(row);
    });
    return y + 30;
  }

  /** 右栏：已习武学（名 + 熟练等级）。 */
  private renderSkills(state: GameState, x: number, y0: number) {
    let y = y0;
    const header = this.text("── 武学 ──", 15, AMBER, "bold");
    header.position.set(x, y);
    this.content.addChild(header);
    y += 26;

    // 已习武学 = 主角自带招式（CharacterDef.skills）∪ 剧情习得（proficiency 键）
    const innate = CHARACTERS["player"]?.skills ?? [];
    const learnedIds = Object.keys(state.progress["player"]?.proficiency ?? {});
    const known = [...new Set([...innate, ...learnedIds])];
    if (known.length === 0) {
      const empty = this.text("尚未习得武学。", 13, 0x9c8f76);
      empty.position.set(x, y);
      this.content.addChild(empty);
      return y + 22;
    }
    for (const id of known) {
      const def = SKILLS[id];
      const lv = skillLevel(state, "player", id);
      const row = this.text(
        `· ${def ? def.name : id}  熟练 Lv.${lv}`,
        14,
        CREAM,
      );
      row.position.set(x, y);
      this.content.addChild(row);
      y += 24;
    }
    return y;
  }

  /** 右栏：常驻队友（名 + 折算后关键属性）。 */
  private renderParty(state: GameState, x: number, y0: number) {
    let y = y0;
    const header = this.text("── 队伍 ──", 15, AMBER, "bold");
    header.position.set(x, y);
    this.content.addChild(header);
    y += 26;

    if (state.party.length === 0) {
      const empty = this.text("孤身闯荡，尚无队友。", 13, 0x9c8f76);
      empty.position.set(x, y);
      this.content.addChild(empty);
      return y + 22;
    }

    const playerLevel = charLevel(state, "player");
    for (const id of state.party) {
      const def = CHARACTERS[id];
      if (!def) continue;
      // 与战斗同源的折算（progression.effectiveAllyStats），状态页数值即战斗数值
      const s = effectiveAllyStats(def, playerLevel);
      const row = this.text(
        `· ${def.name}  血${s.hp} 攻${s.attack} 防${s.defense} 身${s.speed}`,
        13,
        CREAM,
      );
      row.position.set(x, y);
      this.content.addChild(row);
      y += 24;
    }
    return y;
  }

  /** 右栏：门派声望。 */
  private renderReputation(state: GameState, x: number, y0: number) {
    let y = y0;
    const header = this.text("── 门派声望 ──", 15, AMBER, "bold");
    header.position.set(x, y);
    this.content.addChild(header);
    y += 26;

    const sects = Object.keys(state.reputation);
    if (sects.length === 0) {
      const empty = this.text("尚无门派声望。", 13, 0x9c8f76);
      empty.position.set(x, y);
      this.content.addChild(empty);
      return;
    }
    for (const sect of sects) {
      const rep = getReputation(state, sect);
      const row = this.text(`· ${sectName(sect)}：${rep}`, 14, CREAM);
      row.position.set(x, y);
      this.content.addChild(row);
      y += 24;
    }
  }

  private text(
    text: string,
    fontSize: number,
    fill: number,
    fontWeight: "normal" | "bold" = "normal",
  ): Text {
    return new Text({
      text,
      style: { fontFamily: "sans-serif", fontSize, fill, fontWeight },
    });
  }

  close() {
    this.view.visible = false;
  }

  get isOpen(): boolean {
    return this.view.visible;
  }
}
