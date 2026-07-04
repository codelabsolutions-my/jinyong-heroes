/** 键盘输入状态。方向键与 WASD 等价。 */
export type Direction = "up" | "down" | "left" | "right";

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
  /** 按下顺序栈，最后按下的方向优先 */
  private directionStack: Direction[] = [];

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    this.pressed.add(e.code);
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

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
