import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useWorkspaceOwnership } from "../useWorkspaceOwnership";
import { workspaceApi } from "@/apis/workspace.api";

describe("useWorkspaceOwnership (CC-007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("identifies user as owner when listWorkspaceMembers returns OWNER role", async () => {
    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValueOnce({
      items: [
        {
          id: "wm-1",
          workspaceId: "ws-1",
          userId: "user-1",
          role: "OWNER",
          user: { id: "user-1", fullName: "Owner User", email: "owner@test.com", status: "ACTIVE" },
          endedAt: null,
          createdAt: "2026-10-10T00:00:00.000Z",
          updatedAt: "2026-10-10T00:00:00.000Z",
        },
      ],
    });

    const { result } = renderHook(() => useWorkspaceOwnership("ws-1", "user-1"));

    // Pre-effect invariant: should be false initially
    expect(result.current.isWorkspaceOwner).toBe(false);

    await waitFor(() => {
      expect(result.current.isWorkspaceOwner).toBe(true);
    });

    expect(result.current.verifiedOwnerContext).toEqual({
      workspaceId: "ws-1",
      userId: "user-1",
      isOwner: true,
    });
  });

  it("denies ownership when role is MEMBER", async () => {
    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValueOnce({
      items: [
        {
          id: "wm-2",
          workspaceId: "ws-1",
          userId: "user-2",
          role: "MEMBER",
          user: { id: "user-2", fullName: "Regular Member", email: "member@test.com", status: "ACTIVE" },
          endedAt: null,
          createdAt: "2026-10-10T00:00:00.000Z",
          updatedAt: "2026-10-10T00:00:00.000Z",
        },
      ],
    });

    const { result } = renderHook(() => useWorkspaceOwnership("ws-1", "user-2"));

    await waitFor(() => {
      expect(result.current.verifiedOwnerContext).not.toBeNull();
    });

    expect(result.current.isWorkspaceOwner).toBe(false);
  });

  it("denies ownership by default on API failure", async () => {
    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockRejectedValueOnce(
      new Error("Network Error")
    );

    const { result } = renderHook(() => useWorkspaceOwnership("ws-1", "user-1"));

    await waitFor(() => {
      expect(result.current.verifiedOwnerContext).not.toBeNull();
    });

    expect(result.current.isWorkspaceOwner).toBe(false);
    expect(result.current.verifiedOwnerContext?.isOwner).toBe(false);
  });

  it("does not fetch when workspaceId or userId is undefined", () => {
    const listSpy = vi.spyOn(workspaceApi, "listWorkspaceMembers");

    const { result } = renderHook(() => useWorkspaceOwnership(undefined, "user-1"));
    expect(result.current.isWorkspaceOwner).toBe(false);
    expect(listSpy).not.toHaveBeenCalled();

    const { result: result2 } = renderHook(() => useWorkspaceOwnership("ws-1", undefined));
    expect(result2.current.isWorkspaceOwner).toBe(false);
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("invalidates ownership immediately on workspace change (strict invariant)", async () => {
    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValue({
      items: [
        {
          id: "wm-1",
          workspaceId: "ws-1",
          userId: "user-1",
          role: "OWNER",
          user: { id: "user-1", fullName: "Owner User", email: "owner@test.com", status: "ACTIVE" },
          endedAt: null,
          createdAt: "2026-10-10T00:00:00.000Z",
          updatedAt: "2026-10-10T00:00:00.000Z",
        },
      ],
    });

    let currentWorkspace = "ws-1";
    const { result, rerender } = renderHook(() =>
      useWorkspaceOwnership(currentWorkspace, "user-1")
    );

    await waitFor(() => {
      expect(result.current.isWorkspaceOwner).toBe(true);
    });

    // Switch workspace to ws-2
    currentWorkspace = "ws-2";
    rerender();

    // Invariant: synchronously false because verifiedOwnerContext still has ws-1
    expect(result.current.isWorkspaceOwner).toBe(false);
  });
});
