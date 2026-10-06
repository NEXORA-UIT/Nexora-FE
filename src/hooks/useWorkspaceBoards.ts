import * as React from "react";
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

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

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
      setIsCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Archive Board
  const handleArchiveBoard = async (boardId: string) => {
    try {
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
    } catch (err) {
      console.error("Archive board failed:", err);
    }
  };

  // Action: Restore Board
  const handleRestoreBoard = async (boardId: string) => {
    try {
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
    } catch (err) {
      console.error("Restore board failed:", err);
    }
  };

  // Action: Delete Board
  const handleDeleteBoard = async (boardId: string) => {
    try {
      await boardApi.deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch (err) {
      console.error("Delete board failed:", err);
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

    // Modal
    isCreateOpen,
    setIsCreateOpen,
    isSubmitting,

    // Handlers
    handleCreateBoard,
    handleArchiveBoard,
    handleRestoreBoard,
    handleDeleteBoard,
  };
}
