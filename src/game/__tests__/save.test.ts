import { describe, expect, it } from "vitest";
import {
  SAVE_KEY,
  SaveLoadError,
  type KVStorage,
  loadGame,
  saveGame,
} from "../save";
import { newGame, setFlag } from "../state";
import { grantClue } from "../journal";

function memoryStorage(): KVStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

describe("save / load", () => {
  it("round-trips full state", () => {
    const storage = memoryStorage();
    const s = newGame({ mapId: "houshan-path", x: 3, y: 4 });
    s.player.facing = "left";
    setFlag(s, "met-sweeper");
    grantClue(s, "main-fourteen-books");

    saveGame(storage, s);
    const loaded = loadGame(storage);
    expect(loaded).toEqual(s);
    expect(loaded).not.toBe(s); // 独立副本，不共享引用
  });

  it("returns null when no save exists", () => {
    expect(loadGame(memoryStorage())).toBeNull();
  });

  it("throws SaveLoadError on corrupt JSON", () => {
    const storage = memoryStorage();
    storage.data.set(SAVE_KEY, "{not json");
    expect(() => loadGame(storage)).toThrow(SaveLoadError);
  });

  it("throws SaveLoadError on version mismatch", () => {
    const storage = memoryStorage();
    const s = newGame({ mapId: "m", x: 0, y: 0 });
    storage.data.set(SAVE_KEY, JSON.stringify({ ...s, version: 999 }));
    expect(() => loadGame(storage)).toThrow(/版本不兼容/);
  });

  it("migrates a v1 save all the way to v3, filling all new defaults", () => {
    const storage = memoryStorage();
    // 手写一个 v1 存档（没有 books/progress，也没有 morality/reputation/party）
    const v1 = {
      version: 1,
      player: { mapId: "houshan-path", x: 3, y: 4, facing: "left" },
      flags: { "met-sweeper": true },
      clues: ["main-fourteen-books"],
    };
    storage.data.set(SAVE_KEY, JSON.stringify(v1));

    const loaded = loadGame(storage);
    expect(loaded).not.toBeNull();
    expect(loaded?.version).toBe(3);
    // v2 补的
    expect(loaded?.books).toEqual([]);
    expect(loaded?.progress).toEqual({});
    // v3 补的
    expect(loaded?.morality).toBe(0);
    expect(loaded?.reputation).toEqual({});
    expect(loaded?.party).toEqual([]);
    // 旧字段原样保留，never 静默丢档
    expect(loaded?.flags).toEqual({ "met-sweeper": true });
    expect(loaded?.clues).toEqual(["main-fourteen-books"]);
    expect(loaded?.player.mapId).toBe("houshan-path");
  });

  it("migrates a v2 save to v3, filling morality/reputation/party defaults", () => {
    const storage = memoryStorage();
    const v2 = {
      version: 2,
      player: { mapId: "m", x: 1, y: 2, facing: "up" },
      flags: {},
      clues: [],
      books: ["book-shediao"],
      progress: { player: { exp: 100, proficiency: {} } },
    };
    storage.data.set(SAVE_KEY, JSON.stringify(v2));

    const loaded = loadGame(storage);
    expect(loaded?.version).toBe(3);
    expect(loaded?.books).toEqual(["book-shediao"]); // v2 数据保留
    expect(loaded?.morality).toBe(0);
    expect(loaded?.reputation).toEqual({});
    expect(loaded?.party).toEqual([]);
  });

  it("preserves an existing v3 round-trip (books/progress/morality/reputation/party)", () => {
    const storage = memoryStorage();
    const s = newGame({ mapId: "m", x: 0, y: 0 });
    s.books.push("book-shediao");
    s.progress["player"] = { exp: 240, proficiency: { changquan: 12 } };
    s.morality = 35;
    s.reputation["shaolin"] = 20;
    s.party.push("guojing");
    saveGame(storage, s);
    expect(loadGame(storage)).toEqual(s);
  });

  it("rejects malformed morality/reputation/party", () => {
    const base = newGame({ mapId: "m", x: 0, y: 0 });
    for (const patch of [
      { morality: "high" },
      { morality: NaN },
      { reputation: [1, 2] },
      { reputation: { shaolin: "lots" } },
      { party: "guojing" },
      { party: [1, 2] },
    ]) {
      const storage = memoryStorage();
      storage.data.set(SAVE_KEY, JSON.stringify({ ...base, ...patch }));
      expect(() => loadGame(storage), JSON.stringify(patch)).toThrow(
        SaveLoadError,
      );
    }
  });

  it("rejects malformed progress field", () => {
    const base = newGame({ mapId: "m", x: 0, y: 0 });
    for (const badProgress of [
      { player: { exp: "lots", proficiency: {} } },
      { player: { exp: 10 } },
      { player: { exp: 10, proficiency: { s: "x" } } },
      { player: 5 },
    ]) {
      const storage = memoryStorage();
      storage.data.set(
        SAVE_KEY,
        JSON.stringify({ ...base, progress: badProgress }),
      );
      expect(() => loadGame(storage), JSON.stringify(badProgress)).toThrow(
        SaveLoadError,
      );
    }
  });

  it("throws SaveLoadError on missing fields", () => {
    const storage = memoryStorage();
    storage.data.set(SAVE_KEY, JSON.stringify({ version: 1, flags: {} }));
    expect(() => loadGame(storage)).toThrow(SaveLoadError);
  });

  it("rejects null player / null flags (typeof null === 'object' trap)", () => {
    const base = newGame({ mapId: "m", x: 0, y: 0 });
    for (const bad of [
      { ...base, player: null },
      { ...base, flags: null },
      { ...base, clues: [1, 2] },
    ]) {
      const storage = memoryStorage();
      storage.data.set(SAVE_KEY, JSON.stringify(bad));
      expect(() => loadGame(storage), JSON.stringify(bad)).toThrow(
        SaveLoadError,
      );
    }
  });

  it("rejects invalid facing and non-integer coordinates", () => {
    const base = newGame({ mapId: "m", x: 0, y: 0 });
    for (const patch of [
      { facing: "Down" },
      { facing: 3 },
      { x: 1.5 },
      { y: NaN },
      { mapId: 7 },
    ]) {
      const storage = memoryStorage();
      storage.data.set(
        SAVE_KEY,
        JSON.stringify({ ...base, player: { ...base.player, ...patch } }),
      );
      expect(() => loadGame(storage), JSON.stringify(patch)).toThrow(
        SaveLoadError,
      );
    }
  });

  it("worldCheck rejection becomes SaveLoadError with its message", () => {
    const storage = memoryStorage();
    saveGame(storage, newGame({ mapId: "deleted-map", x: 0, y: 0 }));
    expect(() => loadGame(storage, () => "存档指向未知地图")).toThrow(
      /未知地图/,
    );
    // 通过时正常返回
    expect(loadGame(storage, () => null)).not.toBeNull();
  });
});
