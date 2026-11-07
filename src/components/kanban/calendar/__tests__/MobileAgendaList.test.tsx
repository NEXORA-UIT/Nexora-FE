import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileAgendaList } from "../MobileAgendaList";
import type { KanbanList } from "@/types";

describe("MobileAgendaList", () => {
  const lists = [
    {
      id: "l1",
      name: "To Do",
      cards: [
        {
          id: "c1",
          code: "NEX-1",
          title: "Setup auth",
          dueDate: "2026-11-10T10:00:00Z",
          priority: "HIGH",
          labels: [],
          assignees: [],
        },
      ],
    },
  ] as unknown as KanbanList[];

  it("renders scheduled cards in agenda order and handles click", () => {
    const handleClick = vi.fn();
    render(
      <MobileAgendaList
        lists={lists}
        currentDate={new Date("2026-11-10T00:00:00Z")}
        onCardClick={handleClick}
      />
    );

    expect(screen.getByText("Setup auth")).toBeDefined();
    expect(screen.getByText("NEX-1")).toBeDefined();
    fireEvent.click(screen.getByText("Setup auth"));
    expect(handleClick).toHaveBeenCalled();
  });
});
