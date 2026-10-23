import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClient } from '../websocket-client';
import { useAuthStore } from '@/stores/auth.store';
import type { RealtimeEnvelope } from '@/types/websocket';

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static readonly OPEN = 1;
  static readonly CLOSED = 3;

  url: string;
  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    setTimeout(() => {
      this.onopen?.();
    }, 0);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(code = 1000, reason = '') {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code, reason });
  }

  triggerMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

describe('WebSocketClient', () => {
  let client: WebSocketClient;

  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);

    useAuthStore.setState({
      accessToken: 'valid-test-access-token',
      refreshToken: 'valid-test-refresh-token',
      user: { id: 'u-1', email: 'u1@test.com', fullName: 'User One', avatarUrl: null, status: 'ACTIVE', createdAt: '', updatedAt: '' },
      isAuthenticated: true,
    });

    client = new WebSocketClient();
  });

  afterEach(() => {
    client.destroy();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('connects using access token from auth store and transitions status to CONNECTED', async () => {
    const statuses: string[] = [];
    client.onStatusChange((s) => statuses.push(s));

    client.connect();
    expect(client.getStatus()).toBe('CONNECTING');

    await vi.advanceTimersByTimeAsync(10);

    expect(client.getStatus()).toBe('CONNECTED');
    expect(MockWebSocket.instances.length).toBe(1);
    expect(MockWebSocket.instances[0].url).toContain('token=valid-test-access-token');
  });

  it('does not connect when there is no access token', () => {
    useAuthStore.setState({ accessToken: null, isAuthenticated: false });
    client.connect();
    expect(client.getStatus()).toBe('DISCONNECTED');
    expect(MockWebSocket.instances.length).toBe(0);
  });

  it('automatically rejoins boards on reconnect after unexpected closure', async () => {
    client.connect();
    await vi.advanceTimersByTimeAsync(10);

    client.joinBoard('board-uuid-1');
    const ws1 = MockWebSocket.instances[0];
    expect(ws1.sentMessages).toContain(JSON.stringify({ action: 'JOIN_BOARD', boardId: 'board-uuid-1' }));

    // Unexpected server disconnect (code 1006)
    ws1.close(1006, 'Abnormal closure');
    expect(client.getStatus()).toBe('RECONNECTING');

    // Advance through backoff timer
    await vi.advanceTimersByTimeAsync(2000);
    expect(MockWebSocket.instances.length).toBe(2);

    const ws2 = MockWebSocket.instances[1];
    await vi.advanceTimersByTimeAsync(10);
    expect(client.getStatus()).toBe('CONNECTED');

    // Should have automatically rejoined board-uuid-1
    expect(ws2.sentMessages).toContain(JSON.stringify({ action: 'JOIN_BOARD', boardId: 'board-uuid-1' }));
  });

  it('deduplicates events with identical eventId within the bounded window', async () => {
    client.connect();
    await vi.advanceTimersByTimeAsync(10);

    const receivedEvents: RealtimeEnvelope[] = [];
    client.onEvent('CARD_MOVED', (env) => receivedEvents.push(env));

    const envelope: RealtimeEnvelope = {
      event: 'CARD_MOVED',
      eventId: 'evt-unique-123',
      occurredAt: new Date().toISOString(),
      boardId: 'b-1',
      actor: { userId: 'u-1', fullName: 'User One' },
      data: { cardId: 'c-1' },
    };

    const ws = MockWebSocket.instances[0];
    // First delivery
    ws.triggerMessage(envelope);
    expect(receivedEvents.length).toBe(1);

    // Duplicate delivery
    ws.triggerMessage(envelope);
    expect(receivedEvents.length).toBe(1);
  });

  it('disconnects immediately when auth is cleared (logout)', async () => {
    client.connect();
    await vi.advanceTimersByTimeAsync(10);

    expect(client.getStatus()).toBe('CONNECTED');

    // Trigger clearAuth
    useAuthStore.getState().clearAuth();

    expect(client.getStatus()).toBe('DISCONNECTED');
  });

  it('dispatches ACK and ERROR messages correctly', async () => {
    client.connect();
    await vi.advanceTimersByTimeAsync(10);

    const ackAndErrorEvents: Array<{ event: string; boardId?: string; error?: { code: string; message: string } }> = [];

    client.onEvent('JOINED_BOARD', (ack) => {
      ackAndErrorEvents.push(ack as unknown as typeof ackAndErrorEvents[0]);
    });
    client.onEvent('ERROR', (err) => {
      ackAndErrorEvents.push(err as unknown as typeof ackAndErrorEvents[0]);
    });

    const ws = MockWebSocket.instances[0];
    ws.triggerMessage({ event: 'JOINED_BOARD', boardId: 'b-1', occurredAt: '2026-10-20T00:00:00.000Z' });
    ws.triggerMessage({ event: 'ERROR', error: { code: 'FORBIDDEN', message: 'No access' } });

    expect(ackAndErrorEvents[0]?.event).toBe('JOINED_BOARD');
    expect(ackAndErrorEvents[1]?.error?.code).toBe('FORBIDDEN');
  });
});
