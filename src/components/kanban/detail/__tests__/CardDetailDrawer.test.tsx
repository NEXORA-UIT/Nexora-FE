import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardDetailDrawer } from "../CardDetailDrawer";
import { MOCK_BOARD_DETAIL, MOCK_BOARD_MEMBERS } from "@/mocks/data/kanban.mock";

describe("CardDetailDrawer Component", () => {
  const card101 = MOCK_BOARD_DETAIL.lists[0].cards.find((c) => c.id === "card-101")!;

  it("renders drawer with all sections when open", () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();
    const handleStatusChange = vi.fn();
    const handleDelete = vi.fn();
    const handleAddChecklist = vi.fn();
    const handleToggleChecklist = vi.fn();
    const handleDeleteChecklist = vi.fn();
    const handleAddComment = vi.fn();
    const handleFetchActivities = vi.fn().mockResolvedValue([]);

    render(
      <CardDetailDrawer
        card={card101}
        isOpen={true}
        lists={MOCK_BOARD_DETAIL.lists}
        members={MOCK_BOARD_MEMBERS}
        onClose={handleClose}
        onUpdate={handleUpdate}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onAddChecklistItem={handleAddChecklist}
        onToggleChecklistItem={handleToggleChecklist}
        onDeleteChecklistItem={handleDeleteChecklist}
        onAddComment={handleAddComment}
        onFetchActivities={handleFetchActivities}
      />
    );

    // Code and title
    expect(screen.getByText("NEX-101")).toBeDefined();
    expect(screen.getByText(card101.title)).toBeDefined();

    // Metadata section
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Priority")).toBeDefined();

    // Description section
    expect(screen.getByText(/Description/i)).toBeDefined();

    // Checklist section
    expect(screen.getByText(/Checklist/i)).toBeDefined();

    // Dependencies section
    expect(screen.getByText(/Dependencies & Prerequisites/i)).toBeDefined();

    // Attachments section
    expect(screen.getByText(/Attachments/i)).toBeDefined();

    // Comments section
    expect(screen.getByText(/Comments/i)).toBeDefined();
  });

  it("returns null when card is null", () => {
    const { container } = render(
      <CardDetailDrawer
        card={null}
        isOpen={false}
        lists={[]}
        members={[]}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onAddChecklistItem={vi.fn()}
        onToggleChecklistItem={vi.fn()}
        onDeleteChecklistItem={vi.fn()}
        onAddComment={vi.fn()}
        onFetchActivities={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
