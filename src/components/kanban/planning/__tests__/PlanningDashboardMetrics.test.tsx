import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanningDashboardMetrics } from "../PlanningDashboardMetrics";
import type { BoardDashboard } from "@/types";

describe("PlanningDashboardMetrics Component", () => {
  const mockMetrics: BoardDashboard = {
    totalCards: 24,
    completedCards: 10,
    inProgressCards: 8,
    todoCards: 6,
    overdueCards: 2,
    completionRate: 41.67,
  };

  it("renders all 6 backend metrics across 4 KPI cards", () => {
    render(<PlanningDashboardMetrics metrics={mockMetrics} />);

    // 1. Completion Rate & completed cards
    expect(screen.getByText("41.67%")).toBeDefined();
    expect(screen.getByText(/10 of 24 cards completed/i)).toBeDefined();

    // 2. Total Cards
    expect(screen.getByText("24")).toBeDefined();
    expect(screen.getByText(/Total Cards/i)).toBeDefined();

    // 3. In Progress and To Do
    expect(screen.getByText("8")).toBeDefined();
    expect(screen.getByText(/In Progress/i)).toBeDefined();
    expect(screen.getByText("6")).toBeDefined();
    expect(screen.getByText(/To Do/i)).toBeDefined();

    // 4. Overdue Cards
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText(/Overdue/i)).toBeDefined();
  });

  it("handles empty board with 0 cards gracefully without NaN", () => {
    const emptyMetrics: BoardDashboard = {
      totalCards: 0,
      completedCards: 0,
      inProgressCards: 0,
      todoCards: 0,
      overdueCards: 0,
      completionRate: 0,
    };

    render(<PlanningDashboardMetrics metrics={emptyMetrics} />);

    expect(screen.getByText("0%")).toBeDefined();
    expect(screen.getByText(/0 of 0 cards completed/i)).toBeDefined();
    expect(screen.queryByText(/NaN/i)).toBeNull();
  });

  it("renders loading skeletons when isLoading is true", () => {
    render(<PlanningDashboardMetrics metrics={mockMetrics} isLoading={true} />);
    const skeletons = screen.getAllByTestId("metric-skeleton");
    expect(skeletons.length).toBe(4);
  });
});
