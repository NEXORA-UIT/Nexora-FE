import type { KnowledgeBaseArticle } from "@/types/knowledge-base";

export const KNOWLEDGE_BASE_ARTICLES: KnowledgeBaseArticle[] = [
  {
    id: "workspace-membership-basics",
    title: "Workspace membership basics",
    category: "Workspace",
    summary: "Understand workspace ownership, member access, and invitations.",
    content:
      "A workspace is the shared home for a team and its boards. The person who creates it becomes its Owner. Owners manage workspace settings, invitations, and membership.\n\nMembers see boards they have been added to. Board access is managed separately, so joining a workspace does not automatically grant access to every project board.\n\nUse the Members tab to review people and pending invitations. The owner can transfer ownership or remove a member when the team changes.",
    updatedAt: "2026-10-18",
    readMinutes: 3,
  },
  {
    id: "board-status",
    title: "How board status works",
    category: "Planning",
    summary: "Organize work into lists and understand how card status follows a list.",
    content:
      "A board groups a project’s work. Each board contains lists that represent stages such as To do, In progress, and Done. Move a card to a different list to change its status.\n\nCard status follows the destination list’s status group. Completing an individual task does not automatically move its card.\n\nCards can also have dependencies. A card cannot be marked Done while a required dependency is still incomplete.",
    updatedAt: "2026-10-17",
    readMinutes: 4,
  },
  {
    id: "working-with-cards",
    title: "Create and update cards",
    category: "Planning",
    summary: "Keep a board actionable with clear card details, owners, labels, and due dates.",
    content:
      "Create a card in the list where work should begin. Add a short title, useful description, priority, and due date so teammates can understand the next step.\n\nAssignees show who is responsible for follow-up. They do not have exclusive editing rights: workspace and board permissions determine who can update the card.\n\nMove cards between lists as work progresses. If two people edit the same card at once, the app may ask one person to reload the latest version before saving.",
    updatedAt: "2026-10-16",
    readMinutes: 3,
  },
  {
    id: "my-tasks-and-calendar",
    title: "Use My Tasks and Calendar",
    category: "Personal workflow",
    summary: "Review assigned work and see upcoming due dates across your boards.",
    content:
      "My Tasks brings together cards assigned to you across the workspaces you can access. Search and filter the list to focus on what needs attention.\n\nThe Calendar view places scheduled card due dates on a timeline. Select an event to open its board and continue working in context.\n\nIf a card or event is missing, check its assignee, due date, and your access to the board.",
    updatedAt: "2026-10-15",
    readMinutes: 2,
  },
];
