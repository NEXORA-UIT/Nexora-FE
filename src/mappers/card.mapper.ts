import type { CardDto, KanbanCard, KanbanList } from "@/types";

/**
 * Derives Frontend UI card status ('ACTIVE' | 'ARCHIVED') from Backend CardDto
 */
export function deriveCardStatus(dto: CardDto): "ACTIVE" | "ARCHIVED" {
  if (dto.archivedAt) {
    return "ARCHIVED";
  }
  return "ACTIVE";
}

/**
 * Pure mapping function converting Backend CardDto to Frontend KanbanCard domain model.
 * Maps cardKey -> code, taskProgress -> tasksCount & completedTasksCount.
 * Allows supplying child entities (assignees, labels, checklist, dependencies, comments, attachments) via overrides.
 */
export function mapCardDtoToKanbanCard(
  dto: CardDto,
  overrides?: Partial<KanbanCard>
): KanbanCard {
  return {
    id: dto.id,
    listId: dto.listId,
    boardId: dto.boardId,
    code: dto.cardKey,
    title: dto.title,
    description: dto.description,
    startDate: dto.startDate,
    dueDate: dto.dueDate,
    priority: dto.priority,
    position: dto.position,
    status: deriveCardStatus(dto),
    statusGroup: overrides?.statusGroup ?? dto.statusGroup,
    assignees: overrides?.assignees ?? [],
    labels: overrides?.labels ?? [],
    tasksCount: overrides?.tasksCount ?? dto.taskProgress?.total ?? 0,
    completedTasksCount:
      overrides?.completedTasksCount ?? dto.taskProgress?.completed ?? 0,
    isBlocked: overrides?.isBlocked ?? false,
    blockReason: overrides?.blockReason,
    checklist: overrides?.checklist ?? [],
    dependencies: overrides?.dependencies ?? [],
    attachments: overrides?.attachments ?? [],
    comments: overrides?.comments ?? [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Pure mapping function converting an array of Backend CardDtos to Frontend KanbanCards
 */
export function mapCardDtosToKanbanCards(
  dtos: CardDto[],
  overridesMap?: Record<string, Partial<KanbanCard>>
): KanbanCard[] {
  return (dtos || []).map((dto) =>
    mapCardDtoToKanbanCard(dto, overridesMap?.[dto.id])
  );
}

export interface AssociateCardsResult {
  lists: KanbanList[];
  unassociatedCards: KanbanCard[];
}

/**
 * Deterministically associates Cards with Lists based on exact list ID matching.
 * - Handles lists sharing the same category/statusGroup without cross-contamination.
 * - Retains empty lists.
 * - Sorts cards within each list by position ASC, id ASC.
 * - Isolates any unassociated cards whose listId does not match any loaded list.
 */
export function associateCardsWithLists(
  lists: KanbanList[],
  cards: KanbanCard[]
): AssociateCardsResult {
  const listMap = new Map<string, KanbanList>();
  for (const list of lists) {
    listMap.set(list.id, {
      ...list,
      cards: [],
    });
  }

  const unassociatedCards: KanbanCard[] = [];

  for (const card of cards) {
    const targetList = listMap.get(card.listId);
    if (targetList) {
      targetList.cards.push({
        ...card,
        statusGroup: card.statusGroup ?? targetList.category,
      });
    } else {
      unassociatedCards.push(card);
    }
  }

  // Sort cards within each list by position ASC, id ASC
  for (const list of listMap.values()) {
    list.cards.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position;
      }
      return a.id.localeCompare(b.id);
    });
  }

  return {
    lists: Array.from(listMap.values()),
    unassociatedCards,
  };
}
