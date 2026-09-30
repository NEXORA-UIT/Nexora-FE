import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { ForgotPasswordSuccessProps } from "@/types";

export const ForgotPasswordSuccess: React.FC<ForgotPasswordSuccessProps> = ({
  email,
  resendCountdown,
  onResend,
}) => {
  return (
    <div className="mt-5 text-center">
      {/* Visual Mail Icon Badge */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Mail className="h-7 w-7" />
      </div>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
        Check your email
      </h1>
      <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
        We have sent a password reset link to{" "}
        <span className="font-semibold text-neutral-800">{email}</span>.
        Please check your inbox.
      </p>

      <div className="mt-6 space-y-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="md"
          disabled={resendCountdown > 0}
          onClick={onResend}
          className="h-10 rounded-lg text-sm font-medium"
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          {resendCountdown > 0
            ? `Resend available in ${resendCountdown}s`
            : "Resend email"}
        </Button>

        <div className="pt-1 text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
