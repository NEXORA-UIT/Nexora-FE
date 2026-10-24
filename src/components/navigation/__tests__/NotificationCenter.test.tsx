import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "../NotificationCenter";

const realtime = vi.hoisted(() => ({
  listeners: new Map<string, (payload?: unknown) => void>(),
}));

vi.mock("@/providers/RealtimeProvider", () => ({
  useRealtimeSocket: () => ({
    on: (event: string, listener: (payload?: unknown) => void) =>
      realtime.listeners.set(event, listener),
    off: (event: string) => realtime.listeners.delete(event),
  }),
}));

vi.mock("@/apis/notifications.api", () => ({
  notificationsApi: {
    getUnreadCount: vi.fn(),
    list: vi.fn(),
    markAllRead: vi.fn(),
    markRead: vi.fn(),
    remove: vi.fn(),
  },
}));

import { notificationsApi } from "@/apis/notifications.api";

describe("NotificationCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    realtime.listeners.clear();
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue(2);
    vi.mocked(notificationsApi.list).mockResolvedValue({
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  it("refreshes the unread badge when a realtime notification arrives", async () => {
    render(<NotificationCenter />);

    expect(await screen.findByText("2")).toBeTruthy();
    vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue(3);
    act(() => realtime.listeners.get("notifications:changed")?.({ change: "notifications" }));

    await waitFor(() => expect(screen.getByText("3")).toBeTruthy());
  });
});
