import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_BOARD_BACKGROUND,
  getBoardBackgroundPreference,
  saveBoardBackgroundPreference,
} from "../board-background";

describe("board background preferences", () => {
  beforeEach(() => localStorage.clear());

  it("saves a background separately for each board", () => {
    saveBoardBackgroundPreference("board-1", "coast");
    saveBoardBackgroundPreference("board-2", "meadow");

    expect(getBoardBackgroundPreference("board-1")).toBe("coast");
    expect(getBoardBackgroundPreference("board-2")).toBe("meadow");
  });

  it("uses the default for missing or invalid preferences", () => {
    localStorage.setItem("nexora:board-background:board-1", "unknown");

    expect(getBoardBackgroundPreference("board-1")).toBe(DEFAULT_BOARD_BACKGROUND);
    expect(getBoardBackgroundPreference("board-2")).toBe(DEFAULT_BOARD_BACKGROUND);
  });
});
