import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardDetailHeader } from "../CardDetailHeader";
import { CardDetailMetadata } from "../CardDetailMetadata";
import { MOCK_BOARD_DETAIL, MOCK_BOARD_MEMBERS } from "@/mocks/data/kanban.mock";

describe("CardDetailHeader & CardDetailMetadata", () => {
  const card = MOCK_BOARD_DETAIL.lists[0].cards[0];

  it("renders card code and title", () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();
    const handleClose = vi.fn();

    render(
      <CardDetailHeader
        card={card}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    );

    expect(screen.getByText(card.code)).toBeDefined();
    expect(screen.getByText(card.title)).toBeDefined();
  });

  it("renders status, priority, and assignees in metadata", () => {
    const handleStatusChange = vi.fn();
    const handleUpdate = vi.fn();

    render(
      <CardDetailMetadata
        card={card}
        lists={MOCK_BOARD_DETAIL.lists}
        members={MOCK_BOARD_MEMBERS}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdate}
      />
    );

    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Priority")).toBeDefined();
    expect(screen.getByText("Assignee")).toBeDefined();
    expect(screen.getByText("Due date")).toBeDefined();
  });
  it("allows title editing and commits on Enter", async () => {
    const handleUpdate = vi.fn().mockResolvedValue(undefined);
    const handleDelete = vi.fn();
    const handleClose = vi.fn();

    render(
      <CardDetailHeader
        card={card}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    );

    const titleHeading = screen.getByText(card.title);
    fireEvent.click(titleHeading);

    const titleInput = screen.getByRole("textbox", { name: /Card title/i });
    expect(titleInput).toBeDefined();

    fireEvent.change(titleInput, { target: { value: "Updated task title" } });
    fireEvent.keyDown(titleInput, { key: "Enter" });

    expect(handleUpdate).toHaveBeenCalledWith({
      title: "Updated task title",
      updatedAt: card.updatedAt,
    });
  });

  it("opens delete confirmation modal and commits on confirm", async () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <CardDetailHeader
        card={card}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    );

    // Open dropdown menu via keyboard or pointerDown for Radix UI
    const menuBtn = screen.getByRole("button", { name: /More card actions/i });
    fireEvent.keyDown(menuBtn, { key: "Enter" });

    // Click Delete in menu
    const deleteMenuItem = await screen.findByText("Delete card");
    fireEvent.click(deleteMenuItem);

    // Confirmation dialog should be visible
    expect(screen.getByText("Delete card?")).toBeDefined();
    expect(
      screen.getByText(/This will permanently remove the card from the board/i)
    ).toBeDefined();

    // Click Confirm Delete in dialog
    const confirmButtons = screen.getAllByRole("button", { name: /Delete card/i });
    // The button inside dialog
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    expect(handleDelete).toHaveBeenCalledWith(card.id);
  });
});
