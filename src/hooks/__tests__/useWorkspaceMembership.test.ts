import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ApiError } from "@/apis/client";
import { workspaceApi } from "@/apis/workspace.api";
import { useWorkspaceMembership } from "../useWorkspaceMembership";

vi.mock("@/apis/workspace.api", () => ({
  workspaceApi: {
    listWorkspaceMembers: vi.fn(),
    listWorkspaceInvitations: vi.fn(),
    inviteWorkspaceMember: vi.fn(),
    cancelWorkspaceInvitation: vi.fn(),
    resendWorkspaceInvitation: vi.fn(),
    removeWorkspaceMember: vi.fn(),
    transferWorkspaceOwner: vi.fn(),
  },
}));
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: "member-1" } }),
}));

describe("useWorkspaceMembership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads membership for a regular member without calling the Owner-only invitation endpoint", async () => {
    vi.mocked(workspaceApi.listWorkspaceMembers).mockResolvedValue({
      items: [
        {
          id: "membership-1",
          workspaceId: "ws-1",
          userId: "member-1",
          role: "MEMBER",
          createdAt: "",
          updatedAt: "",
          endedAt: null,
          user: {
            id: "member-1",
            email: "member@example.com",
            fullName: "Member",
            status: "ACTIVE",
          },
        },
      ],
    });
    const { result } = renderHook(() => useWorkspaceMembership("ws-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.members).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(workspaceApi.listWorkspaceInvitations).not.toHaveBeenCalled();
  });

  it("clears member data after Workspace access is revoked", async () => {
    vi.mocked(workspaceApi.listWorkspaceMembers)
      .mockResolvedValueOnce({
        items: [
          {
            id: "membership-1",
            workspaceId: "ws-1",
            userId: "member-1",
            role: "MEMBER",
            createdAt: "",
            updatedAt: "",
            endedAt: null,
            user: {
              id: "member-1",
              email: "member@example.com",
              fullName: "Member",
              status: "ACTIVE",
            },
          },
        ],
      })
      .mockRejectedValueOnce(new ApiError("Forbidden", "WORKSPACE_FORBIDDEN", 403));

    const { result } = renderHook(() => useWorkspaceMembership("ws-1"));
    await waitFor(() => expect(result.current.members).toHaveLength(1));
    await act(async () => result.current.refresh());

    expect(result.current.members).toEqual([]);
    expect(result.current.invitations).toEqual([]);
  });

  it("ignores a previous Workspace membership response after switching", async () => {
    const member = {
      id: "membership-1",
      workspaceId: "ws-1",
      userId: "member-1",
      role: "MEMBER" as const,
      createdAt: "",
      updatedAt: "",
      endedAt: null,
      user: {
        id: "member-1",
        email: "member@example.com",
        fullName: "Member",
        status: "ACTIVE" as const,
      },
    };
    let resolveOldRequest!: (result: { items: (typeof member)[] }) => void;
    vi.mocked(workspaceApi.listWorkspaceMembers).mockImplementation((workspaceId) =>
      workspaceId === "ws-1"
        ? new Promise((resolve) => {
            resolveOldRequest = resolve;
          })
        : Promise.resolve({ items: [{ ...member, id: "membership-2", workspaceId: "ws-2" }] })
    );

    const { result, rerender } = renderHook(
      ({ workspaceId }) => useWorkspaceMembership(workspaceId),
      { initialProps: { workspaceId: "ws-1" } }
    );
    rerender({ workspaceId: "ws-2" });
    await waitFor(() => expect(result.current.members[0]?.workspaceId).toBe("ws-2"));

    await act(async () => resolveOldRequest({ items: [member] }));
    expect(result.current.members[0]?.workspaceId).toBe("ws-2");
  });
});
