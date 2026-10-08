import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarDayCell } from "../CalendarDayCell";
import type { CalendarDay } from "../calendar.utils";
import type { KanbanCard } from "@/types";

describe("CalendarDayCell", () => {
  const cardA: KanbanCard = {
    id: "c-1",
    listId: "l-1",
    boardId: "b-1",
    code: "NEX-101",
    title: "Card One",
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
  const cardB = { ...cardA, id: "c-2", code: "NEX-102", title: "Card Two" };
  const cardC = { ...cardA, id: "c-3", code: "NEX-103", title: "Card Three" };

  const day: CalendarDay = {
    date: new Date(2026, 8, 28),
    dateString: "2026-09-28",
    dayOfMonth: 28,
    isCurrentMonth: true,
    isToday: false,
    cards: [cardA, cardB, cardC],
  };

  it("renders day number and primary cards", () => {
    const handleCardClick = vi.fn();
    render(<CalendarDayCell day={day} onCardClick={handleCardClick} />);

    expect(screen.getByText("28")).toBeDefined();
    expect(screen.getByText("Card One")).toBeDefined();
    expect(screen.getByText("Card Two")).toBeDefined();
  });

  it("renders +1 more overflow button and opens popover listing all cards", () => {
    const handleCardClick = vi.fn();
    render(<CalendarDayCell day={day} onCardClick={handleCardClick} />);

    const moreBtn = screen.getByRole("button", { name: /\+1 more/i });
    expect(moreBtn).toBeDefined();

    fireEvent.click(moreBtn);
    expect(screen.getByText("Card Three")).toBeDefined();
  });

  it("triggers onCardClick when clicking a card chip", () => {
    const handleCardClick = vi.fn();
    render(<CalendarDayCell day={day} onCardClick={handleCardClick} />);

    fireEvent.click(screen.getByText("Card One"));
    expect(handleCardClick).toHaveBeenCalledWith(cardA);
  });
});
