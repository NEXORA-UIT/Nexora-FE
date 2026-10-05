import * as React from "react";

// ==========================================
// Form Data & State Types
// ==========================================

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

export interface ForgotPasswordFormData {
  email: string;
}

export type ForgotPasswordStep = "form" | "sending" | "sent";

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// ==========================================
// Auth Component Props Interfaces
// ==========================================

export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface AuthStepIndicatorProps {
  currentStep: ForgotPasswordStep;
  onStepClick?: (step: ForgotPasswordStep) => void;
  className?: string;
}

export interface OAuthButtonsProps {
  onGoogleClick?: () => void;
  onGitHubClick?: () => void;
  separatorText?: string;
  className?: string;
}

export interface PasswordStrengthMeterProps {
  strength?: PasswordStrengthResult;
  password?: string;
  className?: string;
}

export interface LoginFormProps {
  onSuccess: () => void;
}

export interface RegisterFormProps {
  onSuccess: () => void;
}

export interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => void;
  isSubmitting: boolean;
}

export interface ForgotPasswordSuccessProps {
  email: string;
  resendCountdown: number;
  onResend: () => void;
}

export interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export interface ResetPasswordSuccessProps {
  onBackToSignIn: () => void;
}

// ==========================================
// API Contract Types (from OpenAPI Spec)
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  status: "ACTIVE" | "LOCKED" | string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface VerifyRegistrationRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ==========================================
// Auth Store State Interface
// ==========================================

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setAuth: (tokens: AuthTokens) => void;
  setUser: (user: UserProfile) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

