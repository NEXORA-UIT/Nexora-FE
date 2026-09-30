import type { PasswordStrengthResult } from "@/types";

/**
 * Pure utility function to evaluate password strength based on length,
 * uppercase letters, digits, and special characters.
 */
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
