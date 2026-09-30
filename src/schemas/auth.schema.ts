import { z } from "zod";
import type { PasswordStrengthResult } from "@/types";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: "Full name is required" })
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number"),
    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      level: "empty",
      segmentsFilled: 0,
      label: "",
      colorClass: "bg-neutral-200",
    };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return {
      level: "weak",
      segmentsFilled: 1,
      label: "Weak",
      colorClass: "bg-error-500",
    };
  }

  if (score <= 3) {
    return {
      level: "medium",
      segmentsFilled: 2,
      label: "Medium",
      colorClass: "bg-primary-500",
    };
  }

  return {
    level: "strong",
    segmentsFilled: 3,
    label: "Strong",
    colorClass: "bg-success-500",
  };
}
