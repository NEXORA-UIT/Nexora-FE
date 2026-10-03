import type { UserProfile } from "./auth";

export type SettingsTab = "profile" | "security";

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ProfileFormData {
  fullName: string;
}

export interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileInformationCardProps {
  user: UserProfile | null;
  isLoading: boolean;
  onUpdateSuccess: (updatedUser: UserProfile) => void;
}

export interface ChangePasswordCardProps {
  onSuccess?: () => void;
}
