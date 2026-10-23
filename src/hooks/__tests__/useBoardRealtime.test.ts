import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type * as React from 'react';
import { useBoardRealtime } from '../useBoardRealtime';
import type {
  WebSocketClient,
  WebSocketStatus,
  RealtimeEventHandler,
  WebSocketStatusHandler,
} from '@/lib/websocket/websocket-client';
import type { BoardDetail, RealtimeEnvelope, KanbanList, CardDto } from '@/types';

class MockWebSocketClient {
  status: WebSocketStatus = 'CONNECTED';
  eventListeners = new Map<string, Set<RealtimeEventHandler<unknown>>>();
  statusListeners = new Set<WebSocketStatusHandler>();
  joinedBoards = new Set<string>();

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
    const wildcard = this.eventListeners.get('*');
    if (wildcard) {
      for (const handler of wildcard) handler(envelope);
    }
  }

  emitStatus(status: WebSocketStatus): void {
    this.status = status;
    for (const handler of this.statusListeners) {
      handler(status);
    }
  }

  emitAck(ack: { event: 'JOINED_BOARD' | 'LEFT_BOARD'; boardId: string; occurredAt: string }): void {
    const specific = this.eventListeners.get(ack.event);
    if (specific) {
      for (const handler of specific) handler(ack as unknown as RealtimeEnvelope);
    }
  }
}

function createCardDto(overrides: Partial<CardDto> = {}): CardDto {
  return {
    id: 'card-default',
    boardId: 'board-1',
    listId: 'list-todo',
    cardKey: 'CARD-DEF',
    title: 'Card Title',
    description: null,
    startDate: null,
    dueDate: null,
    priority: 'MEDIUM',
    position: 1000,
    archivedAt: null,
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
    statusGroup: 'TODO',
    taskProgress: { total: 0, completed: 0, percent: 0 },
    ...overrides,
  };
}

function createInitialBoard(boardId = 'board-1'): BoardDetail {
  const lists: KanbanList[] = [
    {
      id: 'list-todo',
      boardId,
      name: 'To Do',
      position: 1000,
      category: 'TODO',
      status: 'ACTIVE',
      createdAt: '2026-10-20T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z',
      cards: [
        {
          id: 'card-1',
          boardId,
          listId: 'list-todo',
          code: 'CARD-001',
          title: 'Card 1',
          description: null,
          startDate: null,
          dueDate: null,
          priority: 'MEDIUM',
          position: 1000,
          status: 'ACTIVE',
          statusGroup: 'TODO',
          assignees: [],
          assigneeIds: [],
          labels: [],
          commentsCount: 2,
          attachmentsCount: 0,
          tasksCount: 0,
          completedTasksCount: 0,
          isBlocked: false,
          checklist: [],
          dependencies: [],
          attachments: [],
          comments: [],
          createdAt: '2026-10-20T10:00:00.000Z',
          updatedAt: '2026-10-20T10:00:00.000Z',
        },
      ],
    },
    {
      id: 'list-done',
      boardId,
      name: 'Done',
      position: 2000,
      category: 'DONE',
      status: 'ACTIVE',
      createdAt: '2026-10-20T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z',
      cards: [],
    },
  ];

  return {
    id: boardId,
    workspaceId: 'workspace-1',
    name: 'Test Board',
    status: 'ACTIVE',
    members: [],
    labels: [],
    lists,
    archivedListsCount: 0,
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
  };
}

function createMockSetBoard(initialBoard: BoardDetail | null) {
  let currentBoard: BoardDetail | null = initialBoard;
  const setBoard = vi.fn((updater: React.SetStateAction<BoardDetail | null>) => {
    currentBoard =
      typeof updater === 'function'
        ? (updater as (prev: BoardDetail | null) => BoardDetail | null)(currentBoard)
        : updater;
  }) as unknown as React.Dispatch<React.SetStateAction<BoardDetail | null>>;
  return {
    setBoard,
    getCurrentBoard: () => currentBoard,
    setCurrentBoard: (b: BoardDetail | null) => {
      currentBoard = b;
    },
  };
}

describe('useBoardRealtime Hardened Invariant Verification', () => {
  it('1. Snapshot starts before delete but returns after delete -> Tombstone prevents resurrection', () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const mock = createMockSetBoard(createInitialBoard(boardId));

    const { result } = renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard: mock.setBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    // Snapshot 1 starts at t0
    let gen1 = 0;
    act(() => {
      gen1 = result.current.beginSnapshot();
    });

    // CARD_DELETED arrives at t1
    act(() => {
      client.emitEvent({
        event: 'CARD_DELETED',
        eventId: 'evt-del-1',
        occurredAt: '2026-10-20T10:00:02.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: { cardId: 'card-1', listId: 'list-todo', deletedAt: '2026-10-20T10:00:02.000Z' },
      });
    });

    expect(result.current.isCardDeleted('card-1')).toBe(true);

    // Stale REST snapshot returns at t2 containing card-1 (because REST read DB before deletion committed)
    const staleSnapshotCards = [
      createCardDto({ id: 'card-1', title: 'Stale Card 1' }),
      createCardDto({ id: 'card-survivor', title: 'Survivor' }),
    ];
    const filtered = staleSnapshotCards.filter((c) => !result.current.isCardDeleted(c.id));
    expect(filtered.map((c) => c.id)).toEqual(['card-survivor']);

    // Commit snapshot
    act(() => {
      result.current.commitSnapshot(gen1, () => {
        const board = mock.getCurrentBoard();
        if (board) {
          board.lists[0]!.cards = [];
        }
      });
    });

    // Card 1 must not be resurrected
    expect(mock.getCurrentBoard()?.lists[0]?.cards.find((c) => c.id === 'card-1')).toBeUndefined();
  });

  it('2. Two snapshots return out of order -> Stale response is dropped', () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const mock = createMockSetBoard(createInitialBoard(boardId));

    const { result } = renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard: mock.setBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    let gen1 = 0;
    let gen2 = 0;

    act(() => {
      gen1 = result.current.beginSnapshot();
    });
    expect(gen1).toBe(1);

    act(() => {
      gen2 = result.current.beginSnapshot();
    });
    expect(gen2).toBe(2);

    // Snapshot 2 returns first and commits
    let snap2Committed = false;
    act(() => {
      snap2Committed = result.current.commitSnapshot(gen2, () => {
        const b = mock.getCurrentBoard();
        if (b) b.name = 'Fresh Board Name (Gen 2)';
      });
    });
    expect(snap2Committed).toBe(true);
    expect(mock.getCurrentBoard()?.name).toBe('Fresh Board Name (Gen 2)');

    // Snapshot 1 returns late and tries to commit
    let snap1Committed = false;
    act(() => {
      snap1Committed = result.current.commitSnapshot(gen1, () => {
        const b = mock.getCurrentBoard();
        if (b) b.name = 'Stale Board Name (Gen 1)';
      });
    });
    expect(snap1Committed).toBe(false);
    expect(mock.getCurrentBoard()?.name).toBe('Fresh Board Name (Gen 2)');
  });

  it('3. Out-of-order move and delete events -> Stale events are discarded', () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const mock = createMockSetBoard(createInitialBoard(boardId));

    renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard: mock.setBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    // Move 1: Move card-1 to list-done at t=10s
    act(() => {
      client.emitEvent({
        event: 'CARD_MOVED',
        eventId: 'evt-move-newer',
        occurredAt: '2026-10-20T10:00:10.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: {
          cardId: 'card-1',
          fromListId: 'list-todo',
          toListId: 'list-done',
          oldPosition: 1000,
          newPosition: 2000,
          updatedAt: '2026-10-20T10:00:10.000Z',
        },
      });
    });

    const doneCard = mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-done')?.cards[0];
    expect(doneCard?.id).toBe('card-1');

    // Move 2: Stale move arriving out-of-order at t=05s (moving back to list-todo)
    act(() => {
      client.emitEvent({
        event: 'CARD_MOVED',
        eventId: 'evt-move-older',
        occurredAt: '2026-10-20T10:00:05.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: {
          cardId: 'card-1',
          fromListId: 'list-done',
          toListId: 'list-todo',
          oldPosition: 2000,
          newPosition: 1000,
          updatedAt: '2026-10-20T10:00:05.000Z',
        },
      });
    });

    // Stale move must be rejected: card remains in list-done
    expect(mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-done')?.cards.length).toBe(1);
    expect(mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-todo')?.cards.length).toBe(0);

    // Delete card-1
    act(() => {
      client.emitEvent({
        event: 'CARD_DELETED',
        eventId: 'evt-del',
        occurredAt: '2026-10-20T10:00:20.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: { cardId: 'card-1', listId: 'list-done', deletedAt: '2026-10-20T10:00:20.000Z' },
      });
    });

    expect(mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-done')?.cards.length).toBe(0);

    // Delayed move for deleted card arrives -> must be ignored by tombstone
    act(() => {
      client.emitEvent({
        event: 'CARD_MOVED',
        eventId: 'evt-delayed-after-delete',
        occurredAt: '2026-10-20T10:00:15.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: {
          cardId: 'card-1',
          fromListId: 'list-done',
          toListId: 'list-todo',
          oldPosition: 2000,
          newPosition: 1000,
          updatedAt: '2026-10-20T10:00:15.000Z',
        },
      });
    });

    expect(mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-todo')?.cards.length).toBe(0);
    expect(mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-done')?.cards.length).toBe(0);
  });

  it('4. Snapshot fails while buffer has events -> Drains buffer, no events lost, buffer not stuck', () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const mock = createMockSetBoard(createInitialBoard(boardId));

    const { result } = renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard: mock.setBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    let genId = 0;
    act(() => {
      genId = result.current.beginSnapshot();
    });

    // Realtime events arrive while snapshot is in flight
    act(() => {
      client.emitEvent({
        event: 'CARD_CREATED',
        eventId: 'evt-created-fail',
        occurredAt: '2026-10-20T10:00:05.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: {
          card: createCardDto({
            id: 'card-survived-failure',
            boardId,
            listId: 'list-todo',
            title: 'I survived snapshot failure',
          }),
        },
      });
    });

    expect(result.current.getBufferedEventsCount()).toBe(1);

    // Snapshot fails (e.g. HTTP 500 error)
    act(() => {
      result.current.cancelSnapshot(genId);
    });

    // Buffer must be drained against current state, NOT lost or stuck!
    expect(result.current.getBufferedEventsCount()).toBe(0);
    const survivedCard = mock
      .getCurrentBoard()
      ?.lists[0]?.cards.find((c) => c.id === 'card-survived-failure');
    expect(survivedCard).toBeDefined();

    // Subsequent events process directly in live mode
    act(() => {
      client.emitEvent({
        event: 'CARD_ARCHIVED',
        eventId: 'evt-arch',
        occurredAt: '2026-10-20T10:00:06.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: { cardId: 'card-survived-failure', listId: 'list-todo', status: 'ARCHIVED', isArchived: true, updatedAt: '2026-10-20T10:00:06.000Z' },
      });
    });

    expect(
      mock.getCurrentBoard()?.lists[0]?.cards.find((c) => c.id === 'card-survived-failure')
    ).toBeUndefined();
  });

  it('5. Switching board during in-flight snapshot -> Old board response & events cannot mutate new board', () => {
    const client = new MockWebSocketClient();
    const boardAlpha = createInitialBoard('board-alpha');
    const boardBeta = createInitialBoard('board-beta');

    const mock = createMockSetBoard(boardAlpha);

    const { result, rerender } = renderHook(
      ({ boardId }) =>
        useBoardRealtime({
          boardId,
          setBoard: mock.setBoard,
          client: client as unknown as WebSocketClient,
        }),
      { initialProps: { boardId: 'board-alpha' } }
    );

    // Start snapshot on board-alpha
    let alphaGen = 0;
    act(() => {
      alphaGen = result.current.beginSnapshot();
    });

    // User switches to board-beta
    act(() => {
      mock.setCurrentBoard(boardBeta);
    });
    rerender({ boardId: 'board-beta' });

    // Delayed alpha snapshot tries to commit
    act(() => {
      const alphaCommitted = result.current.commitSnapshot(alphaGen, () => {
        mock.setCurrentBoard(boardAlpha);
      });
      expect(alphaCommitted).toBe(false);
    });

    // Current board must still be board-beta
    expect(mock.getCurrentBoard()?.id).toBe('board-beta');

    // Delayed WebSocket event from board-alpha arrives
    act(() => {
      client.emitEvent({
        event: 'CARD_CREATED',
        eventId: 'evt-alpha-delayed',
        occurredAt: '2026-10-20T10:00:01.000Z',
        boardId: 'board-alpha',
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: {
          card: createCardDto({ id: 'card-alpha-delayed', boardId: 'board-alpha', listId: 'list-todo' }),
        },
      });
    });

    // Board-beta must not contain alpha's card
    const hasAlphaCard = mock.getCurrentBoard()?.lists.some((l) =>
      l.cards.some((c) => c.id === 'card-alpha-delayed')
    );
    expect(hasAlphaCard).toBe(false);
  });

  it('6. Duplicate COMMENT_ADDED event with authoritative commentsCount -> No double count or duplicate comment', () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const mock = createMockSetBoard(createInitialBoard(boardId));

    renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard: mock.setBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    const commentPayload = {
      cardId: 'card-1',
      comment: {
        id: 'comm-exact-1',
        cardId: 'card-1',
        userId: 'u-1',
        content: 'Authoritative test comment',
        createdAt: '2026-10-20T10:00:05.000Z',
        updatedAt: '2026-10-20T10:00:05.000Z',
        user: { id: 'u-1', fullName: 'Alice', email: 'alice@test.com', avatarUrl: null },
      },
      commentsCount: 3,
    };

    // First arrival
    act(() => {
      client.emitEvent({
        event: 'COMMENT_ADDED',
        eventId: 'evt-comm-1',
        occurredAt: '2026-10-20T10:00:05.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: commentPayload,
      });
    });

    const cardAfterFirst = mock.getCurrentBoard()?.lists[0]?.cards.find((c) => c.id === 'card-1');
    expect(cardAfterFirst?.commentsCount).toBe(3);
    expect(cardAfterFirst?.comments?.length).toBe(1);

    // Duplicate delivery with same event data
    act(() => {
      client.emitEvent({
        event: 'COMMENT_ADDED',
        eventId: 'evt-comm-1-dup',
        occurredAt: '2026-10-20T10:00:05.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: commentPayload,
      });
    });

    const cardAfterSecond = mock.getCurrentBoard()?.lists[0]?.cards.find((c) => c.id === 'card-1');
    // Must remain 3, NOT incremented to 4 or doubled
    expect(cardAfterSecond?.commentsCount).toBe(3);
    // Comments array must remain exactly 1, NOT duplicated
    expect(cardAfterSecond?.comments?.length).toBe(1);
  });

  it('7. Reconnect triggers resync appropriately upon receiving JOINED_BOARD ACK without duplicate calls', async () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const setBoard = vi.fn();
    const reloadBoard = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 10)));

    const { result } = renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard,
        reloadBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    expect(result.current.wsStatus).toBe('CONNECTED');
    // Initial mount does not trigger reloadBoard
    expect(reloadBoard).toHaveBeenCalledTimes(0);

    // Disconnect -> Reconnecting
    act(() => {
      client.emitStatus('RECONNECTING');
    });
    expect(reloadBoard).toHaveBeenCalledTimes(0);

    // Socket re-establishes CONNECTED: resync must wait for server room confirmation ACK
    act(() => {
      client.emitStatus('CONNECTED');
    });
    expect(reloadBoard).toHaveBeenCalledTimes(0);

    // Server sends JOINED_BOARD ACK
    act(() => {
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId,
        occurredAt: '2026-10-20T10:00:00.000Z',
      });
    });
    expect(reloadBoard).toHaveBeenCalledTimes(1);

    // Multiple rapid CONNECTED or JOINED_BOARD events while reload is in flight do NOT spawn competing parallel reloads
    act(() => {
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId,
        occurredAt: '2026-10-20T10:00:00.000Z',
      });
    });
    expect(reloadBoard).toHaveBeenCalledTimes(1);
  });

  it('8. In-flight snapshot has card X deleted, 500 subsequent deletions evict X from tombstones -> Snapshot replay via drain buffer prevents resurrection', () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const mock = createMockSetBoard(createInitialBoard(boardId));

    const { result } = renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard: mock.setBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    // 1. Snapshot S starts
    let gen1 = 0;
    act(() => {
      gen1 = result.current.beginSnapshot();
    });

    // 2. Receive deletion for card-1 while snapshot is in-flight
    act(() => {
      client.emitEvent({
        event: 'CARD_DELETED',
        eventId: 'evt-del-x',
        occurredAt: '2026-10-20T10:00:01.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: { cardId: 'card-1', listId: 'list-todo', deletedAt: '2026-10-20T10:00:01.000Z' },
      });
    });

    // Immediately after deletion, tombstone exists
    expect(result.current.isCardDeleted('card-1')).toBe(true);

    // 3. Receive 500 more deletions to evict card-1 from tombstones (MAX_SESSION_TOMBSTONES = 500)
    act(() => {
      for (let i = 1; i <= 500; i++) {
        client.emitEvent({
          event: 'CARD_DELETED',
          eventId: `evt-del-evict-${i}`,
          occurredAt: '2026-10-20T10:00:02.000Z',
          boardId,
          actor: { userId: 'u-1', fullName: 'Alice' },
          data: { cardId: `card-evict-${i}`, listId: 'list-todo', deletedAt: '2026-10-20T10:00:02.000Z' },
        });
      }
    });

    // Verify card-1 was evicted from tombstones due to FIFO capacity limit
    expect(result.current.isCardDeleted('card-1')).toBe(false);

    // 4. S is still the current generation
    expect(result.current.isCurrentGeneration(gen1)).toBe(true);

    // 5. Apply snapshot that contains card-1 (simulating DB read before deletion), then drain buffer
    act(() => {
      result.current.commitSnapshot(gen1, () => {
        const board = mock.getCurrentBoard();
        if (board) {
          // Explicitly restore card-1 in snapshot payload
          board.lists[0]!.cards = [
            {
              id: 'card-1',
              boardId,
              listId: 'list-todo',
              code: 'CARD-001',
              title: 'Card 1 (from stale snapshot)',
              description: null,
              startDate: null,
              dueDate: null,
              priority: 'MEDIUM',
              position: 1000,
              status: 'ACTIVE',
              statusGroup: 'TODO',
              assignees: [],
              assigneeIds: [],
              labels: [],
              commentsCount: 0,
              attachmentsCount: 0,
              tasksCount: 0,
              completedTasksCount: 0,
              isBlocked: false,
              checklist: [],
              dependencies: [],
              attachments: [],
              comments: [],
              createdAt: '2026-10-20T10:00:00.000Z',
              updatedAt: '2026-10-20T10:00:00.000Z',
            },
            {
              id: 'card-survivor',
              boardId,
              listId: 'list-todo',
              code: 'CARD-SURVIVOR',
              title: 'Survivor Card',
              description: null,
              startDate: null,
              dueDate: null,
              priority: 'MEDIUM',
              position: 2000,
              status: 'ACTIVE',
              statusGroup: 'TODO',
              assignees: [],
              assigneeIds: [],
              labels: [],
              commentsCount: 0,
              attachmentsCount: 0,
              tasksCount: 0,
              completedTasksCount: 0,
              isBlocked: false,
              checklist: [],
              dependencies: [],
              attachments: [],
              comments: [],
              createdAt: '2026-10-20T10:00:00.000Z',
              updatedAt: '2026-10-20T10:00:00.000Z',
            },
          ];
        }
      });
    });

    // 6. Assert final state: card-1 is NOT resurrected because buffered CARD_DELETED was drained
    const finalCards = mock.getCurrentBoard()?.lists[0]?.cards ?? [];
    expect(finalCards.find((c) => c.id === 'card-1')).toBeUndefined();
    expect(finalCards.find((c) => c.id === 'card-survivor')).toBeDefined();
  });

  it('9. CARD_UPDATED and CARD_MOVED discard events with invalid, missing, empty, or malformed timestamps without mutating state', () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const mock = createMockSetBoard(createInitialBoard(boardId));

    renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard: mock.setBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    const initialCard = mock.getCurrentBoard()?.lists[0]?.cards[0];
    expect(initialCard?.title).toBe('Card 1');
    expect(initialCard?.listId).toBe('list-todo');
    expect(initialCard?.position).toBe(1000);

    const invalidTimestamps = [null, undefined, '', '   ', 'not-a-valid-date', 12345678, {}];

    // Test CARD_UPDATED with each invalid timestamp
    for (let i = 0; i < invalidTimestamps.length; i++) {
      const badTs = invalidTimestamps[i];
      act(() => {
        client.emitEvent({
          event: 'CARD_UPDATED',
          eventId: `evt-upd-bad-${i}`,
          occurredAt: '2026-10-20T10:00:05.000Z',
          boardId,
          actor: { userId: 'u-1', fullName: 'Alice' },
          data: {
            card: createCardDto({
              id: 'card-1',
              title: `Malicious Title ${i}`,
              updatedAt: badTs as unknown as string,
            }),
          },
        });
      });

      // Card must NOT be modified
      const currentCard = mock.getCurrentBoard()?.lists[0]?.cards[0];
      expect(currentCard?.title).toBe('Card 1');
    }

    // Test CARD_MOVED with each invalid timestamp
    for (let i = 0; i < invalidTimestamps.length; i++) {
      const badTs = invalidTimestamps[i];
      act(() => {
        client.emitEvent({
          event: 'CARD_MOVED',
          eventId: `evt-mov-bad-${i}`,
          occurredAt: '2026-10-20T10:00:05.000Z',
          boardId,
          actor: { userId: 'u-1', fullName: 'Alice' },
          data: {
            cardId: 'card-1',
            fromListId: 'list-todo',
            toListId: 'list-done',
            oldPosition: 1000,
            newPosition: 5000,
            updatedAt: badTs as unknown as string,
          },
        });
      });

      // Card must NOT be moved
      expect(mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-todo')?.cards.length).toBe(1);
      expect(mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-done')?.cards.length).toBe(0);
    }

    // Now test a VALID event: CARD_UPDATED and CARD_MOVED work normally
    act(() => {
      client.emitEvent({
        event: 'CARD_UPDATED',
        eventId: 'evt-upd-valid',
        occurredAt: '2026-10-20T10:00:15.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: {
          card: createCardDto({
            id: 'card-1',
            title: 'Valid Updated Title',
            updatedAt: '2026-10-20T10:00:15.000Z',
          }),
        },
      });
    });
    expect(mock.getCurrentBoard()?.lists[0]?.cards[0]?.title).toBe('Valid Updated Title');

    act(() => {
      client.emitEvent({
        event: 'CARD_MOVED',
        eventId: 'evt-mov-valid',
        occurredAt: '2026-10-20T10:00:20.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: {
          cardId: 'card-1',
          fromListId: 'list-todo',
          toListId: 'list-done',
          oldPosition: 1000,
          newPosition: 3000,
          updatedAt: '2026-10-20T10:00:20.000Z',
        },
      });
    });
    expect(mock.getCurrentBoard()?.lists.find((l) => l.id === 'list-done')?.cards[0]?.id).toBe('card-1');
  });

  it('10. CARD_UPDATED accepts valid event even if current card timestamp is missing or invalid', () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const initialBoard = createInitialBoard(boardId);
    // Explicitly corrupt local card's updatedAt
    initialBoard.lists[0]!.cards[0]!.updatedAt = 'corrupted-timestamp';
    const mock = createMockSetBoard(initialBoard);

    renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard: mock.setBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    // Valid update event arrives
    act(() => {
      client.emitEvent({
        event: 'CARD_UPDATED',
        eventId: 'evt-upd-recover',
        occurredAt: '2026-10-20T10:00:05.000Z',
        boardId,
        actor: { userId: 'u-1', fullName: 'Alice' },
        data: {
          card: createCardDto({
            id: 'card-1',
            title: 'Recovered Title',
            updatedAt: '2026-10-20T10:00:05.000Z',
          }),
        },
      });
    });

    // Local card should accept the valid update rather than silently dropping it due to NaN comparison
    expect(mock.getCurrentBoard()?.lists[0]?.cards[0]?.title).toBe('Recovered Title');
  });

  it('11. Delayed JOINED_BOARD prevents premature resync and protects against mutations lost in the join window', async () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const setBoard = vi.fn();
    const reloadBoard = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard,
        reloadBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    // Connection drops and starts reconnecting
    act(() => {
      client.emitStatus('RECONNECTING');
    });

    // Socket connects at network layer
    act(() => {
      client.emitStatus('CONNECTED');
    });

    // CRITICAL: reloadBoard must NOT have fired yet because Backend has not confirmed JOINED_BOARD
    expect(reloadBoard).toHaveBeenCalledTimes(0);

    // An ACK for a DIFFERENT board arrives (e.g. from an old pending subscription) -> must be ignored
    act(() => {
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId: 'other-board-uuid',
        occurredAt: '2026-10-20T10:00:00.000Z',
      });
    });
    expect(reloadBoard).toHaveBeenCalledTimes(0);

    // Finally, the server completes authorization and emits JOINED_BOARD for board-1
    act(() => {
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId,
        occurredAt: '2026-10-20T10:00:01.000Z',
      });
    });

    // NOW resync is safely triggered
    expect(reloadBoard).toHaveBeenCalledTimes(1);
  });

  it('12. Second reconnect while reload A is in-flight queues resync B without parallel execution or duplicate loops', async () => {
    const client = new MockWebSocketClient();
    const boardId = 'board-1';
    const setBoard = vi.fn();

    let resolveA!: () => void;
    const promiseA = new Promise<void>((res) => {
      resolveA = res;
    });

    let resolveB!: () => void;
    const promiseB = new Promise<void>((res) => {
      resolveB = res;
    });

    let reloadCount = 0;
    const reloadBoard = vi.fn().mockImplementation(() => {
      reloadCount++;
      if (reloadCount === 1) return promiseA;
      return promiseB;
    });

    renderHook(() =>
      useBoardRealtime({
        boardId,
        setBoard,
        reloadBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    // Reconnect 1 occurs
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId,
        occurredAt: '2026-10-20T10:00:01.000Z',
      });
    });

    // Reload A should be triggered and in-flight
    expect(reloadBoard).toHaveBeenCalledTimes(1);

    // Reconnect 2 occurs while reload A is still in-flight
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId,
        occurredAt: '2026-10-20T10:00:02.000Z',
      });
    });

    // Duplicate ACK arrives during reload A
    act(() => {
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId,
        occurredAt: '2026-10-20T10:00:02.000Z',
      });
    });

    // Reload B must NOT have run concurrently with Reload A
    expect(reloadBoard).toHaveBeenCalledTimes(1);

    // Now reload A completes
    await act(async () => {
      resolveA();
    });

    // Reload B should have been triggered automatically after Reload A finished
    expect(reloadBoard).toHaveBeenCalledTimes(2);

    // Duplicate ACK arriving after Reload B started should not trigger a third reload
    act(() => {
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId,
        occurredAt: '2026-10-20T10:00:03.000Z',
      });
    });

    await act(async () => {
      resolveB();
    });

    // Still exactly 2 reloads total
    expect(reloadBoard).toHaveBeenCalledTimes(2);
  });

  it('13. Switching board or unmounting during in-flight reload cancels pending queued reconnect resync', async () => {
    const client = new MockWebSocketClient();
    const setBoard = vi.fn();

    let resolveAlpha!: () => void;
    const promiseAlpha = new Promise<void>((res) => {
      resolveAlpha = res;
    });

    const reloadBoard = vi.fn().mockImplementation(() => promiseAlpha);

    const { rerender } = renderHook(
      ({ boardId }) =>
        useBoardRealtime({
          boardId,
          setBoard,
          reloadBoard,
          client: client as unknown as WebSocketClient,
        }),
      { initialProps: { boardId: 'board-alpha' } }
    );

    // Reconnect on board-alpha
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId: 'board-alpha',
        occurredAt: '2026-10-20T10:00:01.000Z',
      });
    });

    expect(reloadBoard).toHaveBeenCalledTimes(1);

    // Reconnect 2 on board-alpha while reload is in-flight
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId: 'board-alpha',
        occurredAt: '2026-10-20T10:00:02.000Z',
      });
    });

    expect(reloadBoard).toHaveBeenCalledTimes(1);

    // Switch board to board-beta before reloadAlpha resolves
    rerender({ boardId: 'board-beta' });

    // Now reloadAlpha resolves
    await act(async () => {
      resolveAlpha();
    });

    // Reload B must NOT be triggered for board-alpha because board switched!
    expect(reloadBoard).toHaveBeenCalledTimes(1);
  });

  it('14. Unmounting hook during in-flight reload cancels pending queued reconnect resync', async () => {
    const client = new MockWebSocketClient();
    const setBoard = vi.fn();

    let resolveA!: () => void;
    const promiseA = new Promise<void>((res) => {
      resolveA = res;
    });

    const reloadBoard = vi.fn().mockImplementation(() => promiseA);

    const { unmount } = renderHook(() =>
      useBoardRealtime({
        boardId: 'board-1',
        setBoard,
        reloadBoard,
        client: client as unknown as WebSocketClient,
      })
    );

    // Reconnect 1
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId: 'board-1',
        occurredAt: '2026-10-20T10:00:01.000Z',
      });
    });

    expect(reloadBoard).toHaveBeenCalledTimes(1);

    // Reconnect 2 queued
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId: 'board-1',
        occurredAt: '2026-10-20T10:00:02.000Z',
      });
    });

    // Unmount before resolve
    unmount();

    await act(async () => {
      resolveA();
    });

    // Must still be 1, no second reload fired after unmount
    expect(reloadBoard).toHaveBeenCalledTimes(1);
  });

  it('15. Board Alpha reload completion does not corrupt Board Beta in-flight reload state or permit parallel Beta reloads', async () => {
    const client = new MockWebSocketClient();

    let resolveAlpha1!: () => void;
    const promiseAlpha1 = new Promise<void>((res) => {
      resolveAlpha1 = res;
    });

    let resolveBeta1!: () => void;
    const promiseBeta1 = new Promise<void>((res) => {
      resolveBeta1 = res;
    });

    let resolveBeta2!: () => void;
    const promiseBeta2 = new Promise<void>((res) => {
      resolveBeta2 = res;
    });

    const alphaReloads: number[] = [];
    const betaReloads: number[] = [];

    let currentBoardId = 'board-alpha';

    const reloadBoard = vi.fn().mockImplementation(() => {
      if (currentBoardId === 'board-alpha') {
        alphaReloads.push(Date.now());
        return promiseAlpha1;
      } else {
        betaReloads.push(Date.now());
        if (betaReloads.length === 1) {
          return promiseBeta1;
        }
        return promiseBeta2;
      }
    });

    const setBoard = vi.fn();

    const { rerender } = renderHook(
      ({ boardId }) =>
        useBoardRealtime({
          boardId,
          setBoard,
          reloadBoard,
          client: client as unknown as WebSocketClient,
        }),
      { initialProps: { boardId: 'board-alpha' } }
    );

    // 1. Board Alpha reconnect, nhận ACK và bắt đầu reload Alpha; giữ promise chưa hoàn tất.
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId: 'board-alpha',
        occurredAt: '2026-10-20T10:00:01.000Z',
      });
    });

    expect(alphaReloads.length).toBe(1);
    expect(betaReloads.length).toBe(0);

    // 2. Chuyển sang board Beta.
    currentBoardId = 'board-beta';
    rerender({ boardId: 'board-beta' });

    // 3. Beta reconnect, nhận ACK và bắt đầu reload Beta; giữ promise chưa hoàn tất.
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId: 'board-beta',
        occurredAt: '2026-10-20T10:00:02.000Z',
      });
    });

    expect(alphaReloads.length).toBe(1);
    expect(betaReloads.length).toBe(1);

    // 4. Hoàn tất promise Alpha.
    await act(async () => {
      resolveAlpha1();
    });

    // 5. Beta trải qua một chu kỳ reconnect nữa và nhận ACK đúng board.
    act(() => {
      client.emitStatus('RECONNECTING');
      client.emitStatus('CONNECTED');
      client.emitAck({
        event: 'JOINED_BOARD',
        boardId: 'board-beta',
        occurredAt: '2026-10-20T10:00:03.000Z',
      });
    });

    // 6. Xác nhận chưa có reload Beta thứ hai chạy song song với reload Beta đang chờ.
    expect(betaReloads.length).toBe(1);

    // 7. Hoàn tất reload Beta đầu tiên.
    await act(async () => {
      resolveBeta1();
    });

    // 8. Xác nhận yêu cầu pending tạo đúng một lượt reload Beta tiếp theo.
    expect(betaReloads.length).toBe(2);

    // Cleanup Beta 2
    await act(async () => {
      resolveBeta2();
    });
    expect(betaReloads.length).toBe(2);
    expect(alphaReloads.length).toBe(1);
  });
});
