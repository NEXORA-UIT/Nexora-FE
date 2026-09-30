import * as React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import type { ForgotPasswordFormData, ForgotPasswordFormProps } from "@/types";

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <Input
        label="Email"
        type="email"
        required
        autoComplete="email"
        placeholder="developer@company.org"
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />

      <div className="pt-1">
        <Button
          type="submit"
          fullWidth
          size="md"
          disabled={isSubmitting}
          className="h-10 rounded-lg text-sm font-medium"
        >
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
      </div>

      <div className="pt-2 text-center">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
};
