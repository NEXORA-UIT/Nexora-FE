import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard, OAuthButtons, RegisterForm } from "@/components/auth";
import { NexoraLogo } from "@/components/common/NexoraLogo";
import { ROUTES } from "@/constants/routes";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthCard className="p-6 sm:p-8">
      {/* Brand Header */}
      <NexoraLogo />

      {/* Screen Title & Subtitle */}
      <div className="mt-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create your Nexora account to start managing projects.
        </p>
      </div>

      {/* Register Form */}
      <RegisterForm onSuccess={() => navigate(ROUTES.HOME)} />

      {/* Social OAuth Buttons */}
      <OAuthButtons />

      {/* Bottom Switch Link */}
      <div className="mt-4 text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
};
