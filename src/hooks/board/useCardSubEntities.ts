import * as React from "react";
import type { BoardDetail } from "@/types";
import {
  useCardTasks,
  useCardAssignments,
  useCardLabels,
  useCardComments,
  useCardAttachments,
  useCardDependencies,
} from "./sub-entities";

export interface UseCardSubEntitiesOptions {
  selectedCardId: string | null;
  board: BoardDetail | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
}

/**
 * Composite aggregator hook for card sub-entities.
 * Combines cohesive sub-hooks for tasks, assignments, labels, comments,
 * attachments, and dependencies into a single backward-compatible interface.
 */
export function useCardSubEntities({
  selectedCardId,
  board,
  setBoard,
}: UseCardSubEntitiesOptions) {
  const tasks = useCardTasks({ selectedCardId, setBoard });
  const assignments = useCardAssignments({ selectedCardId, setBoard });
  const labels = useCardLabels({ selectedCardId, setBoard });
  const comments = useCardComments({ selectedCardId, setBoard });
  const attachments = useCardAttachments({ selectedCardId, setBoard });
  const dependencies = useCardDependencies({ selectedCardId, board, setBoard });

  return {
    ...tasks,
    ...assignments,
    ...labels,
    ...comments,
    ...attachments,
    ...dependencies,
  };
}
