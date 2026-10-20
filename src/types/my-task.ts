import type { CardPriority, ListCategory } from "./kanban";

export interface MyTaskItem {
  id: string;
  code: string;
  title: string;
  boardId: string;
  boardName: string;
  workspaceName: string;
  priority: CardPriority;
  statusGroup: ListCategory;
  dueDate: string | null;
  labels: Array<{ id: string; name: string; color?: string }>;
}
