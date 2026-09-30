import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { ResetPasswordSuccessProps } from "@/types";

export const ResetPasswordSuccess: React.FC<ResetPasswordSuccessProps> = ({
  onBackToSignIn,
}) => {
  return (
    <div className="mt-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
        Password reset successful
      </h1>
      <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
        Your password has been securely updated. You can now sign in with your new credentials.
      </p>

      <div className="mt-6">
        <Button
          type="button"
          variant="primary"
          fullWidth
          size="md"
          onClick={onBackToSignIn}
          className="h-10 rounded-lg text-sm font-medium"
        >
          Back to sign in
        </Button>
      </div>
    </div>
  );
};
