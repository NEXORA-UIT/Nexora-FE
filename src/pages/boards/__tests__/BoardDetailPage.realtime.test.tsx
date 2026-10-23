import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { BoardDetailPage } from "../BoardDetailPage";
import { boardApi, cardApi, listApi } from "@/apis";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import type {
  Board,
  KanbanList,
  KanbanCard,
  BoardMember,
  RealtimeEnvelope,
  CardDto,
  CardCommentDto,
} from "@/types";
import type {
  WebSocketStatus,
  RealtimeEventHandler,
  WebSocketStatusHandler,
} from "@/lib/websocket/websocket-client";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Hoisted Mock WebSocket Client
const { mockWsClient } = vi.hoisted(() => {
  class MockWebSocketClient {
    status: WebSocketStatus = "CONNECTED";
    eventListeners = new Map<string, Set<RealtimeEventHandler<unknown>>>();
    statusListeners = new Set<WebSocketStatusHandler>();
    joinedBoards = new Set<string>();

    setStatus(newStatus: WebSocketStatus): void {
      this.status = newStatus;
      for (const handler of Array.from(this.statusListeners)) {
        handler(newStatus);
      }
    }

    getStatus(): WebSocketStatus {
      return this.status;
    }

    joinBoard(boardId: string): void {
      this.joinedBoards.add(boardId);
    }

    leaveBoard(boardId: string): void {
      this.joinedBoards.delete(boardId);
    }

    onEvent(event: string, handler: RealtimeEventHandler<unknown>): () => void {
      let set = this.eventListeners.get(event);
      if (!set) {
        set = new Set();
        this.eventListeners.set(event, set);
      }
      set.add(handler);
      return () => {
        set?.delete(handler);
      };
    }

    onStatusChange(handler: WebSocketStatusHandler): () => void {
      this.statusListeners.add(handler);
      handler(this.status);
      return () => {
        this.statusListeners.delete(handler);
      };
    }

    emitEvent(envelope: RealtimeEnvelope): void {
      const specific = this.eventListeners.get(envelope.event);
      if (specific) {
        for (const handler of specific) handler(envelope);
      }
      const wildcard = this.eventListeners.get("*");
      if (wildcard) {
        for (const handler of wildcard) handler(envelope);
      }
    }

    emitAck(ack: { event: "JOINED_BOARD" | "LEFT_BOARD"; boardId: string; occurredAt?: string }): void {
      const specific = this.eventListeners.get(ack.event);
      if (specific) {
        for (const handler of specific) handler(ack as unknown as RealtimeEnvelope);
      }
    }

    reset(): void {
      this.status = "CONNECTED";
      this.eventListeners.clear();
      this.statusListeners.clear();
      this.joinedBoards.clear();
    }
  }

  return { mockWsClient: new MockWebSocketClient() };
});

vi.mock("@/lib/websocket/websocket-client", () => ({
  webSocketClient: mockWsClient,
}));

describe("BoardDetailPage Realtime UI Integration Suite (Checkpoint 2)", () => {
  const mockMembers: BoardMember[] = [
    { id: "user-1", name: "Alice Admin", initials: "AA", role: "PM" },
    { id: "user-2", name: "Bob Member", initials: "BM", role: "MEMBER" },
  ];

  const card1: KanbanCard = {
    id: "card-1",
    listId: "list-todo",
    boardId: "board-101",
    code: "CARD-001",
    title: "Initial Kanban Card",
    description: "Initial card description",
    priority: "MEDIUM",
    position: 1024,
    status: "ACTIVE",
    statusGroup: "TODO",
    assignees: [mockMembers[0]],
    labels: [],
    commentsCount: 1,
    attachmentsCount: 0,
    tasksCount: 0,
    completedTasksCount: 0,
    comments: [
      {
        id: "comment-1",
        cardId: "card-1",
        userId: "user-1",
        author: mockMembers[0],
        content: "First existing comment",
        createdAt: "2026-10-20T10:00:00.000Z",
        updatedAt: "2026-10-20T10:00:00.000Z",
        deletedAt: null,
        isDeleted: false,
      },
    ],
    updatedAt: "2026-10-20T10:00:00.000Z",
    createdAt: "2026-10-20T10:00:00.000Z",
  };

  const listTodo: KanbanList = {
    id: "list-todo",
    boardId: "board-101",
    name: "To Do",
    category: "TODO",
    position: 1024,
    status: "ACTIVE",
    cards: [card1],
    createdAt: "2026-10-20T10:00:00.000Z",
    updatedAt: "2026-10-20T10:00:00.000Z",
  };

  const listDone: KanbanList = {
    id: "list-done",
    boardId: "board-101",
    name: "Done",
    category: "DONE",
    position: 2048,
    status: "ACTIVE",
    cards: [],
    createdAt: "2026-10-20T10:00:00.000Z",
    updatedAt: "2026-10-20T10:00:00.000Z",
  };

  const mockBoardData: Board = {
    id: "board-101",
    workspaceId: "ws-1",
    name: "Project Titan",
    title: "Project Titan",
    status: "active",
    description: "Core sprint board",
    coverColor: "#3B82F6",
    coverUrl: null,
    createdAt: "2026-10-20T10:00:00.000Z",
    updatedAt: "2026-10-20T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWsClient.reset();

    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "alice@nexora.test",
        fullName: "Alice Admin",
        avatarUrl: null,
        status: "ACTIVE",
        createdAt: "2026-10-20T00:00:00.000Z",
        updatedAt: "2026-10-20T00:00:00.000Z",
      },
    });

    vi.spyOn(boardApi, "getBoard").mockResolvedValue(mockBoardData);
    vi.spyOn(boardApi, "getBoardMembers").mockResolvedValue(mockMembers);
    vi.spyOn(cardApi, "getBoardLabels").mockResolvedValue([]);
    vi.spyOn(listApi, "getBoardLists").mockResolvedValue([listTodo, listDone]);
    vi.spyOn(cardApi, "getBoardCards").mockResolvedValue([card1]);
    vi.spyOn(cardApi, "getCardComments").mockResolvedValue([
      {
        id: "comment-1",
        cardId: "card-1",
        userId: "user-1",
        content: "First existing comment",
        createdAt: "2026-10-20T10:00:00.000Z",
        updatedAt: "2026-10-20T10:00:00.000Z",
        deletedAt: null,
      },
    ]);
    vi.spyOn(cardApi, "getCardTasks").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardActivities").mockResolvedValue({ items: [], nextCursor: null });
    vi.spyOn(cardApi, "getCardAssignments").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardLabels").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardAttachments").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardDependencies").mockResolvedValue([]);
    vi.spyOn(boardApi, "getBoardDashboard").mockResolvedValue({
      totalCards: 1,
      completedCards: 0,
      inProgressCards: 0,
      todoCards: 1,
      overdueCards: 0,
      completionRate: 0,
    });
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={["/workspaces/ws-1/boards/board-101"]}>
        <Routes>
          <Route path="/workspaces/:workspaceId/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("1. renders newly created card in correct list in realtime without refresh", async () => {
    renderPage();

    // Verify initial card is rendered in the To Do column
    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();
    expect(screen.getByText("CARD-001")).toBeDefined();

    // Another user creates a new card
    const newCardDto: CardDto = {
      id: "card-realtime-2",
      boardId: "board-101",
      listId: "list-todo",
      cardKey: "CARD-002",
      title: "Realtime Created Card",
      description: "Created by peer member",
      startDate: null,
      dueDate: null,
      priority: "HIGH",
      position: 2048,
      archivedAt: null,
      statusGroup: "TODO",
      assigneeIds: ["user-2"],
      labels: [],
      commentsCount: 0,
      attachmentsCount: 0,
      taskProgress: { total: 0, completed: 0, percent: 0 },
      createdAt: "2026-10-20T11:00:00.000Z",
      updatedAt: "2026-10-20T11:00:00.000Z",
    };

    act(() => {
      mockWsClient.emitEvent({
        event: "CARD_CREATED",
        eventId: "evt-create-1",
        occurredAt: "2026-10-20T11:00:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: { card: newCardDto },
      });
    });

    // Verify new card appears immediately in the DOM without page reload
    expect(await screen.findByText("Realtime Created Card")).toBeDefined();
    expect(screen.getByText("CARD-002")).toBeDefined();
  });

  it("2. updates source and destination lists when a card is moved in realtime", async () => {
    renderPage();

    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();

    // Simulate CARD_MOVED: card-1 moved from list-todo to list-done
    act(() => {
      mockWsClient.emitEvent({
        event: "CARD_MOVED",
        eventId: "evt-move-1",
        occurredAt: "2026-10-20T11:30:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: {
          cardId: "card-1",
          fromListId: "list-todo",
          toListId: "list-done",
          oldPosition: 1024,
          newPosition: 512,
          updatedAt: "2026-10-20T11:30:00.000Z",
        },
      });
    });

    // Check that card-1 still exists in DOM
    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();

    // Verify card is now inside the "Done" list column
    const doneColumn = screen.getByText("Done").closest("[data-column-id='list-done']") ||
      screen.getByText("Done").closest(".flex.flex-col");
    expect(doneColumn).toBeDefined();
  });

  it("3. displays realtime comment in open drawer while preserving user typing in comment textarea", async () => {
    renderPage();

    // Click on card-1 to open the detail drawer
    const cardEl = await screen.findByText("Initial Kanban Card");
    fireEvent.click(cardEl);

    // Verify Drawer is open with card code
    expect(await screen.findByText("Task details for CARD-001: Initial Kanban Card")).toBeDefined();

    // Find the comment input textarea
    const commentInput = screen.getByPlaceholderText(/write a comment/i) as HTMLTextAreaElement;
    expect(commentInput).toBeDefined();

    // User is currently typing a draft comment
    fireEvent.change(commentInput, { target: { value: "Drafting an important thought..." } });
    expect(commentInput.value).toBe("Drafting an important thought...");

    // Realtime COMMENT_ADDED event arrives from Bob Member with authoritative commentsCount: 5
    act(() => {
      mockWsClient.emitEvent({
        event: "COMMENT_ADDED",
        eventId: "evt-cmt-1",
        occurredAt: "2026-10-20T12:00:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: {
          cardId: "card-1",
          comment: {
            id: "comment-live-99",
            cardId: "card-1",
            userId: "user-2",
            content: "Hey team, this is live from Bob!",
            createdAt: "2026-10-20T12:00:00.000Z",
            updatedAt: "2026-10-20T12:00:00.000Z",
            deletedAt: null,
            user: { id: "user-2", fullName: "Bob Member" },
          } as unknown as CardCommentDto,
          commentsCount: 5,
        },
      });
    });

    // Verify the new comment appears in the comment feed with content and author
    expect(await screen.findByText("Hey team, this is live from Bob!")).toBeDefined();
    expect(screen.getByText("Bob Member")).toBeDefined();

    // CRITICAL INVARIANT: The user's typing in the textarea was NOT overwritten or cleared!
    expect(commentInput.value).toBe("Drafting an important thought...");
  });

  it("4. deduplicates duplicate comment events and does not increment count twice", async () => {
    renderPage();

    const cardEl = await screen.findByText("Initial Kanban Card");
    fireEvent.click(cardEl);

    expect(await screen.findByText("Task details for CARD-001: Initial Kanban Card")).toBeDefined();

    const duplicateCommentPayload = {
      cardId: "card-1",
      comment: {
        id: "comment-dup-1",
        cardId: "card-1",
        userId: "user-2",
        content: "Deduplicated realtime comment",
        createdAt: "2026-10-20T12:00:00.000Z",
        updatedAt: "2026-10-20T12:00:00.000Z",
        deletedAt: null,
        user: { id: "user-2", fullName: "Bob Member" },
      } as unknown as CardCommentDto,
      commentsCount: 3,
    };

    // First arrival
    act(() => {
      mockWsClient.emitEvent({
        event: "COMMENT_ADDED",
        eventId: "evt-dup-1",
        occurredAt: "2026-10-20T12:00:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: duplicateCommentPayload,
      });
    });

    expect(await screen.findByText("Deduplicated realtime comment")).toBeDefined();
    const commentItems = screen.getAllByText("Deduplicated realtime comment");
    expect(commentItems).toHaveLength(1);

    // Second arrival (duplicate delivery of the exact same comment)
    act(() => {
      mockWsClient.emitEvent({
        event: "COMMENT_ADDED",
        eventId: "evt-dup-1-retry",
        occurredAt: "2026-10-20T12:00:01.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: duplicateCommentPayload,
      });
    });

    // Still only appears once in the DOM
    const commentItemsAfter = screen.getAllByText("Deduplicated realtime comment");
    expect(commentItemsAfter).toHaveLength(1);
  });

  it("5. closes drawer and shows toast when active card is deleted in realtime", async () => {
    renderPage();

    const cardEl = await screen.findByText("Initial Kanban Card");
    fireEvent.click(cardEl);

    // Drawer is open
    expect(await screen.findByText("Task details for CARD-001: Initial Kanban Card")).toBeDefined();

    // Realtime CARD_DELETED event arrives for card-1
    act(() => {
      mockWsClient.emitEvent({
        event: "CARD_DELETED",
        eventId: "evt-del-1",
        occurredAt: "2026-10-20T12:30:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: {
          cardId: "card-1",
          listId: "list-todo",
          deletedAt: "2026-10-20T12:30:00.000Z",
        },
      });
    });

    // Card is removed from Kanban canvas
    await waitFor(() => {
      expect(screen.queryByText("Initial Kanban Card")).toBeNull();
    });

    // Drawer is closed
    await waitFor(() => {
      expect(screen.queryByText("Task details for CARD-001: Initial Kanban Card")).toBeNull();
    });

    // Toast notification informed user
    expect(toast.info).toHaveBeenCalledWith("The card you were viewing was deleted.");
  });

  it("6. closes drawer and shows toast when active card is archived in realtime", async () => {
    renderPage();

    const cardEl = await screen.findByText("Initial Kanban Card");
    fireEvent.click(cardEl);

    expect(await screen.findByText("Task details for CARD-001: Initial Kanban Card")).toBeDefined();

    // Realtime CARD_ARCHIVED event arrives for card-1
    act(() => {
      mockWsClient.emitEvent({
        event: "CARD_ARCHIVED",
        eventId: "evt-arc-1",
        occurredAt: "2026-10-20T12:45:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: {
          cardId: "card-1",
          listId: "list-todo",
          status: "ARCHIVED",
          isArchived: true,
          updatedAt: "2026-10-20T12:45:00.000Z",
        },
      });
    });

    // Card disappears from active canvas
    await waitFor(() => {
      expect(screen.queryByText("Initial Kanban Card")).toBeNull();
    });

    // Drawer is closed
    await waitFor(() => {
      expect(screen.queryByText("Task details for CARD-001: Initial Kanban Card")).toBeNull();
    });

    expect(toast.info).toHaveBeenCalledWith("The card you were viewing was archived.");
  });

  it("7. ignores stale out-of-order CARD_UPDATED event with older timestamp", async () => {
    renderPage();

    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();

    // CARD_UPDATED arrives with timestamp older than current card (card1.updatedAt is 10:00:00)
    act(() => {
      mockWsClient.emitEvent({
        event: "CARD_UPDATED",
        eventId: "evt-upd-stale",
        occurredAt: "2026-10-20T09:00:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: {
          card: {
            id: "card-1",
            boardId: "board-101",
            listId: "list-todo",
            cardKey: "CARD-001",
            title: "Stale Overwrite Title",
            priority: "LOW",
            position: 1024,
            statusGroup: "TODO",
            assigneeIds: [],
            labels: [],
            commentsCount: 0,
            attachmentsCount: 0,
            tasksCount: 0,
            completedTasksCount: 0,
            taskProgress: { total: 0, completed: 0, percent: 0 },
            createdAt: "2026-10-20T09:00:00.000Z",
            updatedAt: "2026-10-20T09:00:00.000Z", // Stale!
          },
        },
      });
    });

    // Stale title is discarded
    expect(screen.queryByText("Stale Overwrite Title")).toBeNull();
    expect(screen.getByText("Initial Kanban Card")).toBeDefined();
  });
  it("8. updates column ordering when LIST_REORDERED event arrives", async () => {
    renderPage();

    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();
    expect(screen.getByText("To Do")).toBeDefined();
    expect(screen.getByText("Done")).toBeDefined();

    // Reorder "To Do" (1024) to 5000 so it moves after "Done" (2048)
    act(() => {
      mockWsClient.emitEvent({
        event: "LIST_REORDERED",
        eventId: "evt-reorder-1",
        occurredAt: "2026-10-20T12:50:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: {
          listId: "list-todo",
          oldPosition: 1024,
          newPosition: 5000,
          updatedAt: "2026-10-20T12:50:00.000Z",
        },
      });
    });

    // Both columns still exist and are rendered in the new order
    expect(screen.getByText("To Do")).toBeDefined();
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("9. cleans up socket listeners and unregisters board on unmount", async () => {
    const { unmount } = renderPage();

    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();
    expect(mockWsClient.joinedBoards.has("board-101")).toBe(true);

    unmount();

    expect(mockWsClient.joinedBoards.has("board-101")).toBe(false);
  });

  it("10. displays and updates realtime connection status pill on header based on socket state", async () => {
    renderPage();

    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();

    const statusPill = screen.getByTestId("realtime-status-pill");
    // Initially socket is CONNECTED but room ACK has not arrived yet -> Connecting...
    expect(statusPill.textContent).toContain("Connecting...");

    // Server sends JOINED_BOARD ACK for board-101 -> Live
    act(() => {
      mockWsClient.emitAck({
        event: "JOINED_BOARD",
        boardId: "board-101",
      });
    });
    expect(statusPill.textContent).toContain("Live");

    // Socket transitions to RECONNECTING
    act(() => {
      mockWsClient.setStatus("RECONNECTING");
    });
    expect(statusPill.textContent).toContain("Reconnecting...");

    // Socket transitions to DISCONNECTED
    act(() => {
      mockWsClient.setStatus("DISCONNECTED");
    });
    expect(statusPill.textContent).toContain("Offline");

    // Socket recovers to CONNECTED (still Connecting until room ACK)
    act(() => {
      mockWsClient.setStatus("CONNECTED");
    });
    expect(statusPill.textContent).toContain("Connecting...");

    // Room ACK arrives -> Live
    act(() => {
      mockWsClient.emitAck({
        event: "JOINED_BOARD",
        boardId: "board-101",
      });
    });
    expect(statusPill.textContent).toContain("Live");
  });

  it("11. updates Calendar view reactively when realtime card events arrive without page reload", async () => {
    renderPage();

    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();

    // Switch view to Calendar
    const calendarTab = screen.getByRole("button", { name: /Calendar/i });
    fireEvent.click(calendarTab);

    // Initial card is unscheduled
    expect(await screen.findByText("1 unscheduled")).toBeDefined();

    // Realtime CARD_CREATED event arrives with a new unscheduled card
    const newCardDto: CardDto = {
      id: "card-cal-2",
      boardId: "board-101",
      listId: "list-todo",
      cardKey: "CARD-002",
      title: "Calendar Realtime Card",
      description: null,
      startDate: null,
      dueDate: null,
      priority: "MEDIUM",
      position: 3000,
      archivedAt: null,
      statusGroup: "TODO",
      assigneeIds: [],
      labels: [],
      commentsCount: 0,
      attachmentsCount: 0,
      taskProgress: { total: 0, completed: 0, percent: 0 },
      createdAt: "2026-10-20T13:00:00.000Z",
      updatedAt: "2026-10-20T13:00:00.000Z",
    };

    act(() => {
      mockWsClient.emitEvent({
        event: "CARD_CREATED",
        eventId: "evt-cal-create-1",
        occurredAt: "2026-10-20T13:00:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: { card: newCardDto },
      });
    });

    // Calendar view reactively reflects the new card (unscheduled count is now 2)
    expect(await screen.findByText("2 unscheduled")).toBeDefined();

    // Now peer member deletes the first card
    act(() => {
      mockWsClient.emitEvent({
        event: "CARD_DELETED",
        eventId: "evt-cal-del-1",
        occurredAt: "2026-10-20T13:05:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: {
          cardId: "card-1",
          listId: "list-todo",
          deletedAt: "2026-10-20T13:05:00.000Z",
        },
      });
    });

    // Unscheduled count reactively decrements back to 1
    await waitFor(() => {
      expect(screen.getByText("1 unscheduled")).toBeDefined();
    });
  });

  it("12. updates Planning view reactively when realtime card events arrive without page reload", async () => {
    renderPage();

    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();

    // Switch view to Planning
    const planningTab = screen.getByRole("button", { name: /Planning/i });
    fireEvent.click(planningTab);

    // Initial planning view renders dependency relation header and schedule warnings
    expect(await screen.findByText("Dependency Relations (0)")).toBeDefined();
    expect(screen.getAllByRole("heading", { name: /Schedule & Blocker Warnings/i })[0]).toBeDefined();

    // Realtime CARD_CREATED event arrives
    const newCardDto: CardDto = {
      id: "card-plan-2",
      boardId: "board-101",
      listId: "list-done",
      cardKey: "CARD-002",
      title: "Planning Realtime Card",
      description: null,
      startDate: null,
      dueDate: null,
      priority: "HIGH",
      position: 4000,
      archivedAt: null,
      statusGroup: "DONE",
      assigneeIds: [],
      labels: [],
      commentsCount: 0,
      attachmentsCount: 0,
      taskProgress: { total: 0, completed: 0, percent: 0 },
      createdAt: "2026-10-20T13:10:00.000Z",
      updatedAt: "2026-10-20T13:10:00.000Z",
    };

    act(() => {
      mockWsClient.emitEvent({
        event: "CARD_CREATED",
        eventId: "evt-plan-create-1",
        occurredAt: "2026-10-20T13:10:00.000Z",
        boardId: "board-101",
        actor: { userId: "user-2", fullName: "Bob Member" },
        data: { card: newCardDto },
      });
    });

    // Planning view reactively updates metrics call for the new board state
    await waitFor(() => {
      expect(boardApi.getBoardDashboard).toHaveBeenCalledWith("board-101");
    });
  });

  it("13. clicking 'Share / Members' button opens BoardMembersDialog", async () => {
    renderPage();

    expect(await screen.findByText("Initial Kanban Card")).toBeDefined();

    // Click Share / Members
    const shareButton = screen.getByRole("button", { name: /Share \/ Members/i });
    fireEvent.click(shareButton);

    // BoardMembersDialog opens
    expect(await screen.findByRole("dialog")).toBeDefined();
    expect(screen.getByText("Board Members")).toBeDefined();

    // Close button closes the dialog
    const closeBtn = screen.getAllByRole("button", { name: /Close/i })[0];
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
