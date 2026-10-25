import * as React from "react";
import { boardApi } from "@/apis/board.api";
import { ApiError } from "@/apis/client";
import { workspaceApi } from "@/apis/workspace.api";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { BoardMember, WorkspaceMemberDto } from "@/types";
import { useBoardRealtime } from "@/providers/RealtimeProvider";

export function useBoardMembership(boardId: string, workspaceId: string) {
  const [members, setMembers] = React.useState<BoardMember[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = React.useState<WorkspaceMemberDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dataScope, setDataScope] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);
  const scope = `${workspaceId}:${boardId}`;

  const refresh = React.useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const [boardResult, workspaceResult] = await Promise.all([
        boardApi.getBoardMembers(boardId),
        workspaceApi.listWorkspaceMembers(workspaceId, { bypassCache: true }),
      ]);
      if (requestId !== requestIdRef.current) return;
      setMembers(boardResult);
      setWorkspaceMembers(workspaceResult.items);
      setDataScope(scope);
    } catch (cause) {
      if (requestId !== requestIdRef.current) return;
      if (cause instanceof ApiError && (cause.status === 403 || cause.status === 404)) {
        setMembers([]);
        setWorkspaceMembers([]);
        setDataScope(null);
      }
      setError(getUserFacingApiError(cause, "Unable to load Board members."));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [boardId, scope, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  useBoardRealtime(boardId, refresh);

  const addMember = React.useCallback(
    async (userId: string) => {
      await boardApi.addBoardMember(boardId, { userId });
      await refresh();
    },
    [boardId, refresh]
  );

  const removeMember = React.useCallback(
    async (userId: string) => {
      await boardApi.removeBoardMember(boardId, userId);
      await refresh();
    },
    [boardId, refresh]
  );

  const assignPm = React.useCallback(
    async (userId: string) => {
      await boardApi.assignBoardPm(boardId, userId);
      await refresh();
    },
    [boardId, refresh]
  );

  return {
    members: dataScope === scope ? members : [],
    workspaceMembers: dataScope === scope ? workspaceMembers : [],
    isLoading,
    error,
    refresh,
    addMember,
    removeMember,
    assignPm,
  };
}
