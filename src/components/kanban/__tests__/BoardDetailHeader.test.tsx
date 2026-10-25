import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { BoardDetailHeader } from "../BoardDetailHeader";
import type { BoardDetail } from "@/types";

const mockBoardDetail: BoardDetail = {
  id: "board-1",
  workspaceId: "ws-1",
  name: "Engineering Kanban",
  description: "Core sprint tracking",
  status: "ACTIVE",
  members: [{ id: "u-1", name: "Alice", initials: "AL", role: "PM" }],
  labels: [],
  lists: [],
  createdAt: "2026-10-09T00:00:00.000Z",
  updatedAt: "2026-10-09T00:00:00.000Z",
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("BoardDetailHeader", () => {
  it("renders board name, description, and workspace breadcrumb", () => {
    renderWithRouter(<BoardDetailHeader board={mockBoardDetail} workspaceName="Nexora Team" />);

    expect(screen.getByRole("heading", { name: "Engineering Kanban" })).toBeTruthy();
    expect(screen.getByText("Core sprint tracking")).toBeTruthy();
    expect(screen.getByText("Nexora Team")).toBeTruthy();
  });

  it("opens options dropdown and triggers onEditBoardClick when clicked", async () => {
    const onEditBoardClick = vi.fn();
    renderWithRouter(
      <BoardDetailHeader
        board={mockBoardDetail}
        canManageBoard={true}
        onEditBoardClick={onEditBoardClick}
      />
    );

    const optionsButton = screen.getByRole("button", { name: /Board options/i });
    fireEvent.keyDown(optionsButton, { key: "Enter" });

    const editMenuItem = await screen.findByText(/Edit Board Details/i);
    expect(editMenuItem).toBeTruthy();

    fireEvent.click(editMenuItem);
    expect(onEditBoardClick).toHaveBeenCalledTimes(1);
  });

  it("disables Edit Board Details menu item when isEditDisabled is true", async () => {
    renderWithRouter(
      <BoardDetailHeader
        board={mockBoardDetail}
        canManageBoard={true}
        isEditDisabled={true}
        editDisabledReason="Cannot edit an archived board."
      />
    );

    const optionsButton = screen.getByRole("button", { name: /Board options/i });
    fireEvent.keyDown(optionsButton, { key: "Enter" });

    const editMenuItemText = await screen.findByText(/Edit Board Details/i);
    const editMenuItem = editMenuItemText.closest("[role='menuitem']");
    expect(editMenuItem).toBeTruthy();
    expect(
      editMenuItem?.getAttribute("aria-disabled") === "true" ||
        editMenuItem?.hasAttribute("disabled")
    ).toBe(true);
    expect(editMenuItem?.getAttribute("title")).toBe("Cannot edit an archived board.");
  });

  it("disables Edit Board Details menu item when user cannot manage board", async () => {
    renderWithRouter(<BoardDetailHeader board={mockBoardDetail} canManageBoard={false} />);

    const optionsButton = screen.getByRole("button", { name: /Board options/i });
    fireEvent.keyDown(optionsButton, { key: "Enter" });

    const editMenuItemText = await screen.findByText(/Edit Board Details/i);
    const editMenuItem = editMenuItemText.closest("[role='menuitem']");
    expect(editMenuItem).toBeTruthy();
    expect(
      editMenuItem?.getAttribute("aria-disabled") === "true" ||
        editMenuItem?.hasAttribute("disabled")
    ).toBe(true);
    expect(editMenuItem?.getAttribute("title")).toBe(
      "Only Workspace Owners and Board PMs can edit board details."
    );
  });

  it("lets a Board member leave from the options menu", async () => {
    const onLeaveBoard = vi.fn();
    renderWithRouter(
      <BoardDetailHeader board={mockBoardDetail} canLeaveBoard onLeaveBoard={onLeaveBoard} />
    );

    fireEvent.keyDown(screen.getByRole("button", { name: /Board options/i }), { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: /Leave Board/i }));

    expect(onLeaveBoard).toHaveBeenCalledOnce();
  });

  it("explains why a Board PM cannot leave before assigning a replacement", async () => {
    renderWithRouter(
      <BoardDetailHeader
        board={mockBoardDetail}
        leaveBoardDisabledReason="Assign another PM before leaving this Board."
      />
    );

    fireEvent.keyDown(screen.getByRole("button", { name: /Board options/i }), { key: "Enter" });
    const leaveItem = await screen.findByRole("menuitem", { name: /Leave Board/i });

    expect(
      leaveItem.hasAttribute("disabled") || leaveItem.getAttribute("aria-disabled") === "true"
    ).toBe(true);
    expect(screen.getByText("Assign another PM before leaving this Board.")).toBeTruthy();
  });
});
