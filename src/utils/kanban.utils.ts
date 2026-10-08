import type { KanbanCard } from "@/types";

/**
 * Calculates new floating position coordinate using midpoint spacing strategy,
 * matching OpenAPI ReorderListRequest and MoveCardRequest schemas.
 */
export function calculateMidpointPosition(
  cards: Array<{ position: number }>,
  targetIndex: number
): number {
  if (cards.length === 0) {
    return 1024;
  }

  // Insert at top of list
  if (targetIndex <= 0) {
    const firstPos = cards[0]?.position || 1024;
    return Math.max(1, Math.round(firstPos / 2));
  }

  // Insert at bottom of list
  if (targetIndex >= cards.length) {
    const lastPos = cards[cards.length - 1]?.position || 1024;
    return lastPos + 1024;
  }

  // Insert between two existing items
  const prevPos = cards[targetIndex - 1]?.position || 1024;
  const nextPos = cards[targetIndex]?.position || prevPos + 1024;
  return Math.round((prevPos + nextPos) / 2);
}

/**
 * Filters cards within lists matching a text search query across title, code, and labels.
 */
export function filterCardsByQuery(cards: KanbanCard[], rawQuery: string): KanbanCard[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return cards;

  return cards.filter((card) => {
    const matchesTitle = card.title.toLowerCase().includes(query);
    const matchesCode = card.code.toLowerCase().includes(query);
    const matchesLabel = card.labels.some((l) => l.name.toLowerCase().includes(query));
    const matchesAssignee = card.assignees.some((a) =>
      a.name.toLowerCase().includes(query) || a.initials.toLowerCase().includes(query)
    );

    return matchesTitle || matchesCode || matchesLabel || matchesAssignee;
  });
}
