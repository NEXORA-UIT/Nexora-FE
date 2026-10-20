export interface CreateDependencyRequest {
  dependsOnCardId: string;
}

export interface BoardDashboard {
  totalCards: number;
  completedCards: number;
  inProgressCards: number;
  todoCards: number;
  overdueCards: number;
  completionRate: number;
}

export interface BoardDashboardDto {
  totalCards: number;
  todoCards: number;
  inProgressCards: number;
  completedCards: number;
  overdueCards: number;
  completionRate: number;
  todo?: number;
  inProgress?: number;
  done?: number;
  overdue?: number;
  completionPercent?: number;
}

export interface BoardDashboardResponse {
  success: boolean;
  data: BoardDashboardDto;
}

export interface BoardCalendarEntryDto {
  id: string;
  boardId: string;
  listId: string;
  listName: string;
  cardKey: string;
  title: string;
  startDate: string | null;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  statusGroup: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeIds: string[];
  isOverdue: boolean;
  dependencyWarnings: Array<{ prerequisiteCardId: string; kind: "SCHEDULE_CONFLICT" }>;
}

export interface BoardCalendarResponse {
  success: boolean;
  data: BoardCalendarEntryDto[];
}

export type ScheduleWarningType = "OVERDUE" | "BLOCKER" | "CONFLICT";

export interface ScheduleWarning {
  id: string;
  type: ScheduleWarningType;
  cardId: string;
  cardCode: string;
  cardTitle: string;
  message: string;
  severity: "error" | "warning";
  dueDate?: string | null;
  prerequisiteCode?: string;
  prerequisiteTitle?: string;
}
