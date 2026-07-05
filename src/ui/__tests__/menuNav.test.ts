import { describe, expect, it } from "vitest";
import { wrapIndex } from "../menuNav";

describe("wrapIndex", () => {
  it("在范围内正常加减", () => {
    expect(wrapIndex(0, 1, 3)).toBe(1);
    expect(wrapIndex(1, 1, 3)).toBe(2);
    expect(wrapIndex(2, -1, 3)).toBe(1);
  });
  it("环形回绕（首尾相接）", () => {
    expect(wrapIndex(2, 1, 3)).toBe(0); // 末项 →下 回到首项
    expect(wrapIndex(0, -1, 3)).toBe(2); // 首项 →上 回到末项
  });
  it("n<=0 安全返回 0", () => {
    expect(wrapIndex(0, 1, 0)).toBe(0);
    expect(wrapIndex(3, -1, 0)).toBe(0);
  });
  it("单项菜单始终停在 0", () => {
    expect(wrapIndex(0, 1, 1)).toBe(0);
    expect(wrapIndex(0, -1, 1)).toBe(0);
  });
});
