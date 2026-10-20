import { describe, expect, it } from "vitest";
import type { BoardCardFilters, KanbanCard } from "@/types";
import { filterCards } from "@/utils";

const card = (overrides: Partial<KanbanCard> = {}): KanbanCard => ({
  id: "card-1",
  listId: "list-1",
  boardId: "board-1",
  code: "NX-1",
  title: "Card",
  priority: "HIGH",
  position: 1,
  status: "ACTIVE",
  statusGroup: "TODO",
  assignees: [{ id: "user-1", name: "Alex", initials: "A", role: "MEMBER" }],
  labels: [],
  tasksCount: 0,
  completedTasksCount: 0,
  updatedAt: "2026-10-01T00:00:00.000Z",
  createdAt: "2026-10-01T00:00:00.000Z",
  ...overrides,
});

const noFilters: BoardCardFilters = {
  statusGroup: "ALL",
  priority: "ALL",
  assigneeIds: [],
  dueDate: "ALL",
  labelIds: [],
};

describe("filterCards", () => {
  it("combines status, priority, assignee, and due-date filters", () => {
    const matching = card({ dueDate: "2026-10-09T00:00:00.000Z" });
    const wrongAssignee = card({
      id: "card-2",
      assignees: [{ id: "user-2", name: "Sam", initials: "S", role: "MEMBER" }],
    });

    expect(
      filterCards(
        [matching, wrongAssignee],
        {
          ...noFilters,
          statusGroup: "TODO",
          priority: "HIGH",
          assigneeIds: ["user-1"],
          dueDate: "OVERDUE",
        },
        new Date("2026-10-10T00:00:00.000Z")
      )
    ).toEqual([matching]);
  });

  it("excludes completed and undated cards from overdue results", () => {
    const pastDue = "2026-10-01T00:00:00.000Z";
    expect(
      filterCards(
        [card({ dueDate: pastDue, statusGroup: "DONE" }), card({ id: "undated", dueDate: null })],
        { ...noFilters, dueDate: "OVERDUE" },
        new Date("2026-10-10T00:00:00.000Z")
      )
    ).toEqual([]);
  });

  it("filters cards by label", () => {
    const labeled = card({ labels: [{ id: "label-1", boardId: "board-1", name: "Bug" }] });
    const other = card({
      id: "card-2",
      labels: [{ id: "label-2", boardId: "board-1", name: "Feature" }],
    });
    expect(filterCards([labeled, other], { ...noFilters, labelIds: ["label-1"] })).toEqual([
      labeled,
    ]);
  });
});
