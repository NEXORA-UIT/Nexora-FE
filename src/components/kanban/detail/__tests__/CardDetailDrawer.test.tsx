import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CardDetailDrawer } from "../CardDetailDrawer";
import type { CardDetailDrawerProps } from "../CardDetailDrawer";
import type { KanbanCard } from "@/types";
import { MOCK_BOARD_DETAIL, MOCK_BOARD_MEMBERS } from "@/mocks/data/kanban.mock";

describe("CardDetailDrawer Component", () => {
  const card101 = MOCK_BOARD_DETAIL.lists[0].cards.find((c) => c.id === "card-101")!;

  /**
   * Helper fixture to construct valid domain section bundles with sensible defaults
   * and allow individual test cases to provide targeted overrides.
   */
  const createTestProps = (overrides?: {
    card?: KanbanCard | null;
    isOpen?: boolean;
    onClose?: () => void;
    operations?: Partial<CardDetailDrawerProps["operations"]>;
    metadata?: Partial<CardDetailDrawerProps["metadata"]>;
    checklist?: Partial<CardDetailDrawerProps["checklist"]>;
    dependencies?: Partial<CardDetailDrawerProps["dependencies"]>;
    attachments?: Partial<CardDetailDrawerProps["attachments"]>;
    activity?: Partial<CardDetailDrawerProps["activity"]>;
  }): CardDetailDrawerProps => {
    return {
      card: overrides?.card !== undefined ? overrides.card : card101,
      isOpen: overrides?.isOpen ?? true,
      onClose: overrides?.onClose ?? vi.fn(),
      operations: {
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
        ...overrides?.operations,
      },
      metadata: {
        lists: MOCK_BOARD_DETAIL.lists,
        members: MOCK_BOARD_MEMBERS,
        boardLabels: [],
        onStatusChange: vi.fn().mockResolvedValue(true),
        ...overrides?.metadata,
      },
      checklist: {
        onAddItem: vi.fn(),
        onToggleItem: vi.fn(),
        onDeleteItem: vi.fn(),
        isLoading: false,
        error: null,
        ...overrides?.checklist,
      },
      dependencies: {
        boardCards: [card101],
        canManage: false,
        isLoading: false,
        error: null,
        ...overrides?.dependencies,
      },
      attachments: {
        isLoadingAttachments: false,
        attachmentsError: null,
        ...overrides?.attachments,
      },
      activity: {
        onAddComment: vi.fn(),
        onFetchActivities: vi.fn().mockResolvedValue([]),
        isLoadingComments: false,
        commentsError: null,
        ...overrides?.activity,
      },
    };
  };

  it("renders drawer with all sections when open and forwards activity interactions", async () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();
    const handleStatusChange = vi.fn();
    const handleDelete = vi.fn();
    const handleAddChecklist = vi.fn();
    const handleToggleChecklist = vi.fn();
    const handleDeleteChecklist = vi.fn();
    const handleAddComment = vi.fn().mockResolvedValue(undefined);
    const handleFetchActivities = vi.fn().mockResolvedValue([]);

    const props = createTestProps({
      card: card101,
      isOpen: true,
      onClose: handleClose,
      operations: {
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      },
      metadata: {
        lists: MOCK_BOARD_DETAIL.lists,
        members: MOCK_BOARD_MEMBERS,
        onStatusChange: handleStatusChange,
      },
      checklist: {
        onAddItem: handleAddChecklist,
        onToggleItem: handleToggleChecklist,
        onDeleteItem: handleDeleteChecklist,
      },
      activity: {
        onAddComment: handleAddComment,
        onFetchActivities: handleFetchActivities,
      },
    });

    render(<CardDetailDrawer {...props} />);

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

    // Exercise adding a comment callback
    const commentInput = screen.getByLabelText("Write a comment");
    fireEvent.change(commentInput, { target: { value: "Great work team!" } });
    const sendButton = screen.getByLabelText("Send comment");
    await act(async () => {
      fireEvent.click(sendButton);
    });
    expect(handleAddComment).toHaveBeenCalledWith(card101.id, "Great work team!");

    // Exercise lazy-loading activities when switching to Activity tab
    const activityTab = screen.getByRole("tab", { name: /Activity/i });
    await act(async () => {
      fireEvent.click(activityTab);
    });
    expect(handleFetchActivities).toHaveBeenCalledWith(card101.id);
  });

  it("returns null when card is null", () => {
    const props = createTestProps({
      card: null,
      isOpen: false,
    });

    const { container } = render(<CardDetailDrawer {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("defaults canManageDependencies to false (deny-by-default) when prop is omitted or explicitly false", () => {
    // 1. When canManage is omitted/undefined
    const { rerender } = render(
      <CardDetailDrawer
        {...createTestProps({
          dependencies: {
            canManage: undefined,
            onAddDependency: vi.fn(),
            onDeleteDependency: vi.fn(),
          },
        })}
      />
    );
    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();

    // 2. When canManage is explicitly false
    rerender(
      <CardDetailDrawer
        {...createTestProps({
          dependencies: {
            canManage: false,
            onAddDependency: vi.fn(),
            onDeleteDependency: vi.fn(),
          },
        })}
      />
    );
    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
  });

  it("renders Add dependency button when canManage is explicitly true", () => {
    const props = createTestProps({
      dependencies: {
        canManage: true,
        onAddDependency: vi.fn(),
        onDeleteDependency: vi.fn(),
      },
    });

    render(<CardDetailDrawer {...props} />);
    expect(screen.getByRole("button", { name: /Add dependency/i })).toBeDefined();
  });

  it("renders live UUID card with interactive assignee and label controls", () => {
    const liveCard: KanbanCard = {
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

    const props = createTestProps({
      card: liveCard,
      metadata: {
        lists: [],
        members: [],
      },
    });

    render(<CardDetailDrawer {...props} />);

    expect(screen.getByText("NEX-999")).toBeDefined();
    expect(screen.getByText("Live card from backend")).toBeDefined();
    expect(screen.getByRole("button", { name: /Assign member/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Manage labels/i })).toBeDefined();
  });

  it("threads comment error, retry and loading props down to activity component", () => {
    const handleRetry = vi.fn();
    const props = createTestProps({
      activity: {
        commentsError: "Failed to load comments",
        onRetryComments: handleRetry,
      },
    });

    render(<CardDetailDrawer {...props} />);

    expect(screen.getByText("Failed to load comments")).toBeDefined();
    const retryBtn = screen.getByRole("button", { name: /Retry/i });
    retryBtn.click();
    expect(handleRetry).toHaveBeenCalled();
  });

  it("threads attachment error, retry and loading props down to attachments component", () => {
    const handleRetry = vi.fn();
    const props = createTestProps({
      attachments: {
        attachmentsError: "Failed to load attachments",
        onRetryAttachments: handleRetry,
      },
    });

    render(<CardDetailDrawer {...props} />);

    expect(screen.getByText("Failed to load attachments")).toBeDefined();
    const retryBtn = screen.getByRole("button", { name: /Retry/i });
    retryBtn.click();
    expect(handleRetry).toHaveBeenCalled();
  });

  it("threads isWorkspaceOwner prop to attachments and enables delete", () => {
    const cardWithAttachment: KanbanCard = {
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

    // 1. With isWorkspaceOwner: true, delete button is visible for non-owner's attachment
    const { rerender } = render(
      <CardDetailDrawer
        {...createTestProps({
          card: cardWithAttachment,
          attachments: {
            currentUserId: "owner-outside-board",
            isWorkspaceOwner: true,
            onDeleteAttachment: vi.fn(),
          },
        })}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Delete document.pdf/i });
    expect(deleteBtn).toBeDefined();

    // 2. With isWorkspaceOwner: false and not the uploader, delete button is NOT rendered
    rerender(
      <CardDetailDrawer
        {...createTestProps({
          card: cardWithAttachment,
          attachments: {
            currentUserId: "regular-member-outside-board",
            isWorkspaceOwner: false,
            onDeleteAttachment: vi.fn(),
          },
        })}
      />
    );
    expect(screen.queryByRole("button", { name: /Delete document.pdf/i })).toBeNull();
  });

  it("renders correctly and triggers callbacks when configured via domain section bundles", async () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();
    const handleClose = vi.fn();
    const handleAddChecklist = vi.fn();
    const handleToggleChecklist = vi.fn();
    const handleDeleteChecklist = vi.fn();
    const handleRetryTasks = vi.fn();

    render(
      <CardDetailDrawer
        card={card101}
        isOpen={true}
        onClose={handleClose}
        operations={{
          onUpdate: handleUpdate,
          onDelete: handleDelete,
        }}
        metadata={{
          lists: MOCK_BOARD_DETAIL.lists,
          members: MOCK_BOARD_MEMBERS,
          boardLabels: [],
          onStatusChange: vi.fn(),
        }}
        checklist={{
          onAddItem: handleAddChecklist,
          onToggleItem: handleToggleChecklist,
          onDeleteItem: handleDeleteChecklist,
          isLoading: false,
          error: "Checklist error",
          onRetry: handleRetryTasks,
        }}
        dependencies={{
          boardCards: [card101],
          canManage: true,
          isLoading: false,
          error: null,
          onRetry: vi.fn(),
          onAddDependency: vi.fn(),
          onDeleteDependency: vi.fn(),
        }}
        attachments={{
          isLoadingAttachments: false,
          attachmentsError: null,
          onRetryAttachments: vi.fn(),
          currentUserId: "user-1",
        }}
        activity={{
          onAddComment: vi.fn(),
          onFetchActivities: vi.fn().mockResolvedValue([]),
          isLoadingComments: false,
          commentsError: null,
          onRetryComments: vi.fn(),
          currentUserId: "user-1",
        }}
      />
    );

    // Verify sections render
    expect(screen.getByText("NEX-101")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Priority")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Checklist" })).toBeDefined();
    expect(screen.getByText("Checklist error")).toBeDefined();
    expect(screen.getByRole("button", { name: /Add dependency/i })).toBeDefined();

    // Verify retry button works from checklist bundle
    const retryBtn = screen.getByRole("button", { name: /Retry/i });
    retryBtn.click();
    expect(handleRetryTasks).toHaveBeenCalled();
  });
});
