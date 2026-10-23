import { toast } from "sonner";
import { ApiError } from "@/apis/client";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { Workspace } from "@/types";

export type WorkspaceAction = "create" | "modify" | "restore" | "delete";

/**
 * Checks whether a workspace is currently archived.
 */
export function isWorkspaceArchived(workspace?: Workspace | null): boolean {
  return workspace?.status === "archived";
}

/**
 * Checks whether a workspace is currently frozen / paused.
 */
export function isWorkspaceFrozen(workspace?: Workspace | null): boolean {
  return Boolean(workspace?.isFrozen || workspace?.status === "paused");
}

function getActionVerb(action: WorkspaceAction): string {
  switch (action) {
    case "create":
      return "create boards in";
    case "restore":
      return "restore boards in";
    case "delete":
      return "delete boards in";
    case "modify":
    default:
      return "modify boards in";
  }
}

/**
 * Validates that a workspace is operable before performing a mutation.
 * Emits appropriate toast messages if the workspace is archived or frozen.
 * Returns true if the operation may proceed, false otherwise.
 */
export function assertWorkspaceIsOperable(
  workspace: Workspace | null | undefined,
  action: WorkspaceAction = "modify"
): boolean {
  if (isWorkspaceArchived(workspace)) {
    toast.error(`Cannot ${getActionVerb(action)} an archived workspace.`);
    return false;
  }

  if (isWorkspaceFrozen(workspace)) {
    toast.error("This workspace is frozen and cannot be modified.");
    return false;
  }

  return true;
}

/**
 * Handles API errors resulting from workspace operations, normalizing 403
 * frozen/archived messages and delegating role errors to the provided fallback.
 */
export function handleWorkspaceActionError(
  err: unknown,
  defaultRoleMessage: string,
  action: WorkspaceAction = "modify"
): void {
  if (err instanceof ApiError) {
    if (err.status === 403) {
      if (err.code === "WORKSPACE_FROZEN") {
        toast.error("This workspace is frozen and cannot be modified.");
        return;
      }
      if (err.code === "RESOURCE_ARCHIVED" || err.code === "WORKSPACE_ARCHIVED") {
        toast.error(`Cannot ${getActionVerb(action)} an archived workspace.`);
        return;
      }
      toast.error(defaultRoleMessage);
      return;
    }
    if (err.status === 400) {
      toast.error(getUserFacingApiError(err, "Invalid request."));
      return;
    }
    toast.error(getUserFacingApiError(err, defaultRoleMessage));
    return;
  }

  toast.error(getUserFacingApiError(err, defaultRoleMessage));
}
