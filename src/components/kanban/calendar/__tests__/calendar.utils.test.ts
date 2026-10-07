import { describe, it, expect } from "vitest";
import {
  getCardTargetDateString,
  getCalendarMonthDays,
  getAgendaGroups,
  getUnscheduledCards,
  formatPeriodTitle,
} from "../calendar.utils";
import type { KanbanCard } from "@/types";

describe("calendar.utils", () => {
  const createCard = (partial: Partial<KanbanCard>): KanbanCard => ({
    id: "card-default",
    listId: "l-1",
    boardId: "b-1",
    code: "NEX-100",
    title: "Default card",
    priority: "MEDIUM",
    position: 1024,
    status: "ACTIVE",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    updatedAt: "2026-09-20T00:00:00.000Z",
    createdAt: "2026-09-15T00:00:00.000Z",
    ...partial,
  });

  describe("getCardTargetDateString", () => {
    it("prioritizes dueDate when both dueDate and startDate are present", () => {
      const card = createCard({
        startDate: "2026-09-20T00:00:00.000Z",
        dueDate: "2026-09-28T00:00:00.000Z",
      });
      expect(getCardTargetDateString(card)).toBe("2026-09-28");
    });

    it("falls back to startDate when dueDate is absent", () => {
      const card = createCard({
        startDate: "2026-09-20T00:00:00.000Z",
        dueDate: null,
      });
      expect(getCardTargetDateString(card)).toBe("2026-09-20");
    });

    it("returns null when neither dueDate nor startDate is present", () => {
      const card = createCard({ startDate: null, dueDate: null });
      expect(getCardTargetDateString(card)).toBeNull();
    });

    it("handles timezone boundaries consistently by extracting YYYY-MM-DD", () => {
      const cardA = createCard({ dueDate: "2026-10-01T00:00:00.000Z" });
      const cardB = createCard({ dueDate: "2026-10-01T23:59:59.999Z" });
      expect(getCardTargetDateString(cardA)).toBe("2026-10-01");
      expect(getCardTargetDateString(cardB)).toBe("2026-10-01");
    });
  });

  describe("getCalendarMonthDays", () => {
    it("generates a Monday-start grid of 35 or 42 days", () => {
      const days = getCalendarMonthDays(new Date(2026, 8, 15), []); // Sep 2026
      expect(days.length % 7).toBe(0);
      expect(days.length).toBeGreaterThanOrEqual(35);
      // First day of grid for Sep 2026 should be Monday Aug 31
      expect(days[0].dateString).toBe("2026-08-31");
    });

    it("places cards on the correct date cells and ignores dateless cards", () => {
      const cardWithDue = createCard({ code: "NEX-101", dueDate: "2026-09-28T00:00:00.000Z" });
      const cardWithStartOnly = createCard({ code: "NEX-102", startDate: "2026-09-15T00:00:00.000Z", dueDate: null });
      const cardDateless = createCard({ code: "NEX-103", startDate: null, dueDate: null });

      const days = getCalendarMonthDays(new Date(2026, 8, 1), [cardWithDue, cardWithStartOnly, cardDateless]);

      const sep28 = days.find((d) => d.dateString === "2026-09-28");
      const sep15 = days.find((d) => d.dateString === "2026-09-15");

      expect(sep28?.cards.map((c) => c.code)).toContain("NEX-101");
      expect(sep15?.cards.map((c) => c.code)).toContain("NEX-102");

      const allPlacedCards = days.flatMap((d) => d.cards);
      expect(allPlacedCards.some((c) => c.code === "NEX-103")).toBe(false);
    });
  });

  describe("getAgendaGroups", () => {
    it("groups cards chronologically by date within the period", () => {
      const card1 = createCard({ code: "NEX-101", dueDate: "2026-09-28T00:00:00.000Z" });
      const card2 = createCard({ code: "NEX-102", dueDate: "2026-09-15T00:00:00.000Z" });
      const groups = getAgendaGroups(new Date(2026, 8, 15), [card1, card2]);

      expect(groups).toHaveLength(2);
      expect(groups[0].dateString).toBe("2026-09-15");
      expect(groups[1].dateString).toBe("2026-09-28");
    });
  });

  describe("getUnscheduledCards", () => {
    it("identifies cards without any dates", () => {
      const scheduled = createCard({ dueDate: "2026-09-28T00:00:00.000Z" });
      const unscheduled = createCard({ startDate: null, dueDate: null });
      const result = getUnscheduledCards([scheduled, unscheduled]);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(unscheduled);
    });
  });

  describe("formatPeriodTitle", () => {
    it("formats month and year title correctly", () => {
      expect(formatPeriodTitle(new Date(2026, 8, 15))).toBe("September 2026");
      expect(formatPeriodTitle(new Date(2026, 9, 1))).toBe("October 2026");
    });
  });
});
