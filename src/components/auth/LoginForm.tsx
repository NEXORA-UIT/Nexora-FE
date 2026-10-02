import * as React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/apis/auth.api";
import { ApiError } from "@/apis/client";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginFormData, LoginFormProps } from "@/types";

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const tokens = await authApi.login({
        email: data.email,
        password: data.password,
      });

      // Save authenticated session in Zustand store (with localStorage persistence)
      setAuth(tokens);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "INVALID_CREDENTIALS") {
          setServerError("Incorrect email or password.");
        } else if (err.code === "ACCOUNT_LOCKED") {
          setServerError("Your account has been locked. Please contact support.");
        } else if (err.code === "RATE_LIMITED") {
          setServerError("Too many login attempts. Please try again in 1 minute.");
        } else if (err.code === "VALIDATION_ERROR" && err.details) {
          err.details.forEach((detail) => {
            if (detail.field === "email" || detail.field === "password") {
              setError(detail.field, { message: detail.message });
            }
          });
          setServerError(err.message || "Invalid input data.");
        } else {
          setServerError(err.message || "Sign in failed. Please try again.");
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
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
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

      {/* Email Field */}
      <Input
        label="Email"
        type="email"
        required
        disabled={isSubmitting}
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
          disabled={isSubmitting}
          autoComplete="current-password"
          placeholder="EnterpriseShield2025!"
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
        <div className="flex justify-end pt-0.5">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
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
  );
};
