import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { ApiError } from "@/apis/client";
import {
  isWorkspaceArchived,
  isWorkspaceFrozen,
  assertWorkspaceIsOperable,
  handleWorkspaceActionError,
} from "../workspace";
import type { Workspace } from "@/types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("workspace utility module (CC-006)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const activeWorkspace: Workspace = {
    id: "ws-1",
    name: "Active Workspace",
    slug: "active-workspace",
    status: "active",
    description: "Active",
    teamType: "Engineering",
    initials: "AW",
    isFrozen: false,
  };

  const archivedWorkspace: Workspace = {
    id: "ws-2",
    name: "Archived Workspace",
    slug: "archived-workspace",
    status: "archived",
    description: "Archived",
    teamType: "Engineering",
    initials: "AR",
  };

  const frozenWorkspace: Workspace = {
    id: "ws-3",
    name: "Frozen Workspace",
    slug: "frozen-workspace",
    status: "paused",
    isFrozen: true,
    description: "Frozen",
    teamType: "Engineering",
    initials: "FW",
  };

  it("correctly identifies archived status", () => {
    expect(isWorkspaceArchived(activeWorkspace)).toBe(false);
    expect(isWorkspaceArchived(archivedWorkspace)).toBe(true);
    expect(isWorkspaceArchived(frozenWorkspace)).toBe(false);
    expect(isWorkspaceArchived(null)).toBe(false);
    expect(isWorkspaceArchived(undefined)).toBe(false);
  });

  it("correctly identifies frozen status", () => {
    expect(isWorkspaceFrozen(activeWorkspace)).toBe(false);
    expect(isWorkspaceFrozen(archivedWorkspace)).toBe(false);
    expect(isWorkspaceFrozen(frozenWorkspace)).toBe(true);
    expect(isWorkspaceFrozen({ ...activeWorkspace, isFrozen: true })).toBe(true);
    expect(isWorkspaceFrozen({ ...activeWorkspace, status: "paused" })).toBe(true);
    expect(isWorkspaceFrozen(null)).toBe(false);
    expect(isWorkspaceFrozen(undefined)).toBe(false);
  });

  it("assertWorkspaceIsOperable allows active workspace", () => {
    const result = assertWorkspaceIsOperable(activeWorkspace, "create");
    expect(result).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("assertWorkspaceIsOperable rejects archived workspace with action-specific toast", () => {
    expect(assertWorkspaceIsOperable(archivedWorkspace, "create")).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Cannot create boards in an archived workspace.");

    expect(assertWorkspaceIsOperable(archivedWorkspace, "modify")).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Cannot modify boards in an archived workspace.");

    expect(assertWorkspaceIsOperable(archivedWorkspace, "restore")).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Cannot restore boards in an archived workspace.");

    expect(assertWorkspaceIsOperable(archivedWorkspace, "delete")).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Cannot delete boards in an archived workspace.");
  });

  it("assertWorkspaceIsOperable rejects frozen workspace with frozen toast", () => {
    const result = assertWorkspaceIsOperable(frozenWorkspace, "create");
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("This workspace is frozen and cannot be modified.");
  });

  it("handleWorkspaceActionError handles 403 WORKSPACE_FROZEN", () => {
    const error = new ApiError("Forbidden", "WORKSPACE_FROZEN", 403);
    handleWorkspaceActionError(error, "Default message", "modify");
    expect(toast.error).toHaveBeenCalledWith("This workspace is frozen and cannot be modified.");
  });

  it("handleWorkspaceActionError handles 403 RESOURCE_ARCHIVED / WORKSPACE_ARCHIVED", () => {
    const error = new ApiError("Forbidden", "WORKSPACE_ARCHIVED", 403);
    handleWorkspaceActionError(error, "Default message", "create");
    expect(toast.error).toHaveBeenCalledWith("Cannot create boards in an archived workspace.");
  });

  it("handleWorkspaceActionError falls back to default role message for generic 403", () => {
    const error = new ApiError("Forbidden", "FORBIDDEN", 403);
    handleWorkspaceActionError(error, "Only owners can do this.", "modify");
    expect(toast.error).toHaveBeenCalledWith("Only owners can do this.");
  });

  it("handleWorkspaceActionError handles generic errors", () => {
    handleWorkspaceActionError(new Error("Network failure"), "Fallback");
    expect(toast.error).toHaveBeenCalledWith("Network failure");

    handleWorkspaceActionError("Unknown error string", "Fallback");
    expect(toast.error).toHaveBeenCalledWith("Fallback");
  });
});
