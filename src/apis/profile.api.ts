import { apiClient } from "./client";
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ApiSuccessResponse,
} from "@/types";

export const profileApi = {
  /**
   * Retrieves the identity, email, full name, and avatar of the currently authenticated user.
   * GET /api/v1/auth/me
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiSuccessResponse<UserProfile>>(
      "/auth/me"
    );
    return response.data.data;
  },

  /**
   * Updates full name and/or avatar image URL.
   * PATCH /api/v1/auth/me
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.patch<ApiSuccessResponse<UserProfile>>(
      "/auth/me",
      payload
    );
    return response.data.data;
  },

  /**
   * Validates current password and updates to a new password using Bcrypt.
   * POST /api/v1/auth/change-password
   */
  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await apiClient.post<ApiSuccessResponse<Record<string, never>>>(
      "/auth/change-password",
      payload
    );
  },
};
