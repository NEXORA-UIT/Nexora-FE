import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { LandingPage } from "@/pages/LandingPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { BoardsPage, BoardDetailPage } from "@/pages/boards";
import { UnderDevelopmentPage } from "@/pages/UnderDevelopmentPage";
import { KnowledgeBasePage } from "@/pages/knowledge/KnowledgeBasePage";
import { HelpPage } from "@/pages/help/HelpPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { WorkspaceInvitationPage } from "@/pages/workspaces/WorkspaceInvitationPage";
import { MyTasksPage } from "@/pages/tasks/MyTasksPage";
import { WorkspaceCalendarPage } from "@/pages/calendar/WorkspaceCalendarPage";
import { QuickNotesPage } from "@/pages/quick-notes/QuickNotesPage";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/auth";
import { ROUTES } from "@/constants/routes";

export const router = createBrowserRouter([
  // Public Marketing Landing Page
  {
    path: ROUTES.LANDING,
    element: <LandingPage />,
  },

  // Authenticated App Workspace Layout
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTES.BOARDS,
        element: <BoardsPage />,
      },
      {
        path: ROUTES.BOARD_DETAIL,
        element: <BoardDetailPage />,
      },
      {
        path: ROUTES.WORKSPACE_INVITATION,
        element: <WorkspaceInvitationPage />,
      },
      {
        path: ROUTES.MY_TASKS,
        element: <MyTasksPage />,
      },
      {
        path: ROUTES.CALENDAR,
        element: <WorkspaceCalendarPage />,
      },
      {
        path: ROUTES.QUICK_NOTES,
        element: <QuickNotesPage />,
      },
      {
        path: ROUTES.KNOWLEDGE_BASE,
        element: <KnowledgeBasePage />,
      },
      {
        path: ROUTES.AI_ASSISTANT,
        element: <UnderDevelopmentPage title="AI Assistant and Agents are not implemented yet" />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <SettingsPage />,
      },
      {
        path: ROUTES.PROFILE,
        element: <SettingsPage />,
      },
      {
        path: ROUTES.HELP,
        element: <HelpPage />,
      },
    ],
  },

  // Authentication Flow Layout
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: ROUTES.REGISTER,
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: (
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: (
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: ROUTES.VERIFY_EMAIL,
        element: <VerifyEmailPage />,
      },
      {
        path: ROUTES.OAUTH_CALLBACK,
        element: <OAuthCallbackPage />,
      },
      {
        path: ROUTES.UNDER_DEVELOPMENT,
        element: <UnderDevelopmentPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
