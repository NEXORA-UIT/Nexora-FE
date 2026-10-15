import type { BoardDetail, KanbanCard } from "@/types";

/**
 * Authoritatively merges a refreshed card from backend into local card state.
 * Prevents stale responses (where refreshed updatedAt is older than current updatedAt)
 * from overwriting local state.
 */
export function applyAuthoritativeCardUpdate(
  currentCard: KanbanCard,
  refreshedCard: KanbanCard
): KanbanCard {
  const refreshedTime = new Date(refreshedCard.updatedAt).getTime();
  const currentTime = currentCard.updatedAt ? new Date(currentCard.updatedAt).getTime() : 0;

  // Stale response guard: never overwrite if server response has an older timestamp
  if (!isNaN(refreshedTime) && !isNaN(currentTime) && refreshedTime < currentTime) {
    return currentCard;
  }

  const isStrictlyNewer = !isNaN(refreshedTime) && (isNaN(currentTime) || refreshedTime > currentTime);

  return {
    ...currentCard,
    updatedAt: isStrictlyNewer ? refreshedCard.updatedAt : currentCard.updatedAt,
    tasksCount: isStrictlyNewer ? refreshedCard.tasksCount : (currentCard.tasksCount ?? currentCard.checklist?.length ?? 0),
    completedTasksCount: isStrictlyNewer
      ? refreshedCard.completedTasksCount
      : (currentCard.completedTasksCount ?? currentCard.checklist?.filter((t) => t.isCompleted).length ?? 0),
  };
}

/**
 * Functional immutable helper to update a single card within a BoardDetail structure.
 */
export function updateCardInBoard(
  board: BoardDetail,
  cardId: string,
  updater: (card: KanbanCard) => KanbanCard
): BoardDetail {
  return {
    ...board,
    lists: board.lists.map((list) => ({
      ...list,
      cards: list.cards.map((card) => (card.id === cardId ? updater(card) : card)),
    })),
  };
}
