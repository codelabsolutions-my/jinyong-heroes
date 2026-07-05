import { describe, expect, it } from "vitest";
import { moralityLabel } from "../state";

describe("moralityLabel", () => {
  it("按正邪值区间给侠名（边界含端点）", () => {
    expect(moralityLabel(100)).toBe("大侠");
    expect(moralityLabel(60)).toBe("大侠");
    expect(moralityLabel(59)).toBe("侠士");
    expect(moralityLabel(20)).toBe("侠士");
    expect(moralityLabel(19)).toBe("无名");
    expect(moralityLabel(0)).toBe("无名");
    expect(moralityLabel(-19)).toBe("无名");
    expect(moralityLabel(-20)).toBe("枭雄");
    expect(moralityLabel(-59)).toBe("枭雄");
    expect(moralityLabel(-60)).toBe("魔头");
    expect(moralityLabel(-100)).toBe("魔头");
  });
});
