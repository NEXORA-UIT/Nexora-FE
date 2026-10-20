import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/apis/client";
import { planningApi } from "@/apis/planning.api";

describe("planningApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads authorized board calendar items and optional date range", async () => {
    const entry = {
      id: "card-1",
      boardId: "board-1",
      listId: "list-1",
      listName: "To do",
      cardKey: "NX-1",
      title: "Prepare demo",
      startDate: null,
      dueDate: "2026-10-20T00:00:00.000Z",
      priority: "HIGH",
      statusGroup: "TODO",
      assigneeIds: ["user-1"],
      isOverdue: false,
      dependencyWarnings: [],
    };
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: { success: true, data: [entry] } });

    await expect(
      planningApi.getBoardCalendar("board-1", { from: "2026-10-01", to: "2026-11-01" })
    ).resolves.toEqual([entry]);
    expect(apiClient.get).toHaveBeenCalledWith("/boards/board-1/calendar", {
      params: { from: "2026-10-01", to: "2026-11-01" },
    });
  });
});
