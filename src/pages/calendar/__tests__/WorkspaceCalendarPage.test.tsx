import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WorkspaceCalendarPage } from "../WorkspaceCalendarPage";

const { reload } = vi.hoisted(() => ({ reload: vi.fn() }));
vi.mock("@/hooks", () => ({
  useWorkspaceCalendar: () => ({
    workspace: { id: "workspace-1", name: "Nexora Team" },
    boards: [
      { id: "board-1", name: "Product roadmap", title: "Product roadmap" },
      { id: "board-2", name: "Engineering", title: "Engineering" },
    ],
    lists: [{
      id: "list-1", boardId: "board-1", name: "To Do", category: "TODO", position: 1,
      status: "ACTIVE", createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-01T00:00:00.000Z",
      cards: [
        { id: "card-dated", listId: "list-1", boardId: "board-1", code: "NX-1", title: "Scheduled card", priority: "HIGH", position: 1, status: "ACTIVE", dueDate: "2026-10-22T00:00:00.000Z", assignees: [], labels: [], tasksCount: 0, completedTasksCount: 0, updatedAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-10-01T00:00:00.000Z" },
        { id: "card-undated", listId: "list-1", boardId: "board-1", code: "NX-2", title: "Unscheduled card", priority: "MEDIUM", position: 2, status: "ACTIVE", assignees: [], labels: [], tasksCount: 0, completedTasksCount: 0, updatedAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-10-01T00:00:00.000Z" },
      ],
    }],
    isLoading: false,
    error: null,
    partialFailureCount: 0,
    reload,
  }),
}));

describe("WorkspaceCalendarPage", () => {
  it("uses English labels while preserving workspace and Board names", () => {
    render(
      <MemoryRouter>
        <WorkspaceCalendarPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Workspace calendar" })).toBeDefined();
    const summary = screen.getByRole("region", { name: "Calendar summary" });
    expect(within(summary).getByText("2")).toBeDefined();
    expect(within(summary).getAllByText("1")).toHaveLength(2);
    expect(screen.getByText("Planned cards in Nexora Team.")).toBeDefined();
    expect(screen.getByLabelText("Filter by Board")).toBeDefined();
    expect(screen.getByRole("option", { name: "Product roadmap" })).toBeDefined();
    fireEvent.change(screen.getByLabelText("Filter by Board"), {
      target: { value: "board-2" },
    });
    expect((screen.getByLabelText("Filter by Board") as HTMLSelectElement).value).toBe(
      "board-2"
    );
  });
});
