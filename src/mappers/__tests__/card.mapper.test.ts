import { describe, it, expect } from "vitest";
import {
  deriveCardStatus,
  mapCardDtoToKanbanCard,
  mapCardDtosToKanbanCards,
  associateCardsWithLists,
  mapTaskDtoToChecklistItem,
  mapTaskDtosToChecklistItems,
  mapCardAssignmentDtoToBoardMember,
  mapCardAssignmentDtosToBoardMembers,
  mapBoardLabelDtoToBoardLabel,
  mapBoardLabelDtosToBoardLabels,
  mapCardLabelDtoToBoardLabel,
  mapCardLabelDtosToBoardLabels,
  mapCommentDtoToCardComment,
  mapCommentDtosToCardComments,
  mapAttachmentDtoToCardAttachment,
  mapAttachmentDtosToCardAttachments,
  formatFileSize,
} from "../card.mapper";
import type {
  CardDto,
  KanbanList,
  BoardMember,
  BoardLabel,
  TaskDto,
  CardAssignmentDto,
  BoardLabelDto,
  CardLabelDto,
  CommentDto,
  AttachmentDto,
} from "@/types";

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
        assigneeIds: [],
        labels: [],
        commentsCount: undefined,
        attachmentsCount: undefined,
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

    it("maps aggregate assignees, labels, and child counts from Board Cards response", () => {
      const dto: CardDto = {
        ...sampleActiveCardDto,
        assigneeIds: ["user-1"],
        labels: [{ id: "label-1", boardId: "board-uuid-1", name: "Backend", color: "#2563EB", createdAt: sampleActiveCardDto.createdAt, updatedAt: sampleActiveCardDto.updatedAt }],
        commentsCount: 2,
        attachmentsCount: 1,
      };
      const member: BoardMember = { id: "user-1", name: "Alex Kim", initials: "AK", role: "MEMBER" };

      const card = mapCardDtoToKanbanCard(dto, undefined, [member]);
      expect(card.assignees).toEqual([member]);
      expect(card.labels).toEqual([{ id: "label-1", boardId: "board-uuid-1", name: "Backend", color: "#2563EB" }]);
      expect(card.commentsCount).toBe(2);
      expect(card.attachmentsCount).toBe(1);
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

    it("preserves existing assigneeIds and labels when mapping a partial DTO with overrides", () => {
      const partialDto: CardDto = {
        id: "card-uuid-1",
        boardId: "board-uuid-1",
        listId: "list-uuid-1",
        cardKey: "NEX-101",
        title: "Updated Title",
        description: "New description",
        startDate: null,
        dueDate: null,
        priority: "HIGH",
        position: 1024,
        archivedAt: null,
        statusGroup: "TODO",
        taskProgress: { total: 0, completed: 0, percent: 0 },
        createdAt: "2026-10-09T08:00:00.000Z",
        updatedAt: "2026-10-09T10:00:00.000Z",
        // Notice: assigneeIds and labels are undefined in partial DTO
      };

      const existingCard = {
        assignees: [{ id: "u-1", name: "Alice", initials: "A", role: "ADMIN" as const }],
        assigneeIds: ["u-1"],
        labels: [{ id: "lbl-1", boardId: "board-uuid-1", name: "Frontend", color: "#3B82F6" }],
        commentsCount: 3,
        attachmentsCount: 1,
      };

      const mapped = mapCardDtoToKanbanCard(partialDto, existingCard);

      expect(mapped.assignees).toEqual(existingCard.assignees);
      expect(mapped.assigneeIds).toEqual(["u-1"]);
      expect(mapped.labels).toEqual(existingCard.labels);
      expect(mapped.commentsCount).toBe(3);
      expect(mapped.attachmentsCount).toBe(1);
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

  describe("mapTaskDtoToChecklistItem", () => {
    it("maps TaskDto to ChecklistItem preserving all fields", () => {
      const taskDto: TaskDto = {
        id: "task-uuid-1",
        cardId: "card-uuid-1",
        title: "Write documentation",
        isCompleted: true,
        position: 1024,
        createdAt: "2026-10-10T09:00:00.000Z",
        updatedAt: "2026-10-10T10:00:00.000Z",
      };

      const item = mapTaskDtoToChecklistItem(taskDto);

      expect(item).toEqual({
        id: "task-uuid-1",
        cardId: "card-uuid-1",
        title: "Write documentation",
        isCompleted: true,
        position: 1024,
        createdAt: "2026-10-10T09:00:00.000Z",
        updatedAt: "2026-10-10T10:00:00.000Z",
      });
    });
  });

  describe("mapTaskDtosToChecklistItems", () => {
    it("sorts tasks by position ASC, then id ASC for tie-breaking", () => {
      const dtos: TaskDto[] = [
        {
          id: "task-c",
          cardId: "card-1",
          title: "Third by pos",
          isCompleted: false,
          position: 2048,
          createdAt: "2026-10-10T09:00:00.000Z",
          updatedAt: "2026-10-10T09:00:00.000Z",
        },
        {
          id: "task-b",
          cardId: "card-1",
          title: "Tie breaker B",
          isCompleted: true,
          position: 1024,
          createdAt: "2026-10-10T09:00:00.000Z",
          updatedAt: "2026-10-10T09:00:00.000Z",
        },
        {
          id: "task-a",
          cardId: "card-1",
          title: "Tie breaker A",
          isCompleted: false,
          position: 1024,
          createdAt: "2026-10-10T09:00:00.000Z",
          updatedAt: "2026-10-10T09:00:00.000Z",
        },
      ];

      const mapped = mapTaskDtosToChecklistItems(dtos);

      expect(mapped.map((t) => t.id)).toEqual(["task-a", "task-b", "task-c"]);
      expect(mapped[0].title).toBe("Tie breaker A");
      expect(mapped[1].title).toBe("Tie breaker B");
      expect(mapped[2].title).toBe("Third by pos");
    });

    it("handles empty or null/undefined task arrays safely", () => {
      expect(mapTaskDtosToChecklistItems([])).toEqual([]);
      expect(mapTaskDtosToChecklistItems(null as unknown as TaskDto[])).toEqual([]);
    });
  });

  describe("mapCardAssignmentDtoToBoardMember", () => {
    const existingMember: BoardMember = {
      id: "user-1",
      name: "Alice PM",
      initials: "AP",
      avatarUrl: "https://example.com/alice.png",
      role: "PM",
    };

    it("matches existing member from membersPool to retain avatar and role", () => {
      const assignmentDto: CardAssignmentDto = {
        id: "assign-1",
        cardId: "card-1",
        userId: "user-1",
        assignedAt: "2026-10-10T10:00:00.000Z",
        user: {
          id: "user-1",
          fullName: "Alice PM",
          email: "alice@example.com",
        },
      };

      const member = mapCardAssignmentDtoToBoardMember(assignmentDto, [existingMember]);
      expect(member).toEqual(existingMember);
      expect(member.avatarUrl).toBe("https://example.com/alice.png");
      expect(member.role).toBe("PM");
    });

    it("safely generates BoardMember when user is not in membersPool (e.g. Workspace Owner)", () => {
      const assignmentDto: CardAssignmentDto = {
        id: "assign-2",
        cardId: "card-1",
        userId: "owner-99",
        assignedAt: "2026-10-10T10:00:00.000Z",
        user: {
          id: "owner-99",
          fullName: "Bao Workspace Owner",
          email: "owner@nexora.app",
        },
      };

      const member = mapCardAssignmentDtoToBoardMember(assignmentDto, [existingMember]);
      expect(member.id).toBe("owner-99");
      expect(member.name).toBe("Bao Workspace Owner");
      expect(member.initials).toBe("BW");
      expect(member.avatarUrl).toBeUndefined();
    });

    it("handles email fallback when fullName is empty", () => {
      const assignmentDto: CardAssignmentDto = {
        id: "assign-3",
        cardId: "card-1",
        userId: "user-3",
        assignedAt: "2026-10-10T10:00:00.000Z",
        user: {
          id: "user-3",
          fullName: "",
          email: "dev@nexora.app",
        },
      };

      const member = mapCardAssignmentDtoToBoardMember(assignmentDto);
      expect(member.name).toBe("dev@nexora.app");
      expect(member.initials).toBe("D");
    });
  });

  describe("mapCardAssignmentDtosToBoardMembers", () => {
    it("maps and deduplicates assignments by userId", () => {
      const dtos: CardAssignmentDto[] = [
        {
          id: "assign-1",
          cardId: "card-1",
          userId: "user-1",
          assignedAt: "2026-10-10T09:00:00.000Z",
          user: { id: "user-1", fullName: "User One", email: "u1@test.com" },
        },
        {
          id: "assign-dup",
          cardId: "card-1",
          userId: "user-1",
          assignedAt: "2026-10-10T09:05:00.000Z",
          user: { id: "user-1", fullName: "User One Duplicate", email: "u1@test.com" },
        },
        {
          id: "assign-2",
          cardId: "card-1",
          userId: "user-2",
          assignedAt: "2026-10-10T09:10:00.000Z",
          user: { id: "user-2", fullName: "User Two", email: "u2@test.com" },
        },
      ];

      const members = mapCardAssignmentDtosToBoardMembers(dtos);
      expect(members).toHaveLength(2);
      expect(members.map((m) => m.id)).toEqual(["user-1", "user-2"]);
    });

    it("handles empty or null assignment arrays safely", () => {
      expect(mapCardAssignmentDtosToBoardMembers([])).toEqual([]);
      expect(mapCardAssignmentDtosToBoardMembers(null as unknown as CardAssignmentDto[])).toEqual([]);
    });
  });

  describe("Label Mappers", () => {
    const mockLabelDto1: BoardLabelDto = {
      id: "label-uuid-1",
      boardId: "board-uuid-1",
      name: "Bug",
      color: "#ef4444",
      createdAt: "2026-10-10T00:00:00.000Z",
      updatedAt: "2026-10-10T00:00:00.000Z",
    };

    const mockLabelDto2: BoardLabelDto = {
      id: "label-uuid-2",
      boardId: "board-uuid-1",
      name: "Feature",
      color: "#3b82f6",
      createdAt: "2026-10-10T01:00:00.000Z",
      updatedAt: "2026-10-10T01:00:00.000Z",
    };

    it("maps BoardLabelDto to BoardLabel preserving id, boardId, name, color", () => {
      const result = mapBoardLabelDtoToBoardLabel(mockLabelDto1);
      expect(result).toEqual({
        id: "label-uuid-1",
        boardId: "board-uuid-1",
        name: "Bug",
        color: "#ef4444",
      });
    });

    it("maps array of BoardLabelDtos to BoardLabels", () => {
      const result = mapBoardLabelDtosToBoardLabels([mockLabelDto1, mockLabelDto2]);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Bug");
      expect(result[1].name).toBe("Feature");
    });

    it("maps CardLabelDto by unwrapping its inner label object", () => {
      const cardLabelDto: CardLabelDto = {
        cardId: "card-uuid-1",
        labelId: "label-uuid-1",
        createdAt: "2026-10-10T02:00:00.000Z",
        label: mockLabelDto1,
      };

      const result = mapCardLabelDtoToBoardLabel(cardLabelDto);
      expect(result).toEqual({
        id: "label-uuid-1",
        boardId: "board-uuid-1",
        name: "Bug",
        color: "#ef4444",
      });
    });

    it("maps array of CardLabelDtos and deduplicates by label id", () => {
      const cardLabelDtos: CardLabelDto[] = [
        {
          cardId: "card-uuid-1",
          labelId: "label-uuid-1",
          createdAt: "2026-10-10T02:00:00.000Z",
          label: mockLabelDto1,
        },
        {
          cardId: "card-uuid-1",
          labelId: "label-uuid-1",
          createdAt: "2026-10-10T02:05:00.000Z",
          label: mockLabelDto1,
        },
        {
          cardId: "card-uuid-1",
          labelId: "label-uuid-2",
          createdAt: "2026-10-10T02:10:00.000Z",
          label: mockLabelDto2,
        },
      ];

      const result = mapCardLabelDtosToBoardLabels(cardLabelDtos);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("label-uuid-1");
      expect(result[1].id).toBe("label-uuid-2");
    });

    it("handles empty and null arrays safely", () => {
      expect(mapBoardLabelDtosToBoardLabels([])).toEqual([]);
      expect(mapBoardLabelDtosToBoardLabels(null as unknown as BoardLabelDto[])).toEqual([]);
      expect(mapCardLabelDtosToBoardLabels([])).toEqual([]);
      expect(mapCardLabelDtosToBoardLabels(null as unknown as CardLabelDto[])).toEqual([]);
    });
  });

  describe("mapCommentDtoToCardComment & mapCommentDtosToCardComments (Step 6E)", () => {
    const existingMember: BoardMember = {
      id: "user-1",
      name: "Phan Gia Đạt",
      initials: "Đ",
      role: "PM",
      avatarUrl: "https://example.com/dat.png",
    };

    it("matches existing member from membersPool by userId", () => {
      const dto: CommentDto = {
        id: "comment-1",
        cardId: "card-1",
        userId: "user-1",
        content: "Nice work on this task!",
        createdAt: "2026-10-10T08:00:00.000Z",
        updatedAt: "2026-10-10T08:00:00.000Z",
        deletedAt: null,
      };

      const result = mapCommentDtoToCardComment(dto, [existingMember]);
      expect(result.id).toBe("comment-1");
      expect(result.author).toEqual(existingMember);
      expect(result.userId).toBe("user-1");
      expect(result.content).toBe("Nice work on this task!");
      expect(result.isDeleted).toBe(false);
      expect(result.deletedAt).toBeNull();
    });

    it("falls back to neutral Unknown Member when member is not in membersPool", () => {
      const dto: CommentDto = {
        id: "comment-2",
        cardId: "card-1",
        userId: "external-user-99",
        content: "External remark",
        createdAt: "2026-10-10T09:00:00.000Z",
        updatedAt: "2026-10-10T09:00:00.000Z",
        deletedAt: null,
      };

      const result = mapCommentDtoToCardComment(dto, [existingMember]);
      expect(result.author.id).toBe("external-user-99");
      expect(result.author.name).toBe("Unknown Member");
      expect(result.author.initials).toBe("U");
      expect(result.content).toBe("External remark");
      expect(result.isDeleted).toBe(false);
    });

    it("handles soft-deleted comments (content: null, deletedAt set)", () => {
      const dto: CommentDto = {
        id: "comment-3",
        cardId: "card-1",
        userId: "user-1",
        content: null,
        createdAt: "2026-10-10T09:00:00.000Z",
        updatedAt: "2026-10-10T09:10:00.000Z",
        deletedAt: "2026-10-10T09:10:00.000Z",
      };

      const result = mapCommentDtoToCardComment(dto, [existingMember]);
      expect(result.isDeleted).toBe(true);
      expect(result.content).toBeNull();
      expect(result.deletedAt).toBe("2026-10-10T09:10:00.000Z");
    });

    it("preserves exact backend order in mapCommentDtosToCardComments", () => {
      const dtos: CommentDto[] = [
        {
          id: "c-1",
          cardId: "card-1",
          userId: "user-1",
          content: "First",
          createdAt: "2026-10-10T01:00:00.000Z",
          updatedAt: "2026-10-10T01:00:00.000Z",
          deletedAt: null,
        },
        {
          id: "c-2",
          cardId: "card-1",
          userId: "user-1",
          content: null,
          createdAt: "2026-10-10T02:00:00.000Z",
          updatedAt: "2026-10-10T02:00:00.000Z",
          deletedAt: "2026-10-10T02:00:00.000Z",
        },
        {
          id: "c-3",
          cardId: "card-1",
          userId: "user-1",
          content: "Third",
          createdAt: "2026-10-10T03:00:00.000Z",
          updatedAt: "2026-10-10T03:00:00.000Z",
          deletedAt: null,
        },
      ];

      const result = mapCommentDtosToCardComments(dtos, [existingMember]);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("c-1");
      expect(result[0].content).toBe("First");
      expect(result[1].id).toBe("c-2");
      expect(result[1].isDeleted).toBe(true);
      expect(result[2].id).toBe("c-3");
      expect(result[2].content).toBe("Third");
    });

    it("handles empty and null arrays safely", () => {
      expect(mapCommentDtosToCardComments([])).toEqual([]);
      expect(mapCommentDtosToCardComments(null as unknown as CommentDto[])).toEqual([]);
    });
  });

  describe("mapAttachmentDtoToCardAttachment & mapAttachmentDtosToCardAttachments (Step 6F)", () => {
    const existingMember: BoardMember = {
      id: "user-1",
      name: "Phan Gia Đạt",
      initials: "Đ",
      role: "PM",
      avatarUrl: "https://example.com/dat.png",
    };

    describe("formatFileSize helper", () => {
      it("formats bytes into human-readable string correctly", () => {
        expect(formatFileSize(500)).toBe("500 B");
        expect(formatFileSize(2048)).toBe("2.0 KB");
        expect(formatFileSize(1048576 * 2.5)).toBe("2.5 MB");
      });

      it("returns string unchanged if already formatted", () => {
        expect(formatFileSize("1.5 MB")).toBe("1.5 MB");
      });
    });

    it("matches existing member from membersPool by userId", () => {
      const dto: AttachmentDto = {
        id: "att-1",
        cardId: "card-1",
        userId: "user-1",
        fileName: "specs.pdf",
        fileSize: 1048576,
        mimeType: "application/pdf",
        createdAt: "2026-10-10T08:00:00.000Z",
      };

      const result = mapAttachmentDtoToCardAttachment(dto, [existingMember]);
      expect(result.id).toBe("att-1");
      expect(result.cardId).toBe("card-1");
      expect(result.fileName).toBe("specs.pdf");
      expect(result.fileSize).toBe(1048576);
      expect(result.mimeType).toBe("application/pdf");
      expect(result.uploadedBy).toEqual(existingMember);
      expect(result.createdAt).toBe("2026-10-10T08:00:00.000Z");
    });

    it("falls back to neutral Unknown Member when member is not in membersPool", () => {
      const dto: AttachmentDto = {
        id: "att-2",
        cardId: "card-1",
        userId: "external-user-88",
        fileName: "external.docx",
        fileSize: 20480,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        createdAt: "2026-10-10T09:00:00.000Z",
      };

      const result = mapAttachmentDtoToCardAttachment(dto, [existingMember]);
      expect(result.uploadedBy.id).toBe("external-user-88");
      expect(result.uploadedBy.name).toBe("Unknown Member");
      expect(result.uploadedBy.initials).toBe("U");
    });

    it("preserves exact backend order in mapAttachmentDtosToCardAttachments", () => {
      const dtos: AttachmentDto[] = [
        {
          id: "att-1",
          cardId: "card-1",
          userId: "user-1",
          fileName: "file1.png",
          fileSize: 1000,
          mimeType: "image/png",
          createdAt: "2026-10-10T01:00:00.000Z",
        },
        {
          id: "att-2",
          cardId: "card-1",
          userId: "user-1",
          fileName: "file2.pdf",
          fileSize: 2000,
          mimeType: "application/pdf",
          createdAt: "2026-10-10T02:00:00.000Z",
        },
      ];

      const result = mapAttachmentDtosToCardAttachments(dtos, [existingMember]);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("att-1");
      expect(result[1].id).toBe("att-2");
    });

    it("handles empty and null arrays safely", () => {
      expect(mapAttachmentDtosToCardAttachments([])).toEqual([]);
      expect(mapAttachmentDtosToCardAttachments(null as unknown as AttachmentDto[])).toEqual([]);
    });
  });
});

