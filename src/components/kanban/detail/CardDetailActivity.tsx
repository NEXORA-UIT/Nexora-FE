import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { MessageSquare, Activity as ActivityIcon } from "lucide-react";
import type { KanbanCard, CardActivity } from "@/types";
import { CardCommentsTab } from "./activity/CardCommentsTab";
import { CardActivityTab } from "./activity/CardActivityTab";

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
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("comments");

  // Lazy-loaded activity state with cursor pagination
  const [activities, setActivities] = React.useState<CardActivity[] | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [isLoadingActivities, setIsLoadingActivities] = React.useState(false);
  const [isLoadingMoreActivities, setIsLoadingMoreActivities] = React.useState(false);
  const [activityError, setActivityError] = React.useState<string | null>(null);
  const activeCardIdRef = React.useRef<string>(card.id);

  const comments = card.comments || [];

  // Reset activities and cursor when card ID changes
  React.useEffect(() => {
    activeCardIdRef.current = card.id;
    setActivities(null);
    setNextCursor(null);
    setIsLoadingActivities(false);
    setIsLoadingMoreActivities(false);
    setActivityError(null);
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
      setActivityError(err instanceof Error ? err.message : "Failed to load activity logs");
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
      setActivityError(err instanceof Error ? err.message : "Failed to load more activities");
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
          <CardCommentsTab
            cardId={card.id}
            comments={comments}
            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            isLoadingComments={isLoadingComments}
            commentsError={commentsError}
            onRetryComments={onRetryComments}
            currentUserId={currentUserId}
          />
        </Tabs.Content>

        {/* Activity Tab Content (Lazy Loaded) */}
        <Tabs.Content value="activity" className="space-y-3 focus:outline-none">
          <CardActivityTab
            activities={activities}
            isLoading={isLoadingActivities}
            isLoadingMore={isLoadingMoreActivities}
            error={activityError}
            nextCursor={nextCursor}
            onRetry={() => void loadInitialActivities()}
            onLoadMore={handleLoadMoreActivities}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
