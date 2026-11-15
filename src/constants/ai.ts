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
    label: "Summarize progress",
    prompt: "Summarize the overall progress of this board currently?",
  },
  {
    id: "overdue",
    iconName: "overdue",
    label: "Overdue & Due soon",
    prompt: "Which tasks are overdue or due soon?",
  },
  {
    id: "workload",
    iconName: "workload",
    label: "Workload distribution",
    prompt: "How is the workload distributed across team members?",
  },
  {
    id: "unassigned",
    iconName: "unassigned",
    label: "Unassigned tasks",
    prompt: "Which tasks are not assigned to anyone?",
  },
];
