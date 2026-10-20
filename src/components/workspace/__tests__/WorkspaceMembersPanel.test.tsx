import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkspaceMembersPanel } from "../WorkspaceMembersPanel";
import { useWorkspaceMembership } from "@/hooks";
import { useAuthStore } from "@/stores/auth.store";
import type { Workspace } from "@/types";

vi.mock("@/hooks", () => ({ useWorkspaceMembership: vi.fn() }));

const workspace: Workspace = {
  id: "workspace-1",
  name: "Workspace",
  slug: "workspace",
  status: "active",
  description: "",
  teamType: "General",
  initials: "WS",
};

describe("WorkspaceMembersPanel member presentation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: { id: "owner-1" } as never });
    vi.mocked(useWorkspaceMembership).mockReturnValue({
      members: [
        {
          id: "membership-1",
          workspaceId: workspace.id,
          userId: "owner-1",
          role: "OWNER",
          createdAt: "2026-10-01T00:00:00.000Z",
          updatedAt: "2026-10-01T00:00:00.000Z",
          endedAt: null,
          user: {
            id: "owner-1",
            email: "jack@example.com",
            fullName: "Jack Nguyen",
            status: "ACTIVE",
          },
        },
      ],
      invitations: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      invite: vi.fn(),
      cancelInvitation: vi.fn(),
      resendInvitation: vi.fn(),
      removeMember: vi.fn(),
      transferOwner: vi.fn(),
    });
  });

  it("shows member initials and the membership join date", () => {
    render(<WorkspaceMembersPanel workspace={workspace} />);

    expect(screen.getByRole("img", { name: "Avatar for Jack Nguyen" }).textContent).toBe("JN");
    expect(screen.getByText("Joined").parentElement?.querySelector("time")?.dateTime).toBe(
      "2026-10-01T00:00:00.000Z"
    );
    expect(screen.getByRole("heading", { name: "Workspace members" })).toBeTruthy();
  });
});
