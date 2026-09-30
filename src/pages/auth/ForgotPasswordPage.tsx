import * as React from "react";
import {
  AuthCard,
  AuthStepIndicator,
  ForgotPasswordForm,
  ForgotPasswordSuccess,
} from "@/components/auth";
import { NexoraLogo } from "@/components/common/NexoraLogo";
import { useCountdown } from "@/hooks/useCountdown";
import type { ForgotPasswordFormData, ForgotPasswordStep } from "@/types";

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = React.useState<ForgotPasswordStep>("form");
  const [submittedEmail, setSubmittedEmail] = React.useState("");
  const { secondsLeft, start: startCountdown } = useCountdown(0);

  const handleSubmit = (data: ForgotPasswordFormData) => {
    setSubmittedEmail(data.email);
    setStep("sending");

    // Simulate sending network request
    setTimeout(() => {
      setStep("sent");
      startCountdown(45);
    }, 800);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setStep("sending");
    setTimeout(() => {
      setStep("sent");
      startCountdown(45);
    }, 700);
  };

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center">
      {/* 1. Step Indicator Pill Tabs */}
      <AuthStepIndicator
        currentStep={step}
        onStepClick={(newStep) => setStep(newStep)}
      />

      {/* 2. Main Authentication Card */}
      <AuthCard>
        {/* Brand Header */}
        <NexoraLogo />

        {step !== "sent" ? (
          <>
            {/* Screen Title & Subtitle */}
            <div className="mt-5 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Forgot password?
              </h1>
              <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                Enter your email and we'll send you instructions to reset your password.
              </p>
            </div>

            {/* Form */}
            <ForgotPasswordForm
              onSubmit={handleSubmit}
              isSubmitting={step === "sending"}
            />
          </>
        ) : (
          /* Step 3: Check Email State */
          <ForgotPasswordSuccess
            email={submittedEmail}
            resendCountdown={secondsLeft}
            onResend={handleResend}
          />
        )}
      </AuthCard>
    </div>
  );
};
