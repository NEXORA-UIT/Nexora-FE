import * as React from "react";
import { toast } from "sonner";
import { workspaceApi } from "@/apis/workspace.api";
import { boardApi } from "@/apis/board.api";
import type {
  Workspace,
  Board,
  BoardFilterTab,
  BoardSortOption,
  CreateBoardInput,
} from "@/types";

export function useWorkspaceBoards(workspaceId: string = "ws-core-platform") {
  const [workspace, setWorkspace] = React.useState<Workspace | null>(null);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
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

  // Load Initial Data
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [wsData, boardsData] = await Promise.all([
        workspaceApi.getWorkspace(workspaceId),
        boardApi.getBoards(workspaceId),
      ]);
      setWorkspace(wsData);
      setBoards(boardsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load workspace boards"
      );
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

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
          b.description.toLowerCase().includes(query)
        );
      };

      // Sort comparator helper
      const comparator = (a: Board, b: Board) => {
        switch (sortBy) {
          case "name_asc":
            return a.title.localeCompare(b.title);
          case "progress_desc":
            return b.completedPercent - a.completedPercent;
          case "tasks_desc":
            return b.openTasksCount - a.openTasksCount;
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
    setIsSubmitting(true);
    try {
      const newBoard = await boardApi.createBoard(input);
      setBoards((prev) => [newBoard, ...prev]);
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              activeBoardCount: prev.activeBoardCount + 1,
            }
          : prev
      );
      toast.success(`Board "${newBoard.title || newBoard.name}" created successfully.`);
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create board");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Archive Board
  const handleArchiveBoard = async (boardId: string) => {
    try {
      const target = boards.find((b) => b.id === boardId);
      const updated = await boardApi.archiveBoard(boardId);
      setBoards((prev) =>
        prev.map((b) => (b.id === boardId ? updated : b))
      );
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              activeBoardCount: Math.max(0, prev.activeBoardCount - 1),
            }
          : prev
      );
      toast.success(`Board "${target?.title || target?.name || "Board"}" archived.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Archive board failed");
      console.error("Archive board failed:", err);
    }
  };

  // Action: Restore Board
  const handleRestoreBoard = async (boardId: string) => {
    try {
      const target = boards.find((b) => b.id === boardId);
      const updated = await boardApi.restoreBoard(boardId);
      setBoards((prev) =>
        prev.map((b) => (b.id === boardId ? updated : b))
      );
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              activeBoardCount: prev.activeBoardCount + 1,
            }
          : prev
      );
      toast.success(`Board "${target?.title || target?.name || "Board"}" restored to Active.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore board failed");
      console.error("Restore board failed:", err);
    }
  };

  // Action: Open Delete Confirmation Modal
  const handleDeleteBoard = (boardId: string) => {
    const target = boards.find((b) => b.id === boardId);
    if (target) {
      setDeleteTargetBoard(target);
    }
  };

  // Action: Confirm Permanent Delete
  const handleConfirmDelete = async (boardId: string, confirmationName: string) => {
    setIsDeleting(true);
    try {
      await boardApi.deleteBoard(boardId, confirmationName);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              activeBoardCount: Math.max(0, prev.activeBoardCount - 1),
            }
          : prev
      );
      toast.success("Board deleted permanently.");
      setDeleteTargetBoard(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete board failed");
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
    handleArchiveBoard,
    handleRestoreBoard,
    handleDeleteBoard,
    handleConfirmDelete,
  };
}

