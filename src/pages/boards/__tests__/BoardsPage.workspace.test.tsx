import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BoardsPage } from "../BoardsPage";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { workspaceApi } from "@/apis/workspace.api";
import { boardApi } from "@/apis/board.api";
import { ApiError } from "@/apis/client";
import { useWorkspaceMembership } from "@/hooks";
import type { Workspace, Board } from "@/types";

vi.mock("@/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks")>();
  return { ...actual, useWorkspaceMembership: vi.fn() };
});

describe("BoardsPage Workspace Integration Suite", () => {
  const fetchWorkspaces = useWorkspaceStore.getState().fetchWorkspaces;
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useWorkspaceStore.getState().resetWorkspaceState();
    useWorkspaceStore.setState({ fetchWorkspaces });
    vi.mocked(useWorkspaceMembership).mockReturnValue({
      members: [],
      invitations: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      invite: vi.fn(),
      cancelInvitation: vi.fn(),
      resendInvitation: vi.fn(),
      removeMember: vi.fn(),
      transferOwner: vi.fn(),
    });
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
      expect(screen.getByText(/You do not have any workspaces yet/i)).toBeDefined();
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
      expect(screen.getAllByRole("heading", { name: "Engineering Core" })).toHaveLength(2);
      expect(screen.getByText("Alpha Platform")).toBeDefined();
    });
    expect(screen.getByRole("heading", { name: "Recent boards" })).toBeDefined();
  });

  it("shows a Board access error instead of presenting an empty Workspace as valid", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockActiveWorkspace],
      activeWorkspaceId: mockActiveWorkspace.id,
      isInitialized: true,
      fetchWorkspaces: vi.fn().mockResolvedValue(undefined),
    });
    vi.spyOn(boardApi, "getBoards").mockRejectedValueOnce(
      new ApiError("Board access revoked", "WORKSPACE_FORBIDDEN", 403)
    );

    render(
      <MemoryRouter>
        <BoardsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Board access revoked")).toBeTruthy();
    expect(screen.queryByText("No boards in this workspace yet")).toBeNull();
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
      expect(screen.getAllByRole("heading", { name: "Legacy System" })).toHaveLength(2);
      expect(
        screen.getByText(
          /This workspace is archived\. Boards and workspace configurations are read-only\./i
        )
      ).toBeDefined();

      const createButtons = screen.getAllByRole("button", { name: /Create Board/i });
      expect(createButtons.some((button) => (button as HTMLButtonElement).disabled)).toBe(true);
    });
  });

  it("renders the data-backed overview and workspace settings tabs", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockActiveWorkspace],
      activeWorkspaceId: mockActiveWorkspace.id,
      isInitialized: true,
      isLoading: false,
    });
    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce(mockBoards);

    render(
      <MemoryRouter>
        <BoardsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    expect(await screen.findByRole("heading", { name: "Recent boards" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Alpha Platform/i }).getAttribute("href")).toBe(
      "/boards/board-1"
    );

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(await screen.findByRole("heading", { name: "Workspace settings" })).toBeTruthy();
    expect(screen.queryByText(/currently under development/i)).toBeNull();
  });

  it("keeps archived workspace settings read-only", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockArchivedWorkspace],
      activeWorkspaceId: mockArchivedWorkspace.id,
      isInitialized: true,
      isLoading: false,
    });
    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <BoardsPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    const saveButton = await screen.findByRole("button", { name: /save changes/i });
    expect(saveButton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("textbox", { name: /workspace name/i }).hasAttribute("disabled")).toBe(
      true
    );
  });
});
