import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoardCalendar } from "../BoardCalendar";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";

describe("BoardCalendar", () => {
  it("renders calendar toolbar and navigation buttons", () => {
    const handleCardClick = vi.fn();
    render(
      <BoardCalendar
        lists={MOCK_BOARD_DETAIL.lists}
        onCardClick={handleCardClick}
      />
    );

    expect(screen.getByRole("button", { name: /Previous month/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Next month/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Jump to current date/i })).toBeDefined();
    // Monday header in Month grid
    expect(screen.getByText("Mon")).toBeDefined();
  });

  it("advances month when clicking Next month button and returns to Today", () => {
    render(
      <BoardCalendar
        lists={MOCK_BOARD_DETAIL.lists}
        onCardClick={vi.fn()}
      />
    );

    const initialTitle = screen.getByRole("heading", { level: 2 }).textContent;
    const nextBtn = screen.getByRole("button", { name: /Next month/i });
    fireEvent.click(nextBtn);

    const updatedTitle = screen.getByRole("heading", { level: 2 }).textContent;
    expect(updatedTitle).not.toBe(initialTitle);

    const todayBtn = screen.getByRole("button", { name: /Jump to current date/i });
    fireEvent.click(todayBtn);

    const resetTitle = screen.getByRole("heading", { level: 2 }).textContent;
    expect(resetTitle).toBe(initialTitle);
  });
});
