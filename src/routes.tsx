import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { LandingPage } from "@/pages/landing/LandingPage";
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { UnderDevelopmentPage } from "@/pages/UnderDevelopmentPage";
import { ROUTES } from "@/constants/routes";

export const router = createBrowserRouter([
  // Public Marketing Landing Page
  {
    path: ROUTES.LANDING,
    element: <LandingPage />,
  },

  // Authenticated App Workspace Layout
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTES.BOARDS,
        element: <UnderDevelopmentPage />,
      },
      {
        path: ROUTES.MY_TASKS,
        element: <UnderDevelopmentPage />,
      },
      {
        path: ROUTES.CALENDAR,
        element: <UnderDevelopmentPage />,
      },
      {
        path: ROUTES.KNOWLEDGE_BASE,
        element: <UnderDevelopmentPage />,
      },
      {
        path: ROUTES.AI_ASSISTANT,
        element: <UnderDevelopmentPage />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <UnderDevelopmentPage />,
      },
      {
        path: ROUTES.HELP,
        element: <UnderDevelopmentPage />,
      },
    ],
  },

  // Authentication Flow Layout
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: <ResetPasswordPage />,
      },
      {
        path: ROUTES.UNDER_DEVELOPMENT,
        element: <UnderDevelopmentPage />,
      },
      {
        path: "*",
        element: <UnderDevelopmentPage />,
      },
    ],
  },
]);
