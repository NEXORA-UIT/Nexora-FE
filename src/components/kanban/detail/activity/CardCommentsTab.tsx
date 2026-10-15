import * as React from "react";
import { Send, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import type { CardComment } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { CardCommentItem } from "./CardCommentItem";

export interface CardCommentsTabProps {
  cardId: string;
  comments: CardComment[];
  onAddComment: (cardId: string, content: string) => Promise<void>;
  onUpdateComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  isLoadingComments?: boolean;
  commentsError?: string | null;
  onRetryComments?: () => void;
  currentUserId?: string;
}

export const CardCommentsTab: React.FC<CardCommentsTabProps> = ({
  cardId,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  isLoadingComments = false,
  commentsError = null,
  onRetryComments,
  currentUserId,
}) => {
  const [commentText, setCommentText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Editing state
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  // Deleting state
  const [deletingCommentId, setDeletingCommentId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Current logged in user ID
  const storeUserId = useAuthStore((state) => state.user?.id);
  const effectiveUserId = currentUserId || storeUserId;

  // Reset editing & deleting state when cardId changes
  React.useEffect(() => {
    setEditingCommentId(null);
    setEditText("");
    setDeletingCommentId(null);
  }, [cardId]);

  const handleCommentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(cardId, trimmed);
      setCommentText("");
    } catch {
      // Intentionally preserve commentText on failure so user does not lose input
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (commentId: string, initialContent: string | null) => {
    setEditingCommentId(commentId);
    setEditText(initialContent || "");
    setDeletingCommentId(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId: string) => {
    const trimmed = editText.trim();
    if (!trimmed || isSavingEdit || !onUpdateComment) return;

    setIsSavingEdit(true);
    try {
      await onUpdateComment(commentId, trimmed);
      setEditingCommentId(null);
      setEditText("");
    } catch {
      // Intentionally preserve editText on failure
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleConfirmDelete = (commentId: string) => {
    setDeletingCommentId((prev) => (prev === commentId ? null : commentId));
    setEditingCommentId(null);
  };

  const handleCancelConfirmDelete = () => {
    setDeletingCommentId(null);
  };

  const handleConfirmDelete = async (commentId: string) => {
    if (isDeleting || !onDeleteComment) return;

    setIsDeleting(true);
    try {
      await onDeleteComment(commentId);
      setDeletingCommentId(null);
    } catch {
      // Retain confirmation state on failure
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* New Comment Input */}
      <form onSubmit={handleCommentSubmit} className="space-y-2">
        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                void handleCommentSubmit();
              }
            }}
            disabled={isSubmitting}
            placeholder="Write a comment... (Ctrl+Enter to post)"
            aria-label="Write a comment"
            rows={2}
            className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 pr-10 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white transition-opacity hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            aria-label="Send comment"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </form>

      {/* Comments Loading / Error / List */}
      {isLoadingComments ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-2.5 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-neutral-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 rounded bg-neutral-200" />
                <div className="h-8 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      ) : commentsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{commentsError}</span>
          </div>
          {onRetryComments && (
            <button
              type="button"
              onClick={onRetryComments}
              className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-semibold text-red-700 border border-red-300 hover:bg-red-50 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-neutral-400 italic py-2">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CardCommentItem
              key={comment.id}
              comment={comment}
              effectiveUserId={effectiveUserId}
              isEditing={editingCommentId === comment.id}
              editText={editText}
              isSavingEdit={isSavingEdit}
              isConfirmingDelete={deletingCommentId === comment.id}
              isDeleting={isDeleting}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onEditTextChange={setEditText}
              onSaveEdit={handleSaveEdit}
              onToggleConfirmDelete={handleToggleConfirmDelete}
              onCancelConfirmDelete={handleCancelConfirmDelete}
              onConfirmDelete={handleConfirmDelete}
              canUpdateComment={Boolean(onUpdateComment)}
              canDeleteComment={Boolean(onDeleteComment)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
