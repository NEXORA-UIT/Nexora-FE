import * as React from "react";
import { boardApi } from "@/apis/board.api";
import { cardApi } from "@/apis/card.api";
import { workspaceApi } from "@/apis/workspace.api";
import { useAuthStore } from "@/stores/auth.store";
import type { MyTaskItem } from "@/types";
import { mapWithConcurrency } from "@/utils";
import { getUserFacingApiError } from "@/utils/api-error-message";

const MAX_PARALLEL_REQUESTS = 5;
const PAGE_SIZE = 50;

export function useMyTasks() {
  const userId = useAuthStore((state) => state.user?.id);
  const [tasks, setTasks] = React.useState<MyTaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [partialFailureCount, setPartialFailureCount] = React.useState(0);

  const reload = React.useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setError("Sign in again to view your assigned tasks.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPartialFailureCount(0);
    try {
      const firstPage = await workspaceApi.listWorkspaces({ page: 1, limit: PAGE_SIZE });
      const pages = firstPage.meta?.totalPages ?? 1;
      const additionalPages =
        pages > 1
          ? await mapWithConcurrency(
              Array.from({ length: pages - 1 }, (_, index) => index + 2),
              MAX_PARALLEL_REQUESTS,
              (page) => workspaceApi.listWorkspaces({ page, limit: PAGE_SIZE })
            )
          : [];
      const workspaces = [firstPage, ...additionalPages].flatMap((page) => page.items);

      let failures = 0;
      const boardGroups = await mapWithConcurrency(
        workspaces,
        MAX_PARALLEL_REQUESTS,
        async (workspace) => {
          try {
            return {
              workspace,
              boards: await boardApi.getBoards(workspace.id),
            };
          } catch {
            failures += 1;
            return { workspace, boards: [] };
          }
        }
      );
      const boards = boardGroups.flatMap(({ workspace, boards: workspaceBoards }) =>
        workspaceBoards.map((board) => ({ board, workspaceName: workspace.name }))
      );

      const taskGroups = await mapWithConcurrency(
        boards,
        MAX_PARALLEL_REQUESTS,
        async ({ board, workspaceName }) => {
          try {
            const cards = await cardApi.getBoardCards(board.id);
            return cards
              .filter((card) => card.status === "ACTIVE" && card.assigneeIds?.includes(userId))
              .map((card): MyTaskItem => ({
                id: card.id,
                code: card.code,
                title: card.title,
                boardId: board.id,
                boardName: board.name || board.title,
                workspaceName,
                priority: card.priority,
                statusGroup: card.statusGroup ?? "TODO",
                dueDate: card.dueDate ?? null,
                labels: card.labels,
              }));
          } catch {
            failures += 1;
            return [];
          }
        }
      );

      setTasks(
        taskGroups.flat().sort((left, right) => {
          if (!left.dueDate) return right.dueDate ? 1 : 0;
          if (!right.dueDate) return -1;
          return left.dueDate.localeCompare(right.dueDate);
        })
      );
      setPartialFailureCount(failures);
    } catch (cause) {
      setError(getUserFacingApiError(cause, "Could not load your assigned tasks."));
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return { tasks, isLoading, error, partialFailureCount, reload };
}
