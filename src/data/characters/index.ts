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
};
