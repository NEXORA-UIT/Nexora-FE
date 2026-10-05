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

export interface AvatarSectionProps {
  currentAvatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
  disabled?: boolean;
}

export interface ProfileInformationCardProps {
  user: UserProfile | null;
  onUpdateSuccess?: (updatedUser: UserProfile) => void;
}

export interface ChangePasswordCardProps {
  onSuccess?: () => void;
}
