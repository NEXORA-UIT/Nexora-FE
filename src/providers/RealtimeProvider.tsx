import * as React from "react";
import { io, type Socket } from "socket.io-client";
import { apiClient, ApiError } from "@/apis/client";
import { useAuthStore } from "@/stores/auth.store";
import type { KanbanCard, MoveCardInput } from "@/types";

type Ack<T> = { ok: true; data?: T } | { ok: false; code: string };
type ClientEvents = {
  "board:join": (
    input: { boardId: string },
    acknowledge: (result: Ack<{ boardId: string }>) => void
  ) => void;
  "board:leave": (
    input: { boardId: string },
    acknowledge: (result: Ack<{ boardId: string }>) => void
  ) => void;
  "workspace:join": (
    input: { workspaceId: string },
    acknowledge: (result: Ack<{ workspaceId: string }>) => void
  ) => void;
  "workspace:leave": (
    input: { workspaceId: string },
    acknowledge: (result: Ack<{ workspaceId: string }>) => void
  ) => void;
  "card:move": (
    input: MoveCardInput & { boardId: string; cardId: string },
    acknowledge: (result: Ack<KanbanCard>) => void
  ) => void;
};
type ServerEvents = {
  "board:changed": (event: {
    boardId: string;
    change: string;
    occurredAt: string;
    eventId: string;
    schemaVersion: 1;
  }) => void;
  "workspace:changed": (event: {
    workspaceId: string;
    change: string;
    occurredAt: string;
    eventId: string;
    schemaVersion: 1;
  }) => void;
  "notifications:changed": (event: { change: "notifications" }) => void;
  "session:expired": () => void;
};

type RealtimeSocket = Socket<ServerEvents, ClientEvents>;
const RealtimeContext = React.createContext<RealtimeSocket | null>(null);

export function RealtimeProvider({ children }: React.PropsWithChildren) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const socket = React.useMemo(() => {
    if (!accessToken) return null;
    const origin = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    return io(origin, {
      path: "/realtime/socket.io",
      transports: ["websocket"],
      auth: { token: accessToken },
      autoConnect: false,
      reconnection: true,
    }) as RealtimeSocket;
  }, [accessToken]);

  React.useEffect(() => {
    if (!socket) return;
    socket.connect();
    const refreshSession = () => {
      void apiClient.get("/auth/me").catch(() => useAuthStore.getState().clearAuth());
    };
    const handleConnectError = (error: Error & { data?: { code?: string } }) => {
      if (error.data?.code === "AUTH_INVALID") refreshSession();
    };
    socket.on("session:expired", refreshSession);
    socket.on("connect_error", handleConnectError);
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [socket]);

  return <RealtimeContext.Provider value={socket}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeSocket() {
  return React.useContext(RealtimeContext);
}

export function useBoardRealtime(boardId: string | undefined, reloadBoard: () => Promise<void>) {
  const socket = useRealtimeSocket();
  const reloadRef = React.useRef(reloadBoard);
  const [isJoined, setIsJoined] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(Boolean(socket?.connected));

  React.useEffect(() => {
    reloadRef.current = reloadBoard;
  }, [reloadBoard]);

  React.useEffect(() => {
    if (!socket || !boardId) {
      setIsJoined(false);
      setIsConnected(false);
      return;
    }

    let refreshTimer: number | undefined;
    let refreshInProgress = false;
    let refreshRequested = false;
    let disposed = false;
    const refreshSnapshot = async () => {
      refreshRequested = true;
      if (refreshInProgress) return;
      refreshInProgress = true;
      try {
        while (refreshRequested && !disposed) {
          refreshRequested = false;
          await reloadRef.current();
        }
      } finally {
        refreshInProgress = false;
        if (refreshRequested && !disposed) void refreshSnapshot();
      }
    };
    const refreshBoard = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void refreshSnapshot(), 80);
    };
    const joinBoard = () => {
      setIsConnected(true);
      socket.emit("board:join", { boardId }, (result) => {
        setIsJoined(result.ok);
        if (result.ok) void refreshSnapshot();
      });
    };
    const leaveBoard = () => {
      setIsConnected(false);
      setIsJoined(false);
    };
    const handleBoardChange = (event: { boardId: string }) => {
      if (event.boardId === boardId) refreshBoard();
    };

    socket.on("connect", joinBoard);
    socket.on("disconnect", leaveBoard);
    socket.on("board:changed", handleBoardChange);
    if (socket.connected) joinBoard();

    return () => {
      disposed = true;
      window.clearTimeout(refreshTimer);
      socket.off("connect", joinBoard);
      socket.off("disconnect", leaveBoard);
      socket.off("board:changed", handleBoardChange);
      if (socket.connected) socket.emit("board:leave", { boardId }, () => undefined);
    };
  }, [socket, boardId]);

  const moveCardRealtime = React.useCallback(
    async (cardId: string, payload: MoveCardInput): Promise<KanbanCard | null> => {
      if (!socket?.connected || !isJoined || !boardId) return null;
      return new Promise((resolve, reject) => {
        socket
          .timeout(8_000)
          .emit("card:move", { ...payload, boardId, cardId }, (timeoutError, result) => {
            if (timeoutError) {
              reject(
                new ApiError(
                  "Realtime move timed out. Refreshing Board data.",
                  "REALTIME_TIMEOUT",
                  408
                )
              );
              return;
            }
            if (!result.ok) {
              reject(
                new ApiError("Card move was rejected. Refreshing Board data.", result.code, 409)
              );
              return;
            }
            if (!result.data) {
              reject(
                new ApiError("Realtime server returned no Card.", "INVALID_REALTIME_RESPONSE", 502)
              );
              return;
            }
            resolve(result.data);
          });
      });
    },
    [socket, isJoined, boardId]
  );

  return { isConnected, isJoined, moveCardRealtime };
}

export function useWorkspaceRealtime(
  workspaceId: string | undefined,
  reloadWorkspace: () => Promise<void>
) {
  const socket = useRealtimeSocket();
  const reloadRef = React.useRef(reloadWorkspace);
  React.useEffect(() => {
    reloadRef.current = reloadWorkspace;
  }, [reloadWorkspace]);

  React.useEffect(() => {
    if (!socket || !workspaceId) return;
    let refreshInProgress = false;
    let refreshRequested = false;
    let disposed = false;
    const refreshSnapshot = async () => {
      refreshRequested = true;
      if (refreshInProgress) return;
      refreshInProgress = true;
      try {
        while (refreshRequested && !disposed) {
          refreshRequested = false;
          await reloadRef.current();
        }
      } finally {
        refreshInProgress = false;
        if (refreshRequested && !disposed) void refreshSnapshot();
      }
    };
    const joinWorkspace = () => {
      socket.emit("workspace:join", { workspaceId }, (result) => {
        if (result.ok) void refreshSnapshot();
      });
    };
    const handleWorkspaceChange = (event: { workspaceId: string }) => {
      if (event.workspaceId === workspaceId) void refreshSnapshot();
    };
    socket.on("connect", joinWorkspace);
    socket.on("workspace:changed", handleWorkspaceChange);
    if (socket.connected) joinWorkspace();
    return () => {
      disposed = true;
      socket.off("connect", joinWorkspace);
      socket.off("workspace:changed", handleWorkspaceChange);
      if (socket.connected) socket.emit("workspace:leave", { workspaceId }, () => undefined);
    };
  }, [socket, workspaceId]);
}
