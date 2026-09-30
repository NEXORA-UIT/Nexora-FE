import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { registerSchema } from "@/schemas/auth.schema";
import { evaluatePasswordStrength } from "@/utils/password";
import type { RegisterFormData, RegisterFormProps } from "@/types";

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");
  const strength = evaluatePasswordStrength(passwordValue);

  const onSubmit = (_data: RegisterFormData) => {
    setIsSubmitting(true);
    // UI mock submission (real auth API integration will be wired in future task)
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3.5" noValidate>
      {/* Full Name Field */}
      <Input
        label="Full name"
        type="text"
        required
        autoComplete="name"
        placeholder="Alex Morgan"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      {/* Email Field */}
      <Input
        label="Email"
        type="email"
        required
        autoComplete="email"
        placeholder="alex.morgan@nexora.io"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* Password Field with Strength Meter */}
      <div className="space-y-1">
        <Input
          label="Password"
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
        label="Confirm password"
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

      {/* Submit Button */}
      <div className="pt-1">
        <Button
          type="submit"
          fullWidth
          size="md"
          disabled={isSubmitting}
          className="h-10 rounded-lg text-sm font-medium"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </form>
  );
};
