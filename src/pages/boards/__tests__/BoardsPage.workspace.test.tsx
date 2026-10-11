import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BoardsPage } from "../BoardsPage";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { workspaceApi } from "@/apis/workspace.api";
import { boardApi } from "@/apis/board.api";
import type { Workspace, Board } from "@/types";

describe("BoardsPage Workspace Integration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useWorkspaceStore.getState().resetWorkspaceState();
  });

  const mockActiveWorkspace: Workspace = {
    id: "ws-test-1",
    name: "Engineering Core",
    slug: "engineering-core",
    status: "active",
    description: "Core platform engineering",
    teamType: "Software Engineering",
    initials: "EC",
  };

  const mockArchivedWorkspace: Workspace = {
    id: "ws-test-archived",
    name: "Legacy System",
    slug: "legacy-system",
    status: "archived",
    description: "Legacy archived workspace",
    teamType: "General",
    initials: "LS",
  };

  const mockBoards: Board[] = [
    {
      id: "board-1",
      workspaceId: "ws-test-1",
      name: "Alpha Platform",
      title: "Alpha Platform",
      description: "Platform core",
      status: "active",
      openTasksCount: 5,
      completedPercent: 50,
      members: [],
      updatedAt: "2026-10-09T00:00:00.000Z",
      createdAt: "2026-10-09T00:00:00.000Z",
    },
  ];

  it("renders empty workspace state when user has 0 workspaces", async () => {
    vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
      items: [],
    });

    render(
      <MemoryRouter>
        <BoardsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No Workspace Selected")).toBeDefined();
      expect(
        screen.getByText(/You do not have any workspaces yet/i)
      ).toBeDefined();
      expect(screen.getByRole("button", { name: /Create Workspace/i })).toBeDefined();
    });
  });

  it("renders active workspace header and boards when active workspace is present", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockActiveWorkspace],
      activeWorkspaceId: "ws-test-1",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce(mockBoards);

    render(
      <MemoryRouter>
        <BoardsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Engineering Core" })).toBeDefined();
      expect(screen.getByText("Alpha Platform")).toBeDefined();
    });
  });

  it("renders archived banner and disables Create Board when active workspace is archived", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockArchivedWorkspace],
      activeWorkspaceId: "ws-test-archived",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <BoardsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Legacy System" })).toBeDefined();
      expect(
        screen.getByText(/This workspace is archived\. Boards and workspace configurations are read-only\./i)
      ).toBeDefined();

      const createBtn = screen.getByRole("button", { name: /Create Board/i });
      expect(createBtn).toHaveProperty("disabled", true);
    });
  });
});
