import * as React from "react";
import { boardApi } from "@/apis/board.api";
import { workspaceApi } from "@/apis/workspace.api";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { BoardMember, WorkspaceMemberDto } from "@/types";

export function useBoardMembership(boardId: string, workspaceId: string) {
  const [members, setMembers] = React.useState<BoardMember[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = React.useState<WorkspaceMemberDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [boardResult, workspaceResult] = await Promise.all([
        boardApi.getBoardMembers(boardId),
        workspaceApi.listWorkspaceMembers(workspaceId, { bypassCache: true }),
      ]);
      setMembers(boardResult);
      setWorkspaceMembers(workspaceResult.items);
    } catch (cause) {
      setError(getUserFacingApiError(cause, "Unable to load Board members."));
    } finally {
      setIsLoading(false);
    }
  }, [boardId, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

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
    members,
    workspaceMembers,
    isLoading,
    error,
    refresh,
    addMember,
    removeMember,
    assignPm,
  };
}
