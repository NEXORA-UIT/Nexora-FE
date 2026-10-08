import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlanningScheduleWarnings } from "../PlanningScheduleWarnings";
import type { ScheduleWarning } from "@/types";

describe("PlanningScheduleWarnings Component", () => {
  const mockWarnings: ScheduleWarning[] = [
    {
      id: "overdue-1",
      type: "OVERDUE",
      cardId: "card-1",
      cardCode: "NEX-101",
      cardTitle: "Database Migration",
      message: "Deadline has passed",
      severity: "error",
      dueDate: "2026-10-01T10:00:00.000Z",
    },
    {
      id: "blocker-1",
      type: "BLOCKER",
      cardId: "card-2",
      cardCode: "NEX-102",
      cardTitle: "Auth Service",
      message: "Blocked by incomplete prerequisite NEX-101",
      severity: "warning",
      prerequisiteCode: "NEX-101",
      prerequisiteTitle: "Database Migration",
    },
    {
      id: "conflict-1",
      type: "CONFLICT",
      cardId: "card-3",
      cardCode: "NEX-103",
      cardTitle: "Frontend Integration",
      message: "Prerequisite NEX-102 due date is after NEX-103 schedule",
      severity: "warning",
      prerequisiteCode: "NEX-102",
      prerequisiteTitle: "Auth Service",
    },
  ];

  it("renders warnings list and category badges", () => {
    render(<PlanningScheduleWarnings warnings={mockWarnings} onCardClick={vi.fn()} />);

    expect(screen.getByText("NEX-101")).toBeDefined();
    expect(screen.getByText("Database Migration")).toBeDefined();
    expect(screen.getByText("NEX-102")).toBeDefined();
    expect(screen.getByText("NEX-103")).toBeDefined();

    expect(screen.getAllByText(/Overdue/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Blocked/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Conflict/i).length).toBeGreaterThanOrEqual(1);
  });

  it("filters warnings by category tab", () => {
    render(<PlanningScheduleWarnings warnings={mockWarnings} onCardClick={vi.fn()} />);

    // Click Blockers tab
    const blockersTab = screen.getByRole("button", { name: /Blockers/i });
    fireEvent.click(blockersTab);

    expect(screen.getByText("NEX-102")).toBeDefined();
    expect(screen.queryByText("NEX-101")).toBeNull();
    expect(screen.queryByText("NEX-103")).toBeNull();
  });

  it("invokes onCardClick when a warning item is clicked", () => {
    const handleCardClick = vi.fn();
    render(<PlanningScheduleWarnings warnings={mockWarnings} onCardClick={handleCardClick} />);

    const itemBtn = screen.getByText("NEX-101").closest("button");
    expect(itemBtn).toBeDefined();

    fireEvent.click(itemBtn!);
    expect(handleCardClick).toHaveBeenCalledWith("card-1");
  });

  it("renders positive empty state when warnings list is empty", () => {
    render(<PlanningScheduleWarnings warnings={[]} onCardClick={vi.fn()} />);

    expect(
      screen.getByText(/All scheduled cards are on track/i)
    ).toBeDefined();
  });
});
