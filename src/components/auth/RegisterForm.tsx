import * as React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { registerSchema } from "@/schemas/auth.schema";
import { evaluatePasswordStrength } from "@/utils/password";
import { authApi } from "@/apis/auth.api";
import { ApiError } from "@/apis/client";
import { ROUTES } from "@/constants/routes";
import type { RegisterFormData, RegisterFormProps } from "@/types";

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
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

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Backend z.strictObject only accepts email, password, fullName (strip confirmPassword)
      await authApi.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      // Backend returns 202 Accepted: Verification link sent to email
      setRegisteredEmail(data.email);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_TAKEN") {
          setError("email", { message: "This email is already in use." });
          setServerError("This email is already registered. Please sign in or use a different email.");
        } else if (err.code === "MAIL_NOT_CONFIGURED") {
          setServerError("Email verification service is temporarily unconfigured on the server.");
        } else if (err.code === "VALIDATION_ERROR" && err.details) {
          err.details.forEach((detail) => {
            if (
              detail.field === "email" ||
              detail.field === "password" ||
              detail.field === "fullName"
            ) {
              setError(detail.field, { message: detail.message });
            }
          });
          setServerError(err.message || "Invalid registration data.");
        } else {
          setServerError(err.message || "Registration failed. Please try again.");
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

  // If registration was accepted by backend (202), show check email message
  if (registeredEmail) {
    return (
      <div className="mt-4 space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success-50 text-success-600">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            Check your email
          </h2>
          <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
            We have sent a verification link to{" "}
            <span className="font-semibold text-neutral-800">{registeredEmail}</span>.
            Please check your inbox and click the link to activate your account.
          </p>
        </div>
        <div className="pt-2">
          <Link to={ROUTES.LOGIN}>
            <Button fullWidth size="md" className="h-10 rounded-lg text-sm font-medium">
              <span>Back to Sign in</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3.5" noValidate>
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

      {/* Full Name Field */}
      <Input
        label="Full name"
        type="text"
        required
        disabled={isSubmitting}
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
        disabled={isSubmitting}
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
        label="Confirm password"
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
