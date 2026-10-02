import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard, OAuthButtons, LoginForm } from "@/components/auth";
import { NexoraLogo } from "@/components/common/NexoraLogo";
import { ROUTES } from "@/constants/routes";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthCard>
      {/* Brand Header */}
      <NexoraLogo />

      {/* Screen Title & Subtitle */}
      <div className="mt-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sign in to continue to your workspace
        </p>
      </div>

      {/* Login Form */}
      <LoginForm onSuccess={() => navigate(ROUTES.HOME)} />

      {/* Social OAuth Buttons */}
      <OAuthButtons />

      {/* Bottom Switch Link */}
      <div className="mt-5 text-center text-xs text-neutral-500">
        Don't have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
};
