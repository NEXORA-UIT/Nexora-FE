import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuthStore } from "@/stores/auth.store";
import { RealtimeProvider, useBoardRealtime, useWorkspaceRealtime } from "../RealtimeProvider";

const socket = vi.hoisted(() => ({
  connected: true,
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  removeAllListeners: vi.fn(),
}));

vi.mock("socket.io-client", () => ({ io: () => socket }));

const wrapper = ({ children }: React.PropsWithChildren) => (
  <RealtimeProvider>{children}</RealtimeProvider>
);

describe("realtime room access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: "test-access-token" });
    socket.emit.mockImplementation(
      (event: string, _input: unknown, acknowledge: (result: unknown) => void) => {
        if (event === "board:join" || event === "workspace:join") {
          acknowledge({ ok: false, code: "FORBIDDEN" });
        }
      }
    );
  });

  it("reloads a Board after join is denied so revoked data is cleared", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useBoardRealtime("board-1", reload), { wrapper });

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  });

  it("reloads a Workspace after join is denied so revoked data is cleared", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useWorkspaceRealtime("workspace-1", reload), { wrapper });

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  });

  it("reconnects after the server forcibly disconnects a room subscriber", () => {
    renderHook(() => useBoardRealtime("board-1", vi.fn().mockResolvedValue(undefined)), {
      wrapper,
    });
    const disconnectHandlers = socket.on.mock.calls
      .filter(([event]) => event === "disconnect")
      .map(([, handler]) => handler);

    act(() => disconnectHandlers.forEach((handler) => handler("io server disconnect")));

    expect(socket.connect).toHaveBeenCalledTimes(2);
  });
});
