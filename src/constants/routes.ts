export const ROUTES = {
  LANDING: "/",
  HOME: "/home",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  BOARDS: "/boards",
  BOARD_DETAIL: "/boards/:boardId",
  WORKSPACE_INVITATION: "/workspace-invitations",
  MY_TASKS: "/tasks",
  CALENDAR: "/calendar",
  QUICK_NOTES: "/quick-notes",
  KNOWLEDGE_BASE: "/knowledge",
  AI_ASSISTANT: "/assistant",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  HELP: "/help",
  UNDER_DEVELOPMENT: "/under-development",
  OAUTH_CALLBACK: "/oauth/callback/:provider",
  OAUTH_CALLBACK_GOOGLE: "/oauth/callback/google",
  OAUTH_CALLBACK_GITHUB: "/oauth/callback/github",
} as const;

export const getBoardDetailRoute = (boardId: string) => `/boards/${boardId}`;

