import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type * as React from "react";
import { useBoardCardMutations, useCardSubEntities } from "../index";
import { cardApi, listApi } from "@/apis";
import type { BoardDetail, KanbanList, KanbanCard } from "@/types";

describe("Modular Board Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBoardDetail: BoardDetail = {
    id: "b-1",
    workspaceId: "ws-1",
    name: "Sprint Board",
    status: "ACTIVE",
    members: [
      { id: "u-1", name: "Alice", initials: "A", role: "ADMIN" },
      { id: "u-2", name: "Bob", initials: "B", role: "MEMBER" },
    ],
    labels: [],
    lists: [
      {
        id: "list-1",
        boardId: "b-1",
        name: "Todo",
        category: "TODO",
        position: 1024,
        status: "ACTIVE",
        cards: [
          {
            id: "c-1",
            listId: "list-1",
            boardId: "b-1",
            code: "NEX-1",
            title: "Task 1",
            priority: "MEDIUM",
            position: 1024,
            status: "ACTIVE",
            statusGroup: "TODO",
            assignees: [],
            labels: [],
            tasksCount: 0,
            completedTasksCount: 0,
            isBlocked: false,
            createdAt: "2026-10-10T00:00:00Z",
            updatedAt: "2026-10-10T00:00:00Z",
          },
        ],
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      },
    ],
    archivedListsCount: 0,
    createdAt: "2026-10-10T00:00:00Z",
    updatedAt: "2026-10-10T00:00:00Z",
  };

  describe("useBoardCardMutations", () => {
    it("handles adding a column and updates board state", async () => {
      let currentBoard: BoardDetail | null = mockBoardDetail;
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") {
          currentBoard = updater(currentBoard);
        } else {
          currentBoard = updater;
        }
      });
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      const createdList: KanbanList = {
        id: "list-2",
        boardId: "b-1",
        name: "In Progress",
        category: "IN_PROGRESS",
        position: 2048,
        status: "ACTIVE",
        cards: [],
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      };

      vi.spyOn(listApi, "createList").mockResolvedValue(createdList);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "b-1",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: null,
          setSelectedCardId,
        })
      );

      await act(async () => {
        await result.current.handleAddColumn("In Progress", "IN_PROGRESS");
      });

      expect(listApi.createList).toHaveBeenCalledWith("b-1", {
        name: "In Progress",
        category: "IN_PROGRESS",
      });
      expect(setBoard).toHaveBeenCalled();
    });

    it("handles deleting a card and deselects if it was active", async () => {
      const currentBoard: BoardDetail | null = mockBoardDetail;
      const setBoard = vi.fn();
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      vi.spyOn(cardApi, "deleteCard").mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "b-1",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: "c-1",
          setSelectedCardId,
        })
      );

      await act(async () => {
        await result.current.handleDeleteCard("c-1");
      });

      expect(cardApi.deleteCard).toHaveBeenCalledWith("c-1");
      expect(setSelectedCardId).toHaveBeenCalledWith(null);
    });
    it("prevents duplicate card when WS event arrives before REST resolve (Order 1: WS -> REST)", async () => {
      let currentBoard = mockBoardDetail;
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") {
          currentBoard = updater(currentBoard);
        } else {
          currentBoard = updater;
        }
      });
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      const newCard = {
        id: "card-new-1",
        listId: "list-1",
        boardId: "b-1",
        code: "NEX-2",
        title: "New Task",
        priority: "MEDIUM" as const,
        position: 2048,
        status: "ACTIVE" as const,
        statusGroup: "TODO" as const,
        assignees: [],
        labels: [],
        tasksCount: 0,
        completedTasksCount: 0,
        isBlocked: false,
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      };

      let resolveCreateCard!: (value: KanbanCard) => void;
      const deferredCreateCard = new Promise<KanbanCard>((resolve) => {
        resolveCreateCard = resolve;
      });
      vi.spyOn(cardApi, "createCard").mockReturnValueOnce(deferredCreateCard);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "b-1",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: null,
          setSelectedCardId,
        })
      );

      // 1. User starts add card mutation (REST in-flight)
      let addCardPromise: Promise<void> | undefined;
      act(() => {
        addCardPromise = result.current.handleAddCard("list-1", "New Task");
      });

      // 2. WebSocket CARD_CREATED arrives FIRST and adds card to state
      act(() => {
        setBoard((prev: BoardDetail | null) => {
          if (!prev) return prev;
          return {
            ...prev,
            lists: prev.lists.map((l) =>
              l.id === "list-1"
                ? { ...l, cards: [...l.cards, newCard] }
                : l
            ),
          };
        });
      });

      expect(currentBoard.lists[0].cards.filter((c) => c.id === "card-new-1")).toHaveLength(1);

      // 3. REST resolves SECOND
      await act(async () => {
        resolveCreateCard(newCard);
        await addCardPromise;
      });

      // Assert: The card MUST NOT be duplicated in list-1
      const matchingCards = currentBoard.lists[0].cards.filter((c) => c.id === "card-new-1");
      expect(matchingCards).toHaveLength(1);
    });

    it("does not overwrite a card that was updated/moved via realtime while REST was in-flight", async () => {
      let currentBoard = mockBoardDetail;
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") {
          currentBoard = updater(currentBoard);
        } else {
          currentBoard = updater;
        }
      });
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      const initialCard = {
        id: "card-concurrent-1",
        listId: "list-1",
        boardId: "b-1",
        code: "NEX-99",
        title: "Initial Title",
        priority: "LOW" as const,
        position: 2048,
        status: "ACTIVE" as const,
        statusGroup: "TODO" as const,
        assignees: [],
        labels: [],
        tasksCount: 0,
        completedTasksCount: 0,
        isBlocked: false,
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      };

      let resolveCreateCard!: (value: KanbanCard) => void;
      const deferred = new Promise<KanbanCard>((resolve) => {
        resolveCreateCard = resolve;
      });
      vi.spyOn(cardApi, "createCard").mockReturnValueOnce(deferred);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "b-1",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: null,
          setSelectedCardId,
        })
      );

      // 1. Mutation starts
      let addPromise: Promise<void> | undefined;
      act(() => {
        addPromise = result.current.handleAddCard("list-1", "Initial Title");
      });

      // 2. WS arrives and adds card, then subsequent WS event updates title to 'Realtime Updated Title'
      act(() => {
        setBoard((prev: BoardDetail | null) => {
          if (!prev) return prev;
          return {
            ...prev,
            lists: prev.lists.map((l) =>
              l.id === "list-1"
                ? {
                    ...l,
                    cards: [
                      ...l.cards,
                      {
                        ...initialCard,
                        title: "Realtime Updated Title",
                        priority: "URGENT",
                        updatedAt: "2026-10-10T00:00:05Z",
                      },
                    ],
                  }
                : l
            ),
          };
        });
      });

      // 3. REST resolves later with old creation payload ('Initial Title')
      await act(async () => {
        resolveCreateCard(initialCard);
        await addPromise;
      });

      // Assert: Realtime updated title and priority MUST NOT be reverted by stale REST creation response
      const cardInBoard = currentBoard.lists[0].cards.find((c) => c.id === "card-concurrent-1");
      expect(cardInBoard).toBeDefined();
      expect(cardInBoard?.title).toBe("Realtime Updated Title");
      expect(cardInBoard?.priority).toBe("URGENT");
    });

    it("handleUpdateCard preserves existing assignees, labels, comments, and counts when updating priority", async () => {
      let currentBoard = mockBoardDetail;
      const setBoard = vi.fn((updater: React.SetStateAction<BoardDetail | null>) => {
        if (typeof updater === "function") {
          currentBoard = (updater as (prev: BoardDetail | null) => BoardDetail | null)(currentBoard) as BoardDetail;
        } else {
          currentBoard = updater as BoardDetail;
        }
      });
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      // Card with existing assignees, labels, comments, checklist
      const existingAssignee = { id: "u-1", name: "Alice", initials: "A", role: "ADMIN" as const };
      const existingLabel = { id: "lbl-1", boardId: "b-1", name: "Urgent Fix", color: "#ef4444" };
      const existingComment = { id: "cmt-1", cardId: "c-1", userId: "u-1", author: existingAssignee, content: "Existing comment", createdAt: "", updatedAt: "" };

      currentBoard = {
        ...currentBoard,
        lists: currentBoard.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) =>
            c.id === "c-1"
              ? {
                  ...c,
                  priority: "MEDIUM" as const,
                  assignees: [existingAssignee],
                  assigneeIds: ["u-1"],
                  labels: [existingLabel],
                  comments: [existingComment],
                  commentsCount: 1,
                  attachmentsCount: 2,
                  tasksCount: 3,
                  completedTasksCount: 1,
                }
              : c
          ),
        })),
      };

      // updateCard returns partial card (as Backend currently does)
      const partialUpdateResult = {
        id: "c-1",
        listId: "list-1",
        boardId: "b-1",
        code: "NEX-1",
        title: "Test Card 1",
        priority: "HIGH" as const,
        position: 1024,
        status: "ACTIVE" as const,
        statusGroup: "TODO" as const,
        updatedAt: "2026-10-10T12:00:00Z",
        // Notice: partial update response omits assignees, labels, comments, etc.!
        assignees: [],
        assigneeIds: [],
        labels: [],
        comments: [],
        checklist: [],
        dependencies: [],
        attachments: [],
      };
      vi.spyOn(cardApi, "updateCard").mockResolvedValueOnce(partialUpdateResult as never);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "b-1",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: "c-1",
          setSelectedCardId,
        })
      );

      await act(async () => {
        await result.current.handleUpdateCard("c-1", {
          priority: "HIGH",
          updatedAt: "2026-10-10T10:00:00Z",
        });
      });

      const updatedCard = currentBoard.lists[0].cards.find((c) => c.id === "c-1");
      expect(updatedCard).toBeDefined();
      // Priority MUST be updated to HIGH
      expect(updatedCard?.priority).toBe("HIGH");
      // Assignees MUST NOT be wiped out!
      expect(updatedCard?.assignees).toEqual([existingAssignee]);
      expect(updatedCard?.assigneeIds).toEqual(["u-1"]);
      // Labels MUST NOT be wiped out!
      expect(updatedCard?.labels).toEqual([existingLabel]);
      // Comments & counts MUST NOT be wiped out!
      expect(updatedCard?.comments).toEqual([existingComment]);
      expect(updatedCard?.commentsCount).toBe(1);
      expect(updatedCard?.attachmentsCount).toBe(2);
    });

    it("guards against race condition when switching boards during in-flight createCard (Board A -> Board B)", async () => {
      const boardA: BoardDetail = {
        ...mockBoardDetail,
        id: "board-A",
        name: "Board A",
        lists: [
          {
            id: "list-A1",
            boardId: "board-A",
            name: "Todo A",
            category: "TODO",
            position: 1024,
            status: "ACTIVE",
            cards: [],
            createdAt: "2026-10-10T00:00:00Z",
            updatedAt: "2026-10-10T00:00:00Z",
          },
        ],
      };

      const boardB: BoardDetail = {
        ...mockBoardDetail,
        id: "board-B",
        name: "Board B",
        lists: [
          {
            id: "list-B1",
            boardId: "board-B",
            name: "Todo B",
            category: "TODO",
            position: 1024,
            status: "ACTIVE",
            cards: [],
            createdAt: "2026-10-10T00:00:00Z",
            updatedAt: "2026-10-10T00:00:00Z",
          },
        ],
      };

      let currentBoard: BoardDetail | null = boardA;
      const setBoard = vi.fn((updater: React.SetStateAction<BoardDetail | null>) => {
        if (typeof updater === "function") {
          currentBoard = (updater as (prev: BoardDetail | null) => BoardDetail | null)(currentBoard);
        } else {
          currentBoard = updater;
        }
      });
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      let resolveCreateCard!: (value: KanbanCard) => void;
      const deferredCreateCard = new Promise<KanbanCard>((resolve) => {
        resolveCreateCard = resolve;
      });
      vi.spyOn(cardApi, "createCard").mockReturnValueOnce(deferredCreateCard);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "board-A",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: null,
          setSelectedCardId,
        })
      );

      // 1. User starts add card on Board A (REST in-flight)
      let addCardPromise: Promise<void> | undefined;
      act(() => {
        addCardPromise = result.current.handleAddCard("list-A1", "Card For Board A");
      });

      // 2. User switches to Board B before request finishes
      act(() => {
        currentBoard = boardB;
      });

      // 3. Response for Board A resolves while user is on Board B
      const createdCardA: KanbanCard = {
        id: "card-A-new",
        listId: "list-A1",
        boardId: "board-A",
        code: "NEX-A1",
        title: "Card For Board A",
        priority: "MEDIUM" as const,
        position: 1024,
        status: "ACTIVE" as const,
        statusGroup: "TODO" as const,
        assignees: [],
        labels: [],
        tasksCount: 0,
        completedTasksCount: 0,
        isBlocked: false,
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      };

      await act(async () => {
        resolveCreateCard(createdCardA);
        await addCardPromise;
      });

      // Assert: Board B state MUST NOT be modified or contaminated by Board A's response
      expect(currentBoard).toBeDefined();
      expect(currentBoard?.id).toBe("board-B");
      expect(currentBoard?.lists[0].id).toBe("list-B1");
      expect(currentBoard?.lists[0].cards).toHaveLength(0);
    });

    it("guards against race condition when switching boards during in-flight createList (Board A -> Board B)", async () => {
      const boardA: BoardDetail = {
        ...mockBoardDetail,
        id: "board-A",
        name: "Board A",
        lists: [],
      };

      const boardB: BoardDetail = {
        ...mockBoardDetail,
        id: "board-B",
        name: "Board B",
        lists: [
          {
            id: "list-B1",
            boardId: "board-B",
            name: "Todo B",
            category: "TODO",
            position: 1024,
            status: "ACTIVE",
            cards: [],
            createdAt: "2026-10-10T00:00:00Z",
            updatedAt: "2026-10-10T00:00:00Z",
          },
        ],
      };

      let currentBoard: BoardDetail | null = boardA;
      const setBoard = vi.fn((updater: React.SetStateAction<BoardDetail | null>) => {
        if (typeof updater === "function") {
          currentBoard = (updater as (prev: BoardDetail | null) => BoardDetail | null)(currentBoard);
        } else {
          currentBoard = updater;
        }
      });
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      let resolveCreateList!: (value: KanbanList) => void;
      const deferredCreateList = new Promise<KanbanList>((resolve) => {
        resolveCreateList = resolve;
      });
      vi.spyOn(listApi, "createList").mockReturnValueOnce(deferredCreateList);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "board-A",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: null,
          setSelectedCardId,
        })
      );

      // 1. User starts add column on Board A (REST in-flight)
      let addColumnPromise: Promise<void> | undefined;
      act(() => {
        addColumnPromise = result.current.handleAddColumn("New Column A", "IN_PROGRESS");
      });

      // 2. User switches to Board B before request finishes
      act(() => {
        currentBoard = boardB;
      });

      // 3. Response for Board A resolves while user is on Board B
      const createdListA: KanbanList = {
        id: "list-A-new",
        boardId: "board-A",
        name: "New Column A",
        category: "IN_PROGRESS",
        position: 2048,
        status: "ACTIVE",
        cards: [],
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      };

      await act(async () => {
        resolveCreateList(createdListA);
        await addColumnPromise;
      });

      // Assert: Board B state MUST NOT have List A added to it
      expect(currentBoard).toBeDefined();
      expect(currentBoard?.id).toBe("board-B");
      expect(currentBoard?.lists).toHaveLength(1);
      expect(currentBoard?.lists[0].id).toBe("list-B1");
    });

    it("prevents cross-list duplicate when card is created and moved via WS before REST create resolves", async () => {
      const boardWithTwoLists: BoardDetail = {
        ...mockBoardDetail,
        id: "b-1",
        lists: [
          {
            id: "list-1",
            boardId: "b-1",
            name: "Todo",
            category: "TODO",
            position: 1000,
            status: "ACTIVE",
            cards: [],
            createdAt: "2026-10-10T00:00:00Z",
            updatedAt: "2026-10-10T00:00:00Z",
          },
          {
            id: "list-2",
            boardId: "b-1",
            name: "In Progress",
            category: "IN_PROGRESS",
            position: 2000,
            status: "ACTIVE",
            cards: [],
            createdAt: "2026-10-10T00:00:00Z",
            updatedAt: "2026-10-10T00:00:00Z",
          },
        ],
      };

      let currentBoard: BoardDetail | null = boardWithTwoLists;
      const setBoard = vi.fn((updater: React.SetStateAction<BoardDetail | null>) => {
        if (typeof updater === "function") {
          currentBoard = (updater as (prev: BoardDetail | null) => BoardDetail | null)(currentBoard);
        } else {
          currentBoard = updater;
        }
      });
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      const initialCardX: KanbanCard = {
        id: "card-x",
        listId: "list-1",
        boardId: "b-1",
        code: "NEX-X",
        title: "Original Card X",
        priority: "LOW" as const,
        position: 1024,
        status: "ACTIVE" as const,
        statusGroup: "TODO" as const,
        assignees: [],
        labels: [],
        tasksCount: 0,
        completedTasksCount: 0,
        isBlocked: false,
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      };

      let resolveCreateCard!: (value: KanbanCard) => void;
      const deferredCreateCard = new Promise<KanbanCard>((resolve) => {
        resolveCreateCard = resolve;
      });
      vi.spyOn(cardApi, "createCard").mockReturnValueOnce(deferredCreateCard);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "b-1",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: null,
          setSelectedCardId,
        })
      );

      // 1. User starts add card X at list-1 (REST in-flight)
      let addCardPromise: Promise<void> | undefined;
      act(() => {
        addCardPromise = result.current.handleAddCard("list-1", "Original Card X");
      });

      // 2. While REST is pending:
      // - WS CARD_CREATED arrives (card X created in list-1)
      // - Then WS CARD_MOVED arrives: card X is moved to list-2 with newer title / updated position & updatedAt
      const movedCardXOnList2: KanbanCard = {
        ...initialCardX,
        listId: "list-2",
        title: "Realtime Renamed Card X",
        statusGroup: "IN_PROGRESS" as const,
        position: 2048,
        updatedAt: "2026-10-10T00:00:10Z",
      };

      act(() => {
        setBoard((prev: BoardDetail | null) => {
          if (!prev) return prev;
          return {
            ...prev,
            lists: prev.lists.map((l) => {
              if (l.id === "list-1") {
                return { ...l, cards: [] }; // card X moved out of list-1
              }
              if (l.id === "list-2") {
                return { ...l, cards: [movedCardXOnList2] }; // card X now in list-2
              }
              return l;
            }),
          };
        });
      });

      // Confirm intermediate state: list-1 is empty, list-2 has card-x
      expect(currentBoard?.lists.find((l) => l.id === "list-1")?.cards).toHaveLength(0);
      expect(currentBoard?.lists.find((l) => l.id === "list-2")?.cards).toHaveLength(1);

      // 3. REST create resolves with initial data of X (pointing to list-1)
      await act(async () => {
        resolveCreateCard(initialCardX);
        await addCardPromise;
      });

      // 4. Assertions:
      // - The whole board must have ONLY ONE instance of card X
      const allCardsOnBoard = currentBoard?.lists.flatMap((l) => l.cards).filter((c) => c.id === "card-x") ?? [];
      expect(allCardsOnBoard).toHaveLength(1);

      // - list-1 must NOT contain card X
      const list1Cards = currentBoard?.lists.find((l) => l.id === "list-1")?.cards ?? [];
      expect(list1Cards.some((c) => c.id === "card-x")).toBe(false);

      // - list-2 must have card X, and the newer data (title, statusGroup, updatedAt) is preserved
      const cardOnList2 = currentBoard?.lists.find((l) => l.id === "list-2")?.cards.find((c) => c.id === "card-x");
      expect(cardOnList2).toBeDefined();
      expect(cardOnList2?.title).toBe("Realtime Renamed Card X");
      expect(cardOnList2?.statusGroup).toBe("IN_PROGRESS");
      expect(cardOnList2?.updatedAt).toBe("2026-10-10T00:00:10Z");
    });
  });

  describe("useCardSubEntities", () => {
    it("initializes with default empty/clean states when no card is selected", () => {
      const setBoard = vi.fn();
      const { result } = renderHook(() =>
        useCardSubEntities({
          selectedCardId: null,
          board: mockBoardDetail,
          setBoard,
        })
      );

      expect(result.current.isTasksLoading).toBe(false);
      expect(result.current.tasksError).toBeNull();
      expect(result.current.isAssignmentsLoading).toBe(false);
      expect(result.current.assignmentsError).toBeNull();
      expect(result.current.isLabelsLoading).toBe(false);
      expect(result.current.labelsError).toBeNull();
      expect(result.current.isCommentsLoading).toBe(false);
      expect(result.current.commentsError).toBeNull();
      expect(result.current.isAttachmentsLoading).toBe(false);
      expect(result.current.attachmentsError).toBeNull();
      expect(result.current.isDependenciesLoading).toBe(false);
      expect(result.current.dependenciesError).toBeNull();
    });

    it("loads all 6 sub-entities when card is selected", async () => {
      const setBoard = vi.fn();
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardById").mockResolvedValue(mockBoardDetail.lists[0].cards[0]);
      vi.spyOn(cardApi, "getCardAssignments").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardLabels").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardComments").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardAttachments").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardDependencies").mockResolvedValue([]);

      renderHook(() =>
        useCardSubEntities({
          selectedCardId: "c-1",
          board: mockBoardDetail,
          setBoard,
        })
      );

      await act(async () => {
        // Allow in-flight loaders to settle
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(cardApi.getCardTasks).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardAssignments).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardLabels).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardComments).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardAttachments).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardDependencies).toHaveBeenCalledWith("c-1");
    });
  });
});
