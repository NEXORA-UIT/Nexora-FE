export interface HelpFaq {
  question: string;
  answer: string;
}

export const HELP_FAQS: HelpFaq[] = [
  {
    question: "Who can manage workspace members?",
    answer: "The workspace Owner can invite or remove members and transfer ownership. Members can view the people in their workspace.",
  },
  {
    question: "How do I change a card’s status?",
    answer: "Move the card to a list with the status you want. Card status follows its list; completing a task does not move the card automatically.",
  },
  {
    question: "Why can’t I open a board?",
    answer: "Board access is assigned separately from workspace membership. Ask the workspace Owner or the board’s PM to add you to that board.",
  },
  {
    question: "Where can I find work assigned to me?",
    answer: "Open My Tasks to review assigned cards across the workspaces and boards you can access. Use the Calendar for scheduled due dates.",
  },
];
