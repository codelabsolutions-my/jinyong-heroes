import { describe, expect, it } from "vitest";
import { newGame } from "@/game/state";
import { BOOKS, TOTAL_BOOKS, bookEntries, ownedBookCount } from "../index";

describe("十四天书 registry", () => {
  it("恰好 14 部，key 与 id 一致", () => {
    const list = Object.entries(BOOKS);
    expect(list).toHaveLength(TOTAL_BOOKS);
    for (const [key, def] of list) expect(def.id).toBe(key);
  });

  it("序位 1-14 无重复无缺口", () => {
    const orders = Object.values(BOOKS)
      .map((b) => b.order)
      .sort((a, b) => a - b);
    expect(orders).toEqual(
      Array.from({ length: TOTAL_BOOKS }, (_, i) => i + 1),
    );
  });

  it("射雕线天书 book-shediao 在册（M3 唯一可得）", () => {
    expect(BOOKS["book-shediao"]).toBeDefined();
    expect(BOOKS["book-shediao"]!.name).toBe("射雕英雄传");
  });

  it("每部都有非空入口线索 hint", () => {
    for (const b of Object.values(BOOKS)) {
      expect(b.hint.length, `${b.id} 缺 hint`).toBeGreaterThan(0);
    }
  });
});

describe("bookEntries / ownedBookCount", () => {
  it("按序位排序，标注已得", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    state.books.push("book-shediao");
    const entries = bookEntries(state);
    expect(entries).toHaveLength(TOTAL_BOOKS);
    // 排序：order 递增
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i]!.def.order).toBeGreaterThan(entries[i - 1]!.def.order);
    }
    const shediao = entries.find((e) => e.def.id === "book-shediao")!;
    expect(shediao.owned).toBe(true);
    const feihu = entries.find((e) => e.def.id === "book-feihu")!;
    expect(feihu.owned).toBe(false);
  });

  it("ownedBookCount 只数在册的书，忽略未知 id", () => {
    const state = newGame({ mapId: "m", x: 0, y: 0 });
    expect(ownedBookCount(state)).toBe(0);
    state.books.push("book-shediao", "book-xiaoao", "book-nonexistent");
    expect(ownedBookCount(state)).toBe(2);
  });
});
