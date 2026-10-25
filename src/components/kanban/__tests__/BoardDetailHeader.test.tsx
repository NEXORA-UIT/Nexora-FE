import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { BoardDetailHeader } from "../BoardDetailHeader";
import type { BoardDetail } from "@/types";

const board = {
  id: "board-1",
  workspaceId: "workspace-1",
  name: "Sprint Planning",
  status: "ACTIVE",
  members: [],
  labels: [],
  lists: [],
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
} as BoardDetail;

describe("BoardDetailHeader actions", () => {
  it("opens Board membership management from the header action", () => {
    const onManageMembers = vi.fn();
    render(
      <MemoryRouter>
        <BoardDetailHeader board={board} onManageMembers={onManageMembers} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Board members" }));

    expect(onManageMembers).toHaveBeenCalledOnce();
  });

  it("shows working edit and archive actions in Board options", () => {
    const onEditBoard = vi.fn();
    const onArchiveBoard = vi.fn();
    render(
      <MemoryRouter>
        <BoardDetailHeader
          board={board}
          canManageBoard
          onEditBoard={onEditBoard}
          onArchiveBoard={onArchiveBoard}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Board options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit Board details" }));
    expect(onEditBoard).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Board options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Archive Board" }));
    expect(onArchiveBoard).toHaveBeenCalledOnce();
  });

  it("offers a Board member the option to leave the Board", () => {
    const onLeaveBoard = vi.fn();
    render(
      <MemoryRouter>
        <BoardDetailHeader board={board} canLeaveBoard onLeaveBoard={onLeaveBoard} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Board options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Leave Board" }));

    expect(onLeaveBoard).toHaveBeenCalledOnce();
  });

  it("explains why the Board PM cannot leave before assigning another PM", () => {
    render(
      <MemoryRouter>
        <BoardDetailHeader
          board={board}
          leaveBoardDisabledReason="Assign another PM before leaving this Board."
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Board options" }));

    expect(screen.getByRole("menuitem", { name: /Leave Board/ }).hasAttribute("disabled")).toBe(
      true
    );
    expect(screen.getByText("Assign another PM before leaving this Board.")).toBeTruthy();
  });
});
