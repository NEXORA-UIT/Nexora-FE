import * as React from "react";
import { formatActivityTimestamp } from "@/utils/date";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import type { CardComment } from "@/types";

export interface CardCommentItemProps {
  comment: CardComment;
  effectiveUserId?: string;
  isEditing: boolean;
  editText: string;
  isSavingEdit: boolean;
  isConfirmingDelete: boolean;
  isDeleting: boolean;
  onStartEdit: (commentId: string, initialContent: string | null) => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onSaveEdit: (commentId: string) => Promise<void>;
  onToggleConfirmDelete: (commentId: string) => void;
  onCancelConfirmDelete: () => void;
  onConfirmDelete: (commentId: string) => Promise<void>;
  canUpdateComment: boolean;
  canDeleteComment: boolean;
}

export const CardCommentItem: React.FC<CardCommentItemProps> = ({
  comment,
  effectiveUserId,
  isEditing,
  editText,
  isSavingEdit,
  isConfirmingDelete,
  isDeleting,
  onStartEdit,
  onCancelEdit,
  onEditTextChange,
  onSaveEdit,
  onToggleConfirmDelete,
  onCancelConfirmDelete,
  onConfirmDelete,
  canUpdateComment,
  canDeleteComment,
}) => {
  const isDeleted = Boolean(
    comment.isDeleted || comment.content === null || comment.deletedAt
  );
  const isAuthor = Boolean(
    effectiveUserId &&
      (comment.userId === effectiveUserId || comment.author?.id === effectiveUserId)
  );

  return (
    <div className="flex gap-2.5 text-xs group">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
        {comment.author.initials || comment.author.name.charAt(0)}
      </span>
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">
              {comment.author.name}
            </span>
            <span className="text-[11px] text-neutral-400">
              {formatActivityTimestamp(comment.createdAt)}
            </span>
            {comment.updatedAt &&
              comment.updatedAt !== comment.createdAt &&
              !isDeleted && (
                <span className="text-[10px] text-neutral-400 italic">
                  (edited)
                </span>
              )}
          </div>

          {/* Author actions (Edit / Delete) */}
          {isAuthor && !isDeleted && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {canUpdateComment && (
                <button
                  type="button"
                  onClick={() => onStartEdit(comment.id, comment.content)}
                  className="rounded p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  aria-label="Edit comment"
                  title="Edit comment"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
              {canDeleteComment && (
                <button
                  type="button"
                  onClick={() => onToggleConfirmDelete(comment.id)}
                  className="rounded p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  aria-label="Delete comment"
                  title="Delete comment"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete confirmation banner */}
        {isConfirmingDelete && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs flex items-center justify-between gap-2">
            <span className="text-red-700 font-medium">Delete this comment?</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onCancelConfirmDelete}
                disabled={isDeleting}
                className="px-2 py-0.5 text-[11px] rounded bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirmDelete(comment.id)}
                disabled={isDeleting}
                className="px-2 py-0.5 text-[11px] rounded bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {isDeleting && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Content or Edit Form or Deleted Tombstone */}
        {isDeleted ? (
          <p className="rounded-lg bg-neutral-50/70 border border-neutral-100 p-2.5 text-neutral-400 italic leading-relaxed">
            This comment has been deleted.
          </p>
        ) : isEditing ? (
          <div className="space-y-1.5 pt-1">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              disabled={isSavingEdit}
              rows={2}
              aria-label="Edit comment text"
              className="w-full rounded-lg border border-primary-500 bg-white p-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={isSavingEdit}
                className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onSaveEdit(comment.id)}
                disabled={!editText.trim() || isSavingEdit}
                className="px-2.5 py-1 text-xs rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                {isSavingEdit && <Loader2 className="h-3 w-3 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-neutral-50 p-2.5 text-neutral-800 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
};
