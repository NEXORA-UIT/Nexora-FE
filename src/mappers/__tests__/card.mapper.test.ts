import { describe, it, expect } from "vitest";
import {
  deriveCardStatus,
  mapCardDtoToKanbanCard,
  mapCardDtosToKanbanCards,
  associateCardsWithLists,
} from "../card.mapper";
import type { CardDto, KanbanList, BoardMember, BoardLabel } from "@/types";

describe("Card Mapper Suite", () => {
  const sampleActiveCardDto: CardDto = {
    id: "card-uuid-1",
    boardId: "board-uuid-1",
    listId: "list-uuid-1",
    cardKey: "NEX-101",
    title: "Implement auth guard",
    description: "Protect admin routes with requireAuth",
    startDate: "2026-10-09T08:00:00.000Z",
    dueDate: "2026-10-15T18:00:00.000Z",
    priority: "HIGH",
    position: 1024,
    archivedAt: null,
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T09:00:00.000Z",
    statusGroup: "TODO",
    taskProgress: {
      total: 3,
      completed: 1,
      percent: 33,
    },
  };

  const sampleArchivedCardDto: CardDto = {
    id: "card-uuid-2",
    boardId: "board-uuid-1",
    listId: "list-uuid-1",
    cardKey: "NEX-102",
    title: "Old task",
    description: null,
    startDate: null,
    dueDate: null,
    priority: "LOW",
    position: 2048,
    archivedAt: "2026-10-10T08:00:00.000Z",
    createdAt: "2026-10-08T08:00:00.000Z",
    updatedAt: "2026-10-10T08:00:00.000Z",
    statusGroup: "TODO",
    taskProgress: {
      total: 0,
      completed: 0,
      percent: 0,
    },
  };

  describe("deriveCardStatus", () => {
    it("returns ACTIVE when archivedAt is null", () => {
      expect(deriveCardStatus(sampleActiveCardDto)).toBe("ACTIVE");
    });

    it("returns ARCHIVED when archivedAt is set", () => {
      expect(deriveCardStatus(sampleArchivedCardDto)).toBe("ARCHIVED");
    });
  });

  describe("mapCardDtoToKanbanCard", () => {
    it("transforms CardDto to KanbanCard with cardKey mapped to code and taskProgress mapped to task counts", () => {
      const card = mapCardDtoToKanbanCard(sampleActiveCardDto);

      expect(card).toEqual({
        id: "card-uuid-1",
        boardId: "board-uuid-1",
        listId: "list-uuid-1",
        code: "NEX-101",
        title: "Implement auth guard",
        description: "Protect admin routes with requireAuth",
        startDate: "2026-10-09T08:00:00.000Z",
        dueDate: "2026-10-15T18:00:00.000Z",
        priority: "HIGH",
        position: 1024,
        status: "ACTIVE",
        statusGroup: "TODO",
        tasksCount: 3,
        completedTasksCount: 1,
        assignees: [],
        labels: [],
        isBlocked: false,
        blockReason: undefined,
        checklist: [],
        dependencies: [],
        attachments: [],
        comments: [],
        createdAt: "2026-10-09T08:00:00.000Z",
        updatedAt: "2026-10-09T09:00:00.000Z",
      });
    });

    it("maps nullable fields and defaults tasksCount to 0 when taskProgress is absent", () => {
      const card = mapCardDtoToKanbanCard(sampleArchivedCardDto);

      expect(card.id).toBe("card-uuid-2");
      expect(card.code).toBe("NEX-102");
      expect(card.status).toBe("ARCHIVED");
      expect(card.description).toBeNull();
      expect(card.startDate).toBeNull();
      expect(card.dueDate).toBeNull();
      expect(card.tasksCount).toBe(0);
      expect(card.completedTasksCount).toBe(0);
    });

    it("allows overrides for related child entities like assignees and labels", () => {
      const mockMember: BoardMember = {
        id: "m-1",
        name: "Test User",
        initials: "TU",
        role: "PM",
      };
      const mockLabel: BoardLabel = {
        id: "l-1",
        boardId: "board-uuid-1",
        name: "Backend",
        color: "#3B82F6",
      };

      const card = mapCardDtoToKanbanCard(sampleActiveCardDto, {
        assignees: [mockMember],
        labels: [mockLabel],
        isBlocked: true,
        blockReason: "Waiting on API spec",
      });

      expect(card.assignees).toEqual([mockMember]);
      expect(card.labels).toEqual([mockLabel]);
      expect(card.isBlocked).toBe(true);
      expect(card.blockReason).toBe("Waiting on API spec");
    });
  });

  describe("mapCardDtosToKanbanCards", () => {
    it("returns empty array for empty or falsy inputs", () => {
      expect(mapCardDtosToKanbanCards([])).toEqual([]);
    });

    it("maps an array of CardDtos", () => {
      const cards = mapCardDtosToKanbanCards([sampleActiveCardDto, sampleArchivedCardDto]);
      expect(cards).toHaveLength(2);
      expect(cards[0].code).toBe("NEX-101");
      expect(cards[1].code).toBe("NEX-102");
    });
  });

  describe("associateCardsWithLists", () => {
    const listA: KanbanList = {
      id: "list-a",
      boardId: "board-uuid-1",
      name: "To Do Team Alpha",
      category: "TODO",
      position: 1024,
      status: "ACTIVE",
      cards: [],
      createdAt: "2026-10-09T08:00:00.000Z",
      updatedAt: "2026-10-09T08:00:00.000Z",
    };

    const listB: KanbanList = {
      id: "list-b",
      boardId: "board-uuid-1",
      name: "To Do Team Beta",
      category: "TODO", // Same category as listA!
      position: 2048,
      status: "ACTIVE",
      cards: [],
      createdAt: "2026-10-09T08:00:00.000Z",
      updatedAt: "2026-10-09T08:00:00.000Z",
    };

    const emptyList: KanbanList = {
      id: "list-empty",
      boardId: "board-uuid-1",
      name: "In Progress",
      category: "IN_PROGRESS",
      position: 3072,
      status: "ACTIVE",
      cards: [],
      createdAt: "2026-10-09T08:00:00.000Z",
      updatedAt: "2026-10-09T08:00:00.000Z",
    };

    it("associates cards by exact listId without confusing lists that share the same category", () => {
      const cardA1 = mapCardDtoToKanbanCard({
        ...sampleActiveCardDto,
        id: "c-a1",
        listId: "list-a",
        position: 2048,
      });
      const cardA2 = mapCardDtoToKanbanCard({
        ...sampleActiveCardDto,
        id: "c-a2",
        listId: "list-a",
        position: 1024,
      });
      const cardB1 = mapCardDtoToKanbanCard({
        ...sampleActiveCardDto,
        id: "c-b1",
        listId: "list-b",
        position: 1024,
      });

      const result = associateCardsWithLists([listA, listB, emptyList], [cardA1, cardA2, cardB1]);

      expect(result.unassociatedCards).toHaveLength(0);
      expect(result.lists).toHaveLength(3);

      // List A receives only cardA1 and cardA2, sorted by position ASC
      const resultListA = result.lists.find((l) => l.id === "list-a");
      expect(resultListA?.cards).toHaveLength(2);
      expect(resultListA?.cards[0].id).toBe("c-a2"); // position 1024
      expect(resultListA?.cards[1].id).toBe("c-a1"); // position 2048

      // List B receives only cardB1
      const resultListB = result.lists.find((l) => l.id === "list-b");
      expect(resultListB?.cards).toHaveLength(1);
      expect(resultListB?.cards[0].id).toBe("c-b1");

      // Empty list retains 0 cards
      const resultEmpty = result.lists.find((l) => l.id === "list-empty");
      expect(resultEmpty?.cards).toHaveLength(0);
    });

    it("identifies and separates cards whose listId does not match any loaded list", () => {
      const orphanCard = mapCardDtoToKanbanCard({
        ...sampleActiveCardDto,
        id: "c-orphan",
        listId: "list-non-existent",
      });

      const result = associateCardsWithLists([listA], [orphanCard]);

      expect(result.lists[0].cards).toHaveLength(0);
      expect(result.unassociatedCards).toHaveLength(1);
      expect(result.unassociatedCards[0].id).toBe("c-orphan");
      expect(result.unassociatedCards[0].listId).toBe("list-non-existent");
    });
  });
});
