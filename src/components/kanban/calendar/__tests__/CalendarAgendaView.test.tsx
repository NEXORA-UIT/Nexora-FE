import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarAgendaView } from "../CalendarAgendaView";
import type { KanbanCard } from "@/types";

describe("CalendarAgendaView", () => {
  const card: KanbanCard = {
    id: "c-1",
    listId: "l-1",
    boardId: "b-1",
    code: "NEX-101",
    title: "Mobile test card",
    priority: "HIGH",
    position: 1024,
    status: "ACTIVE",
    dueDate: "2026-09-28T00:00:00.000Z",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    updatedAt: "2026-09-20T00:00:00.000Z",
    createdAt: "2026-09-15T00:00:00.000Z",
  };

  it("renders scheduled cards grouped chronologically by date", () => {
    const handleCardClick = vi.fn();
    render(
      <CalendarAgendaView
        currentDate={new Date(2026, 8, 15)}
        cards={[card]}
        onCardClick={handleCardClick}
      />
    );

    expect(screen.getByText("Mobile test card")).toBeDefined();
    expect(screen.getByText(/Sep 28/i)).toBeDefined();

    fireEvent.click(screen.getByText("Mobile test card"));
    expect(handleCardClick).toHaveBeenCalledWith(card);
  });

  it("renders intentional empty state when no cards are scheduled in the period", () => {
    render(
      <CalendarAgendaView
        currentDate={new Date(2026, 8, 15)}
        cards={[]}
        onCardClick={vi.fn()}
      />
    );

    expect(screen.getByText("No scheduled work")).toBeDefined();
    expect(screen.getByText(/There are no cards with dates in this period/i)).toBeDefined();
  });
});
