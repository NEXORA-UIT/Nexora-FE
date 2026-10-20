import * as React from "react";
import { boardApi } from "@/apis/board.api";
import { planningApi } from "@/apis/planning.api";
import { useWorkspaceStore } from "@/stores/workspace.store";
import type { Board, BoardCalendarEntryDto, KanbanList } from "@/types";
import { mapWithConcurrency } from "@/utils";
import { getUserFacingApiError } from "@/utils/api-error-message";

const MAX_PARALLEL_REQUESTS = 5;

function toCalendarLists(entries: BoardCalendarEntryDto[]): KanbanList[] {
  const lists = new Map<string, KanbanList>();
  for (const entry of entries) {
    let list = lists.get(entry.listId);
    if (!list) {
      list = {
        id: entry.listId,
        boardId: entry.boardId,
        name: entry.listName,
        category: entry.statusGroup,
        position: 0,
        status: "ACTIVE",
        cards: [],
        createdAt: "",
        updatedAt: "",
      };
      lists.set(entry.listId, list);
    }
    list.cards.push({
      id: entry.id,
      listId: entry.listId,
      boardId: entry.boardId,
      code: entry.cardKey,
      title: entry.title,
      startDate: entry.startDate,
      dueDate: entry.dueDate,
      priority: entry.priority,
      position: list.cards.length,
      status: "ACTIVE",
      statusGroup: entry.statusGroup,
      assignees: [],
      assigneeIds: entry.assigneeIds,
      labels: [],
      tasksCount: 0,
      completedTasksCount: 0,
      isBlocked: entry.dependencyWarnings.length > 0,
      createdAt: "",
      updatedAt: "",
    });
  }
  return [...lists.values()];
}

export function useWorkspaceCalendar() {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const workspace = workspaces.find((candidate) => candidate.id === activeWorkspaceId) ?? null;
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [lists, setLists] = React.useState<KanbanList[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [partialFailureCount, setPartialFailureCount] = React.useState(0);

  const reload = React.useCallback(async () => {
    if (!workspace) {
      setBoards([]);
      setLists([]);
      setError("Select a workspace to view its calendar.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPartialFailureCount(0);
    try {
      const workspaceBoards = await boardApi.getBoards(workspace.id);
      setBoards(workspaceBoards);
      let failures = 0;
      const eventGroups = await mapWithConcurrency(
        workspaceBoards,
        MAX_PARALLEL_REQUESTS,
        async (board) => {
          try {
            return await planningApi.getBoardCalendar(board.id);
          } catch {
            failures += 1;
            return [];
          }
        }
      );
      setLists(toCalendarLists(eventGroups.flat()));
      setPartialFailureCount(failures);
    } catch (cause) {
      setBoards([]);
      setLists([]);
      setError(getUserFacingApiError(cause, "Could not load the workspace calendar."));
    } finally {
      setIsLoading(false);
    }
  }, [workspace]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return { workspace, boards, lists, isLoading, error, partialFailureCount, reload };
}
