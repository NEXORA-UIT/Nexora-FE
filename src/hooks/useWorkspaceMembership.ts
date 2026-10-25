import * as React from "react";
import { workspaceApi } from "@/apis/workspace.api";
import { ApiError } from "@/apis/client";
import { useAuthStore } from "@/stores/auth.store";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { WorkspaceInvitationDto, WorkspaceMemberDto } from "@/types";
import { useWorkspaceRealtime } from "@/providers/RealtimeProvider";

export function useWorkspaceMembership(workspaceId: string) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [members, setMembers] = React.useState<WorkspaceMemberDto[]>([]);
  const [invitations, setInvitations] = React.useState<WorkspaceInvitationDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);

  const refresh = React.useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const memberResult = await workspaceApi.listWorkspaceMembers(workspaceId, {
        bypassCache: true,
      });
      const currentMembership = memberResult.items.find(
        (member) => member.userId === currentUserId
      );
      const invitationResult =
        currentMembership?.role === "OWNER"
          ? await workspaceApi.listWorkspaceInvitations(workspaceId)
          : [];
      if (requestId !== requestIdRef.current) return;
      setMembers(memberResult.items);
      setInvitations(invitationResult.filter((invitation) => invitation.status === "PENDING"));
    } catch (cause) {
      if (requestId !== requestIdRef.current) return;
      if (cause instanceof ApiError && (cause.status === 403 || cause.status === 404)) {
        setMembers([]);
        setInvitations([]);
      }
      setError(getUserFacingApiError(cause, "Unable to load workspace members."));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [currentUserId, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  useWorkspaceRealtime(workspaceId, refresh);

  const invite = React.useCallback(
    async (email: string) => {
      await workspaceApi.inviteWorkspaceMember(workspaceId, { email });
      await refresh();
    },
    [refresh, workspaceId]
  );

  const cancelInvitation = React.useCallback(
    async (invitationId: string) => {
      await workspaceApi.cancelWorkspaceInvitation(workspaceId, invitationId);
      await refresh();
    },
    [refresh, workspaceId]
  );

  const resendInvitation = React.useCallback(
    async (invitationId: string) => {
      await workspaceApi.resendWorkspaceInvitation(invitationId);
      await refresh();
    },
    [refresh]
  );

  const removeMember = React.useCallback(
    async (userId: string) => {
      await workspaceApi.removeWorkspaceMember(workspaceId, userId);
      await refresh();
    },
    [refresh, workspaceId]
  );

  const transferOwner = React.useCallback(
    async (userId: string) => {
      await workspaceApi.transferWorkspaceOwner(workspaceId, userId);
      await refresh();
    },
    [refresh, workspaceId]
  );

  return {
    members: members.filter((member) => member.workspaceId === workspaceId),
    invitations: invitations.filter((invitation) => invitation.workspaceId === workspaceId),
    isLoading,
    error,
    refresh,
    invite,
    cancelInvitation,
    resendInvitation,
    removeMember,
    transferOwner,
  };
}
