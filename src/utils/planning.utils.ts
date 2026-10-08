import { parseISO, isAfter } from "date-fns";
import type { KanbanCard, KanbanList, BoardDashboard, ScheduleWarning } from "@/types";

/**
 * Validates whether adding a dependency where `cardId` depends on `candidatePrerequisiteId`
 * would introduce a circular dependency or self-dependency.
 *
 * NOTE: This client-side DFS check serves strictly as UX pre-validation (e.g. disabling
 * cyclic candidate options in the prerequisite picker). The backend remains the sole
 * authoritative validator.
 */
export function wouldCreateCycle(
  cardId: string,
  candidatePrerequisiteId: string,
  allCards: KanbanCard[]
): boolean {
  if (cardId === candidatePrerequisiteId) {
    return true; // Self-dependency is a cycle of length 1
  }

  const cardMap = new Map<string, KanbanCard>(allCards.map((c) => [c.id, c]));
  const visited = new Set<string>();
  const stack = [candidatePrerequisiteId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (currentId === cardId) {
      return true; // Cycle detected: candidatePrerequisite already transitively depends on cardId
    }

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    const currentCard = cardMap.get(currentId);
    if (currentCard?.dependencies) {
      for (const dep of currentCard.dependencies) {
        if (dep.prerequisiteCardId) {
          stack.push(dep.prerequisiteCardId);
        }
      }
    }
  }

  return false;
}

/**
 * Determines whether a card is overdue based on SRS Rule 2.4.9:
 * 1. Has non-null dueDate
 * 2. currentDate > dueDate (timestamp-exact comparison)
 * 3. List category !== 'DONE' (workflow incomplete)
 * 4. Card lifecycle status === 'ACTIVE'
 */
export function isCardOverdue(card: KanbanCard, listCategory: string): boolean {
  if (!card.dueDate) return false;
  if (card.status !== "ACTIVE") return false;
  if (listCategory === "DONE") return false;

  const due = parseISO(card.dueDate);
  if (isNaN(due.getTime())) return false;

  return isAfter(new Date(), due);
}

/**
 * Derives schedule warnings (Overdue, Blockers, Schedule Conflicts) directly
 * from existing KanbanCard.dependencies in the board lists.
 * Does not create or require a separate dependency graph store.
 */
export function detectScheduleWarnings(lists: KanbanList[]): ScheduleWarning[] {
  const warnings: ScheduleWarning[] = [];
  const allCards = lists.flatMap((l) => l.cards);
  const cardMap = new Map<string, KanbanCard>(allCards.map((c) => [c.id, c]));
  const cardListCategoryMap = new Map<string, string>();

  for (const list of lists) {
    for (const card of list.cards) {
      cardListCategoryMap.set(card.id, list.category);
    }
  }

  for (const list of lists) {
    for (const card of list.cards) {
      if (card.status !== "ACTIVE") continue;

      // 1. Overdue Warning
      if (isCardOverdue(card, list.category)) {
        warnings.push({
          id: `overdue-${card.id}`,
          type: "OVERDUE",
          cardId: card.id,
          cardCode: card.code,
          cardTitle: card.title,
          message: `Deadline has passed`,
          severity: "error",
          dueDate: card.dueDate,
        });
      }

      // 2. Dependencies Warnings (Blockers & Conflicts)
      if (card.dependencies && card.dependencies.length > 0) {
        for (const dep of card.dependencies) {
          const prereqCard = cardMap.get(dep.prerequisiteCardId);
          const prereqListCategory = prereqCard
            ? cardListCategoryMap.get(prereqCard.id)
            : dep.prerequisiteStatus === "DONE"
              ? "DONE"
              : "TODO";

          const isCompleted = dep.isCompleted || prereqListCategory === "DONE";

          // Blocker Warning: Incomplete prerequisite
          if (!isCompleted) {
            warnings.push({
              id: `blocker-${card.id}-${dep.id}`,
              type: "BLOCKER",
              cardId: card.id,
              cardCode: card.code,
              cardTitle: card.title,
              message: `Blocked by incomplete prerequisite ${dep.prerequisiteCode}: "${dep.prerequisiteTitle}"`,
              severity: "warning",
              prerequisiteCode: dep.prerequisiteCode,
              prerequisiteTitle: dep.prerequisiteTitle,
            });
          }

          // Schedule Conflict Warning: Prerequisite finishes after dependent card
          const prereqDue = prereqCard?.dueDate ? parseISO(prereqCard.dueDate) : null;
          const cardDue = card.dueDate ? parseISO(card.dueDate) : null;
          const cardStart = card.startDate ? parseISO(card.startDate) : null;

          if (prereqDue && !isNaN(prereqDue.getTime())) {
            let conflict = false;
            if (cardDue && !isNaN(cardDue.getTime()) && isAfter(prereqDue, cardDue)) {
              conflict = true;
            } else if (cardStart && !isNaN(cardStart.getTime()) && isAfter(prereqDue, cardStart)) {
              conflict = true;
            }

            if (conflict) {
              warnings.push({
                id: `conflict-${card.id}-${dep.id}`,
                type: "CONFLICT",
                cardId: card.id,
                cardCode: card.code,
                cardTitle: card.title,
                message: `Prerequisite ${dep.prerequisiteCode} due date is after ${card.code} schedule`,
                severity: "warning",
                prerequisiteCode: dep.prerequisiteCode,
                prerequisiteTitle: dep.prerequisiteTitle,
              });
            }
          }
        }
      }
    }
  }

  return warnings;
}

/**
 * Computes BoardDashboard metrics matching the OpenAPI schema.
 *
 * NOTE: Production dashboard metrics must come strictly from GET /boards/{id}/dashboard.
 * This local calculation helper is restricted to unit tests, optimistic mock preview,
 * or offline fallback only.
 */
export function getBoardDashboardMetrics(lists: KanbanList[]): BoardDashboard {
  const allActiveCards = lists.flatMap((l) => l.cards).filter((c) => c.status === "ACTIVE");
  const totalCards = allActiveCards.length;

  if (totalCards === 0) {
    return {
      totalCards: 0,
      completedCards: 0,
      inProgressCards: 0,
      todoCards: 0,
      overdueCards: 0,
      completionRate: 0,
    };
  }

  const completedCards = lists
    .filter((l) => l.category === "DONE")
    .flatMap((l) => l.cards)
    .filter((c) => c.status === "ACTIVE").length;

  const inProgressCards = lists
    .filter((l) => l.category === "IN_PROGRESS")
    .flatMap((l) => l.cards)
    .filter((c) => c.status === "ACTIVE").length;

  const todoCards = lists
    .filter((l) => l.category === "TODO")
    .flatMap((l) => l.cards)
    .filter((c) => c.status === "ACTIVE").length;

  const overdueCards = lists.flatMap((l) =>
    l.cards.filter((c) => isCardOverdue(c, l.category))
  ).length;

  const completionRate = Math.round((completedCards / totalCards) * 10000) / 100;

  return {
    totalCards,
    completedCards,
    inProgressCards,
    todoCards,
    overdueCards,
    completionRate,
  };
}

/**
 * Checks whether a given role is authorized to create/delete card dependencies.
 * Per SRS and OpenAPI: only Project Manager and Owner are authorized.
 */
export function canUserManageDependencies(role?: string): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  return normalized === "PM" || normalized === "PROJECT_MANAGER" || normalized === "OWNER";
}

/**
 * Validates whether a card can be moved to the DONE category.
 * A card blocked by incomplete prerequisites cannot be moved to DONE.
 */
export function canMoveCardToDone(
  card: KanbanCard,
  targetListCategory: string
): { allowed: boolean; reason?: string } {
  if (targetListCategory === "DONE" && card.isBlocked) {
    return {
      allowed: false,
      reason: card.blockReason || "Cannot move to Done: Prerequisite is not completed.",
    };
  }
  return { allowed: true };
}

/**
 * Evaluates whether a card is blocked by any incomplete prerequisite dependency.
 * A prerequisite is considered complete if:
 * 1. dep.isCompleted is true
 * 2. Prerequisite card is in a list with category === 'DONE'
 * 3. Prerequisite card has checklist items and all are completed
 */
export function isCardBlocked(
  card: KanbanCard,
  lists: KanbanList[]
): { isBlocked: boolean; blockReason?: string } {
  if (!card.dependencies || card.dependencies.length === 0) {
    return { isBlocked: false, blockReason: undefined };
  }
  const allCards = lists.flatMap((l) => l.cards);
  const cardMap = new Map(allCards.map((c) => [c.id, c]));
  const listMap = new Map<string, string>();
  for (const list of lists) {
    for (const c of list.cards) {
      listMap.set(c.id, list.category);
    }
  }

  for (const dep of card.dependencies) {
    const prereqCard = cardMap.get(dep.prerequisiteCardId);
    const prereqCategory = listMap.get(dep.prerequisiteCardId);
    const isDone =
      dep.isCompleted ||
      prereqCategory === "DONE" ||
      (prereqCard?.checklist &&
        prereqCard.checklist.length > 0 &&
        prereqCard.checklist.every((t) => t.isCompleted));

    if (!isDone) {
      return {
        isBlocked: true,
        blockReason: `Blocked by incomplete prerequisite ${dep.prerequisiteCode}: "${dep.prerequisiteTitle}"`,
      };
    }
  }
  return { isBlocked: false, blockReason: undefined };
}
