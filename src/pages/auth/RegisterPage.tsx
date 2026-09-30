import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NexoraLogo } from "@/components/common/NexoraLogo";
import { GoogleIcon, GitHubIcon } from "@/components/common/Icons";
import {
  registerSchema,
  evaluatePasswordStrength,
} from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { RegisterFormData } from "@/types";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
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
      navigate(ROUTES.UNDER_DEVELOPMENT);
    }, 600);
  };

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xl sm:p-8">
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

        {/* Password Field */}
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

          {/* 3-Segment Password Strength Indicator */}
          <div className="pt-0.5">
            <div className="grid grid-cols-3 gap-1.5">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  strength.segmentsFilled >= 1 ? "bg-error-500" : "bg-neutral-200"
                )}
              />
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  strength.segmentsFilled >= 2 ? "bg-primary-500" : "bg-neutral-200"
                )}
              />
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  strength.segmentsFilled >= 3 ? "bg-success-500" : "bg-neutral-200"
                )}
              />
            </div>

            {/* Strength text and requirement text */}
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-neutral-500">
                Strength:{" "}
                <span className={cn("font-medium", strength.label ? "text-primary-600" : "text-neutral-400")}>
                  {strength.label || "Empty"}
                </span>
              </span>
              <span className="text-[11px] text-neutral-400">
                8+ characters, uppercase & number
              </span>
            </div>
          </div>
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

        {/* Primary Action Button */}
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

      {/* OAuth Separator */}
      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <span className="relative bg-white px-3 text-xs text-neutral-400 select-none">
          Or continue with
        </span>
      </div>

      {/* OAuth Action Buttons with Google & GitHub Icons */}
      <div className="space-y-2.5">
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="md"
          className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50 shadow-xs"
          onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
        >
          <GoogleIcon className="mr-2.5 h-4 w-4 shrink-0" />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="md"
          className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50 shadow-xs"
          onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
        >
          <GitHubIcon className="mr-2.5 h-4 w-4 shrink-0 text-neutral-900" />
          Continue with GitHub
        </Button>
      </div>

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
    </div>
  );
};
