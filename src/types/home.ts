export type HomeTaskPriority = "high" | "medium" | "low";

export interface HomeTaskItem {
  id: string;
  title: string;
  projectSubtitle: string;
  priority: HomeTaskPriority;
  dueText: string;
  isOverdue?: boolean;
  isToday?: boolean;
  completed: boolean;
  assigneeInitials: string;
}

export type HomeTaskFilter = "all" | "today" | "upcoming" | "overdue";

export interface AiInsightData {
  summary: string;
  sourceTags: string[];
  actionLabel: string;
}

export interface UpcomingTimelineItem {
  id: string;
  badge: {
    topText: string;
    bottomText: string;
    isPrimary?: boolean;
  };
  timeCategory: string;
  title: string;
}

export interface RecentBoardItem {
  id: string;
  title: string;
  workspace: string;
  lastAccessed: string;
  statusDescription: string;
  progressPercent: number;
  iconType: "kanban" | "architecture" | "mobile";
}
