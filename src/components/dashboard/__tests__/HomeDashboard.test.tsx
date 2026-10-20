import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { useMyTasks, useWorkspaceBoards } from "@/hooks";
import { useAuthStore } from "@/stores/auth.store";
import type { Board, MyTaskItem, Workspace } from "@/types";

vi.mock("@/hooks", () => ({ useMyTasks: vi.fn(), useWorkspaceBoards: vi.fn() }));

const workspace: Workspace = {
  id: "workspace-1", name: "Core Platform", slug: "core-platform", status: "active",
  description: "Core engineering", teamType: "Software Engineering", initials: "CP",
};
const board: Board = {
  id: "board-live-id", workspaceId: workspace.id, name: "Website Redesign", title: "Website Redesign", status: "active",
  updatedAt: "2026-10-19T10:00:00.000Z", createdAt: "2026-10-01T10:00:00.000Z",
};
const task: MyTaskItem = {
  id: "card-live-id", code: "WEB-7", title: "Review accessible navigation", boardId: board.id,
  boardName: board.title, workspaceName: workspace.name, priority: "HIGH", statusGroup: "IN_PROGRESS",
  dueDate: "2026-10-21T12:00:00.000Z", labels: [],
};

const myTasksState = { tasks: [task], isLoading: false, error: null, partialFailureCount: 0, reload: vi.fn() };
const boardsState = {
  workspace, boards: [board], isLoading: false, error: null, reload: vi.fn(), searchQuery: "",
  setSearchQuery: vi.fn(), filterTab: "all", setFilterTab: vi.fn(), sortBy: "recently_updated",
  setSortBy: vi.fn(), filteredActiveBoards: [board], filteredArchivedBoards: [], counts: { all: 1, active: 1, archived: 0 },
  isCreateOpen: false, setIsCreateOpen: vi.fn(), isSubmitting: false, deleteTargetBoard: null,
  setDeleteTargetBoard: vi.fn(), isDeleting: false, handleCreateBoard: vi.fn(), handleUpdateBoard: vi.fn(),
  handleArchiveBoard: vi.fn(), handleRestoreBoard: vi.fn(), handleDeleteBoard: vi.fn(), handleConfirmDelete: vi.fn(),
};

function renderDashboard() {
  return render(<MemoryRouter><HomePage /></MemoryRouter>);
}

describe("Home dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: { id: "user-1", fullName: "Demo User", email: "demo@example.com", avatarUrl: null, status: "ACTIVE", createdAt: "", updatedAt: "" } });
    vi.mocked(useMyTasks).mockReturnValue(myTasksState);
    vi.mocked(useWorkspaceBoards).mockReturnValue(boardsState as unknown as ReturnType<typeof useWorkspaceBoards>);
  });

  it("shows live workspace, board, and task data with real board routes", () => {
    renderDashboard();

    expect(screen.getByRole("heading", { name: /demo user/i }).className).toMatch(/text-white/);
    expect(screen.getByText("Core Platform")).toBeTruthy();
    expect(screen.getByText("1 active board")).toBeTruthy();
    expect(screen.getAllByText("Review accessible navigation")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /review accessible navigation/i }).every((link) => link.getAttribute("href") === "/boards/board-live-id")).toBe(true);
    expect(screen.getAllByRole("link", { name: /website redesign/i }).every((link) => link.getAttribute("href") === "/boards/board-live-id")).toBe(true);
    expect(screen.queryByText(/API schema validation|Clara Chen|Project_Brief/i)).toBeNull();
  });

  it("shows a clear loading state while assigned tasks load", () => {
    vi.mocked(useMyTasks).mockReturnValue({ ...myTasksState, isLoading: true, tasks: [] });
    renderDashboard();
    expect(screen.getAllByRole("status").some((status) => /loading your tasks/i.test(status.textContent ?? ""))).toBe(true);
    expect(screen.getByText(/assigned task count/i).textContent).toMatch(/loading/i);
    expect(screen.getByText(/coming up/i).closest("section")?.textContent).toMatch(/loading due dates/i);
    expect(screen.queryByText(/no upcoming due dates/i)).toBeNull();
  });

  it("offers retry for task errors", () => {
    vi.mocked(useMyTasks).mockReturnValue({ ...myTasksState, error: "Could not load tasks.", tasks: [] });
    renderDashboard();

    expect(screen.getByRole("alert").textContent).toContain("Could not load tasks.");
    expect(screen.getByText(/assigned task count/i).textContent).toMatch(/unavailable/i);
    expect(screen.getByText(/coming up/i).closest("section")?.textContent).toMatch(/could not load due dates/i);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(myTasksState.reload).toHaveBeenCalled();
  });

  it("provides a starting action when no workspace exists", () => {
    vi.mocked(useWorkspaceBoards).mockReturnValue({ ...boardsState, workspace: null, boards: [] } as unknown as ReturnType<typeof useWorkspaceBoards>);
    renderDashboard();

    expect(screen.getByText(/no workspace selected/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /open boards/i }).getAttribute("href")).toBe("/boards");
  });
});
