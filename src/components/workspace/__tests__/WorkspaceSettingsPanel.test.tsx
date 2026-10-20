import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WorkspaceSettingsPanel } from "../WorkspaceSettingsPanel";
import { useWorkspaceMembership } from "@/hooks";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import type { Workspace, WorkspaceMemberDto } from "@/types";

vi.mock("@/hooks", () => ({ useWorkspaceMembership: vi.fn() }));
vi.mock("@/stores/auth.store", () => ({ useAuthStore: vi.fn() }));
vi.mock("@/stores/workspace.store", () => ({ useWorkspaceStore: { getState: vi.fn() } }));

const workspace: Workspace = {
  id: "workspace-1",
  name: "Core Platform",
  slug: "core-platform",
  status: "active",
  description: "A shared product workspace.",
  teamType: "Software Engineering",
  initials: "CP",
};

const owner: WorkspaceMemberDto = {
  id: "membership-1",
  workspaceId: workspace.id,
  userId: "owner-1",
  role: "OWNER",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  endedAt: null,
  user: { id: "owner-1", email: "owner@example.com", fullName: "Workspace Owner", status: "ACTIVE" },
};

const member: WorkspaceMemberDto = {
  ...owner,
  id: "membership-2",
  userId: "member-1",
  role: "MEMBER",
  user: { id: "member-1", email: "member@example.com", fullName: "Project Member", status: "ACTIVE" },
};

const membershipState = {
  members: [owner],
  invitations: [],
  isLoading: false,
  error: null,
  refresh: vi.fn(),
  invite: vi.fn(),
  cancelInvitation: vi.fn(),
  resendInvitation: vi.fn(),
  removeMember: vi.fn(),
  transferOwner: vi.fn(),
};

const updateWorkspace = vi.fn();

describe("WorkspaceSettingsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation(((selector: (state: { user: { id: string } }) => unknown) =>
      selector({ user: { id: "owner-1" } })) as typeof useAuthStore);
    vi.mocked(useWorkspaceMembership).mockReturnValue(membershipState);
    vi.mocked(useWorkspaceStore.getState).mockReturnValue({ updateWorkspace } as ReturnType<typeof useWorkspaceStore.getState>);
  });

  it("lets the active workspace owner edit workspace details", () => {
    render(<WorkspaceSettingsPanel workspace={workspace} />);

    expect(screen.getByRole("textbox", { name: /workspace name/i })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /description/i })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /workspace type/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /save changes/i }).hasAttribute("disabled")).toBe(true);
  });

  it.each([
    ["member", { members: [member] }, workspace],
    ["archived workspace", membershipState, { ...workspace, status: "archived" as const }],
    ["frozen workspace", membershipState, { ...workspace, isFrozen: true }],
  ])("keeps settings read-only for a %s", (_reason, membership, targetWorkspace) => {
    vi.mocked(useWorkspaceMembership).mockReturnValue(membership);
    render(<WorkspaceSettingsPanel workspace={targetWorkspace} />);

    expect(screen.getByText(/only the workspace owner can edit/i)).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /workspace name/i }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: /save changes/i }).hasAttribute("disabled")).toBe(true);
  });

  it("sends only fields changed by the owner", async () => {
    render(<WorkspaceSettingsPanel workspace={workspace} />);
    fireEvent.change(screen.getByRole("textbox", { name: /workspace name/i }), {
      target: { value: "Core Platform 2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateWorkspace).toHaveBeenCalledWith(workspace.id, { name: "Core Platform 2" }));
  });

  it("shows an English error when the update request fails", async () => {
    updateWorkspace.mockRejectedValueOnce(new Error("network detail"));
    render(<WorkspaceSettingsPanel workspace={workspace} />);
    fireEvent.change(screen.getByRole("textbox", { name: /workspace name/i }), {
      target: { value: "New workspace name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/could not update workspace/i);
  });
});
