import * as React from 'react';
import { webSocketClient, type WebSocketClient, type WebSocketStatus } from '@/lib/websocket/websocket-client';
import { mapCardDtoToKanbanCard, mapCommentDtoToCardComment } from '@/mappers/card.mapper';
import type {
  BoardDetail,
  BoardMember,
  CommentDto,
  KanbanCard,
  CardComment,
  RealtimeEnvelope,
  CardCreatedPayload,
  CardUpdatedPayload,
  CardMovedPayload,
  CardArchivedPayload,
  CardDeletedPayload,
  ListReorderedPayload,
  CommentAddedPayload,
} from '@/types';

export interface UseBoardRealtimeOptions {
  boardId?: string;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
  reloadBoard?: () => Promise<void>;
  client?: WebSocketClient;
}

export interface UseBoardRealtimeReturn {
  wsStatus: WebSocketStatus;
  isLive: boolean;
  beginSnapshot: () => number;
  commitSnapshot: (generationId: number, applySnapshot: () => void) => boolean;
  cancelSnapshot: (generationId: number) => void;
  isCurrentGeneration: (generationId: number) => boolean;
  isCardDeleted: (cardId: string) => boolean;
  getBufferedEventsCount: () => number;
  getTombstoneCount: () => number;
}

const MAX_SESSION_TOMBSTONES = 500;

function parseValidTimestamp(ts: unknown): number | null {
  if (typeof ts !== 'string' || ts.trim() === '') return null;
  const parsed = new Date(ts).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

export function useBoardRealtime({
  boardId,
  setBoard,
  reloadBoard,
  client = webSocketClient,
}: UseBoardRealtimeOptions): UseBoardRealtimeReturn {
  const [wsStatus, setWsStatus] = React.useState<WebSocketStatus>(() => client.getStatus());
  const [isBoardJoined, setIsBoardJoined] = React.useState(false);

  // Snapshot generation tracking & atomic buffering
  const snapshotGenerationRef = React.useRef(0);
  const isSnapshotLoadingRef = React.useRef(false);
  const eventBufferRef = React.useRef<RealtimeEnvelope[]>([]);

  // Session-bound Delete Tombstones
  // Maps cardId -> generationId at which deletion was recorded
  const deletedTombstonesRef = React.useRef<Map<string, number>>(new Map());

  // Track reloadBoard ref to avoid stale closures in reconnect listener
  const reloadBoardRef = React.useRef(reloadBoard);
  React.useEffect(() => {
    reloadBoardRef.current = reloadBoard;
  }, [reloadBoard]);

  const recordTombstone = React.useCallback((cardId: string, generationId: number) => {
    const map = deletedTombstonesRef.current;
    if (map.size >= MAX_SESSION_TOMBSTONES) {
      // Evict oldest tombstone to prevent unbounded memory growth in long sessions
      const firstKey = map.keys().next().value;
      if (firstKey !== undefined) {
        map.delete(firstKey);
      }
    }
    map.set(cardId, generationId);
  }, []);

  const isCardDeleted = React.useCallback((cardId: string): boolean => {
    return deletedTombstonesRef.current.has(cardId);
  }, []);

  const isCurrentGeneration = React.useCallback((generationId: number): boolean => {
    return generationId === snapshotGenerationRef.current;
  }, []);

  const getBufferedEventsCount = React.useCallback((): number => {
    return eventBufferRef.current.length;
  }, []);

  const getTombstoneCount = React.useCallback((): number => {
    return deletedTombstonesRef.current.size;
  }, []);

  const applyRealtimeEvent = React.useCallback((envelope: RealtimeEnvelope) => {
    // Board isolation check: ignore events not addressed to this board
    if (boardId && envelope.boardId !== boardId) return;

    switch (envelope.event) {
      case 'CARD_CREATED': {
        const createdCardDto = (envelope.data as CardCreatedPayload)?.card;
        if (!createdCardDto) return;

        // Protection: if card is tombstoned, discard creation to prevent resurrection
        if (deletedTombstonesRef.current.has(createdCardDto.id)) return;

        setBoard((prev) => {
          if (!prev || prev.id !== boardId) return prev;

          // Idempotency: if card already exists, update it rather than duplicating
          const exists = prev.lists.some((list) =>
            list.cards.some((c) => c.id === createdCardDto.id)
          );
          if (exists) {
            return {
              ...prev,
              lists: prev.lists.map((list) => ({
                ...list,
                cards: list.cards.map((c) =>
                  c.id === createdCardDto.id
                    ? mapCardDtoToKanbanCard(createdCardDto, c, prev.members)
                    : c
                ),
              })),
            };
          }

          const mappedCard = mapCardDtoToKanbanCard(createdCardDto, undefined, prev.members);
          return {
            ...prev,
            lists: prev.lists.map((list) => {
              if (list.id !== mappedCard.listId) return list;
              const newCards = [...list.cards, mappedCard].sort((a, b) => {
                if (a.position !== b.position) return a.position - b.position;
                return a.id.localeCompare(b.id);
              });
              return { ...list, cards: newCards };
            }),
          };
        });
        break;
      }

      case 'CARD_UPDATED': {
        const updatedCardDto = (envelope.data as CardUpdatedPayload)?.card;
        if (!updatedCardDto) return;

        // Timestamp validation: event timestamp must be a non-empty string parsing to a finite time
        const eventTs = parseValidTimestamp(updatedCardDto.updatedAt);
        if (eventTs === null) return;

        // Protection: if card was deleted, discard update
        if (deletedTombstonesRef.current.has(updatedCardDto.id)) return;

        setBoard((prev) => {
          if (!prev || prev.id !== boardId) return prev;
          return {
            ...prev,
            lists: prev.lists.map((list) => ({
              ...list,
              cards: list.cards.map((c) => {
                if (c.id !== updatedCardDto.id) return c;
                // Timestamp ordering check: if local card has a valid timestamp newer than event, discard stale update
                const currentTs = parseValidTimestamp(c.updatedAt);
                if (currentTs !== null && currentTs > eventTs) return c;
                return mapCardDtoToKanbanCard(updatedCardDto, c, prev.members);
              }),
            })),
          };
        });
        break;
      }

      case 'CARD_MOVED': {
        const { cardId, toListId, newPosition, updatedAt } = envelope.data as CardMovedPayload;
        if (!cardId || !toListId) return;

        // Timestamp validation: event timestamp must be a non-empty string parsing to a finite time
        const eventTs = parseValidTimestamp(updatedAt);
        if (eventTs === null) return;

        // Protection: if card was deleted, discard move
        if (deletedTombstonesRef.current.has(cardId)) return;

        setBoard((prev) => {
          if (!prev || prev.id !== boardId) return prev;

          let movingCard: KanbanCard | null = null;
          for (const list of prev.lists) {
            const found = list.cards.find((c) => c.id === cardId);
            if (found) {
              movingCard = found;
              break;
            }
          }

          if (!movingCard) return prev;

          // Timestamp ordering check: if local card has a valid timestamp newer than move event, discard stale move
          const currentTs = parseValidTimestamp(movingCard.updatedAt);
          if (currentTs !== null && currentTs > eventTs) return prev;

          const updatedCard: KanbanCard = {
            ...movingCard,
            listId: toListId,
            position: newPosition,
            updatedAt: updatedAt || movingCard.updatedAt,
          };

          return {
            ...prev,
            lists: prev.lists.map((list) => {
              // Strip card from this list
              const withoutCard = list.cards.filter((c) => c.id !== cardId);

              if (list.id === toListId) {
                const withInserted = [
                  ...withoutCard,
                  { ...updatedCard, statusGroup: list.category },
                ].sort((a, b) => {
                  if (a.position !== b.position) return a.position - b.position;
                  return a.id.localeCompare(b.id);
                });
                return { ...list, cards: withInserted };
              }

              return { ...list, cards: withoutCard };
            }),
          };
        });
        break;
      }

      case 'CARD_ARCHIVED': {
        const { cardId } = envelope.data as CardArchivedPayload;
        if (!cardId) return;

        setBoard((prev) => {
          if (!prev || prev.id !== boardId) return prev;
          return {
            ...prev,
            lists: prev.lists.map((list) => ({
              ...list,
              cards: list.cards.filter((c) => c.id !== cardId),
            })),
          };
        });
        break;
      }

      case 'CARD_DELETED': {
        const { cardId } = envelope.data as CardDeletedPayload;
        if (!cardId) return;

        // Record tombstone immediately in session map
        recordTombstone(cardId, snapshotGenerationRef.current);

        setBoard((prev) => {
          if (!prev || prev.id !== boardId) return prev;
          return {
            ...prev,
            lists: prev.lists.map((list) => ({
              ...list,
              cards: list.cards.filter((c) => c.id !== cardId),
            })),
          };
        });
        break;
      }

      case 'LIST_REORDERED': {
        const { listId, newPosition, updatedAt } = envelope.data as ListReorderedPayload;
        if (!listId || newPosition === undefined) return;

        setBoard((prev) => {
          if (!prev || prev.id !== boardId) return prev;
          const reorderedLists = prev.lists
            .map((list) =>
              list.id === listId
                ? { ...list, position: newPosition, updatedAt: updatedAt || list.updatedAt }
                : list
            )
            .sort((a, b) => {
              if (a.position !== b.position) return a.position - b.position;
              return a.id.localeCompare(b.id);
            });

          return { ...prev, lists: reorderedLists };
        });
        break;
      }

      case 'COMMENT_ADDED': {
        const { cardId, comment, commentsCount } = envelope.data as CommentAddedPayload;
        if (!cardId) return;

        setBoard((prev) => {
          if (!prev || prev.id !== boardId) return prev;
          return {
            ...prev,
            lists: prev.lists.map((list) => ({
              ...list,
              cards: list.cards.map((c) => {
                if (c.id !== cardId) return c;

                const currentComments = c.comments ?? [];
                const commentExists = comment?.id
                  ? currentComments.some((item) => item.id === comment.id)
                  : false;

                // Format comment to domain CardComment model if needed
                const commentWithAuthor = comment as unknown as { author?: BoardMember };
                const mappedComment: CardComment | undefined = comment
                  ? (commentWithAuthor.author
                      ? (comment as unknown as CardComment)
                      : mapCommentDtoToCardComment(comment as unknown as CommentDto, prev.members))
                  : undefined;

                // Deduplicate comment payload
                const nextComments =
                  mappedComment && !commentExists ? [...currentComments, mappedComment] : currentComments;

                // Authoritative count handling:
                // If commentsCount is provided by Backend, use it strictly.
                // If comment already exists (duplicate delivery), DO NOT increment count.
                let nextCount: number;
                if (typeof commentsCount === 'number') {
                  nextCount = commentsCount;
                } else if (commentExists) {
                  nextCount = c.commentsCount ?? 0;
                } else {
                  nextCount = (c.commentsCount ?? 0) + 1;
                }

                return {
                  ...c,
                  commentsCount: nextCount,
                  comments: nextComments,
                };
              }),
            })),
          };
        });
        break;
      }
    }
  }, [boardId, setBoard, recordTombstone]);

  const beginSnapshot = React.useCallback((): number => {
    const nextGen = ++snapshotGenerationRef.current;
    isSnapshotLoadingRef.current = true;
    return nextGen;
  }, []);

  const commitSnapshot = React.useCallback(
    (generationId: number, applySnapshot: () => void): boolean => {
      // Stale generation check: reject snapshot responses that arrived out of order
      if (generationId !== snapshotGenerationRef.current) {
        return false;
      }

      // Synchronously apply snapshot data
      applySnapshot();

      // Atomic drain loop: process all buffered events synchronously without async gap
      while (eventBufferRef.current.length > 0) {
        const envelope = eventBufferRef.current.shift()!;
        applyRealtimeEvent(envelope);
      }

      isSnapshotLoadingRef.current = false;
      return true;
    },
    [applyRealtimeEvent]
  );

  const cancelSnapshot = React.useCallback(
    (generationId: number): void => {
      if (generationId === snapshotGenerationRef.current) {
        // Drain buffered events against current board state so no events are lost on snapshot error
        while (eventBufferRef.current.length > 0) {
          const envelope = eventBufferRef.current.shift()!;
          applyRealtimeEvent(envelope);
        }
        isSnapshotLoadingRef.current = false;
      }
    },
    [applyRealtimeEvent]
  );

  const prevBoardIdRef = React.useRef<string | undefined>(undefined);

  // Board Room subscription and Event Listening
  React.useEffect(() => {
    if (!boardId) return;

    const isBoardSwitch =
      prevBoardIdRef.current !== undefined && prevBoardIdRef.current !== boardId;
    prevBoardIdRef.current = boardId;

    if (isBoardSwitch) {
      // Reset buffer and tombstones when switching to a different board,
      // and bump generation counter so any pending snapshot from the old board is discarded.
      eventBufferRef.current = [];
      deletedTombstonesRef.current.clear();
      isSnapshotLoadingRef.current = false;
      snapshotGenerationRef.current += 1;
    }

    // Join room
    client.joinBoard(boardId);

    // Subscribe to all board events
    const unsubscribeEvents = client.onEvent('*', (envelope) => {
      if (envelope.boardId !== boardId) return;

      if (isSnapshotLoadingRef.current) {
        // If event is deletion, record tombstone immediately to protect in-flight snapshot
        if (envelope.event === 'CARD_DELETED') {
          const cardId = (envelope.data as CardDeletedPayload)?.cardId;
          if (cardId) {
            recordTombstone(cardId, snapshotGenerationRef.current);
          }
        }
        eventBufferRef.current.push(envelope);
      } else {
        applyRealtimeEvent(envelope);
      }
    });

    const tombstones = deletedTombstonesRef.current;
    const buffer = eventBufferRef.current;
    return () => {
      unsubscribeEvents();
      client.leaveBoard(boardId);
      buffer.length = 0;
      tombstones.clear();
    };
  }, [boardId, client, applyRealtimeEvent, recordTombstone]);

  // Track status and trigger reload on reconnect only after server confirms room subscription
  const prevStatusRef = React.useRef<WebSocketStatus>(client.getStatus());
  const isReconnectingRef = React.useRef(false);
  const isReloadingOnReconnectRef = React.useRef(false);
  const hasPendingReconnectResyncRef = React.useRef(false);

  React.useEffect(() => {
    let isActive = true;

    const performReconnectResync = () => {
      if (!isActive || !reloadBoardRef.current || isReloadingOnReconnectRef.current) {
        return;
      }

      isReloadingOnReconnectRef.current = true;
      hasPendingReconnectResyncRef.current = false;

      let reloadPromise: unknown;
      try {
        reloadPromise = reloadBoardRef.current();
      } catch {
        reloadPromise = Promise.resolve();
      }

      Promise.resolve(reloadPromise)
        .catch(() => {})
        .finally(() => {
          if (!isActive) return;
          isReloadingOnReconnectRef.current = false;
          if (hasPendingReconnectResyncRef.current) {
            hasPendingReconnectResyncRef.current = false;
            performReconnectResync();
          }
        });
    };

    const unsubscribeStatus = client.onStatusChange((status) => {
      setWsStatus(status);

      const prev = prevStatusRef.current;
      prevStatusRef.current = status;

      if (status !== 'CONNECTED') {
        setIsBoardJoined(false);
      }

      // Reconnect detected: mark pending reconnect resync
      if (prev === 'RECONNECTING' && status === 'CONNECTED') {
        isReconnectingRef.current = true;
      }
    });

    // Listen for server ACK confirming socket is registered in the board room
    const unsubscribeJoined = client.onEvent('JOINED_BOARD', (ack) => {
      const ackBoardId = (ack as unknown as { boardId?: string })?.boardId;
      if (boardId && ackBoardId !== boardId) return;

      if (isActive) {
        setIsBoardJoined(true);
      }

      if (isReconnectingRef.current) {
        isReconnectingRef.current = false;
        if (isReloadingOnReconnectRef.current) {
          hasPendingReconnectResyncRef.current = true;
        } else {
          performReconnectResync();
        }
      }
    });

    const unsubscribeError = client.onEvent('ERROR', () => {
      if (isActive) {
        setIsBoardJoined(false);
      }
    });

    return () => {
      isActive = false;
      setIsBoardJoined(false);
      isReconnectingRef.current = false;
      hasPendingReconnectResyncRef.current = false;
      isReloadingOnReconnectRef.current = false;
      unsubscribeStatus();
      unsubscribeJoined();
      unsubscribeError();
    };
  }, [client, boardId]);

  const isLive = wsStatus === 'CONNECTED' && isBoardJoined;

  return {
    wsStatus,
    isLive,
    beginSnapshot,
    commitSnapshot,
    cancelSnapshot,
    isCurrentGeneration,
    isCardDeleted,
    getBufferedEventsCount,
    getTombstoneCount,
  };
}
