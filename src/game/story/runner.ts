import { type Condition, evaluate } from "../conditions";
import { grantClue } from "../journal";
import { type GameState, hasFlag, setFlag } from "../state";
import type {
  StoryEffect,
  StoryEvent,
  StoryInput,
  StoryRunState,
  StoryStep,
  StoryStepResult,
} from "./types";

/**
 * 剧情事件链的纯逻辑核心（NEXT_STEPS §2.1）。零 Pixi、零 I/O、可回放：
 * 同一 event + 同一 state + 同一输入序列 → 完全相同的游标/副作用/让出。
 */

/** 防 goto 环：单次 runEvent 内处理的自动步数上限（正常事件远达不到）。 */
const MAX_AUTO_STEPS = 1000;

/** 从一批事件里选第一个"触发条件满足且尚未完成"的事件。done 标记用 flag 表达。 */
export function selectTriggeredEvent(
  events: readonly StoryEvent[],
  state: GameState,
): StoryEvent | undefined {
  return events.find(
    (e) => !hasFlag(state, eventDoneFlag(e.id)) && evaluate(state, e.trigger),
  );
}

/** 事件完成后置的 flag，用于"不重复触发"。 */
export function eventDoneFlag(eventId: string): string {
  return `story-done:${eventId}`;
}

export function startEvent(event: StoryEvent): StoryRunState {
  return { eventId: event.id, cursor: 0, done: false, awaiting: null };
}

/** 把 step id 解析成数组下标；找不到即内容坏链，fail fast。 */
function indexOfStep(event: StoryEvent, ref: string): number {
  const idx = event.steps.findIndex((s) => s.id === ref);
  if (idx < 0) {
    throw new Error(`story ${event.id}: 找不到 step id "${ref}"`);
  }
  return idx;
}

function stepAt(event: StoryEvent, cursor: number): StoryStep | undefined {
  return event.steps[cursor];
}

/**
 * 推进事件。首次到达交互 step（对话/选择/战斗）时让出并记 `awaiting`；
 * 下次带对应输入调用即消费该输入并继续。自动 step（flag/clue/book/exp/skill/goto）
 * 就地处理。setFlag/grantClue 会当场应用到 state（影响同事件内后续 Condition）。
 */
export function runEvent(
  event: StoryEvent,
  state: GameState,
  run: StoryRunState,
  input?: StoryInput,
): StoryStepResult {
  if (run.eventId !== event.id) {
    throw new Error(
      `story runner: 游标属于 ${run.eventId}，却用来推进 ${event.id}`,
    );
  }
  const effects: StoryEffect[] = [];
  let cursor = run.cursor;

  // 1) 若停在交互 step 上，先消费输入再继续
  if (run.awaiting) {
    const step = stepAt(event, cursor);
    if (!step) throw new Error(`story ${event.id}: awaiting 游标越界`);
    cursor = resumeFrom(event, step, run.awaiting, input, state);
  }

  // 2) 处理自动 step，直到遇到交互 step 或结束
  for (let guard = 0; guard <= MAX_AUTO_STEPS; guard++) {
    if (cursor >= event.steps.length) {
      return finish(event, state, cursor, effects);
    }
    const step = event.steps[cursor];
    if (!step) return finish(event, state, cursor, effects);

    switch (step.kind) {
      case "setFlag":
        setFlag(state, step.flag);
        effects.push({ type: "setFlag", flag: step.flag });
        cursor++;
        continue;
      case "grantClue":
        if (grantClue(state, step.clueId)) {
          effects.push({ type: "grantClue", clueId: step.clueId });
        }
        cursor++;
        continue;
      case "grantBook":
        effects.push({ type: "grantBook", bookId: step.bookId });
        cursor++;
        continue;
      case "gainExp":
        effects.push({ type: "gainExp", amount: step.amount });
        cursor++;
        continue;
      case "learnSkill":
        effects.push({
          type: "learnSkill",
          skillId: step.skillId,
          who: step.who,
        });
        cursor++;
        continue;
      case "recruit":
        // 招募入常驻队伍：像 grantBook 一样只列出，由 Game 的 applyStoryEffects 应用。
        // （同事件内后续 hasCompanion 条件如需生效，请并发一个 setFlag——与 grantBook/minBooks 一致。）
        effects.push({ type: "recruit", charId: step.charId });
        cursor++;
        continue;
      case "switchMap":
        // 过场切图：剧情把玩家带到另一张地图（M4 §2.3）。由 Game 应用（改 player 位置 + rebuildScene）。
        effects.push({
          type: "switchMap",
          mapId: step.mapId,
          x: step.x,
          y: step.y,
        });
        cursor++;
        continue;
      case "adjustMorality":
        // 正邪值增减（M4 §2.5）：像 recruit 一样只列出，由 Game 的 applyStoryEffects 应用。
        effects.push({ type: "adjustMorality", delta: step.delta });
        cursor++;
        continue;
      case "goto":
        cursor = indexOfStep(event, step.target);
        continue;
      case "end":
        return finish(event, state, event.steps.length, effects);
      case "dialogue":
        return yieldAt(run, cursor, effects, "dialogue", {
          kind: "dialogue",
          dialogueId: step.dialogueId,
        });
      case "choice": {
        const options = step.options
          .map((o, i) => ({ o, i }))
          .filter(({ o }) => evaluate(state, o.when))
          .map(({ o, i }) => ({ label: o.label, option: i }));
        // 全部分支条件都不满足 = 死路（无输入能推进）。fail-fast，别静默卡住。
        if (options.length === 0) {
          throw new Error(
            `story ${event.id}: choice step 无可选项（所有分支条件都不满足）`,
          );
        }
        return yieldAt(run, cursor, effects, "choice", {
          kind: "choice",
          prompt: step.prompt,
          options,
        });
      }
      case "battle":
        return yieldAt(run, cursor, effects, "battle", {
          kind: "battle",
          battleId: step.battleId,
        });
    }
  }
  throw new Error(
    `story ${event.id}: 疑似 goto 死循环（超过 ${MAX_AUTO_STEPS} 步）`,
  );
}

/** 从交互 step 恢复，返回下一个要处理的游标。 */
function resumeFrom(
  event: StoryEvent,
  step: StoryStep,
  awaiting: NonNullable<StoryRunState["awaiting"]>,
  input: StoryInput,
  state: GameState,
): number {
  const cursor = event.steps.indexOf(step);
  if (awaiting === "dialogue") {
    // 对话看完，顺序推进
    return cursor + 1;
  }
  if (awaiting === "choice") {
    if (step.kind !== "choice") {
      throw new Error(`story ${event.id}: awaiting=choice 但 step 不是 choice`);
    }
    if (!input || input.type !== "choice") {
      throw new Error(`story ${event.id}: choice step 需要 choice 输入`);
    }
    const chosen = step.options[input.option];
    if (!chosen) {
      throw new Error(`story ${event.id}: choice 下标 ${input.option} 越界`);
    }
    // 重新校验被选分支的条件，而非只信 UI——回放/坏输入不得走进不可选分支
    if (!evaluate(state, chosen.when)) {
      throw new Error(
        `story ${event.id}: choice 选了不可选分支 ${input.option}`,
      );
    }
    return indexOfStep(event, chosen.goto);
  }
  // awaiting === "battle"
  if (step.kind !== "battle") {
    throw new Error(`story ${event.id}: awaiting=battle 但 step 不是 battle`);
  }
  if (!input || input.type !== "battle") {
    throw new Error(`story ${event.id}: battle step 需要 battle 输入`);
  }
  const target = input.outcome === "victory" ? step.onWin : step.onLose;
  return target !== undefined ? indexOfStep(event, target) : cursor + 1;
}

function yieldAt(
  run: StoryRunState,
  cursor: number,
  effects: StoryEffect[],
  awaiting: NonNullable<StoryRunState["awaiting"]>,
  y: StoryStepResult["yield"],
): StoryStepResult {
  return {
    run: { ...run, cursor, awaiting, done: false },
    effects,
    yield: y,
  };
}

/** 事件结束：置完成 flag（供 selectTriggeredEvent 去重），让出 end。 */
function finish(
  event: StoryEvent,
  state: GameState,
  cursor: number,
  effects: StoryEffect[],
): StoryStepResult {
  setFlag(state, eventDoneFlag(event.id));
  return {
    run: { eventId: event.id, cursor, done: true, awaiting: null },
    effects,
    yield: { kind: "end" },
  };
}

/** 便于测试/调试：断言事件里所有跳转目标都存在（内容完整性检查也会复用）。 */
export function collectStepRefs(event: StoryEvent): string[] {
  const refs: string[] = [];
  for (const step of event.steps) {
    if (step.kind === "goto") refs.push(step.target);
    if (step.kind === "battle") {
      if (step.onWin) refs.push(step.onWin);
      if (step.onLose) refs.push(step.onLose);
    }
    if (step.kind === "choice") {
      for (const o of step.options) refs.push(o.goto);
    }
  }
  return refs;
}

export type { Condition };
