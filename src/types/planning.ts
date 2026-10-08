export interface CreateDependencyRequest {
  dependsOnCardId: string;
}

export interface BoardDashboard {
  totalCards: number;
  completedCards: number;
  inProgressCards: number;
  todoCards: number;
  overdueCards: number;
  completionRate: number; // Float percentage e.g. 41.67
}

export interface BoardDashboardResponse {
  success: boolean;
  data: BoardDashboard;
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
