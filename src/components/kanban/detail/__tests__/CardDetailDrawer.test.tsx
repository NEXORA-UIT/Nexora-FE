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

  it("defaults canManageDependencies to false (deny-by-default) when prop is omitted", () => {
    render(
      <CardDetailDrawer
        card={card101}
        isOpen={true}
        lists={MOCK_BOARD_DETAIL.lists}
        members={MOCK_BOARD_MEMBERS}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onAddChecklistItem={vi.fn()}
        onToggleChecklistItem={vi.fn()}
        onDeleteChecklistItem={vi.fn()}
        onAddComment={vi.fn()}
        onFetchActivities={vi.fn().mockResolvedValue([])}
        onAddDependency={vi.fn()}
        onDeleteDependency={vi.fn()}
      />
    );

    // With canManageDependencies omitted, Add dependency button should NOT render
    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
  });

  it("renders Add dependency button when canManageDependencies is explicitly true", () => {
    render(
      <CardDetailDrawer
        card={card101}
        isOpen={true}
        lists={MOCK_BOARD_DETAIL.lists}
        members={MOCK_BOARD_MEMBERS}
        canManageDependencies={true}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onAddChecklistItem={vi.fn()}
        onToggleChecklistItem={vi.fn()}
        onDeleteChecklistItem={vi.fn()}
        onAddComment={vi.fn()}
        onFetchActivities={vi.fn().mockResolvedValue([])}
        onAddDependency={vi.fn()}
        onDeleteDependency={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /Add dependency/i })).toBeDefined();
  });

  it("renders live UUID card with interactive assignee and label controls", () => {
    const liveCard = {
      id: "9c3f4e12-8a7b-4d6c-b3a1-123456789abc",
      listId: "2b1c4e12-8a7b-4d6c-b3a1-123456789abc",
      boardId: "1a1c4e12-8a7b-4d6c-b3a1-123456789abc",
      code: "NEX-999",
      title: "Live card from backend",
      priority: "MEDIUM" as const,
      position: 1024,
      status: "ACTIVE" as const,
      statusGroup: "TODO" as const,
      assignees: [],
      labels: [],
      tasksCount: 0,
      completedTasksCount: 0,
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    };

    render(
      <CardDetailDrawer
        card={liveCard}
        isOpen={true}
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

    expect(screen.getByText("NEX-999")).toBeDefined();
    expect(screen.getByText("Live card from backend")).toBeDefined();
    expect(screen.getByRole("button", { name: /Assign member/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Manage labels/i })).toBeDefined();
  });

  it("threads comment error, retry and loading props down to activity component", () => {
    const handleRetry = vi.fn();
    render(
      <CardDetailDrawer
        card={card101}
        isOpen={true}
        lists={MOCK_BOARD_DETAIL.lists}
        members={MOCK_BOARD_MEMBERS}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onAddChecklistItem={vi.fn()}
        onToggleChecklistItem={vi.fn()}
        onDeleteChecklistItem={vi.fn()}
        onAddComment={vi.fn()}
        onFetchActivities={vi.fn()}
        commentsError="Failed to load comments"
        onRetryComments={handleRetry}
      />
    );

    expect(screen.getByText("Failed to load comments")).toBeDefined();
    const retryBtn = screen.getByRole("button", { name: /Retry/i });
    retryBtn.click();
    expect(handleRetry).toHaveBeenCalled();
  });

  it("threads attachment error, retry and loading props down to attachments component", () => {
    const handleRetry = vi.fn();
    render(
      <CardDetailDrawer
        card={card101}
        isOpen={true}
        lists={MOCK_BOARD_DETAIL.lists}
        members={MOCK_BOARD_MEMBERS}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onAddChecklistItem={vi.fn()}
        onToggleChecklistItem={vi.fn()}
        onDeleteChecklistItem={vi.fn()}
        onAddComment={vi.fn()}
        onFetchActivities={vi.fn()}
        attachmentsError="Failed to load attachments"
        onRetryAttachments={handleRetry}
      />
    );

    expect(screen.getByText("Failed to load attachments")).toBeDefined();
    const retryBtn = screen.getByRole("button", { name: /Retry/i });
    retryBtn.click();
    expect(handleRetry).toHaveBeenCalled();
  });

  it("threads isWorkspaceOwner prop to attachments and enables delete", () => {
    const cardWithAttachment = {
      ...card101,
      attachments: [
        {
          id: "att-drawer-1",
          cardId: card101.id,
          userId: "some-other-user",
          fileName: "document.pdf",
          fileSize: 1024,
          mimeType: "application/pdf",
          uploadedBy: {
            id: "some-other-user",
            name: "Other User",
            initials: "OU",
          },
          createdAt: "2026-10-10T00:00:00.000Z",
        },
      ],
    };

    render(
      <CardDetailDrawer
        card={cardWithAttachment}
        isOpen={true}
        lists={MOCK_BOARD_DETAIL.lists}
        members={MOCK_BOARD_MEMBERS}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onAddChecklistItem={vi.fn()}
        onToggleChecklistItem={vi.fn()}
        onDeleteChecklistItem={vi.fn()}
        onAddComment={vi.fn()}
        onFetchActivities={vi.fn()}
        onDeleteAttachment={vi.fn()}
        currentUserId="owner-outside-board"
        isWorkspaceOwner={true}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Delete document.pdf/i });
    expect(deleteBtn).toBeDefined();
  });
});


