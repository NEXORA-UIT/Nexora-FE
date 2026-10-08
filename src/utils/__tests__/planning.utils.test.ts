import { describe, it, expect } from "vitest";
import type { KanbanCard, KanbanList } from "@/types";
import {
  wouldCreateCycle,
  isCardOverdue,
  detectScheduleWarnings,
  getBoardDashboardMetrics,
  canUserManageDependencies,
  canMoveCardToDone,
  isCardBlocked,
} from "@/utils";

const createMockCard = (overrides: Partial<KanbanCard> = {}): KanbanCard => ({
  id: "card-1",
  code: "NEX-101",
  title: "Test Card",
  listId: "list-todo",
  boardId: "board-1",
  position: 1000,
  priority: "MEDIUM",
  status: "ACTIVE",
  assignees: [],
  labels: [],
  tasksCount: 0,
  completedTasksCount: 0,
  checklist: [],
  dependencies: [],
  attachments: [],
  comments: [],
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
  ...overrides,
});

const createMockList = (category: "TODO" | "IN_PROGRESS" | "DONE", cards: KanbanCard[]): KanbanList => ({
  id: `list-${category.toLowerCase()}`,
  boardId: "board-1",
  name: category,
  category,
  position: 1000,
  status: "ACTIVE",
  cards,
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
});

describe("planning.utils - wouldCreateCycle", () => {
  it("rejects self-dependency (card cannot depend on itself)", () => {
    const cardA = createMockCard({ id: "card-A" });
    expect(wouldCreateCycle("card-A", "card-A", [cardA])).toBe(true);
  });

  it("detects direct cycle: A -> B, attempting B -> A", () => {
    // Card A already depends on Card B
    const cardB = createMockCard({ id: "card-B" });
    const cardA = createMockCard({
      id: "card-A",
      dependencies: [
        {
          id: "dep-1",
          cardId: "card-A",
          prerequisiteCardId: "card-B",
          prerequisiteCode: "NEX-102",
          prerequisiteTitle: "Card B",
          prerequisiteStatus: "TODO",
          isCompleted: false,
        },
      ],
    });

    // Attempting to make Card B depend on Card A
    expect(wouldCreateCycle("card-B", "card-A", [cardA, cardB])).toBe(true);
  });

  it("detects transitive cycle: A -> B -> C, attempting C -> A", () => {
    // A depends on B
    const cardA = createMockCard({
      id: "card-A",
      dependencies: [
        {
          id: "dep-1",
          cardId: "card-A",
          prerequisiteCardId: "card-B",
          prerequisiteCode: "NEX-B",
          prerequisiteTitle: "Card B",
          prerequisiteStatus: "TODO",
          isCompleted: false,
        },
      ],
    });
    // B depends on C
    const cardB = createMockCard({
      id: "card-B",
      dependencies: [
        {
          id: "dep-2",
          cardId: "card-B",
          prerequisiteCardId: "card-C",
          prerequisiteCode: "NEX-C",
          prerequisiteTitle: "Card C",
          prerequisiteStatus: "TODO",
          isCompleted: false,
        },
      ],
    });
    const cardC = createMockCard({ id: "card-C", dependencies: [] });

    // Attempting to make C depend on A would close the loop A -> B -> C -> A
    expect(wouldCreateCycle("card-C", "card-A", [cardA, cardB, cardC])).toBe(true);
  });

  it("allows non-cyclical dependency link", () => {
    const cardA = createMockCard({ id: "card-A", dependencies: [] });
    const cardB = createMockCard({ id: "card-B", dependencies: [] });
    expect(wouldCreateCycle("card-A", "card-B", [cardA, cardB])).toBe(false);
  });
});

describe("planning.utils - isCardOverdue", () => {
  const pastDate = "2026-10-01T12:00:00.000Z";
  const futureDate = "2026-10-30T12:00:00.000Z";

  it("flags active card with past dueDate in non-DONE list as overdue", () => {
    const card = createMockCard({ dueDate: pastDate, status: "ACTIVE" });
    expect(isCardOverdue(card, "TODO")).toBe(true);
    expect(isCardOverdue(card, "IN_PROGRESS")).toBe(true);
  });

  it("does not flag card without dueDate as overdue", () => {
    const card = createMockCard({ dueDate: null, status: "ACTIVE" });
    expect(isCardOverdue(card, "TODO")).toBe(false);
  });

  it("does not flag card with future dueDate as overdue", () => {
    const card = createMockCard({ dueDate: futureDate, status: "ACTIVE" });
    expect(isCardOverdue(card, "TODO")).toBe(false);
  });

  it("does not flag card in DONE list as overdue even if past dueDate", () => {
    const card = createMockCard({ dueDate: pastDate, status: "ACTIVE" });
    expect(isCardOverdue(card, "DONE")).toBe(false);
  });

  it("does not flag archived card as overdue", () => {
    const card = createMockCard({ dueDate: pastDate, status: "ARCHIVED" });
    expect(isCardOverdue(card, "TODO")).toBe(false);
  });
});

describe("planning.utils - detectScheduleWarnings", () => {
  it("detects overdue warnings, blocker warnings, and date conflict warnings", () => {
    const pastDate = "2026-10-01T10:00:00.000Z";
    const midDate = "2026-10-15T10:00:00.000Z";
    const earlyDate = "2026-10-10T10:00:00.000Z";

    // Prerequisite card B finishes on Oct 15
    const cardB = createMockCard({
      id: "card-B",
      code: "NEX-102",
      title: "Prerequisite B",
      dueDate: midDate,
      status: "ACTIVE",
    });

    // Dependent card A has deadline Oct 10 (earlier than B) and depends on B
    const cardA = createMockCard({
      id: "card-A",
      code: "NEX-101",
      title: "Dependent A",
      dueDate: earlyDate,
      status: "ACTIVE",
      dependencies: [
        {
          id: "dep-1",
          cardId: "card-A",
          prerequisiteCardId: "card-B",
          prerequisiteCode: "NEX-102",
          prerequisiteTitle: "Prerequisite B",
          prerequisiteStatus: "IN_PROGRESS",
          isCompleted: false,
        },
      ],
    });

    // Overdue card C
    const cardC = createMockCard({
      id: "card-C",
      code: "NEX-103",
      title: "Overdue C",
      dueDate: pastDate,
      status: "ACTIVE",
    });

    const lists: KanbanList[] = [
      createMockList("TODO", [cardA, cardC]),
      createMockList("IN_PROGRESS", [cardB]),
      createMockList("DONE", []),
    ];

    const warnings = detectScheduleWarnings(lists);

    // Should detect overdue card C
    const overdueWarning = warnings.find((w) => w.type === "OVERDUE" && w.cardId === "card-C");
    expect(overdueWarning).toBeDefined();

    // Should detect blocker for card A because B is not completed
    const blockerWarning = warnings.find((w) => w.type === "BLOCKER" && w.cardId === "card-A");
    expect(blockerWarning).toBeDefined();

    // Should detect schedule conflict for card A because B finishes after A
    const conflictWarning = warnings.find((w) => w.type === "CONFLICT" && w.cardId === "card-A");
    expect(conflictWarning).toBeDefined();
  });
});

describe("planning.utils - getBoardDashboardMetrics", () => {
  it("calculates 6 metrics matching BoardDashboard schema", () => {
    const pastDate = "2026-10-01T10:00:00.000Z";
    const c1 = createMockCard({ id: "c1", dueDate: pastDate }); // overdue in TODO
    const c2 = createMockCard({ id: "c2" }); // TODO
    const c3 = createMockCard({ id: "c3" }); // IN_PROGRESS
    const c4 = createMockCard({ id: "c4" }); // DONE

    const lists: KanbanList[] = [
      createMockList("TODO", [c1, c2]),
      createMockList("IN_PROGRESS", [c3]),
      createMockList("DONE", [c4]),
    ];

    const metrics = getBoardDashboardMetrics(lists);
    expect(metrics.totalCards).toBe(4);
    expect(metrics.completedCards).toBe(1);
    expect(metrics.inProgressCards).toBe(1);
    expect(metrics.todoCards).toBe(2);
    expect(metrics.overdueCards).toBe(1);
    expect(metrics.completionRate).toBe(25);
  });

  it("handles empty board with 0 cards", () => {
    const lists: KanbanList[] = [
      createMockList("TODO", []),
      createMockList("IN_PROGRESS", []),
      createMockList("DONE", []),
    ];

    const metrics = getBoardDashboardMetrics(lists);
    expect(metrics.totalCards).toBe(0);
    expect(metrics.completedCards).toBe(0);
    expect(metrics.inProgressCards).toBe(0);
    expect(metrics.todoCards).toBe(0);
    expect(metrics.overdueCards).toBe(0);
    expect(metrics.completionRate).toBe(0);
  });
});

describe("planning.utils - canUserManageDependencies", () => {
  it("allows Project Manager (PM / PROJECT_MANAGER) and Owner (OWNER)", () => {
    expect(canUserManageDependencies("PM")).toBe(true);
    expect(canUserManageDependencies("pm")).toBe(true);
    expect(canUserManageDependencies("PROJECT_MANAGER")).toBe(true);
    expect(canUserManageDependencies("project_manager")).toBe(true);
    expect(canUserManageDependencies("OWNER")).toBe(true);
    expect(canUserManageDependencies("owner")).toBe(true);
  });

  it("denies Member, Viewer, or unassigned roles", () => {
    expect(canUserManageDependencies("MEMBER")).toBe(false);
    expect(canUserManageDependencies("member")).toBe(false);
    expect(canUserManageDependencies("VIEWER")).toBe(false);
    expect(canUserManageDependencies("viewer")).toBe(false);
    expect(canUserManageDependencies(undefined)).toBe(false);
    expect(canUserManageDependencies("")).toBe(false);
  });
});

describe("planning.utils - canMoveCardToDone", () => {
  it("rejects transition to DONE when card is blocked", () => {
    const card = createMockCard({
      id: "card-blocked",
      isBlocked: true,
      blockReason: "Prerequisite not finished",
    });
    const result = canMoveCardToDone(card, "DONE");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Prerequisite not finished");
  });

  it("allows transition to DONE when card is not blocked", () => {
    const card = createMockCard({ id: "card-unblocked", isBlocked: false });
    const result = canMoveCardToDone(card, "DONE");
    expect(result.allowed).toBe(true);
  });

  it("allows transition to non-DONE categories even when blocked", () => {
    const card = createMockCard({ id: "card-blocked", isBlocked: true });
    const result = canMoveCardToDone(card, "IN_PROGRESS");
    expect(result.allowed).toBe(true);
  });
});

describe("planning.utils - isCardBlocked", () => {
  it("returns not blocked when card has no dependencies", () => {
    const card = createMockCard({ dependencies: [] });
    const result = isCardBlocked(card, []);
    expect(result.isBlocked).toBe(false);
    expect(result.blockReason).toBeUndefined();
  });

  it("returns blocked when prerequisite is incomplete and in TODO list", () => {
    const prereq = createMockCard({ id: "prereq-1", code: "NEX-200", title: "Prerequisite Task" });
    const card = createMockCard({
      id: "card-1",
      dependencies: [
        {
          id: "dep-1",
          cardId: "card-1",
          prerequisiteCardId: "prereq-1",
          prerequisiteCode: "NEX-200",
          prerequisiteTitle: "Prerequisite Task",
          prerequisiteStatus: "TODO",
          isCompleted: false,
        },
      ],
    });

    const todoList = createMockList("TODO", [prereq, card]);
    const result = isCardBlocked(card, [todoList]);
    expect(result.isBlocked).toBe(true);
    expect(result.blockReason).toContain("Blocked by incomplete prerequisite NEX-200");
  });

  it("returns not blocked when prerequisite list category is DONE", () => {
    const prereq = createMockCard({ id: "prereq-1", code: "NEX-200", title: "Prerequisite Task" });
    const card = createMockCard({
      id: "card-1",
      dependencies: [
        {
          id: "dep-1",
          cardId: "card-1",
          prerequisiteCardId: "prereq-1",
          prerequisiteCode: "NEX-200",
          prerequisiteTitle: "Prerequisite Task",
          prerequisiteStatus: "TODO",
          isCompleted: false,
        },
      ],
    });

    const doneList = createMockList("DONE", [prereq]);
    const todoList = createMockList("TODO", [card]);
    const result = isCardBlocked(card, [doneList, todoList]);
    expect(result.isBlocked).toBe(false);
  });

  it("returns not blocked when dep.isCompleted is true", () => {
    const prereq = createMockCard({ id: "prereq-1" });
    const card = createMockCard({
      id: "card-1",
      dependencies: [
        {
          id: "dep-1",
          cardId: "card-1",
          prerequisiteCardId: "prereq-1",
          prerequisiteCode: "NEX-200",
          prerequisiteTitle: "Prerequisite Task",
          prerequisiteStatus: "TODO",
          isCompleted: true,
        },
      ],
    });

    const todoList = createMockList("TODO", [prereq, card]);
    const result = isCardBlocked(card, [todoList]);
    expect(result.isBlocked).toBe(false);
  });

  it("returns not blocked when all checklist items of prerequisite are completed", () => {
    const prereq = createMockCard({
      id: "prereq-1",
      checklist: [
        { id: "task-1", cardId: "prereq-1", title: "Step 1", isCompleted: true, position: 1000 },
        { id: "task-2", cardId: "prereq-1", title: "Step 2", isCompleted: true, position: 2000 },
      ],
    });
    const card = createMockCard({
      id: "card-1",
      dependencies: [
        {
          id: "dep-1",
          cardId: "card-1",
          prerequisiteCardId: "prereq-1",
          prerequisiteCode: "NEX-200",
          prerequisiteTitle: "Prerequisite Task",
          prerequisiteStatus: "IN_PROGRESS",
          isCompleted: false,
        },
      ],
    });

    const inProgressList = createMockList("IN_PROGRESS", [prereq]);
    const todoList = createMockList("TODO", [card]);
    const result = isCardBlocked(card, [inProgressList, todoList]);
    expect(result.isBlocked).toBe(false);
  });
});

