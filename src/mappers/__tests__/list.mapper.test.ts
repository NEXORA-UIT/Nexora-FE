import { describe, it, expect } from "vitest";
import {
  mapListStatusGroupToCategory,
  mapCategoryToListStatusGroup,
  deriveListStatus,
  mapListDtoToKanbanList,
  mapListDtosToKanbanLists,
} from "../list.mapper";
import type { ListDto, KanbanCard } from "@/types";

describe("List Mapper Suite", () => {
  const sampleActiveListDto: ListDto = {
    id: "list-uuid-1",
    boardId: "board-uuid-1",
    name: "Backlog / To Do",
    statusGroup: "TODO",
    position: 1024,
    archivedAt: null,
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T08:30:00.000Z",
  };

  const sampleArchivedListDto: ListDto = {
    id: "list-uuid-2",
    boardId: "board-uuid-1",
    name: "Archived Milestones",
    statusGroup: "DONE",
    position: 2048,
    archivedAt: "2026-10-10T09:00:00.000Z",
    createdAt: "2026-10-08T08:00:00.000Z",
    updatedAt: "2026-10-10T09:00:00.000Z",
  };

  describe("mapListStatusGroupToCategory", () => {
    it("maps TODO statusGroup to TODO category", () => {
      expect(mapListStatusGroupToCategory("TODO")).toBe("TODO");
    });

    it("maps IN_PROGRESS statusGroup to IN_PROGRESS category", () => {
      expect(mapListStatusGroupToCategory("IN_PROGRESS")).toBe("IN_PROGRESS");
    });

    it("maps DONE statusGroup to DONE category", () => {
      expect(mapListStatusGroupToCategory("DONE")).toBe("DONE");
    });
  });

  describe("mapCategoryToListStatusGroup", () => {
    it("maps TODO category to TODO statusGroup", () => {
      expect(mapCategoryToListStatusGroup("TODO")).toBe("TODO");
    });

    it("maps IN_PROGRESS category to IN_PROGRESS statusGroup", () => {
      expect(mapCategoryToListStatusGroup("IN_PROGRESS")).toBe("IN_PROGRESS");
    });

    it("maps DONE category to DONE statusGroup", () => {
      expect(mapCategoryToListStatusGroup("DONE")).toBe("DONE");
    });
  });

  describe("deriveListStatus", () => {
    it("returns ACTIVE when archivedAt is null", () => {
      expect(deriveListStatus(sampleActiveListDto)).toBe("ACTIVE");
    });

    it("returns ARCHIVED when archivedAt is set", () => {
      expect(deriveListStatus(sampleArchivedListDto)).toBe("ARCHIVED");
    });
  });

  describe("mapListDtoToKanbanList", () => {
    it("correctly transforms ListDto to KanbanList domain object with empty cards by default", () => {
      const result = mapListDtoToKanbanList(sampleActiveListDto);

      expect(result).toEqual({
        id: "list-uuid-1",
        boardId: "board-uuid-1",
        name: "Backlog / To Do",
        category: "TODO",
        position: 1024,
        status: "ACTIVE",
        cards: [],
        createdAt: "2026-10-09T08:00:00.000Z",
        updatedAt: "2026-10-09T08:30:00.000Z",
      });
    });

    it("correctly transforms archived ListDto with status ARCHIVED", () => {
      const result = mapListDtoToKanbanList(sampleArchivedListDto);

      expect(result.id).toBe("list-uuid-2");
      expect(result.category).toBe("DONE");
      expect(result.status).toBe("ARCHIVED");
      expect(result.cards).toEqual([]);
    });

    it("attaches provided existing cards when passed", () => {
      const mockCard: KanbanCard = {
        id: "card-1",
        listId: "list-uuid-1",
        boardId: "board-uuid-1",
        code: "NEX-1",
        title: "Test Card",
        priority: "MEDIUM",
        position: 1024,
        status: "ACTIVE",
        assignees: [],
        labels: [],
        tasksCount: 0,
        completedTasksCount: 0,
        createdAt: "2026-10-09T08:00:00.000Z",
        updatedAt: "2026-10-09T08:00:00.000Z",
      };

      const result = mapListDtoToKanbanList(sampleActiveListDto, [mockCard]);

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].id).toBe("card-1");
      expect(result.cards[0].listId).toBe("list-uuid-1");
    });
  });

  describe("mapListDtosToKanbanLists", () => {
    it("returns empty array for empty or falsy input", () => {
      expect(mapListDtosToKanbanLists([])).toEqual([]);
    });

    it("maps an array of ListDtos and preserves cards from cardsByListId map", () => {
      const mockCard1: KanbanCard = {
        id: "card-1",
        listId: "list-uuid-1",
        boardId: "board-uuid-1",
        code: "NEX-1",
        title: "Card 1",
        priority: "HIGH",
        position: 1024,
        status: "ACTIVE",
        assignees: [],
        labels: [],
        tasksCount: 0,
        completedTasksCount: 0,
        createdAt: "2026-10-09T08:00:00.000Z",
        updatedAt: "2026-10-09T08:00:00.000Z",
      };

      const dtos: ListDto[] = [
        sampleActiveListDto,
        {
          ...sampleActiveListDto,
          id: "list-uuid-3",
          name: "In Progress Column",
          statusGroup: "IN_PROGRESS",
          position: 2048,
        },
      ];

      const cardsByListId = {
        "list-uuid-1": [mockCard1],
      };

      const result = mapListDtosToKanbanLists(dtos, cardsByListId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("list-uuid-1");
      expect(result[0].cards).toEqual([mockCard1]);
      expect(result[1].id).toBe("list-uuid-3");
      expect(result[1].category).toBe("IN_PROGRESS");
      expect(result[1].cards).toEqual([]);
    });
  });
});
