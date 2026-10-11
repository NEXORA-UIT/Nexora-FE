import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CardDetailAttachments } from "../CardDetailAttachments";
import { CardDetailActivity } from "../CardDetailActivity";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";
import type { KanbanCard } from "@/types";

describe("CardDetailAttachments & CardDetailActivity", () => {
  const card101 = MOCK_BOARD_DETAIL.lists[0].cards.find((c) => c.id === "card-101")!;

  it("renders attachments list and disabled upload indicator", () => {
    render(<CardDetailAttachments card={card101} />);

    expect(screen.getByText(/Attachments/i)).toBeDefined();
    expect(screen.getByText("copydeck_v2.docx")).toBeDefined();
    expect(screen.getByText("landing-mockup.png")).toBeDefined();
    expect(screen.getByText("+ Upload")).toBeDefined();
  });

  it("renders comments by default and lazy-loads activity when switching tab", async () => {
    const handleAddComment = vi.fn();
    const handleFetchActivities = vi.fn().mockResolvedValue([
      {
        id: "act-1",
        cardId: "card-101",
        user: { id: "m-1", name: "Phan Gia Đạt", initials: "Đ", role: "PM" },
        action: "updated status to IN PROGRESS",
        createdAt: "2026-09-20T10:00:00.000Z",
      },
    ]);

    render(
      <CardDetailActivity
        card={card101}
        onAddComment={handleAddComment}
        onFetchActivities={handleFetchActivities}
      />
    );

    // Initial tab: Comments
    expect(screen.getByText(/Comments/i)).toBeDefined();
    expect(screen.getByText(/Initial draft is ready for review/i)).toBeDefined();
    // Activities should not be called yet
    expect(handleFetchActivities).not.toHaveBeenCalled();

    // Click Activity tab
    const activityTab = screen.getByRole("tab", { name: /Activity/i });
    fireEvent.click(activityTab);

    // Should trigger lazy load
    await waitFor(() => {
      expect(handleFetchActivities).toHaveBeenCalledWith("card-101");
      expect(screen.getByText(/updated status to IN PROGRESS/i)).toBeDefined();
    });
  });

  it("submits comment using Ctrl+Enter shortcut and validates non-empty content", async () => {
    const handleAddComment = vi.fn().mockResolvedValue(undefined);
    const handleFetchActivities = vi.fn();

    render(
      <CardDetailActivity
        card={card101}
        onAddComment={handleAddComment}
        onFetchActivities={handleFetchActivities}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Send comment/i });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);

    const textarea = screen.getByRole("textbox", { name: /Write a comment/i });
    fireEvent.change(textarea, { target: { value: "A new constructive remark" } });
    expect(submitBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });

    expect(handleAddComment).toHaveBeenCalledWith("card-101", "A new constructive remark");
  });

  describe("Card Comments UI Features (Step 6E)", () => {
    const authorUser = { id: "user-author-1", name: "Author User", initials: "AU" };
    const otherUser = { id: "user-other-2", name: "Other User", initials: "OU" };

    const testCard: KanbanCard = {
      ...card101,
      id: "card-test-comments",
      comments: [
        {
          id: "cmt-1",
          cardId: "card-test-comments",
          userId: "user-author-1",
          author: authorUser,
          content: "First author comment",
          createdAt: "2026-10-10T10:00:00.000Z",
          updatedAt: "2026-10-10T10:00:00.000Z",
          isDeleted: false,
          deletedAt: null,
        },
        {
          id: "cmt-2",
          cardId: "card-test-comments",
          userId: "user-other-2",
          author: otherUser,
          content: "Other member comment",
          createdAt: "2026-10-10T11:00:00.000Z",
          updatedAt: "2026-10-10T11:00:00.000Z",
          isDeleted: false,
          deletedAt: null,
        },
        {
          id: "cmt-3",
          cardId: "card-test-comments",
          userId: "user-author-1",
          author: authorUser,
          content: null,
          createdAt: "2026-10-10T12:00:00.000Z",
          updatedAt: "2026-10-10T12:05:00.000Z",
          isDeleted: true,
          deletedAt: "2026-10-10T12:05:00.000Z",
        },
      ],
    };

    it("renders soft-deleted tombstone for comments with null content and hides edit/delete", () => {
      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
          currentUserId="user-author-1"
        />
      );

      expect(screen.getByText("This comment has been deleted.")).toBeDefined();
    });

    it("only shows edit/delete action buttons to the author of the comment", () => {
      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
          onUpdateComment={vi.fn()}
          onDeleteComment={vi.fn()}
          currentUserId="user-author-1"
        />
      );

      // cmt-1 is authored by user-author-1, so edit/delete buttons exist
      const editButtons = screen.getAllByRole("button", { name: /Edit comment/i });
      expect(editButtons).toHaveLength(1);

      const deleteButtons = screen.getAllByRole("button", { name: /Delete comment/i });
      expect(deleteButtons).toHaveLength(1);
    });

    it("hides edit/delete action buttons when user is not the author", () => {
      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
          onUpdateComment={vi.fn()}
          onDeleteComment={vi.fn()}
          currentUserId="user-non-author-99"
        />
      );

      expect(screen.queryByRole("button", { name: /Edit comment/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /Delete comment/i })).toBeNull();
    });

    it("supports inline edit with save and cancel", async () => {
      const handleUpdateComment = vi.fn().mockResolvedValue(undefined);

      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
          onUpdateComment={handleUpdateComment}
          currentUserId="user-author-1"
        />
      );

      // Click Edit button
      const editBtn = screen.getByRole("button", { name: /Edit comment/i });
      fireEvent.click(editBtn);

      // Edit textarea appears
      const editTextarea = screen.getByRole("textbox", { name: /Edit comment text/i });
      expect((editTextarea as HTMLTextAreaElement).value).toBe("First author comment");

      // Change text
      fireEvent.change(editTextarea, { target: { value: "Updated author comment text" } });

      // Click Save
      const saveBtn = screen.getByRole("button", { name: /Save/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(handleUpdateComment).toHaveBeenCalledWith("cmt-1", "Updated author comment text");
      });
    });

    it("cancels inline edit when Cancel is clicked", () => {
      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
          onUpdateComment={vi.fn()}
          currentUserId="user-author-1"
        />
      );

      const editBtn = screen.getByRole("button", { name: /Edit comment/i });
      fireEvent.click(editBtn);

      expect(screen.getByRole("textbox", { name: /Edit comment text/i })).toBeDefined();

      const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      expect(screen.queryByRole("textbox", { name: /Edit comment text/i })).toBeNull();
    });

    it("confirms before deleting a comment", async () => {
      const handleDeleteComment = vi.fn().mockResolvedValue(undefined);

      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
          onDeleteComment={handleDeleteComment}
          currentUserId="user-author-1"
        />
      );

      // Click Delete icon button
      const deleteIconBtn = screen.getByRole("button", { name: /Delete comment/i });
      fireEvent.click(deleteIconBtn);

      // Confirmation banner appears
      expect(screen.getByText("Delete this comment?")).toBeDefined();

      // Click confirm Delete
      const confirmDeleteBtn = screen.getByRole("button", { name: /^Delete$/i });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(handleDeleteComment).toHaveBeenCalledWith("cmt-1");
      });
    });

    it("preserves comment input text when onAddComment rejects", async () => {
      const handleAddComment = vi.fn().mockRejectedValue(new Error("Network failed"));

      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={handleAddComment}
          onFetchActivities={vi.fn()}
        />
      );

      const textarea = screen.getByRole("textbox", { name: /Write a comment/i });
      fireEvent.change(textarea, { target: { value: "Important draft message" } });

      const submitBtn = screen.getByRole("button", { name: /Send comment/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleAddComment).toHaveBeenCalled();
      });

      // Textarea content must NOT be cleared!
      expect((textarea as HTMLTextAreaElement).value).toBe("Important draft message");
    });

    it("renders loading skeletons when isLoadingComments is true", () => {
      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
          isLoadingComments={true}
        />
      );

      expect(screen.queryByText("First author comment")).toBeNull();
    });

    it("renders error banner and invokes onRetryComments on button click", () => {
      const handleRetry = vi.fn();

      render(
        <CardDetailActivity
          card={testCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
          commentsError="Failed to fetch comments"
          onRetryComments={handleRetry}
        />
      );

      expect(screen.getByText("Failed to fetch comments")).toBeDefined();
      const retryBtn = screen.getByRole("button", { name: /Retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });

    it("renders empty state message when card has 0 comments", () => {
      const emptyCard = { ...testCard, comments: [] };

      render(
        <CardDetailActivity
          card={emptyCard}
          onAddComment={vi.fn()}
          onFetchActivities={vi.fn()}
        />
      );

      expect(screen.getByText("No comments yet. Start the conversation!")).toBeDefined();
    });
  });

  describe("Card Attachments UI Features (Step 6F)", () => {
    const authorUser = { id: "user-author-1", name: "Author User", initials: "AU" };
    const otherUser = { id: "user-other-2", name: "Other User", initials: "OU" };

    const testAttachmentCard: KanbanCard = {
      ...card101,
      id: "card-test-attachments",
      attachments: [
        {
          id: "att-1",
          cardId: "card-test-attachments",
          userId: "user-author-1",
          fileName: "design_system.pdf",
          fileSize: 1048576,
          mimeType: "application/pdf",
          uploadedBy: authorUser,
          createdAt: "2026-10-10T10:00:00.000Z",
        },
        {
          id: "att-2",
          cardId: "card-test-attachments",
          userId: "user-other-2",
          fileName: "screenshot.png",
          fileSize: 524288,
          mimeType: "image/png",
          uploadedBy: otherUser,
          createdAt: "2026-10-10T11:00:00.000Z",
        },
      ],
    };

    it("triggers file picker when + Upload button is clicked", () => {
      const handleUpload = vi.fn();
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onUploadAttachment={handleUpload}
        />
      );

      const uploadBtn = screen.getByRole("button", { name: /Upload attachment/i });
      expect(uploadBtn).toBeDefined();

      const fileInput = screen.getByLabelText(/Upload attachment file/i) as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, "click");

      fireEvent.click(uploadBtn);
      expect(clickSpy).toHaveBeenCalled();
    });

    it("validates 0-byte file and prevents upload", async () => {
      const handleUpload = vi.fn();
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onUploadAttachment={handleUpload}
        />
      );

      const fileInput = screen.getByLabelText(/Upload attachment file/i);
      const emptyFile = new File([""], "empty.pdf", { type: "application/pdf" });

      fireEvent.change(fileInput, { target: { files: [emptyFile] } });
      expect(handleUpload).not.toHaveBeenCalled();
    });

    it("validates file larger than 25MB and prevents upload", async () => {
      const handleUpload = vi.fn();
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onUploadAttachment={handleUpload}
        />
      );

      const fileInput = screen.getByLabelText(/Upload attachment file/i);
      const largeFile = new File(["huge"], "huge.pdf", { type: "application/pdf" });
      Object.defineProperty(largeFile, "size", { value: 26 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      expect(handleUpload).not.toHaveBeenCalled();
    });

    it("validates unsupported file extension and prevents upload", async () => {
      const handleUpload = vi.fn();
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onUploadAttachment={handleUpload}
        />
      );

      const fileInput = screen.getByLabelText(/Upload attachment file/i);
      const scriptFile = new File(["code"], "script.sh", { type: "application/x-sh" });

      fireEvent.change(fileInput, { target: { files: [scriptFile] } });
      expect(handleUpload).not.toHaveBeenCalled();
    });

    it("uploads valid file when selected", async () => {
      const handleUpload = vi.fn().mockResolvedValue(undefined);
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onUploadAttachment={handleUpload}
        />
      );

      const fileInput = screen.getByLabelText(/Upload attachment file/i);
      const validFile = new File(["valid content"], "document.pdf", { type: "application/pdf" });

      fireEvent.change(fileInput, { target: { files: [validFile] } });
      await waitFor(() => {
        expect(handleUpload).toHaveBeenCalledWith("card-test-attachments", validFile);
      });
    });

    it("downloads attachment when download button is clicked and cleans up Blob URL and DOM anchor", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      try {
        const mockBlob = new Blob(["content"], { type: "application/pdf" });
        window.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/test-blob-url");
        window.URL.revokeObjectURL = vi.fn();

        const handleDownload = vi.fn().mockResolvedValue(mockBlob);
        render(
          <CardDetailAttachments
            card={testAttachmentCard}
            onDownloadAttachment={handleDownload}
          />
        );

        const downloadButtons = screen.getAllByRole("button", { name: /Download/i });
        expect(downloadButtons).toHaveLength(2);

        fireEvent.click(downloadButtons[0]);

        await waitFor(() => {
          expect(handleDownload).toHaveBeenCalledWith("att-1");
          expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
        });

        // Fast-forward 100ms to verify revokeObjectURL cleanup and DOM element removal
        act(() => {
          vi.advanceTimersByTime(100);
        });

        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/test-blob-url");
      } finally {
        vi.useRealTimers();
      }
    });

    it("prevents double-submit on delete while deletion request is pending", async () => {
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      const handleDelete = vi.fn().mockReturnValue(deletePromise);

      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onDeleteAttachment={handleDelete}
          currentUserId="user-author-1"
        />
      );

      // Trigger inline confirmation banner
      const deleteBtn = screen.getByRole("button", { name: /Delete/i });
      fireEvent.click(deleteBtn);

      const confirmBtn = screen.getByRole("button", { name: /Confirm delete attachment/i });

      // First click initiates delete
      fireEvent.click(confirmBtn);
      expect(handleDelete).toHaveBeenCalledTimes(1);

      // Second rapid click while pending must NOT invoke handleDelete again
      fireEvent.click(confirmBtn);
      expect(handleDelete).toHaveBeenCalledTimes(1);

      // Resolve pending delete promise
      await act(async () => {
        resolveDelete!();
      });

      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it("renders delete button for author and confirms delete", async () => {
      const handleDelete = vi.fn().mockResolvedValue(undefined);
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onDeleteAttachment={handleDelete}
          currentUserId="user-author-1"
        />
      );

      // att-1 is authored by user-author-1, so delete button is visible
      const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
      expect(deleteButtons).toHaveLength(1);

      fireEvent.click(deleteButtons[0]);

      // Confirm banner appears
      expect(screen.getByText("Delete this file?")).toBeDefined();

      const confirmBtn = screen.getByRole("button", { name: /Confirm delete attachment/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(handleDelete).toHaveBeenCalledWith("att-1");
      });
    });

    it("allows Workspace Owner not in board.members to delete any attachment", () => {
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onDeleteAttachment={vi.fn()}
          currentUserId="owner-outside-board"
          currentUserRole={undefined}
          isWorkspaceOwner={true}
        />
      );

      // Both attachments can be deleted by Workspace Owner even when not in board.members
      const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
      expect(deleteButtons).toHaveLength(2);
    });

    it("allows Workspace Owner with Board role MEMBER to delete any attachment", () => {
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onDeleteAttachment={vi.fn()}
          currentUserId="owner-as-member"
          currentUserRole="MEMBER"
          isWorkspaceOwner={true}
        />
      );

      // Both attachments can be deleted by Workspace Owner even if board role is ordinary MEMBER
      const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
      expect(deleteButtons).toHaveLength(2);
    });

    it("allows Board PM to delete any attachment even when not workspace owner", () => {
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onDeleteAttachment={vi.fn()}
          currentUserId="pm-user-99"
          currentUserRole="PM"
          isWorkspaceOwner={false}
        />
      );

      // Both attachments can be deleted by Board PM
      const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
      expect(deleteButtons).toHaveLength(2);
    });

    it("allows uploader to delete own attachment even when not owner or PM", () => {
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onDeleteAttachment={vi.fn()}
          currentUserId="user-author-1"
          currentUserRole="MEMBER"
          isWorkspaceOwner={false}
        />
      );

      // Only att-1 is authored by user-author-1, att-2 is authored by otherUser
      const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
      expect(deleteButtons).toHaveLength(1);
    });

    it("hides delete button when user is a regular member and not author, PM, or Workspace Owner", () => {
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          onDeleteAttachment={vi.fn()}
          currentUserId="non-author-3"
          currentUserRole="MEMBER"
          isWorkspaceOwner={false}
        />
      );

      expect(screen.queryByRole("button", { name: /Delete/i })).toBeNull();
    });

    it("renders loading skeletons when isLoadingAttachments is true", () => {
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          isLoadingAttachments={true}
        />
      );

      expect(screen.queryByText("design_system.pdf")).toBeNull();
    });

    it("renders error banner and retries when onRetryAttachments is clicked", () => {
      const handleRetry = vi.fn();
      render(
        <CardDetailAttachments
          card={testAttachmentCard}
          attachmentsError="Failed to load attachments"
          onRetryAttachments={handleRetry}
        />
      );

      expect(screen.getByText("Failed to load attachments")).toBeDefined();
      const retryBtn = screen.getByRole("button", { name: /Retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });

    it("renders empty state message when card has 0 attachments", () => {
      const emptyCard = { ...testAttachmentCard, attachments: [] };
      render(<CardDetailAttachments card={emptyCard} />);

      expect(screen.getByText("No attachments uploaded.")).toBeDefined();
    });
  });

  describe("Card Activity Logs UI & Cursor Pagination (Task B)", () => {
    it("fetches first page with nextCursor and shows Load more button", async () => {
      const handleFetchActivities = vi.fn().mockResolvedValue({
        items: [
          {
            id: "act-page1-1",
            cardId: "card-101",
            user: { id: "u-1", name: "Nguyen Van A", initials: "NA", role: "MEMBER" },
            action: "created this card",
            createdAt: "2026-10-10T09:00:00.000Z",
          },
        ],
        nextCursor: "cursor-token-page2",
      });

      render(
        <CardDetailActivity
          card={card101}
          onAddComment={vi.fn()}
          onFetchActivities={handleFetchActivities}
        />
      );

      // Switch to Activity tab
      const activityTab = screen.getByRole("tab", { name: /Activity/i });
      fireEvent.click(activityTab);

      await waitFor(() => {
        expect(handleFetchActivities).toHaveBeenCalledWith("card-101");
        expect(screen.getByText(/created this card/i)).toBeDefined();
      });

      // Load more button should be present
      const loadMoreBtn = screen.getByRole("button", { name: /Load more activity/i });
      expect(loadMoreBtn).toBeDefined();
    });

    it("clicks Load more to fetch subsequent page and hides button when exhausted", async () => {
      const handleFetchActivities = vi
        .fn()
        .mockResolvedValueOnce({
          items: [
            {
              id: "act-1",
              cardId: "card-101",
              user: { id: "u-1", name: "User 1", initials: "U1", role: "MEMBER" },
              action: "activity 1",
              createdAt: "2026-10-10T10:00:00.000Z",
            },
          ],
          nextCursor: "cursor-2",
        })
        .mockResolvedValueOnce({
          items: [
            {
              id: "act-2",
              cardId: "card-101",
              user: { id: "u-2", name: "User 2", initials: "U2", role: "MEMBER" },
              action: "activity 2",
              createdAt: "2026-10-10T09:00:00.000Z",
            },
          ],
          nextCursor: null,
        });

      render(
        <CardDetailActivity
          card={card101}
          onAddComment={vi.fn()}
          onFetchActivities={handleFetchActivities}
        />
      );

      const activityTab = screen.getByRole("tab", { name: /Activity/i });
      fireEvent.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText("activity 1")).toBeDefined();
      });

      const loadMoreBtn = screen.getByRole("button", { name: /Load more activity/i });
      fireEvent.click(loadMoreBtn);

      await waitFor(() => {
        expect(handleFetchActivities).toHaveBeenCalledWith("card-101", "cursor-2");
        expect(screen.getByText("activity 2")).toBeDefined();
      });

      // Button should disappear because nextCursor is null
      expect(screen.queryByRole("button", { name: /Load more activity/i })).toBeNull();
    });

    it("renders empty state when no activities exist", async () => {
      const handleFetchActivities = vi.fn().mockResolvedValue({
        items: [],
        nextCursor: null,
      });

      render(
        <CardDetailActivity
          card={card101}
          onAddComment={vi.fn()}
          onFetchActivities={handleFetchActivities}
        />
      );

      const activityTab = screen.getByRole("tab", { name: /Activity/i });
      fireEvent.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText("No activity recorded yet.")).toBeDefined();
      });
    });

    it("renders error banner and retries when retry button is clicked", async () => {
      const handleFetchActivities = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValueOnce({
          items: [
            {
              id: "act-recovered",
              cardId: "card-101",
              user: { id: "u-1", name: "User 1", initials: "U1", role: "MEMBER" },
              action: "recovered activity",
              createdAt: "2026-10-10T10:00:00.000Z",
            },
          ],
          nextCursor: null,
        });

      render(
        <CardDetailActivity
          card={card101}
          onAddComment={vi.fn()}
          onFetchActivities={handleFetchActivities}
        />
      );

      const activityTab = screen.getByRole("tab", { name: /Activity/i });
      fireEvent.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText("Network timeout")).toBeDefined();
      });

      const retryBtn = screen.getByRole("button", { name: /Retry/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText("recovered activity")).toBeDefined();
      });
    });

    it("resets activities and does not leak across card switches", async () => {
      const handleFetchActivities = vi.fn().mockImplementation((cardId: string) => {
        return Promise.resolve({
          items: [
            {
              id: `act-${cardId}`,
              cardId,
              user: { id: "u-1", name: "User", initials: "U", role: "MEMBER" },
              action: `activity for ${cardId}`,
              createdAt: "2026-10-10T10:00:00.000Z",
            },
          ],
          nextCursor: null,
        });
      });

      const { rerender } = render(
        <CardDetailActivity
          card={card101}
          onAddComment={vi.fn()}
          onFetchActivities={handleFetchActivities}
        />
      );

      const activityTab = screen.getByRole("tab", { name: /Activity/i });
      fireEvent.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText("activity for card-101")).toBeDefined();
      });

      // Switch to card-102
      const card102 = { ...card101, id: "card-102" };
      rerender(
        <CardDetailActivity
          card={card102}
          onAddComment={vi.fn()}
          onFetchActivities={handleFetchActivities}
        />
      );

      // Previous activity should be cleared
      expect(screen.queryByText("activity for card-101")).toBeNull();
    });
  });
});
