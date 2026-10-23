import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { toast } from "sonner";
import { BoardMembersDialog } from "../BoardMembersDialog";
import { useBoardMembership } from "@/hooks";
import type { BoardDetail } from "@/types";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/hooks", () => ({ useBoardMembership: vi.fn() }));

const board = {
  id: "board-1",
  workspaceId: "workspace-1",
  name: "Roadmap",
  status: "ACTIVE",
  members: [],
  labels: [],
  lists: [],
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
} as BoardDetail;

const mockWorkspaceMembers = [
  {
    id: "wm-1",
    workspaceId: "workspace-1",
    userId: "user-1",
    role: "OWNER",
    user: { id: "user-1", email: "owner@test.com", fullName: "Owner User", status: "ACTIVE" },
  },
  {
    id: "wm-2",
    workspaceId: "workspace-1",
    userId: "user-2",
    role: "MEMBER",
    user: { id: "user-2", email: "member@test.com", fullName: "Member User", status: "ACTIVE" },
  },
  {
    id: "wm-3",
    workspaceId: "workspace-1",
    userId: "user-3",
    role: "MEMBER",
    user: { id: "user-3", email: "already@test.com", fullName: "Existing Member", status: "ACTIVE" },
  },
];

const mockBoardMembers = [
  {
    id: "user-1",
    name: "Owner User",
    initials: "OU",
    role: "PM" as const,
  },
  {
    id: "user-3",
    name: "Existing Member",
    initials: "EM",
    role: "MEMBER" as const,
  },
];

describe("BoardMembersDialog", () => {
  const addMemberMock = vi.fn();
  const removeMemberMock = vi.fn();
  const assignPmMock = vi.fn();
  const onMembersChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBoardMembership).mockReturnValue({
      members: mockBoardMembers,
      workspaceMembers: mockWorkspaceMembers as unknown as ReturnType<typeof useBoardMembership>["workspaceMembers"],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      addMember: addMemberMock,
      removeMember: removeMemberMock,
      assignPm: assignPmMock,
    });
  });

  it("copies the current Board URL and reports success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<BoardMembersDialog board={board} isOpen isWorkspaceOwner onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Copy link/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
    expect(toast.success).toHaveBeenCalledWith("Board link copied to clipboard.");
  });

  it("reports when copying the Board URL fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<BoardMembersDialog board={board} isOpen isWorkspaceOwner onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Copy link/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to copy board link.")
    );
  });

  it("displays available workspace members excluding those already in the board", () => {
    render(
      <BoardMembersDialog
        board={board}
        isOpen
        isWorkspaceOwner
        currentUserId="user-1"
        onClose={vi.fn()}
      />
    );

    // user-2 should be in dropdown because user-3 is already in the board
    const select = screen.getByRole("combobox", { name: /Add Workspace member/i });
    expect(select).toBeTruthy();

    const options = within(select).getAllByRole("option");
    const optionTexts = options.map((o) => o.textContent);

    // user-2 is available
    expect(optionTexts.some((t) => t?.includes("Member User"))).toBe(true);
    // user-3 is already a board member, should NOT be in the add dropdown
    expect(optionTexts.some((t) => t?.includes("Existing Member"))).toBe(false);
  });

  it("allows workspace owner to add member and triggers onMembersChange", async () => {
    addMemberMock.mockResolvedValue(undefined);

    render(
      <BoardMembersDialog
        board={board}
        isOpen
        isWorkspaceOwner
        currentUserId="user-1"
        onClose={vi.fn()}
        onMembersChange={onMembersChangeMock}
      />
    );

    const select = screen.getByRole("combobox", { name: /Add Workspace member/i });
    fireEvent.change(select, { target: { value: "user-2" } });

    const submitBtn = screen.getByRole("button", { name: /Add to board/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(addMemberMock).toHaveBeenCalledWith("user-2");
      expect(toast.success).toHaveBeenCalledWith("Member added to board.");
      expect(onMembersChangeMock).toHaveBeenCalled();
    });
  });

  it("prevents non-manager member from seeing management actions", () => {
    render(
      <BoardMembersDialog
        board={board}
        isOpen
        isWorkspaceOwner={false}
        currentUserId="user-3" // user-3 has role MEMBER on the board
        onClose={vi.fn()}
      />
    );

    // Non-manager cannot see Add Member form
    expect(screen.queryByRole("combobox", { name: /Add Workspace member/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Add to board/i })).toBeNull();

    // Non-manager cannot see Board PM select
    expect(screen.queryByLabelText(/Board PM/i)).toBeNull();

    // Non-manager cannot see Remove button
    expect(screen.queryByRole("button", { name: /Remove/i })).toBeNull();

    // But CAN see member list (read-only)
    expect(screen.getByText("Existing Member")).toBeTruthy();
    expect(screen.getByText("Owner User")).toBeTruthy();
  });

  it("handles error gracefully when addMember API fails", async () => {
    addMemberMock.mockRejectedValue(new Error("You do not have permission to access this Board"));

    render(
      <BoardMembersDialog
        board={board}
        isOpen
        isWorkspaceOwner
        currentUserId="user-1"
        onClose={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox", { name: /Add Workspace member/i });
    fireEvent.change(select, { target: { value: "user-2" } });

    fireEvent.click(screen.getByRole("button", { name: /Add to board/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
