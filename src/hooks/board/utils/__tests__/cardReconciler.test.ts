import { describe, it, expect } from "vitest";
import { applyAuthoritativeCardUpdate, updateCardInBoard } from "../cardReconciler";
import type { BoardDetail, KanbanCard } from "@/types";

describe("cardReconciler utility", () => {
  const baseCard: KanbanCard = {
    id: "card-1",
    listId: "list-1",
    boardId: "board-1",
    code: "NEX-1",
    title: "Test Card",
    priority: "MEDIUM",
    position: 1024,
    status: "ACTIVE",
    statusGroup: "TODO",
    assignees: [],
    labels: [],
    checklist: [{ id: "t-1", cardId: "card-1", title: "Task 1", isCompleted: true, position: 1024, createdAt: "", updatedAt: "" }],
    tasksCount: 1,
    completedTasksCount: 1,
    isBlocked: false,
    createdAt: "2026-10-10T10:00:00.000Z",
    updatedAt: "2026-10-10T12:00:00.000Z",
  };

  it("applies updates when refreshedCard is strictly newer", () => {
    const refreshedCard: KanbanCard = {
      ...baseCard,
      updatedAt: "2026-10-10T12:05:00.000Z",
      tasksCount: 2,
      completedTasksCount: 1,
    };

    const result = applyAuthoritativeCardUpdate(baseCard, refreshedCard);
    expect(result.updatedAt).toBe("2026-10-10T12:05:00.000Z");
    expect(result.tasksCount).toBe(2);
    expect(result.completedTasksCount).toBe(1);
  });

  it("ignores stale responses where refreshedCard is older than currentCard", () => {
    const staleRefreshedCard: KanbanCard = {
      ...baseCard,
      updatedAt: "2026-10-10T11:00:00.000Z",
      tasksCount: 0,
      completedTasksCount: 0,
    };

    const result = applyAuthoritativeCardUpdate(baseCard, staleRefreshedCard);
    expect(result.updatedAt).toBe("2026-10-10T12:00:00.000Z");
    expect(result.tasksCount).toBe(1);
    expect(result.completedTasksCount).toBe(1);
  });

  it("updates card inside board lists immutably using updateCardInBoard", () => {
    const mockBoard: BoardDetail = {
      id: "board-1",
      workspaceId: "ws-1",
      name: "Board",
      status: "ACTIVE",
      members: [],
      labels: [],
      lists: [
        {
          id: "list-1",
          boardId: "board-1",
          name: "Todo",
          category: "TODO",
          position: 1024,
          status: "ACTIVE",
          cards: [baseCard],
          createdAt: "",
          updatedAt: "",
        },
      ],
      archivedListsCount: 0,
      createdAt: "",
      updatedAt: "",
    };

    const updatedBoard = updateCardInBoard(mockBoard, "card-1", (c) => ({
      ...c,
      title: "Updated Title",
    }));

    expect(updatedBoard.lists[0].cards[0].title).toBe("Updated Title");
    expect(mockBoard.lists[0].cards[0].title).toBe("Test Card"); // original unchanged
  });
});
