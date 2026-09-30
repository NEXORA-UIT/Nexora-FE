export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type PasswordStrengthLevel = "empty" | "weak" | "medium" | "strong";

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  segmentsFilled: number;
  label: string;
  colorClass: string;
}
