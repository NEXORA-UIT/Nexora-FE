import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { evaluatePasswordStrength } from "@/utils/password";
import { authApi } from "@/apis/auth.api";
import { ApiError } from "@/apis/client";
import type { ResetPasswordFormData, ResetPasswordFormProps } from "@/types";

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");
  const strength = evaluatePasswordStrength(passwordValue);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      if (!token) {
        setServerError(
          "No verification token found in the link. Please click the link in your email again."
        );
        return;
      }

      await authApi.resetPassword({
        token,
        newPassword: data.password,
      });

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "INVALID_RESET_TOKEN") {
          setServerError(
            "The password reset link is invalid or has expired. Please request a new one."
          );
        } else {
          setServerError(err.message || "Password reset failed. Please try again.");
        }
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      {/* Server Error Alert Banner */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-error-200 bg-error-50/70 p-3 text-xs text-error-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-600" />
          <span className="leading-relaxed font-medium">{serverError}</span>
        </div>
      )}

      {/* Password Field */}
      <div className="space-y-1">
        <Input
          label="New password"
          type={showPassword ? "text" : "password"}
          required
          disabled={isSubmitting}
          autoComplete="new-password"
          placeholder="Project2025!"
          error={errors.password?.message}
          actionSlot={
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors select-none disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          {...register("password")}
        />

        {/* 3-Segment Password Strength Indicator Component */}
        <PasswordStrengthMeter strength={strength} />
      </div>

      {/* Confirm Password Field */}
      <Input
        label="Confirm new password"
        type={showConfirmPassword ? "text" : "password"}
        required
        disabled={isSubmitting}
        autoComplete="new-password"
        placeholder="Project2025!"
        error={errors.confirmPassword?.message}
        actionSlot={
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors select-none disabled:opacity-50"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        {...register("confirmPassword")}
      />

      <div className="pt-2">
        <Button
          type="submit"
          fullWidth
          size="md"
          disabled={isSubmitting}
          className="h-10 rounded-lg text-sm font-medium"
        >
          {isSubmitting ? "Resetting password..." : "Reset password"}
        </Button>
      </div>
    </form>
  );
};
