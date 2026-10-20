import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { format, parseISO } from "date-fns";
import {
  Send,
  Loader2,
  MessageSquare,
  Activity as ActivityIcon,
  Edit2,
  Trash2,
  AlertCircle,
  RotateCcw,
  GitBranch,
} from "lucide-react";
import type { KanbanCard, CardActivity, GitActivityFeed } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { getUserFacingApiError } from "@/utils/api-error-message";
import { CardGitActivityTab } from "./activity/CardGitActivityTab";

export interface CardDetailActivityProps {
  card: KanbanCard;
  onAddComment: (cardId: string, content: string) => Promise<void>;
  onFetchActivities: (
    cardId: string,
    cursor?: string
  ) => Promise<CardActivity[] | { items: CardActivity[]; nextCursor: string | null }>;
  onUpdateComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  isLoadingComments?: boolean;
  commentsError?: string | null;
  onRetryComments?: () => void;
  currentUserId?: string;
  onFetchGitActivity?: (cardId: string, cardCode: string) => Promise<GitActivityFeed>;
}

export const CardDetailActivity: React.FC<CardDetailActivityProps> = ({
  card,
  onAddComment,
  onFetchActivities,
  onUpdateComment,
  onDeleteComment,
  isLoadingComments = false,
  commentsError = null,
  onRetryComments,
  currentUserId,
  onFetchGitActivity,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("comments");
  const [gitActivity, setGitActivity] = React.useState<GitActivityFeed | null>(null);
  const [isLoadingGitActivity, setIsLoadingGitActivity] = React.useState(false);
  const [gitActivityError, setGitActivityError] = React.useState<string | null>(null);
  const gitActivityRequestInFlight = React.useRef(false);
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

  // Lazy-loaded activity state with cursor pagination
  const [activities, setActivities] = React.useState<CardActivity[] | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [isLoadingActivities, setIsLoadingActivities] = React.useState(false);
  const [isLoadingMoreActivities, setIsLoadingMoreActivities] = React.useState(false);
  const [activityError, setActivityError] = React.useState<string | null>(null);
  const activeCardIdRef = React.useRef<string>(card.id);

  const comments = card.comments || [];

  // Reset activities, cursor, and editing cache when card ID changes
  React.useEffect(() => {
    activeCardIdRef.current = card.id;
    setActivities(null);
    setNextCursor(null);
    setIsLoadingActivities(false);
    setIsLoadingMoreActivities(false);
    setActivityError(null);
    setGitActivity(null);
    setGitActivityError(null);
    setEditingCommentId(null);
    setEditText("");
    setDeletingCommentId(null);
  }, [card.id]);

  const loadInitialActivities = React.useCallback(async () => {
    const currentId = card.id;
    activeCardIdRef.current = currentId;
    setIsLoadingActivities(true);
    setActivityError(null);
    try {
      const data = await onFetchActivities(currentId);
      if (activeCardIdRef.current !== currentId) return;

      if (Array.isArray(data)) {
        setActivities(data);
        setNextCursor(null);
      } else {
        setActivities(data.items);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      if (activeCardIdRef.current !== currentId) return;
      setActivityError(getUserFacingApiError(err, "Failed to load activity logs."));
    } finally {
      if (activeCardIdRef.current === currentId) {
        setIsLoadingActivities(false);
      }
    }
  }, [card.id, onFetchActivities]);

  const handleLoadMoreActivities = async () => {
    if (!nextCursor || isLoadingMoreActivities) return;
    const currentId = card.id;
    setIsLoadingMoreActivities(true);
    try {
      const data = await onFetchActivities(currentId, nextCursor);
      if (activeCardIdRef.current !== currentId) return;

      const newItems = Array.isArray(data) ? data : data.items;
      const newCursor = Array.isArray(data) ? null : data.nextCursor;

      setActivities((prev) => {
        const existingIds = new Set((prev || []).map((a) => a.id));
        const filtered = newItems.filter((a) => !existingIds.has(a.id));
        return [...(prev || []), ...filtered];
      });
      setNextCursor(newCursor);
    } catch (err) {
      if (activeCardIdRef.current !== currentId) return;
      setActivityError(getUserFacingApiError(err, "Failed to load more activities."));
    } finally {
      if (activeCardIdRef.current === currentId) {
        setIsLoadingMoreActivities(false);
      }
    }
  };

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    if (tab === "activity" && activities === null && !isLoadingActivities) {
      await loadInitialActivities();
    }
    if (tab === "code-git" && gitActivity === null && !isLoadingGitActivity) {
      await loadGitActivity();
    }
  };

  const loadGitActivity = async () => {
    if (gitActivityRequestInFlight.current) return;
    if (!onFetchGitActivity) {
      setGitActivityError("Git activity is not connected yet.");
      return;
    }
    gitActivityRequestInFlight.current = true;
    setIsLoadingGitActivity(true);
    setGitActivityError(null);
    try {
      setGitActivity(await onFetchGitActivity(card.id, card.code));
    } catch (cause) {
      setGitActivityError(
        getUserFacingApiError(cause, "Could not load Git activity.")
      );
    } finally {
      gitActivityRequestInFlight.current = false;
      setIsLoadingGitActivity(false);
    }
  };

  const handleCommentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(card.id, trimmed);
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

  const formatTimestamp = (isoDate: string) => {
    try {
      return format(parseISO(isoDate), "MMM d, h:mm a");
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="pt-4">
      <Tabs.Root value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        {/* Tab Switcher */}
        <Tabs.List className="flex items-center gap-4 border-b border-neutral-200">
          <Tabs.Trigger
            value="comments"
            onClick={() => void handleTabChange("comments")}
            className="data-[state=active]:text-primary-600 flex items-center gap-1.5 border-b-2 border-transparent pb-2 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900 focus:outline-none data-[state=active]:border-primary-600"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Comments ({comments.length})</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="activity"
            onClick={() => void handleTabChange("activity")}
            className="data-[state=active]:text-primary-600 flex items-center gap-1.5 border-b-2 border-transparent pb-2 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900 focus:outline-none data-[state=active]:border-primary-600"
          >
            <ActivityIcon className="h-3.5 w-3.5" />
            <span>Activity</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="code-git"
            onClick={() => void handleTabChange("code-git")}
            className="data-[state=active]:text-primary-600 flex items-center gap-1.5 border-b-2 border-transparent pb-2 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900 focus:outline-none data-[state=active]:border-primary-600"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Code / Git</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Comments Tab Content */}
        <Tabs.Content value="comments" className="space-y-4 focus:outline-none">
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
                className="absolute bottom-2.5 right-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-primary-600 text-white transition-opacity hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-40"
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
                <div key={n} className="flex animate-pulse gap-2.5">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-28 rounded bg-neutral-200" />
                    <div className="h-8 rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : commentsError ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{commentsError}</span>
              </div>
              {onRetryComments && (
                <button
                  type="button"
                  onClick={onRetryComments}
                  className="flex cursor-pointer items-center gap-1 rounded border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </button>
              )}
            </div>
          ) : comments.length === 0 ? (
            <p className="py-2 text-xs italic text-neutral-400">
              No comments yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const isDeleted = Boolean(
                  comment.isDeleted || comment.content === null || comment.deletedAt
                );
                const isAuthor = Boolean(
                  effectiveUserId &&
                  (comment.userId === effectiveUserId || comment.author?.id === effectiveUserId)
                );
                const isEditing = editingCommentId === comment.id;
                const isConfirmingDelete = deletingCommentId === comment.id;

                return (
                  <div key={comment.id} className="group flex gap-2.5 text-xs">
                    <span className="text-primary-700 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold">
                      {comment.author.initials || comment.author.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900">
                            {comment.author.name}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {formatTimestamp(comment.createdAt)}
                          </span>
                          {comment.updatedAt &&
                            comment.updatedAt !== comment.createdAt &&
                            !isDeleted && (
                              <span className="text-[10px] italic text-neutral-400">(edited)</span>
                            )}
                        </div>

                        {/* Author actions (Edit / Delete) */}
                        {isAuthor && !isDeleted && !isEditing && (
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {onUpdateComment && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(comment.id, comment.content)}
                                className="cursor-pointer rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                                aria-label="Edit comment"
                                title="Edit comment"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            )}
                            {onDeleteComment && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeletingCommentId(isConfirmingDelete ? null : comment.id)
                                }
                                className="cursor-pointer rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
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
                        <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs">
                          <span className="font-medium text-red-700">Delete this comment?</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDeletingCommentId(null)}
                              disabled={isDeleting}
                              className="cursor-pointer rounded border border-neutral-200 bg-white px-2 py-0.5 text-[11px] text-neutral-700 hover:bg-neutral-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleConfirmDelete(comment.id)}
                              disabled={isDeleting}
                              className="flex cursor-pointer items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {isDeleting && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                              Delete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content or Edit Form or Deleted Tombstone */}
                      {isDeleted ? (
                        <p className="rounded-lg border border-neutral-100 bg-neutral-50/70 p-2.5 italic leading-relaxed text-neutral-400">
                          This comment has been deleted.
                        </p>
                      ) : isEditing ? (
                        <div className="space-y-1.5 pt-1">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            disabled={isSavingEdit}
                            rows={2}
                            aria-label="Edit comment text"
                            className="w-full rounded-lg border border-primary-500 bg-white p-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={isSavingEdit}
                              className="cursor-pointer rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleSaveEdit(comment.id)}
                              disabled={!editText.trim() || isSavingEdit}
                              className="flex cursor-pointer items-center gap-1 rounded-md bg-primary-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-40"
                            >
                              {isSavingEdit && <Loader2 className="h-3 w-3 animate-spin" />}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words rounded-lg bg-neutral-50 p-2.5 leading-relaxed text-neutral-800">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Tabs.Content>

        {/* Activity Tab Content (Lazy Loaded) */}
        <Tabs.Content value="activity" className="space-y-3 focus:outline-none">
          {isLoadingActivities ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex animate-pulse items-center gap-2.5">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-neutral-200" />
                    <div className="h-2.5 w-1/3 rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : activityError ? (
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 text-xs text-neutral-600">
              <span>{activityError}</span>
              <button
                type="button"
                onClick={() => void loadInitialActivities()}
                className="text-primary-600 hover:text-primary-700 inline-flex cursor-pointer items-center gap-1 font-medium underline"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="flex items-center gap-2.5 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-medium text-neutral-700">
                    {act.user.initials || act.user.name.charAt(0)}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-neutral-800">{act.user.name} </span>
                    <span className="text-neutral-600">{act.action} </span>
                    <span className="text-[11px] text-neutral-400">
                      ({formatTimestamp(act.createdAt)})
                    </span>
                  </div>
                </div>
              ))}
              {nextCursor && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => void handleLoadMoreActivities()}
                    disabled={isLoadingMoreActivities}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                  >
                    {isLoadingMoreActivities ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-neutral-500" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <span>Load more activity</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs italic text-neutral-400">No activity recorded yet.</p>
          )}
        </Tabs.Content>

        <Tabs.Content value="code-git" className="space-y-3 focus:outline-none">
          <CardGitActivityTab
            items={gitActivity?.items ?? []}
            source={gitActivity?.source ?? null}
            isLoading={isLoadingGitActivity}
            error={gitActivityError}
            onRetry={() => void loadGitActivity()}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
