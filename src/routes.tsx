import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LandingPage } from "@/pages/landing/LandingPage";
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
