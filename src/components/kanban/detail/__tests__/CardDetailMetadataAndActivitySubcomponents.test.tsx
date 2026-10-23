import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import {
  CardStatusSelector,
  CardPrioritySelector,
  CardAssigneeSelector,
  CardDateFields,
  CardLabelSelector,
} from "../metadata";
import {
  CardCommentItem,
  CardCommentsTab,
  CardActivityTab,
} from "../activity";
import type {
  KanbanCard,
  KanbanList,
  BoardMember,
  BoardLabel,
  CardComment,
  CardActivity,
} from "@/types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Card Detail Subcomponents (CC-003 & CC-004)", () => {
  const dummyCard: KanbanCard = {
    id: "card-sub-1",
    listId: "list-1",
    boardId: "b-1",
    code: "NEX-101",
    title: "Test Card",
    description: "Description",
    priority: "MEDIUM",
    startDate: "2026-10-01T00:00:00.000Z",
    dueDate: "2026-10-15T00:00:00.000Z",
    position: 1000,
    status: "ACTIVE",
    assignees: [
      { id: "u-1", name: "Alice Smith", initials: "AS", role: "MEMBER" },
    ],
    labels: [
      { id: "lbl-1", boardId: "b-1", name: "Frontend", color: "#3b82f6" },
    ],
    tasksCount: 0,
    completedTasksCount: 0,
    checklist: [],
    comments: [],
    attachments: [],
    dependencies: [],
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-10T12:00:00.000Z",
  };

  const dummyLists: KanbanList[] = [
    { id: "list-1", boardId: "b-1", name: "To Do", position: 1000, category: "TODO", status: "ACTIVE", cards: [], createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-01T00:00:00.000Z" },
    { id: "list-2", boardId: "b-1", name: "In Progress", position: 2000, category: "IN_PROGRESS", status: "ACTIVE", cards: [], createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-01T00:00:00.000Z" },
    { id: "list-3", boardId: "b-1", name: "Done", position: 3000, category: "DONE", status: "ACTIVE", cards: [], createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-01T00:00:00.000Z" },
  ];

  const dummyMembers: BoardMember[] = [
    { id: "u-1", name: "Alice Smith", initials: "AS", role: "MEMBER" },
    { id: "u-2", name: "Bob Jones", initials: "BJ", role: "MEMBER" },
  ];

  const dummyBoardLabels: BoardLabel[] = [
    { id: "lbl-1", boardId: "b-1", name: "Frontend", color: "#3b82f6" },
    { id: "lbl-2", boardId: "b-1", name: "Backend", color: "#10b981" },
  ];

  describe("CC-003: Metadata Subcomponents", () => {
    it("CardStatusSelector renders current status and triggers onStatusChange", async () => {
      const handleStatusChange = vi.fn().mockResolvedValue(true);
      render(
        <CardStatusSelector
          card={dummyCard}
          lists={dummyLists}
          onStatusChange={handleStatusChange}
        />
      );

      const trigger = screen.getByRole("button", { name: /to do/i });
      expect(trigger).toBeDefined();
      fireEvent.keyDown(trigger, { key: "Enter" });

      const inProgressOption = await screen.findByRole("menuitem", { name: /in progress/i });
      fireEvent.click(inProgressOption);

      expect(handleStatusChange).toHaveBeenCalledWith(dummyCard, "IN_PROGRESS");
    });

    it("CardPrioritySelector renders priority and triggers onUpdate", async () => {
      const handleUpdate = vi.fn().mockResolvedValue(undefined);
      render(
        <CardPrioritySelector
          priority={dummyCard.priority}
          cardUpdatedAt={dummyCard.updatedAt}
          onUpdate={handleUpdate}
        />
      );

      const trigger = screen.getByRole("button", { name: /medium/i });
      fireEvent.keyDown(trigger, { key: "Enter" });

      const urgentOption = await screen.findByRole("menuitem", { name: /urgent/i });
      fireEvent.click(urgentOption);

      expect(handleUpdate).toHaveBeenCalledWith({
        priority: "URGENT",
        updatedAt: dummyCard.updatedAt,
      });
    });

    it("CardAssigneeSelector handles assignments error and retry", () => {
      const handleRetry = vi.fn();
      render(
        <CardAssigneeSelector
          cardId={dummyCard.id}
          assignees={dummyCard.assignees}
          members={dummyMembers}
          assignmentsError="Failed to load assignees"
          onRetryAssignments={handleRetry}
        />
      );

      expect(screen.getByText("Failed to load assignees")).toBeDefined();
      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("CardDateFields triggers onUpdate when changing date inputs", () => {
      const handleUpdate = vi.fn().mockResolvedValue(undefined);
      render(
        <CardDateFields
          startDate={dummyCard.startDate}
          dueDate={dummyCard.dueDate}
          cardUpdatedAt={dummyCard.updatedAt}
          onUpdate={handleUpdate}
        />
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBe(2);

      fireEvent.change(dateInputs[0], { target: { value: "2026-10-05" } });
      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.stringContaining("2026-10-05"),
          updatedAt: dummyCard.updatedAt,
        })
      );
    });

    it("CardDateFields triggers showPicker when clicking start date and due date buttons", () => {
      const handleUpdate = vi.fn().mockResolvedValue(undefined);
      render(
        <CardDateFields
          startDate={dummyCard.startDate}
          dueDate={dummyCard.dueDate}
          cardUpdatedAt={dummyCard.updatedAt}
          onUpdate={handleUpdate}
        />
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      const showPickerStart = vi.fn();
      const showPickerDue = vi.fn();
      (dateInputs[0] as HTMLInputElement).showPicker = showPickerStart;
      (dateInputs[1] as HTMLInputElement).showPicker = showPickerDue;

      const startTrigger = screen.getByRole("button", { name: /start date/i });
      fireEvent.click(startTrigger);
      expect(showPickerStart).toHaveBeenCalledTimes(1);

      const dueTrigger = screen.getByRole("button", { name: /due date/i });
      fireEvent.click(dueTrigger);
      expect(showPickerDue).toHaveBeenCalledTimes(1);
    });

    it("CardDateFields validates date order on client-side and toasts in English when invalid", () => {
      const handleUpdate = vi.fn().mockResolvedValue(undefined);
      render(
        <CardDateFields
          startDate="2026-10-15T00:00:00.000Z"
          dueDate="2026-10-20T00:00:00.000Z"
          cardUpdatedAt={dummyCard.updatedAt}
          onUpdate={handleUpdate}
        />
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      // Set dueDate earlier than startDate (2026-10-05 < 2026-10-15)
      fireEvent.change(dateInputs[1], { target: { value: "2026-10-05" } });

      expect(handleUpdate).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Start date must be before or equal to due date.");
    });

    it("CardLabelSelector renders labels error and retry", () => {
      const handleRetry = vi.fn();
      render(
        <CardLabelSelector
          cardId={dummyCard.id}
          cardLabels={dummyCard.labels}
          boardLabels={dummyBoardLabels}
          labelsError="Failed to sync labels"
          onRetryLabels={handleRetry}
        />
      );

      expect(screen.getByText("Failed to sync labels")).toBeDefined();
      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("CardLabelSelector allows creating a new board label when empty or requested", async () => {
      const handleCreateLabel = vi.fn().mockResolvedValue({
        id: "lbl-new",
        boardId: "b-1",
        name: "New Tag",
        color: "#f59e0b",
      });
      const handleAttach = vi.fn().mockResolvedValue(undefined);

      render(
        <CardLabelSelector
          cardId={dummyCard.id}
          cardLabels={[]}
          boardLabels={[]}
          onCreateBoardLabel={handleCreateLabel}
          onAttachLabel={handleAttach}
        />
      );

      const trigger = screen.getByRole("button", { name: /manage labels/i });
      fireEvent.keyDown(trigger, { key: "Enter" });

      const createBtn = await screen.findByRole("button", { name: /create label/i });
      expect(createBtn).toBeDefined();
    });
  });

  describe("CC-004: Activity & Comments Subcomponents", () => {
    const dummyComment: CardComment = {
      id: "cmt-1",
      cardId: "card-sub-1",
      userId: "u-1",
      author: { id: "u-1", name: "Alice Smith", initials: "AS" },
      content: "This is a comment",
      createdAt: "2026-10-10T10:00:00.000Z",
      updatedAt: "2026-10-10T10:00:00.000Z",
      isDeleted: false,
      deletedAt: null,
    };

    it("CardCommentItem displays comment and author actions for author", () => {
      render(
        <CardCommentItem
          comment={dummyComment}
          effectiveUserId="u-1"
          isEditing={false}
          editText=""
          isSavingEdit={false}
          isConfirmingDelete={false}
          isDeleting={false}
          onStartEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          onEditTextChange={vi.fn()}
          onSaveEdit={vi.fn()}
          onToggleConfirmDelete={vi.fn()}
          onCancelConfirmDelete={vi.fn()}
          onConfirmDelete={vi.fn()}
          canUpdateComment={true}
          canDeleteComment={true}
        />
      );

      expect(screen.getByText("This is a comment")).toBeDefined();
      expect(screen.getByText("Alice Smith")).toBeDefined();
      expect(screen.getByRole("button", { name: /edit comment/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /delete comment/i })).toBeDefined();
    });

    it("CardCommentItem renders tombstone when deleted", () => {
      const deletedComment: CardComment = {
        ...dummyComment,
        content: null,
        isDeleted: true,
        deletedAt: "2026-10-10T11:00:00.000Z",
      };

      render(
        <CardCommentItem
          comment={deletedComment}
          effectiveUserId="u-1"
          isEditing={false}
          editText=""
          isSavingEdit={false}
          isConfirmingDelete={false}
          isDeleting={false}
          onStartEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          onEditTextChange={vi.fn()}
          onSaveEdit={vi.fn()}
          onToggleConfirmDelete={vi.fn()}
          onCancelConfirmDelete={vi.fn()}
          onConfirmDelete={vi.fn()}
          canUpdateComment={true}
          canDeleteComment={true}
        />
      );

      expect(screen.getByText("This comment has been deleted.")).toBeDefined();
      expect(screen.queryByRole("button", { name: /edit comment/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /delete comment/i })).toBeNull();
    });

    it("CardCommentsTab submits comment and displays comments list", async () => {
      const handleAddComment = vi.fn().mockResolvedValue(undefined);
      render(
        <CardCommentsTab
          cardId="card-sub-1"
          comments={[dummyComment]}
          onAddComment={handleAddComment}
        />
      );

      const textarea = screen.getByRole("textbox", { name: /write a comment/i });
      fireEvent.change(textarea, { target: { value: "Brand new message" } });

      const submitBtn = screen.getByRole("button", { name: /send comment/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleAddComment).toHaveBeenCalledWith("card-sub-1", "Brand new message");
      });
    });

    it("CardActivityTab renders loading, error, and activity items with load more", () => {
      const handleRetry = vi.fn();
      const handleLoadMore = vi.fn().mockResolvedValue(undefined);

      const dummyActivities: CardActivity[] = [
        {
          id: "act-1",
          cardId: "card-sub-1",
          user: { id: "u-1", name: "Alice Smith", initials: "AS", role: "MEMBER" },
          action: "moved card to IN PROGRESS",
          createdAt: "2026-10-10T10:00:00.000Z",
        },
      ];

      // 1. Error state
      const { rerender } = render(
        <CardActivityTab
          activities={null}
          isLoading={false}
          isLoadingMore={false}
          error="Failed to load activities"
          nextCursor={null}
          onRetry={handleRetry}
          onLoadMore={handleLoadMore}
        />
      );

      expect(screen.getByText("Failed to load activities")).toBeDefined();
      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);

      // 2. Data loaded with nextCursor
      rerender(
        <CardActivityTab
          activities={dummyActivities}
          isLoading={false}
          isLoadingMore={false}
          error={null}
          nextCursor="cursor-123"
          onRetry={handleRetry}
          onLoadMore={handleLoadMore}
        />
      );

      expect(screen.getByText(/moved card to IN PROGRESS/i)).toBeDefined();
      const loadMoreBtn = screen.getByRole("button", { name: /load more activity/i });
      fireEvent.click(loadMoreBtn);
      expect(handleLoadMore).toHaveBeenCalledTimes(1);
    });
  });
});
