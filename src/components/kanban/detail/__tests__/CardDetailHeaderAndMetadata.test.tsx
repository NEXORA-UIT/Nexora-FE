import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
