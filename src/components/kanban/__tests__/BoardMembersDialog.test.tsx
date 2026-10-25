import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("BoardMembersDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBoardMembership).mockReturnValue({
      members: [],
      workspaceMembers: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      assignPm: vi.fn(),
    });
  });

  it("copies the current Board URL and reports success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<BoardMembersDialog board={board} isOpen isWorkspaceOwner={false} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy board link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
    expect(toast.success).toHaveBeenCalledWith("Board link copied to clipboard.");
  });

  it("reports when copying the Board URL fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<BoardMembersDialog board={board} isOpen isWorkspaceOwner={false} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy board link" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Could not copy the board link."));
  });

  it("shows the Workspace Owner, assigned Board PM, and Board member access levels", () => {
    vi.mocked(useBoardMembership).mockReturnValue({
      members: [
        { id: "pm-1", name: "Alex Kim", initials: "AK", role: "PM" },
        { id: "member-1", name: "Sam Lee", initials: "SL", role: "MEMBER" },
      ],
      workspaceMembers: [
        {
          id: "workspace-owner-membership",
          workspaceId: "workspace-1",
          userId: "owner-1",
          role: "OWNER",
          createdAt: "2026-10-01T00:00:00.000Z",
          updatedAt: "2026-10-01T00:00:00.000Z",
          endedAt: null,
          user: {
            id: "owner-1",
            email: "owner@nexora.app",
            fullName: "Jordan Owner",
            status: "ACTIVE",
          },
        },
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      assignPm: vi.fn(),
    });

    render(<BoardMembersDialog board={board} isOpen isWorkspaceOwner={false} onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Board access & roles" })).toBeTruthy();
    expect(screen.getByText("Jordan Owner")).toBeTruthy();
    expect(screen.getByText("Alex Kim")).toBeTruthy();
    expect(screen.getByText("Can access every Board in this Workspace")).toBeTruthy();
    expect(screen.getByText("Manages this Board")).toBeTruthy();
    expect(screen.getByText(/Board members can access this Board only/)).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Members" }), { button: 0 });
    expect(screen.getByRole("tab", { name: "Members" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toContain("Sam Lee");
  });

  it("separates access details from member management in keyboard-accessible tabs", () => {
    vi.mocked(useBoardMembership).mockReturnValue({
      members: [{ id: "member-1", name: "Sam Lee", initials: "SL", role: "MEMBER" }],
      workspaceMembers: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      assignPm: vi.fn(),
    });
    render(<BoardMembersDialog board={board} isOpen isWorkspaceOwner={false} onClose={vi.fn()} />);

    expect(screen.getByRole("tab", { name: "Access & roles" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    expect(screen.getByRole("heading", { name: "Board access & roles" })).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Members" }), { button: 0 });

    expect(screen.getByRole("tab", { name: "Access & roles" }).getAttribute("aria-selected")).toBe(
      "false"
    );
    expect(screen.getByRole("tab", { name: "Members" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toContain("Sam Lee");
  });
});
