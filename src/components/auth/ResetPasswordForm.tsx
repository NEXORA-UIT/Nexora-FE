import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { evaluatePasswordStrength } from "@/utils/password";
import type { ResetPasswordFormData, ResetPasswordFormProps } from "@/types";

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const onSubmit = (_data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      {/* Password Field */}
      <div className="space-y-1">
        <Input
          label="New password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="new-password"
          placeholder="Project2025!"
          error={errors.password?.message}
          actionSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors select-none"
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
        autoComplete="new-password"
        placeholder="Project2025!"
        error={errors.confirmPassword?.message}
        actionSlot={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors select-none"
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
