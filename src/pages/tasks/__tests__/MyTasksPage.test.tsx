import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MyTasksPage } from "../MyTasksPage";

vi.mock("@/hooks", () => ({
  useMyTasks: () => ({
    isLoading: false,
    error: null,
    partialFailureCount: 0,
    reload: vi.fn(),
    tasks: [
      {
        id: "todo",
        code: "NX-1",
        title: "Todo task",
        boardId: "board",
        boardName: "Board",
        workspaceName: "Workspace",
        priority: "LOW",
        statusGroup: "TODO",
        dueDate: "2026-10-20T12:00:00.000Z",
        labels: [],
      },
      {
        id: "progress",
        code: "NX-2",
        title: "Active task",
        boardId: "board",
        boardName: "Board",
        workspaceName: "Workspace",
        priority: "HIGH",
        statusGroup: "IN_PROGRESS",
        dueDate: "2026-10-01T12:00:00.000Z",
        labels: [],
      },
      {
        id: "done",
        code: "NX-3",
        title: "Finished task",
        boardId: "board",
        boardName: "Board",
        workspaceName: "Workspace",
        priority: "MEDIUM",
        statusGroup: "DONE",
        dueDate: null,
        labels: [],
      },
    ],
  }),
}));

describe("MyTasksPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 20, 12));
  });

  afterEach(() => vi.useRealTimers());

  it("filters the task list using To Do, In Progress, and Done status tabs", () => {
    render(
      <MemoryRouter>
        <MyTasksPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Todo task")).toBeDefined();
    expect(screen.getByRole("heading", { name: "My tasks" })).toBeDefined();
    expect(screen.getByLabelText("Search tasks")).toBeDefined();
    expect(screen.queryByText("Active task")).toBeNull();
    expect(screen.queryByText("Finished task")).toBeNull();
    const summary = screen.getByRole("region", { name: "Task summary" });
    expect(within(summary).getByText("Open tasks")).toBeDefined();
    expect(within(summary).getByText("Due today")).toBeDefined();
    expect(within(summary).getByText("Overdue")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: /In Progress/ }));
    expect(screen.queryByText("Todo task")).toBeNull();
    expect(screen.getByText("Active task")).toBeDefined();
    expect(screen.queryByText("Finished task")).toBeNull();
  });

  it("filters tasks by due date and keeps summary counts tied to loaded tasks", () => {
    render(<MemoryRouter><MyTasksPage /></MemoryRouter>);

    const summary = screen.getByRole("region", { name: "Task summary" });
    expect(within(summary).getByText("2")).toBeDefined();
    expect(within(summary).getAllByText("1")).toHaveLength(2);
    fireEvent.click(screen.getByRole("tab", { name: /In Progress/ }));
    fireEvent.change(screen.getByLabelText("Filter by due date"), { target: { value: "OVERDUE" } });
    expect(screen.getByText("Active task")).toBeDefined();
    expect(screen.queryByText("Todo task")).toBeNull();
  });
});
