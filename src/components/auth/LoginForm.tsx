import * as React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import type { LoginFormData, LoginFormProps } from "@/types";

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
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
      onSuccess();
    }, 600);
  };

  return (
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
