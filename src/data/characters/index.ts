import type { CompanionCoeff } from "@/game/progression";

/** 战斗单位模板（数据）。数值见 CHARACTERS_AND_SKILLS §1、§2.3。 */

export interface CharacterDef {
  id: string;
  name: string;
  /** 占位配色（像素素材接入前） */
  color: number;
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  /** 每回合移动力（格数） */
  move: number;
  /** 已习得武学 id（查 SKILLS） */
  skills: string[];
  /** 队友成长系数（M4，CHARACTERS §4）；招募后有效属性 = 主角同级基准×系数。敌人/主角不填。 */
  coeff?: CompanionCoeff;
}

export const CHARACTERS: Record<string, CharacterDef> = {
  // 主角"小虾米"——§1 基准数值
  player: {
    id: "player",
    name: "小虾米",
    color: 0x3355aa,
    hp: 50,
    mp: 20,
    attack: 10,
    defense: 5,
    speed: 10,
    move: 4,
    skills: ["yeqiuquan", "changquan"],
  },
  // 拦路强盗：T1 杂兵，弱于主角，教学关稳赢
  bandit: {
    id: "bandit",
    name: "拦路强盗",
    color: 0x9c5a3a,
    hp: 14,
    mp: 0,
    attack: 8,
    defense: 3,
    speed: 8,
    move: 3,
    skills: [],
  },

  // —— 射雕线（M3）——
  // 数值为 M3 手调临时值：CHARACTERS §2.2 的"主角同级基准×系数"完整折算随 M4 等级系统落地。
  // 郭靖：重装战士（§4 hp1.3 def1.2 spd0.8），自带降龙十八掌，射雕线剧情战友军。
  guojing: {
    id: "guojing",
    name: "郭靖",
    color: 0xc2a86b,
    hp: 90,
    mp: 30,
    attack: 16,
    defense: 12,
    speed: 8,
    move: 4,
    skills: ["xianglong"],
    // 重装战士（CHARACTERS §4）：招募后有效属性 = 主角同级基准 × 系数
    coeff: { hp: 1.3, defense: 1.2, speed: 0.8 },
  },
  // 黄蓉：军师型（§4 atk0.7 spd1.2）。"计策"（乱阵/激励）是控制技，本引擎（伤害制）
  // 暂不支持增益/减益 → M4 §2.4 实装；先以普攻并肩，机动偏高。
  huangrong: {
    id: "huangrong",
    name: "黄蓉",
    color: 0xd98b9a,
    hp: 55,
    mp: 40,
    attack: 9,
    defense: 7,
    speed: 13,
    move: 4,
    skills: ["jimou-luanzhen"],
    coeff: { attack: 0.7, speed: 1.2 },
  },
  // 黄河鬼：射雕第 1 章 BOSS「黄河四鬼」的单体模板（encounter 里放 4 个）。T1-T2 杂兵。
  "huanghe-gui": {
    id: "huanghe-gui",
    name: "黄河鬼",
    color: 0x6b7f4a,
    hp: 24,
    mp: 0,
    attack: 12,
    defense: 5,
    speed: 9,
    move: 3,
    skills: [],
  },
  // 欧阳锋（西毒）：射雕第 3 章 BOSS，T3 超模。设计为"打不过也能过"，撑回合即胜。
  ouyangfeng: {
    id: "ouyangfeng",
    name: "欧阳锋",
    color: 0x8e7cc3,
    hp: 130,
    mp: 99,
    attack: 30,
    defense: 16,
    speed: 16,
    move: 4,
    skills: ["hamagong"],
  },

  // —— 鸳鸯刀线（M4，STORY_BIBLE §2.1 教学线）——
  // 太岳四侠：喜剧客串劫匪，T1 极弱（教学战稳赢）。encounter 里放数个（yy-taiyue 放 3）。
  "taiyue-si-xia": {
    id: "taiyue-si-xia",
    name: "太岳四侠",
    color: 0xb5793a,
    hp: 12,
    mp: 0,
    attack: 6,
    defense: 2,
    speed: 7,
    move: 3,
    skills: [],
  },
  // 卓天雄：鸳鸯刀线 BOSS，T1 BOSS。教学线首通常为无队友单挑，数值调到低级主角可solo 打赢。
  "zhuo-tianxiong": {
    id: "zhuo-tianxiong",
    name: "卓天雄",
    color: 0x7a4a2a,
    hp: 30,
    mp: 0,
    attack: 8,
    defense: 4,
    speed: 9,
    move: 4,
    skills: [],
  },
};
