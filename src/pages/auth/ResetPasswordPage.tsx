import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthCard,
  ResetPasswordForm,
  ResetPasswordSuccess,
} from "@/components/auth";
import { NexoraLogo } from "@/components/common/NexoraLogo";
import { ROUTES } from "@/constants/routes";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = React.useState(false);

  return (
    <AuthCard>
      {/* Brand Header */}
      <NexoraLogo />

      {!isSuccess ? (
        <>
          {/* Screen Title & Subtitle */}
          <div className="mt-5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Set new password
            </h1>
            <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
              Create a new secure password for your account.
            </p>
          </div>

          {/* Form */}
          <ResetPasswordForm onSuccess={() => setIsSuccess(true)} />
        </>
      ) : (
        /* Success State */
        <ResetPasswordSuccess onBackToSignIn={() => navigate(ROUTES.LOGIN)} />
      )}
    </AuthCard>
  );
};
