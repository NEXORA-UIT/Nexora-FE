import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Check, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  changePasswordFormSchema,
  type ChangePasswordFormSchemaType,
} from "@/schemas";
import { profileApi } from "@/apis/profile.api";
import { ApiError } from "@/apis/client";

export interface ChangePasswordCardProps {
  onSuccess?: () => void;
}

export const ChangePasswordCard: React.FC<ChangePasswordCardProps> = ({
  onSuccess,
}) => {
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormSchemaType>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormSchemaType) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await profileApi.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      setSuccessMessage(
        "Password changed successfully. Your other active sessions have been invalidated."
      );
      reset();
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "INVALID_CREDENTIALS" || err.status === 401) {
          setErrorMessage("Current password is incorrect. Please try again.");
        } else {
          setErrorMessage(err.message || "Failed to change password.");
        }
      } else {
        setErrorMessage("An unexpected network error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs">
      {/* Card Header */}
      <div className="border-b border-neutral-100 pb-5">
        <h2 className="text-base font-semibold text-neutral-900">
          Change password
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 border border-emerald-200/80 animate-in fade-in duration-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-error-50 px-3.5 py-2.5 text-xs font-medium text-error-800 border border-error-200/80 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-error-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 max-w-lg">
        {/* Old Password */}
        <div className="space-y-1.5">
          <Input
            id="old-password"
            label="Current password"
            isRequired
            type={showOldPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.oldPassword?.message}
            disabled={isSubmitting}
            actionSlot={
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                aria-label={showOldPassword ? "Hide password" : "Show password"}
              >
                {showOldPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            {...register("oldPassword")}
          />
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <Input
            id="new-password"
            label="New password"
            isRequired
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.newPassword?.message}
            helperText="Must be at least 8 characters, containing at least 1 uppercase letter and 1 number."
            disabled={isSubmitting}
            actionSlot={
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            {...register("newPassword")}
          />
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <Input
            id="confirm-password"
            label="Confirm new password"
            isRequired
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            actionSlot={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
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
        </div>

        {/* Security Warning Box */}
        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 flex items-start gap-2.5 text-xs text-neutral-600">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <span className="leading-relaxed">
            Changing your password will revoke all other active refresh sessions for your account across other devices.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg"
          >
            Clear
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-xs"
          >
            {isSubmitting ? "Updating password..." : "Update password"}
          </Button>
        </div>
      </form>
    </div>
  );
};
