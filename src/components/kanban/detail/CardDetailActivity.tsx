import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { format, parseISO } from "date-fns";
import { Send, Loader2, MessageSquare, Activity as ActivityIcon } from "lucide-react";
import type { KanbanCard, CardActivity } from "@/types";

export interface CardDetailActivityProps {
  card: KanbanCard;
  onAddComment: (cardId: string, content: string) => Promise<void>;
  onFetchActivities: (cardId: string) => Promise<CardActivity[]>;
}

export const CardDetailActivity: React.FC<CardDetailActivityProps> = ({
  card,
  onAddComment,
  onFetchActivities,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("comments");
  const [commentText, setCommentText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Lazy-loaded activity state
  const [activities, setActivities] = React.useState<CardActivity[] | null>(null);
  const [isLoadingActivities, setIsLoadingActivities] = React.useState(false);

  const comments = card.comments || [];

  // Reset or clear activities cache when card ID changes
  React.useEffect(() => {
    setActivities(null);
    setIsLoadingActivities(false);
  }, [card.id]);

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    if (tab === "activity" && activities === null && !isLoadingActivities) {
      setIsLoadingActivities(true);
      try {
        const data = await onFetchActivities(card.id);
        setActivities(data);
      } finally {
        setIsLoadingActivities(false);
      }
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
    } finally {
      setIsSubmitting(false);
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
            className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-neutral-500 border-b-2 border-transparent transition-colors hover:text-neutral-900 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 focus:outline-none"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Comments ({comments.length})</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="activity"
            onClick={() => void handleTabChange("activity")}
            className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-neutral-500 border-b-2 border-transparent transition-colors hover:text-neutral-900 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 focus:outline-none"
          >
            <ActivityIcon className="h-3.5 w-3.5" />
            <span>Activity</span>
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

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5 text-xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                  {comment.author.initials || comment.author.name.charAt(0)}
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">
                      {comment.author.name}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="rounded-lg bg-neutral-50 p-2.5 text-neutral-800 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Tabs.Content>

        {/* Activity Tab Content (Lazy Loaded) */}
        <Tabs.Content value="activity" className="space-y-3 focus:outline-none">
          {isLoadingActivities ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-2.5 animate-pulse">
                  <div className="h-5 w-5 rounded-full bg-neutral-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-neutral-200" />
                    <div className="h-2.5 w-1/3 rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
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
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No activity recorded yet.</p>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
