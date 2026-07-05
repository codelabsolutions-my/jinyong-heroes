import type { Direction } from "@/game/geometry";

/** 键盘输入状态。方向键与 WASD 等价；功能键用边沿触发（takePress）。 */

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

export class Input {
  private pressed = new Set<string>();
  /** 本帧刚按下、尚未被消费的键 */
  private justPressed = new Set<string>();
  /** 按下顺序栈，最后按下的方向优先 */
  private directionStack: Direction[] = [];

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    this.pressed.add(e.code);
    this.justPressed.add(e.code);
    const dir = KEY_TO_DIRECTION[e.code];
    if (dir && !this.directionStack.includes(dir)) {
      this.directionStack.push(dir);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.pressed.delete(e.code);
    const dir = KEY_TO_DIRECTION[e.code];
    if (dir) {
      this.directionStack = this.directionStack.filter((d) => {
        // 只有当没有别的键还映射到同一方向时才移除
        for (const code of this.pressed) {
          if (KEY_TO_DIRECTION[code] === d) return true;
        }
        return d !== dir;
      });
    }
  };

  /** 当前生效的移动方向（最后按下的优先），无输入时返回 null */
  get direction(): Direction | null {
    return this.directionStack[this.directionStack.length - 1] ?? null;
  }

  isPressed(code: string): boolean {
    return this.pressed.has(code);
  }

  /**
   * 边沿触发：这些键里有没有本帧刚按下的？消费掉，同一次按键只返回一次 true。
   * 用于对话推进、开菜单等"按一下做一件事"的操作。
   */
  takePress(...codes: string[]): boolean {
    for (const code of codes) {
      if (this.justPressed.has(code)) {
        this.justPressed.delete(code);
        return true;
      }
    }
    return false;
  }

  /** 每帧结尾调用：丢弃没人消费的按键，避免跨帧堆积 */
  endFrame() {
    this.justPressed.clear();
  }

  /**
   * 清空当前按住的移动方向。模式切换后调用，避免"惯性走一步"——
   * 例：按住 ↓ 移动抉择菜单光标、按空格确认，若不清空，回到 explore 后残留的 ↓
   * 会让主角立刻往下走一格（code review 发现）。松开再按方可继续移动。
   */
  clearDirections() {
    this.directionStack = [];
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
