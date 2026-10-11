import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BoardPlanningView } from "../BoardPlanningView";
import { boardApi } from "@/apis";
import type { KanbanList, BoardDashboard, KanbanCard } from "@/types";

describe("BoardPlanningView Integration Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCard1: KanbanCard = {
    id: "card-1",
    boardId: "board-1",
    listId: "list-1",
    title: "Setup Auth",
    code: "CARD-1",
    position: 1024,
    status: "ACTIVE",
    priority: "HIGH",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    dependencies: [],
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T08:00:00.000Z",
  };

  const mockCard2: KanbanCard = {
    id: "card-2",
    boardId: "board-1",
    listId: "list-2",
    title: "User Profile",
    code: "CARD-2",
    position: 2048,
    status: "ACTIVE",
    priority: "MEDIUM",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    dependencies: [
      {
        id: "dep-1",
        cardId: "card-2",
        prerequisiteCardId: "card-1",
        prerequisiteCode: "CARD-1",
        prerequisiteTitle: "Setup Auth",
        prerequisiteStatus: "TODO",
        isCompleted: false,
      },
    ],
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T08:00:00.000Z",
  };

  const mockLists: KanbanList[] = [
    {
      id: "list-1",
      boardId: "board-1",
      name: "To Do",
      category: "TODO",
      position: 1024,
      status: "ACTIVE",
      cards: [mockCard1],
      createdAt: "2026-10-09T08:00:00.000Z",
      updatedAt: "2026-10-09T08:00:00.000Z",
    },
    {
      id: "list-2",
      boardId: "board-1",
      name: "Done",
      category: "DONE",
      position: 2048,
      status: "ACTIVE",
      cards: [mockCard2],
      createdAt: "2026-10-09T08:00:00.000Z",
      updatedAt: "2026-10-09T08:00:00.000Z",
    },
  ];

  it("renders live metrics returned by boardApi.getBoardDashboard", async () => {
    const liveMetrics: BoardDashboard = {
      totalCards: 20,
      completedCards: 10,
      inProgressCards: 5,
      todoCards: 5,
      overdueCards: 0,
      completionRate: 50,
    };
    vi.spyOn(boardApi, "getBoardDashboard").mockResolvedValueOnce(liveMetrics);

    const handleCardClick = vi.fn();
    render(
      <BoardPlanningView
        boardId="board-1"
        lists={mockLists}
        onCardClick={handleCardClick}
      />
    );

    expect(boardApi.getBoardDashboard).toHaveBeenCalledWith("board-1");

    await waitFor(() => {
      expect(screen.getByText("50%")).toBeDefined();
      expect(screen.getByText(/10 of 20 cards completed/i)).toBeDefined();
    });

    // Check Schedule Warnings section
    expect(screen.getAllByText(/Schedule & Blocker Warnings/i).length).toBeGreaterThanOrEqual(1);

    // Check Dependency Overview section
    expect(screen.getAllByText(/Dependency Relations/i).length).toBeGreaterThanOrEqual(1);
  });

  it("gracefully falls back to local calculation when getBoardDashboard fails", async () => {
    vi.spyOn(boardApi, "getBoardDashboard").mockRejectedValueOnce(
      new Error("Network offline")
    );

    const handleCardClick = vi.fn();
    render(
      <BoardPlanningView
        boardId="board-1"
        lists={mockLists}
        onCardClick={handleCardClick}
      />
    );

    // mockLists has 2 active cards: 1 in TODO, 1 in DONE -> 50%
    await waitFor(() => {
      expect(screen.getByText("50%")).toBeDefined();
      expect(screen.getByText(/1 of 2 cards completed/i)).toBeDefined();
    });
  });

  it("triggers onCardClick when dependency card chip is clicked", async () => {
    vi.spyOn(boardApi, "getBoardDashboard").mockResolvedValueOnce({
      totalCards: 2,
      completedCards: 1,
      inProgressCards: 0,
      todoCards: 1,
      overdueCards: 0,
      completionRate: 50,
    });

    const handleCardClick = vi.fn();
    render(
      <BoardPlanningView
        boardId="board-1"
        lists={mockLists}
        onCardClick={handleCardClick}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText("Setup Auth").length).toBeGreaterThanOrEqual(1);
    });

    const cardButton = screen.getAllByText("Setup Auth")[0].closest("button");
    expect(cardButton).not.toBeNull();
    if (cardButton) {
      fireEvent.click(cardButton);
      expect(handleCardClick).toHaveBeenCalledWith(mockCard1);
    }
  });
});

