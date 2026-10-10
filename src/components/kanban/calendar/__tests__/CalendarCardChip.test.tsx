import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarCardChip } from "../CalendarCardChip";
import type { KanbanCard } from "@/types";

describe("CalendarCardChip status styling with UUID List IDs", () => {
  const baseCard: KanbanCard = {
    id: "card-uuid-1",
    listId: "4f7a2c10-9b4e-4f11-8c01-72a39bc61e05", // Real UUID without 'done' or 'progress' substrings
    boardId: "board-uuid-1",
    code: "NEX-101",
    title: "Implement feature",
    priority: "HIGH",
    position: 1024,
    status: "ACTIVE",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  };

  it("renders emerald dot for DONE cards with real UUID list IDs", () => {
    const card: KanbanCard = {
      ...baseCard,
      statusGroup: "DONE",
    };

    const { container } = render(<CalendarCardChip card={card} onClick={vi.fn()} />);
    const dot = container.querySelector(".rounded-full");
    expect(dot?.className).toContain("bg-emerald-500");
  });

  it("renders primary blue dot for IN_PROGRESS cards with real UUID list IDs", () => {
    const card: KanbanCard = {
      ...baseCard,
      statusGroup: "IN_PROGRESS",
    };

    const { container } = render(<CalendarCardChip card={card} onClick={vi.fn()} />);
    const dot = container.querySelector(".rounded-full");
    expect(dot?.className).toContain("bg-primary-500");
  });

  it("renders neutral dot for TODO cards with real UUID list IDs", () => {
    const card: KanbanCard = {
      ...baseCard,
      statusGroup: "TODO",
    };

    const { container } = render(<CalendarCardChip card={card} onClick={vi.fn()} />);
    const dot = container.querySelector(".rounded-full");
    expect(dot?.className).toContain("bg-neutral-400");
  });

  it("renders error red dot for blocked cards regardless of statusGroup", () => {
    const card: KanbanCard = {
      ...baseCard,
      statusGroup: "DONE",
      isBlocked: true,
    };

    const { container } = render(<CalendarCardChip card={card} onClick={vi.fn()} />);
    const dot = container.querySelector(".rounded-full");
    expect(dot?.className).toContain("bg-error-500");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<CalendarCardChip card={baseCard} onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledWith(baseCard);
  });
});
