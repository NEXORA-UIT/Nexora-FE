import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
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
});
