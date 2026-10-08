import { describe, it, expect } from "vitest";
import { boardApi } from "../board.api";

describe("boardApi.getBoardDashboard", () => {
  it("derives BoardDashboard from existing board detail state", async () => {
    const dashboard = await boardApi.getBoardDashboard("board-website-redesign");
    expect(dashboard).toBeDefined();
    expect(dashboard.totalCards).toBeGreaterThanOrEqual(1);
    expect(typeof dashboard.completedCards).toBe("number");
    expect(typeof dashboard.inProgressCards).toBe("number");
    expect(typeof dashboard.todoCards).toBe("number");
    expect(typeof dashboard.overdueCards).toBe("number");
    expect(typeof dashboard.completionRate).toBe("number");
  });

  it("handles non-existent board gracefully by returning zero metrics", async () => {
    const dashboard = await boardApi.getBoardDashboard("non-existent-board");
    expect(dashboard.totalCards).toBe(0);
    expect(dashboard.completionRate).toBe(0);
  });
});
