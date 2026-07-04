import type { TerrainDef } from "@/data/maps/types";

/**
 * 战斗的纯数据模型（零 Pixi）。BattleState 是可 JSON 序列化的战斗快照，
 * 渲染层只读它；变更全部经 resolve() 走（CLAUDE.md §5.1、§5.5）。
 */

/** 武学系别；null = 无系普攻。克制环：刚→奇→柔→刚 */
export type School = "刚" | "柔" | "奇" | null;

export interface Coord {
  x: number;
  y: number;
}

/**
 * 战斗内的武学运行时数据。**由 setup() 从 data/skills 翻译而来并嵌进 Combatant**——
 * 这样 resolve/ai/range 完全不依赖 data 层，BattleState 自包含、可序列化、可回放。
 */
export interface SkillRuntime {
  id: string;
  name: string;
  school: School;
  power: number;
  /** 攻击范围（曼哈顿，≥1） */
  range: number;
  mpCost: number;
}

/** 普攻：无系、威力 0、范围 1、不耗内力 */
export const BASIC_ATTACK: SkillRuntime = {
  id: "__basic__",
  name: "攻击",
  school: null,
  power: 0,
  range: 1,
  mpCost: 0,
};

export type Side = "ally" | "enemy";

export interface Combatant {
  /** 战斗内唯一 id，如 "player" / "enemy-0" */
  id: string;
  name: string;
  side: Side;
  /** 占位配色（像素素材接入前） */
  color: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  /** 每回合移动力（格数，曼哈顿 BFS） */
  move: number;
  /** 已习得武学（运行时数据，setup 时从 data/skills 展开） */
  skills: SkillRuntime[];
}

/** 战场地形（复用探索地图的字符网格 + 地形表，无出入口/NPC/出生点） */
export interface Battlefield {
  grid: string[];
  terrains: Record<string, TerrainDef>;
}

export type BattleOutcome = "ongoing" | "victory" | "defeat";

/**
 * 战斗胜负目标（可选）。省略即默认规则：歼灭全部敌人=胜、我方全灭=败。
 * 用于"打不过也能过"的剧情战（如欧阳锋一战：撑满若干回合，洪七公救场判胜）。
 */
export interface BattleObjective {
  /** 我方存活满这么多回合（该回合结束后）即判胜，无需歼敌 */
  surviveRounds?: number;
}

export interface BattleLogEntry {
  text: string;
}

export interface BattleState {
  battleId: string;
  /** RNG 种子，用于记录/回放（活的 rng 由 controller 持有并注入 resolve） */
  seed: number;
  field: Battlefield;
  combatants: Combatant[];
  round: number;
  /** 本回合尚未行动的单位 id（不含当前行动者） */
  turnQueue: string[];
  /** 当前行动者 id；null 表示需要开新回合 */
  activeId: string | null;
  /** 当前行动者本回合是否已移动过（移动 + 一个动作 = 一个回合） */
  turnMoved: boolean;
  outcome: BattleOutcome;
  /** 胜负目标；省略=默认歼灭/全灭规则 */
  objective?: BattleObjective;
  /** 最近的战斗日志（UI 取尾部若干条展示） */
  log: BattleLogEntry[];
}

/**
 * 一个原子动作。move 不结束回合（之后还要出手）；attack/skill/wait 结束回合。
 */
export type BattleAction =
  | { type: "move"; to: Coord }
  | { type: "attack"; targetId: string }
  | { type: "skill"; skillId: string; targetId: string }
  | { type: "wait" };

export function combatantById(
  state: BattleState,
  id: string,
): Combatant | undefined {
  return state.combatants.find((c) => c.id === id);
}

export function livingOf(state: BattleState, side: Side): Combatant[] {
  return state.combatants.filter((c) => c.side === side && c.hp > 0);
}

export function isAlive(c: Combatant): boolean {
  return c.hp > 0;
}
