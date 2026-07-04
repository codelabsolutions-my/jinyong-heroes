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
