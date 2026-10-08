import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BoardPlanningView } from "../BoardPlanningView";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";

describe("BoardPlanningView Integration Component", () => {
  it("renders all sections (metrics, warnings, dependencies)", async () => {
    const handleCardClick = vi.fn();
    render(
      <BoardPlanningView
        boardId={MOCK_BOARD_DETAIL.id}
        lists={MOCK_BOARD_DETAIL.lists}
        onCardClick={handleCardClick}
      />
    );

    // Should render Dashboard section
    await waitFor(() => {
      expect(screen.getByText(/Completion Rate/i)).toBeDefined();
      expect(screen.getByText(/Total Cards/i)).toBeDefined();
    });

    // Should render Schedule Warnings section
    expect(screen.getAllByText(/Schedule & Blocker Warnings/i).length).toBeGreaterThanOrEqual(1);

    // Should render Dependency Relations section
    expect(screen.getAllByText(/Dependency Relations/i).length).toBeGreaterThanOrEqual(1);
  });
});

