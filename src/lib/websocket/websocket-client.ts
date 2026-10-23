import { useAuthStore, registerOnClearAuth } from '@/stores/auth.store';
import type {
  RealtimeEnvelope,
  RealtimeEventType,
  ClientMessage,
  WebSocketStatus,
} from '@/types/websocket';

export type { WebSocketStatus };

export type RealtimeEventHandler<T = unknown> = (envelope: RealtimeEnvelope<T>) => void;
export type WebSocketStatusHandler = (status: WebSocketStatus) => void;

const MAX_DEDUPLICATION_ENTRIES = 200;
const MAX_BACKOFF_MS = 30_000;
const INITIAL_BACKOFF_MS = 1_000;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private status: WebSocketStatus = 'DISCONNECTED';
  private readonly joinedBoards = new Set<string>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // Event and Status listeners
  private readonly eventListeners = new Map<string, Set<RealtimeEventHandler<unknown>>>();
  private readonly statusListeners = new Set<WebSocketStatusHandler>();

  // Bounded deduplication window (LRU list + Set)
  private readonly processedEventIds = new Set<string>();
  private readonly eventIdQueue: string[] = [];

  // Cleanup for auth registration
  private clearAuthUnsubscribe: (() => void) | null = null;

  constructor() {
    // Automatically disconnect and reset when auth is cleared (Logout)
    this.clearAuthUnsubscribe = registerOnClearAuth(() => {
      this.disconnect(1000, 'LOGOUT');
      this.joinedBoards.clear();
      this.clearDeduplication();
    });
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  private setStatus(newStatus: WebSocketStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      for (const listener of this.statusListeners) {
        try {
          listener(newStatus);
        } catch (err) {
          console.error('[WebSocketClient] Error in status listener:', err);
        }
      }
    }
  }

  private getWebSocketUrl(): string | null {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return null;

    const baseEnvUrl = import.meta.env.VITE_WS_URL as string | undefined;
    let urlString = baseEnvUrl;

    if (!urlString) {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
      urlString = `${isHttps ? 'wss:' : 'ws:'}//${host}/realtime`;
    }

    try {
      const parsed = new URL(urlString, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      parsed.searchParams.set('token', accessToken);
      return parsed.toString();
    } catch {
      return `${urlString}?token=${encodeURIComponent(accessToken)}`;
    }
  }

  connect(): void {
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      return;
    }

    if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    if (!wsUrl) {
      this.setStatus('DISCONNECTED');
      return;
    }

    this.clearReconnectTimer();
    this.setStatus(this.reconnectAttempts > 0 ? 'RECONNECTING' : 'CONNECTING');

    try {
      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      socket.onopen = () => {
        if (this.ws !== socket) return;
        this.setStatus('CONNECTED');
        this.reconnectAttempts = 0;

        // Automatically rejoin previously joined boards
        for (const boardId of this.joinedBoards) {
          this.sendRaw({ action: 'JOIN_BOARD', boardId });
        }
      };

      socket.onmessage = (event: MessageEvent) => {
        if (this.ws !== socket) return;
        this.handleIncomingMessage(event.data);
      };

      socket.onclose = (event: CloseEvent) => {
        if (this.ws !== socket) return;
        this.ws = null;

        if (event.code === 1000) {
          // Clean intentional closure
          this.setStatus('DISCONNECTED');
          return;
        }

        if (event.code === 4401) {
          // Token expired or revoked
          this.setStatus('DISCONNECTED');
          return;
        }

        // Unexpected disconnect -> trigger backoff reconnect
        this.scheduleReconnect();
      };

      socket.onerror = () => {
        // Socket error is followed by onclose where reconnection is managed
      };
    } catch (err) {
      console.error('[WebSocketClient] Connection instantiation error:', err);
      this.scheduleReconnect();
    }
  }

  private handleIncomingMessage(rawData: unknown): void {
    if (typeof rawData !== 'string') return;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      return;
    }

    if (!parsed || typeof parsed !== 'object') return;

    // Handle ACK / ERROR messages
    if (
      typeof parsed.event === 'string' &&
      (parsed.event === 'JOINED_BOARD' || parsed.event === 'LEFT_BOARD' || parsed.event === 'ERROR')
    ) {
      this.dispatchAckOrError(parsed as { event: string; [key: string]: unknown });
      return;
    }

    // Standard RealtimeEnvelope
    if (typeof parsed.event !== 'string' || typeof parsed.eventId !== 'string') return;
    const envelope = parsed as unknown as RealtimeEnvelope;
    if (!envelope.event || !envelope.eventId) return;

    // Bounded Deduplication Check
    if (this.isEventDuplicate(envelope.eventId)) {
      return;
    }

    // Dispatch to specific event listeners
    this.dispatchEvent(envelope);

    // Mark as processed in bounded window
    this.markEventProcessed(envelope.eventId);
  }

  private dispatchEvent(envelope: RealtimeEnvelope): void {
    const listeners = this.eventListeners.get(envelope.event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(envelope);
        } catch (err) {
          console.error(`[WebSocketClient] Listener error for ${envelope.event}:`, err);
        }
      }
    }

    // Catch-all listeners
    const wildcardListeners = this.eventListeners.get('*');
    if (wildcardListeners) {
      for (const listener of wildcardListeners) {
        try {
          listener(envelope);
        } catch (err) {
          console.error('[WebSocketClient] Wildcard listener error:', err);
        }
      }
    }
  }

  private dispatchAckOrError(message: { event: string; [key: string]: unknown }): void {
    const listeners = this.eventListeners.get(message.event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          (listener as (msg: unknown) => void)(message);
        } catch (err) {
          console.error(`[WebSocketClient] Handler error for ${message.event}:`, err);
        }
      }
    }
  }

  private isEventDuplicate(eventId: string): boolean {
    return this.processedEventIds.has(eventId);
  }

  private markEventProcessed(eventId: string): void {
    if (this.processedEventIds.has(eventId)) return;

    this.processedEventIds.add(eventId);
    this.eventIdQueue.push(eventId);

    if (this.eventIdQueue.length > MAX_DEDUPLICATION_ENTRIES) {
      const evicted = this.eventIdQueue.shift();
      if (evicted) {
        this.processedEventIds.delete(evicted);
      }
    }
  }

  private clearDeduplication(): void {
    this.processedEventIds.clear();
    this.eventIdQueue.length = 0;
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.setStatus('RECONNECTING');

    this.reconnectAttempts += 1;
    const baseDelay = INITIAL_BACKOFF_MS * Math.pow(1.5, Math.min(this.reconnectAttempts, 8));
    const jitter = Math.random() * 500;
    const delay = Math.min(baseDelay + jitter, MAX_BACKOFF_MS);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private sendRaw(message: ClientMessage): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  joinBoard(boardId: string): void {
    this.joinedBoards.add(boardId);
    if (this.status === 'CONNECTED') {
      this.sendRaw({ action: 'JOIN_BOARD', boardId });
    } else if (this.status === 'DISCONNECTED') {
      this.connect();
    }
  }

  leaveBoard(boardId: string): void {
    this.joinedBoards.delete(boardId);
    if (this.status === 'CONNECTED') {
      this.sendRaw({ action: 'LEAVE_BOARD', boardId });
    }
  }

  onEvent<T = unknown>(event: RealtimeEventType | '*' | 'JOINED_BOARD' | 'LEFT_BOARD' | 'ERROR', handler: RealtimeEventHandler<T>): () => void {
    let set = this.eventListeners.get(event);
    if (!set) {
      set = new Set();
      this.eventListeners.set(event, set);
    }
    set.add(handler as RealtimeEventHandler<unknown>);

    return () => {
      set?.delete(handler as RealtimeEventHandler<unknown>);
      if (set && set.size === 0) {
        this.eventListeners.delete(event);
      }
    };
  }

  onStatusChange(handler: WebSocketStatusHandler): () => void {
    this.statusListeners.add(handler);
    handler(this.status);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  disconnect(code = 1000, reason = 'CLIENT_DISCONNECT'): void {
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;

    if (this.ws) {
      try {
        this.ws.close(code, reason);
      } catch {
        // ignore
      }
      this.ws = null;
    }

    this.setStatus('DISCONNECTED');
  }

  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
    this.statusListeners.clear();
    this.joinedBoards.clear();
    this.clearDeduplication();
    if (this.clearAuthUnsubscribe) {
      this.clearAuthUnsubscribe();
      this.clearAuthUnsubscribe = null;
    }
  }
}

export const webSocketClient = new WebSocketClient();
