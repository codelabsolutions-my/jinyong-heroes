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
  effectiveStat,
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

  // attack/skill/wait 走到这里：先判歼灭/全灭，未结束则推进回合并检查目标
  updateOutcome(next);
  if (next.outcome === "ongoing") {
    endTurn(next);
    checkObjective(next); // 回合可能刚推进，检查"存活满 N 回合"类目标
  }
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
      attack: effectiveStat(attacker, "attack"),
      power: skill.power,
      defense: effectiveStat(target, "defense"),
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
  // 命中后施加状态（M4 §2.4，减益）；单位已倒下则不挂
  if (skill.status && target.hp > 0) {
    target.statuses.push({
      stat: skill.status.stat,
      amount: skill.status.amount,
      remaining: skill.status.duration,
    });
    const dir = skill.status.amount < 0 ? "下降" : "上升";
    pushLog(state, `${target.name} 的${statName(skill.status.stat)}${dir}了！`);
  }
  return true;
}

function statName(stat: "attack" | "defense" | "speed"): string {
  return stat === "attack" ? "攻击" : stat === "defense" ? "防御" : "身法";
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

/**
 * 自定义胜负目标（默认歼灭规则之外的补充，在 endTurn 推进回合后调用）。
 * surviveRounds：我方存活满 N 回合（round 已越过 N）即判胜——"打不过也能过"。
 */
function checkObjective(state: BattleState): void {
  const obj = state.objective;
  if (!obj || state.outcome !== "ongoing") return;
  if (
    obj.surviveRounds !== undefined &&
    state.round > obj.surviveRounds &&
    livingOf(state, "ally").length > 0
  ) {
    state.outcome = "victory";
    pushLog(state, `坚持满 ${obj.surviveRounds} 回合，援手赶到，战斗结束！`);
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
  // 新回合：先给所有状态计时 -1（≤0 移除），再按有效属性重排行动序
  state.round += 1;
  decayStatuses(state);
  const order = turnOrder(state);
  state.activeId = order[0] ?? null;
  state.turnQueue = order.slice(1);
}

/** 每新回合把所有单位的状态剩余回合 -1，到期（≤0）移除（M4 §2.4）。 */
function decayStatuses(state: BattleState): void {
  for (const c of state.combatants) {
    for (const s of c.statuses) s.remaining -= 1;
    c.statuses = c.statuses.filter((s) => s.remaining > 0);
  }
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
