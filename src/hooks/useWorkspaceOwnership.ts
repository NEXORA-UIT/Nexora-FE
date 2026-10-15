import * as React from "react";
import { workspaceApi } from "@/apis/workspace.api";

export interface VerifiedOwnerContext {
  workspaceId: string;
  userId: string;
  isOwner: boolean;
}

/**
 * Hook to verify if a user has the OWNER role within a given workspace.
 * Encapsulates the async membership query, cancellation logic, and strict
 * identity invariant to prevent stale permissions across workspace or user changes.
 */
export function useWorkspaceOwnership(
  workspaceId: string | undefined,
  userId: string | undefined
) {
  const [verifiedOwnerContext, setVerifiedOwnerContext] =
    React.useState<VerifiedOwnerContext | null>(null);

  // Invariant: isWorkspaceOwner is only true if verifiedOwnerContext strictly matches the current workspace and user identity
  const isWorkspaceOwner = Boolean(
    workspaceId &&
      userId &&
      verifiedOwnerContext?.workspaceId === workspaceId &&
      verifiedOwnerContext?.userId === userId &&
      verifiedOwnerContext?.isOwner
  );

  React.useEffect(() => {
    let isCancelled = false;

    if (!workspaceId || !userId) {
      return;
    }

    const targetWorkspaceId = workspaceId;
    const targetUserId = userId;

    const checkWorkspaceOwnership = async () => {
      try {
        const res = await workspaceApi.listWorkspaceMembers(targetWorkspaceId);
        if (isCancelled) return;
        const isOwner = (res.items || []).some(
          (m) => m.userId === targetUserId && m.role === "OWNER"
        );
        setVerifiedOwnerContext({
          workspaceId: targetWorkspaceId,
          userId: targetUserId,
          isOwner,
        });
      } catch {
        if (!isCancelled) {
          setVerifiedOwnerContext({
            workspaceId: targetWorkspaceId,
            userId: targetUserId,
            isOwner: false,
          });
        }
      }
    };

    void checkWorkspaceOwnership();

    return () => {
      isCancelled = true;
    };
  }, [workspaceId, userId]);

  return { isWorkspaceOwner, verifiedOwnerContext };
}
