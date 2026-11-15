export interface PromptSuggestionItem {
  id: string;
  iconName: "summary" | "overdue" | "workload" | "unassigned";
  label: string;
  prompt: string;
}

export const DEFAULT_PROMPT_SUGGESTION_ITEMS: PromptSuggestionItem[] = [
  {
    id: "summary",
    iconName: "summary",
    label: "Tóm tắt tiến độ",
    prompt: "Tóm tắt tổng quan tiến độ của bảng này hiện tại?",
  },
  {
    id: "overdue",
    iconName: "overdue",
    label: "Việc quá hạn / Sắp hết hạn",
    prompt: "Những công việc nào đang bị quá hạn hoặc sắp đến hạn?",
  },
  {
    id: "workload",
    iconName: "workload",
    label: "Phân bổ thành viên",
    prompt: "Khối lượng công việc đang phân bổ cho các thành viên thế nào?",
  },
  {
    id: "unassigned",
    iconName: "unassigned",
    label: "Việc chưa ai nhận",
    prompt: "Có những công việc nào chưa được gán cho ai?",
  },
];
