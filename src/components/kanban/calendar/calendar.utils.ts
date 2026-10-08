import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import type { KanbanCard } from "@/types";

export interface CalendarDay {
  date: Date;
  dateString: string; // "yyyy-MM-dd"
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  cards: KanbanCard[];
}

export interface AgendaGroup {
  date: Date;
  dateString: string;
  cards: KanbanCard[];
}

/**
 * Extracts a normalized calendar date string (YYYY-MM-DD) from a card.
 * Placement Priority:
 *   1. dueDate (if present)
 *   2. startDate (if dueDate is absent)
 *   3. null (unscheduled)
 *
 * Extracts YYYY-MM-DD directly from the ISO string to avoid client UTC offset day-shift bugs.
 */
export function getCardTargetDateString(card: KanbanCard): string | null {
  const rawDate = card.dueDate || card.startDate;
  if (!rawDate) return null;

  const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  return `${match[1]}-${match[2]}-${match[3]}`;
}

/**
 * Generates an array of CalendarDay objects for the given month,
 * aligned to a Monday-start calendar grid (35 or 42 cells).
 */
export function getCalendarMonthDays(currentDate: Date, cards: KanbanCard[]): CalendarDay[] {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Monday start of week (weekStartsOn: 1)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const intervalDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Index cards by YYYY-MM-DD
  const cardMap = new Map<string, KanbanCard[]>();
  for (const card of cards) {
    const dateKey = getCardTargetDateString(card);
    if (!dateKey) continue;

    const existing = cardMap.get(dateKey) || [];
    existing.push(card);
    cardMap.set(dateKey, existing);
  }

  return intervalDays.map((d) => {
    const dateString = format(d, "yyyy-MM-dd");
    const dayCards = cardMap.get(dateString) || [];

    return {
      date: d,
      dateString,
      dayOfMonth: d.getDate(),
      isCurrentMonth: isSameMonth(d, currentDate),
      isToday: isToday(d),
      cards: dayCards,
    };
  });
}

/**
 * Groups cards by date within the specified month for mobile Agenda view.
 * Excludes days with zero cards.
 */
export function getAgendaGroups(currentDate: Date, cards: KanbanCard[]): AgendaGroup[] {
  const monthPrefix = format(currentDate, "yyyy-MM");
  const cardMap = new Map<string, KanbanCard[]>();

  for (const card of cards) {
    const dateKey = getCardTargetDateString(card);
    if (!dateKey) continue;
    if (!dateKey.startsWith(monthPrefix)) continue;

    const existing = cardMap.get(dateKey) || [];
    existing.push(card);
    cardMap.set(dateKey, existing);
  }

  const sortedKeys = Array.from(cardMap.keys()).sort();

  return sortedKeys.map((key) => {
    const [year, month, day] = key.split("-").map(Number);
    return {
      date: new Date(year, month - 1, day),
      dateString: key,
      cards: cardMap.get(key) || [],
    };
  });
}

/**
 * Returns cards that have neither a dueDate nor a startDate.
 */
export function getUnscheduledCards(cards: KanbanCard[]): KanbanCard[] {
  return cards.filter((card) => getCardTargetDateString(card) === null);
}

/**
 * Formats period title for toolbar (e.g., "September 2026").
 */
export function formatPeriodTitle(currentDate: Date): string {
  return format(currentDate, "MMMM yyyy");
}
