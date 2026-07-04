import type { Rng } from "@/game/rng";
import { computeDamage } from "./damage";
import { canMoveTo, inAttackRange, targetsInRange } from "./range";
import { turnOrder } from "./turnOrder";
import {
  BASIC_ATTACK,
  type BattleAction,
  type BattleState,
  type Combatant,
  type SkillRuntime,
  combatantById,
  livingOf,
} from "./types";

/**
 * 战斗结算核心（CLAUDE.md §5.5）：纯函数 `(state, action, rng) => newState`。
 * 不改传入 state（深拷贝后返回新对象）；随机只来自注入的 rng。
 * move 不结束回合（之后仍需出手）；attack/skill/wait 结束回合并推进行动序。
 * 非法动作 = 无操作（返回未推进的状态），交互层用 range/reachable 预先约束。
 */
export function resolve(
  state: BattleState,
  action: BattleAction,
  rng: Rng,
): BattleState {
  if (state.outcome !== "ongoing") return state;
  const next = structuredClone(state);
  const active = next.activeId ? combatantById(next, next.activeId) : undefined;
  if (!active) return next;

  switch (action.type) {
    case "move": {
      if (next.turnMoved) return state; // 一回合只能移动一次
      if (!canMoveTo(next, active, action.to)) return state;
      active.x = action.to.x;
      active.y = action.to.y;
      next.turnMoved = true;
      return next; // 移动不结束回合
    }
    case "attack": {
      if (!applyStrike(next, active, action.targetId, BASIC_ATTACK, rng)) {
        return state;
      }
      break;
    }
    case "skill": {
      const skill = active.skills.find((s) => s.id === action.skillId);
      if (!skill) return state;
      if (active.mp < skill.mpCost) return state;
      if (!applyStrike(next, active, action.targetId, skill, rng)) return state;
      active.mp -= skill.mpCost;
      break;
    }
    case "wait": {
      pushLog(next, `${active.name} 按兵不动。`);
      break;
    }
  }

  // attack/skill/wait 走到这里：先判胜负，未结束则推进回合
  updateOutcome(next);
  if (next.outcome === "ongoing") endTurn(next);
  return next;
}

/**
 * 施展一次攻击/武学。校验目标合法与射程；命中则结算伤害并写日志。
 * 返回 false 表示非法（调用方应放弃本次结算）。
 */
function applyStrike(
  state: BattleState,
  attacker: Combatant,
  targetId: string,
  skill: SkillRuntime,
  rng: Rng,
): boolean {
  const target = combatantById(state, targetId);
  if (!target || target.hp <= 0) return false;
  if (target.side === attacker.side) return false;
  if (!inAttackRange(attacker, target, skill.range)) return false;

  const dmg = computeDamage(
    {
      attack: attacker.attack,
      power: skill.power,
      defense: target.defense,
      attackerSchool: skill.school,
      defenderSchool: null, // 单位无常驻系别；防守方按无系（M2）
    },
    rng,
  );
  target.hp = Math.max(0, target.hp - dmg);
  const verb = skill === BASIC_ATTACK ? "攻击" : `使出${skill.name}`;
  pushLog(
    state,
    `${attacker.name} ${verb}，${target.name} 受 ${dmg} 点伤害` +
      (target.hp === 0 ? "，倒下了！" : "。"),
  );
  return true;
}

function updateOutcome(state: BattleState): void {
  if (livingOf(state, "enemy").length === 0) {
    state.outcome = "victory";
    pushLog(state, "敌人已全部倒下，战斗胜利！");
  } else if (livingOf(state, "ally").length === 0) {
    state.outcome = "defeat";
    pushLog(state, "我方全部倒下……");
  }
}

/** 推进到下一个行动者；本回合队列空则开新回合。死亡单位跳过。 */
function endTurn(state: BattleState): void {
  state.turnMoved = false;
  state.turnQueue = state.turnQueue.filter((id) => {
    const c = combatantById(state, id);
    return c !== undefined && c.hp > 0;
  });
  if (state.turnQueue.length > 0) {
    state.activeId = state.turnQueue.shift() ?? null;
    return;
  }
  // 新回合
  state.round += 1;
  const order = turnOrder(state);
  state.activeId = order[0] ?? null;
  state.turnQueue = order.slice(1);
}

/** UI 只读最后一条；保留少量尾部即可，封顶避免 resolve 每步全量 structuredClone 越来越贵 */
const MAX_LOG = 12;
function pushLog(state: BattleState, text: string): void {
  state.log.push({ text });
  if (state.log.length > MAX_LOG)
    state.log.splice(0, state.log.length - MAX_LOG);
}

/** 当前行动者用普攻可命中的敌人（UI 便捷函数） */
export function basicAttackTargets(state: BattleState): Combatant[] {
  if (!state.activeId) return [];
  return targetsInRange(state, state.activeId, BASIC_ATTACK.range);
}
