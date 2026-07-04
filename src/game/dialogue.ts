import { type Condition, evaluate } from "./conditions";
import { grantClue } from "./journal";
import { type GameState, setFlag } from "./state";

/** 对话脚本与对话推进逻辑。脚本是数据（src/data/dialogues/），这里只有规则。 */

export interface DialogueLine {
  speaker: string;
  text: string;
}

export type Effect =
  | { type: "grantClue"; clueId: string }
  | { type: "setFlag"; flag: string }
  | { type: "startBattle"; battleId: string };

export interface DialogueVariant {
  when: Condition;
  lines: DialogueLine[];
  effects?: Effect[];
}

export interface Dialogue {
  id: string;
  /** 按顺序检查，第一个条件满足的变体生效；都不满足用默认 lines */
  variants?: DialogueVariant[];
  lines: DialogueLine[];
  effects?: Effect[];
}

export interface ActiveDialogue {
  dialogueId: string;
  lines: DialogueLine[];
  effects: Effect[];
  index: number;
}

/** 开始对话：根据当前状态选中变体。 */
export function startDialogue(
  state: GameState,
  dialogue: Dialogue,
): ActiveDialogue {
  for (const variant of dialogue.variants ?? []) {
    if (evaluate(state, variant.when)) {
      return {
        dialogueId: dialogue.id,
        lines: variant.lines,
        effects: variant.effects ?? [],
        index: 0,
      };
    }
  }
  return {
    dialogueId: dialogue.id,
    lines: dialogue.lines,
    effects: dialogue.effects ?? [],
    index: 0,
  };
}

export function currentLine(active: ActiveDialogue): DialogueLine {
  // index 由 advanceDialogue 控制，越界即逻辑 bug — fail fast
  const line = active.lines[active.index];
  if (!line) throw new Error(`dialogue ${active.dialogueId}: index 越界`);
  return line;
}

export interface AdvanceResult {
  done: boolean;
  /** 对话结束时新获得的线索 id（去重后），UI 用来弹提示 */
  newClues: string[];
  /** 对话结束时要触发的战斗 id（若有），Game 据此进入战斗模式 */
  startBattle?: string;
}

/** 推进一句；走完最后一句时应用 effects 并返回 done。 */
export function advanceDialogue(
  state: GameState,
  active: ActiveDialogue,
): AdvanceResult {
  if (active.index < active.lines.length - 1) {
    active.index++;
    return { done: false, newClues: [] };
  }
  const newClues: string[] = [];
  let startBattle: string | undefined;
  for (const effect of active.effects) {
    if (effect.type === "grantClue") {
      if (grantClue(state, effect.clueId)) newClues.push(effect.clueId);
    } else if (effect.type === "setFlag") {
      setFlag(state, effect.flag);
    } else if (effect.type === "startBattle") {
      startBattle = effect.battleId;
    }
  }
  return { done: true, newClues, startBattle };
}
