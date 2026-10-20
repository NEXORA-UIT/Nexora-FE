import * as React from "react";
import { workspaceApi } from "@/apis/workspace.api";
import { useAuthStore } from "@/stores/auth.store";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { WorkspaceInvitationDto, WorkspaceMemberDto } from "@/types";

export function useWorkspaceMembership(workspaceId: string) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [members, setMembers] = React.useState<WorkspaceMemberDto[]>([]);
  const [invitations, setInvitations] = React.useState<WorkspaceInvitationDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
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
      setMembers(memberResult.items);
      setInvitations(invitationResult.filter((invitation) => invitation.status === "PENDING"));
    } catch (cause) {
      setError(getUserFacingApiError(cause, "Unable to load workspace members."));
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

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
    members,
    invitations,
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
