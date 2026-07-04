import type { School } from "@/game/battle/types";

/** 武学定义（数据）。战斗时由 battle/setup 展开成 SkillRuntime 嵌进单位。 */
export interface SkillDef {
  id: string;
  name: string;
  school: School;
  power: number;
  /** 攻击范围（曼哈顿，≥1） */
  range: number;
  mpCost: number;
}

export const SKILLS: Record<string, SkillDef> = {
  // 开局自带（CHARACTERS_AND_SKILLS §3.2）。彩蛋"野球拳大成"（10 级 ×8）待熟练度系统（M4）
  yeqiuquan: {
    id: "yeqiuquan",
    name: "野球拳",
    school: "奇",
    power: 3,
    range: 1,
    mpCost: 0,
  },
  // 通用入门拳法：M2 教学关的耗内力武学（非金庸原著具名武功，占位到 M4 拜师系统）
  changquan: {
    id: "changquan",
    name: "长拳",
    school: "刚",
    power: 6,
    range: 1,
    mpCost: 3,
  },
  // 降龙十八掌（§3.2 刚系毕业技，直线 2 格）。M3 郭靖自带；area=直线待 M4，暂用 range 2。
  xianglong: {
    id: "xianglong",
    name: "降龙十八掌",
    school: "刚",
    power: 24,
    range: 2,
    mpCost: 14,
  },
  // 蛤蟆功：欧阳锋专属（§3.2 反派专属不可习得，仅 BOSS 使用）。mpCost 0 便于 BOSS 常用。
  hamagong: {
    id: "hamagong",
    name: "蛤蟆功",
    school: "刚",
    power: 18,
    range: 1,
    mpCost: 0,
  },
};
