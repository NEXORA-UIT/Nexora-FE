import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlanningDependencyOverview } from "../PlanningDependencyOverview";
import type { KanbanCard } from "@/types";

describe("PlanningDependencyOverview Component", () => {
  const mockCardsWithDeps: KanbanCard[] = [
    {
      id: "card-1",
      code: "NEX-101",
      title: "Dependent Card 1",
      listId: "list-todo",
      boardId: "board-1",
      position: 1000,
      priority: "HIGH",
      status: "ACTIVE",
      assignees: [],
      labels: [],
      tasksCount: 0,
      completedTasksCount: 0,
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-01T10:00:00.000Z",
      isBlocked: true,
      dependencies: [
        {
          id: "dep-1",
          cardId: "card-1",
          prerequisiteCardId: "card-2",
          prerequisiteCode: "NEX-102",
          prerequisiteTitle: "Prereq Card 2",
          prerequisiteStatus: "IN_PROGRESS",
          isCompleted: false,
        },
      ],
    },
    {
      id: "card-2",
      code: "NEX-102",
      title: "Prereq Card 2",
      listId: "list-inprogress",
      boardId: "board-1",
      position: 2000,
      priority: "MEDIUM",
      status: "ACTIVE",
      assignees: [],
      labels: [],
      tasksCount: 0,
      completedTasksCount: 0,
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-01T10:00:00.000Z",
      dependencies: [],
    },
  ];

  it("renders dependency relations", () => {
    render(<PlanningDependencyOverview cards={mockCardsWithDeps} onCardClick={vi.fn()} />);

    expect(screen.getAllByText("NEX-101").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dependent Card 1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("NEX-102").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Prereq Card 2").length).toBeGreaterThanOrEqual(1);
  });

  it("invokes onCardClick when a row or card is clicked", () => {
    const handleCardClick = vi.fn();
    render(<PlanningDependencyOverview cards={mockCardsWithDeps} onCardClick={handleCardClick} />);

    const cardLink = screen.getAllByText("NEX-101")[0].closest("button");
    expect(cardLink).toBeDefined();

    fireEvent.click(cardLink!);
    expect(handleCardClick).toHaveBeenCalledWith("card-1");
  });


  it("renders empty state when no cards have dependencies", () => {
    render(
      <PlanningDependencyOverview
        cards={[mockCardsWithDeps[1]]}
        onCardClick={vi.fn()}
      />
    );

    expect(
      screen.getByText(/No dependencies defined across board cards yet/i)
    ).toBeDefined();
  });
});
