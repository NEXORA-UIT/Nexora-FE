import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WorkspaceOverviewPanel } from "../WorkspaceOverviewPanel";
import { useWorkspaceMembership } from "@/hooks";
import type { Board, Workspace, WorkspaceMemberDto } from "@/types";

vi.mock("@/hooks", () => ({ useWorkspaceMembership: vi.fn() }));

const workspace: Workspace = {
  id: "workspace-1",
  name: "Core Platform",
  slug: "core-platform",
  status: "active",
  description: "A shared product workspace.",
  teamType: "Software Engineering",
  initials: "CP",
};

const boards: Board[] = [
  {
    id: "board-active-1",
    workspaceId: workspace.id,
    title: "Website Redesign",
    status: "active",
    updatedAt: "2026-10-19T10:00:00.000Z",
    createdAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "board-active-2",
    workspaceId: workspace.id,
    title: "Mobile App",
    status: "active",
    updatedAt: "2026-10-18T10:00:00.000Z",
    createdAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "board-archived-1",
    workspaceId: workspace.id,
    title: "Legacy Migration",
    status: "archived",
    updatedAt: "2026-09-18T10:00:00.000Z",
    createdAt: "2026-08-02T10:00:00.000Z",
  },
];

const members: WorkspaceMemberDto[] = [
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
      email: "owner@example.com",
      fullName: "Workspace Owner",
      status: "ACTIVE",
    },
  },
  {
    id: "membership-2",
    workspaceId: workspace.id,
    userId: "member-1",
    role: "MEMBER",
    createdAt: "2026-10-02T00:00:00.000Z",
    updatedAt: "2026-10-02T00:00:00.000Z",
    endedAt: null,
    user: {
      id: "member-1",
      email: "member@example.com",
      fullName: "Project Member",
      status: "ACTIVE",
    },
  },
];

const membershipState = {
  members,
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

function renderOverview(boardItems: Board[] = boards, onCreateBoardClick = vi.fn()) {
  return {
    onCreateBoardClick,
    ...render(
      <MemoryRouter>
        <WorkspaceOverviewPanel
          workspace={workspace}
          boards={boardItems}
          onCreateBoardClick={onCreateBoardClick}
        />
      </MemoryRouter>
    ),
  };
}

describe("WorkspaceOverviewPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWorkspaceMembership).mockReturnValue(membershipState);
  });

  it("shows workspace details and counts from the loaded workspace, boards, and members", () => {
    renderOverview();

    expect(screen.getByRole("heading", { name: "Core Platform" }).className).toMatch(/text-white/);
    expect(screen.getByText("A shared product workspace.")).toBeTruthy();
    expect(screen.getByText("Active boards").parentElement?.textContent).toContain("2");
    expect(screen.getByText("Archived boards").parentElement?.textContent).toContain("1");
    expect(screen.getByText("Members").parentElement?.textContent).toContain("2");
  });

  it("links recent boards to their actual board detail routes", () => {
    renderOverview();

    expect(screen.getByRole("link", { name: /Website Redesign/i }).getAttribute("href")).toBe(
      "/boards/board-active-1"
    );
    expect(screen.queryByRole("link", { name: /Legacy Migration/i })).toBeNull();
  });

  it("opens the existing create board flow from the overview", () => {
    const { onCreateBoardClick } = renderOverview();
    fireEvent.click(screen.getByRole("button", { name: /Create board/i }));

    expect(onCreateBoardClick).toHaveBeenCalledOnce();
  });

  it("provides a create action when the workspace has no boards", () => {
    const { onCreateBoardClick } = renderOverview([]);

    expect(screen.getByText(/No boards in this workspace yet/i)).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: /Create board/i })[1]);
    expect(onCreateBoardClick).toHaveBeenCalledOnce();
  });

  it("communicates membership loading and error states", () => {
    vi.mocked(useWorkspaceMembership).mockReturnValue({
      ...membershipState,
      isLoading: true,
    });
    const { unmount } = renderOverview();
    expect(screen.getByRole("status").textContent).toMatch(/Loading members/i);

    unmount();
    vi.mocked(useWorkspaceMembership).mockReturnValue({
      ...membershipState,
      error: "Unable to load workspace members.",
    });
    renderOverview();
    expect(screen.getByRole("alert").textContent).toContain("Unable to load workspace members.");
  });
});
