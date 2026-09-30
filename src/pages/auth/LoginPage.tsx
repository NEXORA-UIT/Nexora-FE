import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NexoraLogo } from "@/components/common/NexoraLogo";
import { GoogleIcon, GitHubIcon } from "@/components/common/Icons";
import { loginSchema } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import type { LoginFormData } from "@/types";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (_data: LoginFormData) => {
    setIsSubmitting(true);
    // UI mock submission (real auth API integration will be wired in future task)
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(ROUTES.UNDER_DEVELOPMENT);
    }, 600);
  };

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-neutral-200/90 bg-white p-7 shadow-2xl sm:p-9">
      {/* Brand Header */}
      <NexoraLogo />

      {/* Screen Title & Subtitle */}
      <div className="mt-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sign in to continue to your workspace
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
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
        <div className="space-y-1.5">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="EnterpriseShield2025!"
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
          <div className="flex justify-end pt-0.5">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-1">
          <Button
            type="submit"
            fullWidth
            size="md"
            disabled={isSubmitting}
            className="h-10 rounded-lg text-sm font-medium"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>

      {/* OAuth Separator */}
      <div className="relative my-5 text-center">
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
      <div className="mt-5 text-center text-xs text-neutral-500">
        Don't have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};
