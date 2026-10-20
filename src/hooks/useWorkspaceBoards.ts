import * as React from "react";
import { toast } from "sonner";
import { boardApi } from "@/apis/board.api";
import { ApiError } from "@/apis/client";
import { useWorkspaceStore } from "@/stores/workspace.store";
import type {
  Board,
  BoardFilterTab,
  BoardSortOption,
  CreateBoardInput,
  UpdateBoardRequest,
} from "@/types";
import { getUserFacingApiError } from "@/utils/api-error-message";

export function useWorkspaceBoards(customWorkspaceId?: string) {
  const storeWorkspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  const resolvedWorkspaceId = customWorkspaceId || activeWorkspaceId || "";

  const workspace = React.useMemo(() => {
    if (!resolvedWorkspaceId) return null;
    return storeWorkspaces.find((w) => w.id === resolvedWorkspaceId) || null;
  }, [storeWorkspaces, resolvedWorkspaceId]);

  const [boards, setBoards] = React.useState<Board[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(Boolean(resolvedWorkspaceId));
  const [error, setError] = React.useState<string | null>(null);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [filterTab, setFilterTab] = React.useState<BoardFilterTab>("all");
  const [sortBy, setSortBy] = React.useState<BoardSortOption>("recently_updated");

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [deleteTargetBoard, setDeleteTargetBoard] = React.useState<Board | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  // Load Boards Data for the Resolved Workspace
  const loadData = React.useCallback(async () => {
    if (!resolvedWorkspaceId) {
      setBoards([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const boardsData = await boardApi.getBoards(resolvedWorkspaceId, {
        includeArchived: true,
      });
      setBoards(boardsData);
    } catch (err) {
      setError(getUserFacingApiError(err, "Failed to load workspace Boards."));
    } finally {
      setIsLoading(false);
    }
  }, [resolvedWorkspaceId]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  // Derived filtered & sorted datasets
  const { filteredActiveBoards, filteredArchivedBoards, counts } =
    React.useMemo(() => {
      const query = searchQuery.trim().toLowerCase();

      // Search match helper
      const matchesSearch = (b: Board) => {
        if (!query) return true;
        return (
          b.title.toLowerCase().includes(query) ||
          (b.description?.toLowerCase().includes(query) ?? false)
        );
      };

      // Sort comparator helper
      const comparator = (a: Board, b: Board) => {
        switch (sortBy) {
          case "name_asc":
            return a.title.localeCompare(b.title);
          case "progress_desc":
            return (b.completedPercent ?? 0) - (a.completedPercent ?? 0);
          case "tasks_desc":
            return (b.openTasksCount ?? 0) - (a.openTasksCount ?? 0);
          case "recently_updated":
          default:
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        }
      };

      const allActive = boards.filter((b) => b.status === "active");
      const allArchived = boards.filter((b) => b.status === "archived");

      const activeFiltered = allActive.filter(matchesSearch).sort(comparator);
      const archivedFiltered = allArchived.filter(matchesSearch).sort(comparator);

      return {
        filteredActiveBoards: activeFiltered,
        filteredArchivedBoards: archivedFiltered,
        counts: {
          all: boards.filter(matchesSearch).length,
          active: activeFiltered.length,
          archived: archivedFiltered.length,
        },
      };
    }, [boards, searchQuery, sortBy]);

  // Action: Create Board
  const handleCreateBoard = async (input: CreateBoardInput) => {
    if (workspace?.status === "archived") {
      toast.error("Cannot create boards in an archived workspace.");
      return;
    }
    if (workspace?.isFrozen || workspace?.status === "paused") {
      toast.error("This workspace is frozen and cannot be modified.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newBoard = await boardApi.createBoard(input);
      setBoards((prev) => [newBoard, ...prev]);
      toast.success(`Board "${newBoard.title || newBoard.name}" created successfully.`);
      setIsCreateOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          if (err.code === "WORKSPACE_FROZEN") {
            toast.error("This workspace is frozen and cannot be modified.");
          } else if (err.code === "RESOURCE_ARCHIVED" || err.code === "WORKSPACE_ARCHIVED") {
            toast.error("Cannot create boards in an archived workspace.");
          } else {
            toast.error("Only workspace owners can create boards.");
          }
        } else if (err.status === 400) {
          toast.error(getUserFacingApiError(err, "Invalid Board input."));
        } else {
          toast.error(getUserFacingApiError(err, "Failed to create Board."));
        }
      } else {
        toast.error(getUserFacingApiError(err, "Failed to create Board."));
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Update Board
  const handleUpdateBoard = async (boardId: string, data: UpdateBoardRequest) => {
    if (workspace?.status === "archived") {
      toast.error("Cannot modify boards in an archived workspace.");
      return;
    }
    if (workspace?.isFrozen || workspace?.status === "paused") {
      toast.error("This workspace is frozen and cannot be modified.");
      return;
    }

    try {
      const updated = await boardApi.updateBoard(boardId, data);
      setBoards((prev) => prev.map((b) => (b.id === boardId ? updated : b)));
      toast.success(`Board "${updated.title || updated.name}" updated successfully.`);
      return updated;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        if (err.code === "WORKSPACE_FROZEN") {
          toast.error("This workspace is frozen and cannot be modified.");
        } else if (err.code === "RESOURCE_ARCHIVED" || err.code === "WORKSPACE_ARCHIVED") {
          toast.error("Cannot modify boards in an archived workspace.");
        } else {
          toast.error("Only workspace owners or PMs can update this board.");
        }
      } else {
        toast.error(getUserFacingApiError(err, "Failed to update Board."));
      }
      throw err;
    }
  };

  // Action: Archive Board
  const handleArchiveBoard = async (boardId: string) => {
    if (workspace?.status === "archived") {
      toast.error("Cannot modify boards in an archived workspace.");
      return;
    }
    if (workspace?.isFrozen || workspace?.status === "paused") {
      toast.error("This workspace is frozen and cannot be modified.");
      return;
    }

    try {
      const target = boards.find((b) => b.id === boardId);
      await boardApi.archiveBoard(boardId);
      setBoards((prev) =>
        prev.map((b) =>
          b.id === boardId
            ? { ...b, status: "archived", updatedAt: new Date().toISOString() }
            : b
        )
      );
      toast.success(`Board "${target?.title || target?.name || "Board"}" archived.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        if (err.code === "WORKSPACE_FROZEN") {
          toast.error("This workspace is frozen and cannot be modified.");
        } else if (err.code === "RESOURCE_ARCHIVED" || err.code === "WORKSPACE_ARCHIVED") {
          toast.error("Cannot modify boards in an archived workspace.");
        } else {
          toast.error("Only workspace owners or PMs can archive this board.");
        }
      } else {
        toast.error(getUserFacingApiError(err, "Could not archive Board."));
      }
      console.error("Archive board failed:", err);
    }
  };

  // Action: Restore Board
  const handleRestoreBoard = async (boardId: string) => {
    if (workspace?.status === "archived") {
      toast.error("Cannot restore boards in an archived workspace.");
      return;
    }
    if (workspace?.isFrozen || workspace?.status === "paused") {
      toast.error("This workspace is frozen and cannot be modified.");
      return;
    }

    try {
      const target = boards.find((b) => b.id === boardId);
      await boardApi.restoreBoard(boardId);
      setBoards((prev) =>
        prev.map((b) =>
          b.id === boardId
            ? { ...b, status: "active", updatedAt: new Date().toISOString() }
            : b
        )
      );
      toast.success(`Board "${target?.title || target?.name || "Board"}" restored to Active.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        if (err.code === "WORKSPACE_FROZEN") {
          toast.error("This workspace is frozen and cannot be modified.");
        } else if (err.code === "RESOURCE_ARCHIVED" || err.code === "WORKSPACE_ARCHIVED") {
          toast.error("Cannot restore boards in an archived workspace.");
        } else {
          toast.error("Only workspace owners or PMs can restore this board.");
        }
      } else {
        toast.error(getUserFacingApiError(err, "Could not restore Board."));
      }
      console.error("Restore board failed:", err);
    }
  };

  // Action: Open Delete Confirmation Modal
  const handleDeleteBoard = (boardId: string) => {
    const target = boards.find((b) => b.id === boardId);
    if (!target) return;
    if (target.status !== "archived") {
      toast.error("Only archived boards can be permanently deleted.");
      return;
    }
    if (workspace?.status === "archived") {
      toast.error("Cannot delete boards in an archived workspace.");
      return;
    }
    if (workspace?.isFrozen || workspace?.status === "paused") {
      toast.error("This workspace is frozen and cannot be modified.");
      return;
    }

    setDeleteTargetBoard(target);
  };

  // Action: Confirm Permanent Delete
  const handleConfirmDelete = async (boardId: string, confirmationName: string) => {
    const target = boards.find((b) => b.id === boardId);
    if (target && target.status !== "archived") {
      toast.error("Only archived boards can be permanently deleted.");
      return;
    }

    setIsDeleting(true);
    try {
      await boardApi.deleteBoard(boardId, confirmationName);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      toast.success("Board deleted permanently.");
      setDeleteTargetBoard(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          if (err.code === "WORKSPACE_FROZEN") {
            toast.error("This workspace is frozen and cannot be modified.");
          } else if (err.code === "RESOURCE_ARCHIVED" || err.code === "WORKSPACE_ARCHIVED") {
            toast.error("Cannot delete boards in an archived workspace.");
          } else {
            toast.error("Only the workspace owner can delete boards.");
          }
        } else if (err.status === 409) {
          toast.error("Only archived boards can be permanently deleted.");
        } else if (err.status === 400) {
          toast.error("Confirmation name must match the board name exactly.");
        } else {
          toast.error(getUserFacingApiError(err, "Could not delete Board."));
        }
      } else {
        toast.error(getUserFacingApiError(err, "Could not delete Board."));
      }
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    workspace,
    boards,
    isLoading,
    error,
    reload: loadData,

    // Search, Filter, Sort
    searchQuery,
    setSearchQuery,
    filterTab,
    setFilterTab,
    sortBy,
    setSortBy,

    // Data lists
    filteredActiveBoards,
    filteredArchivedBoards,
    counts,

    // Modals
    isCreateOpen,
    setIsCreateOpen,
    isSubmitting,
    deleteTargetBoard,
    setDeleteTargetBoard,
    isDeleting,

    // Handlers
    handleCreateBoard,
    handleUpdateBoard,
    handleArchiveBoard,
    handleRestoreBoard,
    handleDeleteBoard,
    handleConfirmDelete,
  };
}
