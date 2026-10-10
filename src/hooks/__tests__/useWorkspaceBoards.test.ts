import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWorkspaceBoards } from "../useWorkspaceBoards";
import { boardApi } from "@/apis/board.api";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { toast } from "sonner";
import type { Board, Workspace } from "@/types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useWorkspaceBoards Mutation & Guard Orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.getState().resetWorkspaceState();
  });

  const mockActiveWorkspace: Workspace = {
    id: "ws-1",
    name: "Engineering Core",
    slug: "engineering-core",
    status: "active",
    description: "Core platform engineering",
    teamType: "Software Engineering",
    initials: "EC",
  };

  const mockArchivedWorkspace: Workspace = {
    id: "ws-archived",
    name: "Legacy System",
    slug: "legacy-system",
    status: "archived",
    description: "Archived workspace",
    teamType: "General",
    initials: "LS",
  };

  const mockFrozenWorkspace: Workspace = {
    id: "ws-frozen",
    name: "Frozen System",
    slug: "frozen-system",
    status: "paused",
    isFrozen: true,
    description: "Frozen workspace",
    teamType: "General",
    initials: "FS",
  };

  const mockActiveBoard: Board = {
    id: "b-active-1",
    workspaceId: "ws-1",
    name: "Platform Sprint",
    title: "Platform Sprint",
    description: "Active sprint board",
    status: "active",
    members: [],
    updatedAt: "2026-10-09T00:00:00.000Z",
    createdAt: "2026-10-09T00:00:00.000Z",
  };

  const mockArchivedBoard: Board = {
    id: "b-archived-1",
    workspaceId: "ws-1",
    name: "Old Migration",
    title: "Old Migration",
    description: "Archived migration board",
    status: "archived",
    members: [],
    updatedAt: "2026-10-01T00:00:00.000Z",
    createdAt: "2026-10-01T00:00:00.000Z",
  };

  it("creates a board and updates local state on success", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockActiveWorkspace],
      activeWorkspaceId: "ws-1",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([mockActiveBoard]);

    const createdBoard: Board = {
      id: "b-created-2",
      workspaceId: "ws-1",
      name: "Feature Team A",
      title: "Feature Team A",
      description: "New board",
      status: "active",
      members: [],
      updatedAt: "2026-10-09T10:00:00.000Z",
      createdAt: "2026-10-09T10:00:00.000Z",
    };
    vi.spyOn(boardApi, "createBoard").mockResolvedValueOnce(createdBoard);

    const { result } = renderHook(() => useWorkspaceBoards("ws-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleCreateBoard({
        workspaceId: "ws-1",
        title: "Feature Team A",
        description: "New board",
      });
    });

    expect(boardApi.createBoard).toHaveBeenCalledTimes(1);
    expect(result.current.boards).toHaveLength(2);
    expect(result.current.boards[0].id).toBe("b-created-2");
    expect(result.current.isCreateOpen).toBe(false);
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Feature Team A")
    );
  });

  it("blocks board creation when workspace is archived", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockArchivedWorkspace],
      activeWorkspaceId: "ws-archived",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([]);
    const createSpy = vi.spyOn(boardApi, "createBoard");

    const { result } = renderHook(() => useWorkspaceBoards("ws-archived"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleCreateBoard({
        workspaceId: "ws-archived",
        title: "Forbidden Board",
      });
    });

    expect(createSpy).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "Cannot create boards in an archived workspace."
    );
  });

  it("blocks board creation when workspace is frozen", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockFrozenWorkspace],
      activeWorkspaceId: "ws-frozen",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([]);
    const createSpy = vi.spyOn(boardApi, "createBoard");

    const { result } = renderHook(() => useWorkspaceBoards("ws-frozen"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleCreateBoard({
        workspaceId: "ws-frozen",
        title: "Forbidden Board",
      });
    });

    expect(createSpy).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "This workspace is frozen and cannot be modified."
    );
  });

  it("archives an active board and updates counts", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockActiveWorkspace],
      activeWorkspaceId: "ws-1",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([mockActiveBoard]);
    vi.spyOn(boardApi, "archiveBoard").mockResolvedValueOnce();

    const { result } = renderHook(() => useWorkspaceBoards("ws-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.counts.active).toBe(1);
    expect(result.current.counts.archived).toBe(0);

    await act(async () => {
      await result.current.handleArchiveBoard("b-active-1");
    });

    expect(boardApi.archiveBoard).toHaveBeenCalledWith("b-active-1");
    expect(result.current.counts.active).toBe(0);
    expect(result.current.counts.archived).toBe(1);
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("archived")
    );
  });

  it("restores an archived board and updates counts", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockActiveWorkspace],
      activeWorkspaceId: "ws-1",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([mockArchivedBoard]);
    vi.spyOn(boardApi, "restoreBoard").mockResolvedValueOnce();

    const { result } = renderHook(() => useWorkspaceBoards("ws-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.counts.active).toBe(0);
    expect(result.current.counts.archived).toBe(1);

    await act(async () => {
      await result.current.handleRestoreBoard("b-archived-1");
    });

    expect(boardApi.restoreBoard).toHaveBeenCalledWith("b-archived-1");
    expect(result.current.counts.active).toBe(1);
    expect(result.current.counts.archived).toBe(0);
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("restored to Active")
    );
  });

  it("prevents permanent deletion of active boards", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockActiveWorkspace],
      activeWorkspaceId: "ws-1",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([mockActiveBoard]);
    const deleteSpy = vi.spyOn(boardApi, "deleteBoard");

    const { result } = renderHook(() => useWorkspaceBoards("ws-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Attempt to open delete modal on active board
    act(() => {
      result.current.handleDeleteBoard("b-active-1");
    });

    expect(result.current.deleteTargetBoard).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      "Only archived boards can be permanently deleted."
    );

    // Attempt to execute permanent delete on active board
    await act(async () => {
      await result.current.handleConfirmDelete(
        "b-active-1",
        "Platform Sprint"
      );
    });

    expect(deleteSpy).not.toHaveBeenCalled();
    expect(result.current.boards).toHaveLength(1);
  });

  it("executes permanent deletion for archived board with confirmation", async () => {
    useWorkspaceStore.setState({
      workspaces: [mockActiveWorkspace],
      activeWorkspaceId: "ws-1",
      isInitialized: true,
      isLoading: false,
    });

    vi.spyOn(boardApi, "getBoards").mockResolvedValueOnce([mockArchivedBoard]);
    vi.spyOn(boardApi, "deleteBoard").mockResolvedValueOnce();

    const { result } = renderHook(() => useWorkspaceBoards("ws-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Open delete modal for archived board
    act(() => {
      result.current.handleDeleteBoard("b-archived-1");
    });

    expect(result.current.deleteTargetBoard?.id).toBe("b-archived-1");

    // Commit deletion
    await act(async () => {
      await result.current.handleConfirmDelete(
        "b-archived-1",
        "Old Migration"
      );
    });

    expect(boardApi.deleteBoard).toHaveBeenCalledWith(
      "b-archived-1",
      "Old Migration"
    );
    expect(result.current.boards).toHaveLength(0);
    expect(result.current.deleteTargetBoard).toBeNull();
    expect(toast.success).toHaveBeenCalledWith(
      "Board deleted permanently."
    );
  });
});
