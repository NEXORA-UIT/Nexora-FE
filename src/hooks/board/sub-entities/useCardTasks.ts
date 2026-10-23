import * as React from "react";
import { toast } from "sonner";
import { cardApi } from "@/apis";
import { getUserFacingApiError } from "@/utils/api-error-message";
import { applyAuthoritativeCardUpdate, updateCardInBoard } from "../utils/cardReconciler";
import type { BoardDetail, ChecklistItem } from "@/types";

export interface UseCardTasksOptions {
  selectedCardId: string | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
}

export function useCardTasks({
  selectedCardId,
  setBoard,
}: UseCardTasksOptions) {
  const [isTasksLoading, setIsTasksLoading] = React.useState<boolean>(false);
  const [tasksError, setTasksError] = React.useState<string | null>(null);

  // Active card ID whose tasks are currently loaded/loading (prevents race conditions)
  const activeTasksCardIdRef = React.useRef<string | null>(null);

  const loadTasksForCard = React.useCallback(async (cardId: string) => {
    activeTasksCardIdRef.current = cardId;
    setIsTasksLoading(true);
    setTasksError(null);
    try {
      const [tasksRes, cardRes] = await Promise.allSettled([
        cardApi.getCardTasks(cardId),
        cardApi.getCardById(cardId),
      ]);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeTasksCardIdRef.current !== cardId) return;

      if (tasksRes.status === "rejected") {
        throw tasksRes.reason;
      }

      const tasks = tasksRes.value;
      const refreshedCard = cardRes.status === "fulfilled" ? cardRes.value : null;

      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, cardId, (c) => {
          const refreshedTime = refreshedCard ? new Date(refreshedCard.updatedAt).getTime() : NaN;
          const currentTime = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
          const isNewerOrEqual = !isNaN(refreshedTime) && (isNaN(currentTime) || refreshedTime >= currentTime);
          const nextUpdatedAt = isNewerOrEqual && refreshedCard ? refreshedCard.updatedAt : c.updatedAt;

          return {
            ...c,
            checklist: tasks,
            tasksCount: tasks.length,
            completedTasksCount: tasks.filter((t) => t.isCompleted).length,
            updatedAt: nextUpdatedAt,
          };
        });
      });

      if (cardRes.status === "rejected") {
        setTasksError("Unable to sync latest card timestamp with server.");
      } else {
        setTasksError(null);
      }
    } catch (err) {
      if (activeTasksCardIdRef.current !== cardId) return;
      setTasksError(getUserFacingApiError(err, "Failed to load checklist tasks"));
    } finally {
      if (activeTasksCardIdRef.current === cardId) {
        setIsTasksLoading(false);
      }
    }
  }, [setBoard]);

  React.useEffect(() => {
    if (!selectedCardId) {
      activeTasksCardIdRef.current = null;
      setIsTasksLoading(false);
      setTasksError(null);
      return;
    }

    void loadTasksForCard(selectedCardId);

    return () => {
      if (activeTasksCardIdRef.current === selectedCardId) {
        activeTasksCardIdRef.current = null;
      }
    };
  }, [selectedCardId, loadTasksForCard]);

  const handleRetryTasks = React.useCallback(() => {
    if (selectedCardId) {
      void loadTasksForCard(selectedCardId);
    }
  }, [selectedCardId, loadTasksForCard]);

  /**
   * Safely reconciles parent Card's updatedAt and taskProgress from authoritative backend.
   * If Card fetch fails, preserves successful task mutation without fabricating updatedAt.
   */
  const reconcileParentCard = React.useCallback(async (
    cardId: string,
    updateChecklist: (prevChecklist: ChecklistItem[]) => ChecklistItem[]
  ) => {
    // 1. Immediately apply the task mutation to local state so the UI is responsive and consistent
    setBoard((prev) => {
      if (!prev) return prev;
      return updateCardInBoard(prev, cardId, (c) => {
        const nextChecklist = updateChecklist(c.checklist || []);
        return {
          ...c,
          checklist: nextChecklist,
          tasksCount: nextChecklist.length,
          completedTasksCount: nextChecklist.filter((t) => t.isCompleted).length,
        };
      });
    });

    // 2. Authoritatively fetch refreshed parent Card (updatedAt & taskProgress)
    try {
      const refreshedCard = await cardApi.getCardById(cardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, cardId, (c) =>
          applyAuthoritativeCardUpdate(c, refreshedCard)
        );
      });
      setTasksError(null);
    } catch {
      // Separation of mutation success from reconciliation failure:
      // Mutation succeeded, but card refresh had a transient error.
      // Do not roll back mutation or fabricate updatedAt.
      setTasksError("Unable to sync latest card timestamp. Click Retry to sync.");
      toast.warning("Task updated, but unable to sync latest card timestamp. Click Retry in checklist to sync.");
    }
  }, [setBoard]);

  // Action: Add Checklist Item
  const handleAddChecklistItem = React.useCallback(async (cardId: string, title: string) => {
    try {
      const newItem = await cardApi.addChecklistItem(cardId, title);
      await reconcileParentCard(cardId, (prev) =>
        prev.some((t) => t.id === newItem.id) ? prev : [...prev, newItem]
      );
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : "";
      if (rawMsg.includes("TASK_LIMIT_REACHED") || (err as { code?: string })?.code === "TASK_LIMIT_REACHED") {
        toast.error("Checklist limit reached: A card can have at most 50 tasks.");
      } else {
        toast.error(getUserFacingApiError(err, "Failed to add checklist item."));
      }
      throw err;
    }
  }, [reconcileParentCard]);

  // Action: Toggle / Update Checklist Item
  const handleToggleChecklistItem = React.useCallback(async (cardId: string, taskId: string, isCompleted: boolean) => {
    try {
      const updated = await cardApi.updateChecklistItem(taskId, { isCompleted });
      await reconcileParentCard(cardId, (prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
    } catch (err) {
      toast.error(getUserFacingApiError(err, "Failed to update checklist item."));
      throw err;
    }
  }, [reconcileParentCard]);

  // Action: Delete Checklist Item
  const handleDeleteChecklistItem = React.useCallback(async (cardId: string, taskId: string) => {
    try {
      await cardApi.deleteChecklistItem(taskId);
      await reconcileParentCard(cardId, (prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      toast.error(getUserFacingApiError(err, "Failed to delete checklist item."));
      throw err;
    }
  }, [reconcileParentCard]);

  return {
    isTasksLoading,
    tasksError,
    handleRetryTasks,
    handleAddChecklistItem,
    handleToggleChecklistItem,
    handleDeleteChecklistItem,
  };
}
