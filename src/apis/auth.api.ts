import { apiClient } from "./client";
import { clearWorkspaceMembersCache } from "./workspace.api";
import type {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyRegistrationRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserProfile,
  ApiSuccessResponse,
  OAuthStartResponse,
  OAuthCallbackRequest,
} from "@/types";

export const authApi = {
  /**
   * Authenticate user credentials with email and password
   * POST /api/v1/auth/login
   */
  async login(payload: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post<ApiSuccessResponse<AuthTokens>>(
      "/auth/login",
      payload
    );
    return response.data.data;
  },

  /**
   * Request local account registration
   * POST /api/v1/auth/register
   * Returns 202 with message to check email
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  /**
   * Complete local account registration using one-time token from email
   * POST /api/v1/auth/verify-registration
   */
  async verifyRegistration(
    payload: VerifyRegistrationRequest
  ): Promise<AuthTokens> {
    const response = await apiClient.post<ApiSuccessResponse<AuthTokens>>(
      "/auth/verify-registration",
      payload
    );
    return response.data.data;
  },

  /**
   * Exchange 7-day refresh token for a new access token pair
   * POST /api/v1/auth/refresh
   */
  async refreshToken(payload: RefreshTokenRequest): Promise<AuthTokens> {
    const response = await apiClient.post<ApiSuccessResponse<AuthTokens>>(
      "/auth/refresh",
      payload
    );
    return response.data.data;
  },

  /**
   * Revoke current session
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    await apiClient.post<ApiSuccessResponse<Record<string, never>>>(
      "/auth/logout"
    );
    clearWorkspaceMembersCache();
  },

  /**
   * Revoke all user sessions
   * POST /api/v1/auth/logout-all
   */
  async logoutAll(): Promise<void> {
    await apiClient.post<ApiSuccessResponse<Record<string, never>>>(
      "/auth/logout-all"
    );
    clearWorkspaceMembersCache();
  },

  /**
   * Get current authenticated user profile
   * GET /api/v1/auth/me
   */
  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<ApiSuccessResponse<UserProfile>>(
      "/auth/me"
    );
    return response.data.data;
  },

  /**
   * Request a password reset email
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await apiClient.post<ApiSuccessResponse<Record<string, never>>>(
      "/auth/forgot-password",
      payload
    );
  },

  /**
   * Reset password with one-time token
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await apiClient.post<ApiSuccessResponse<Record<string, never>>>(
      "/auth/reset-password",
      payload
    );
  },

  /**
   * Initiate Google OAuth sign-in flow
   * POST /api/v1/auth/oauth/google/start
   */
  async startGoogleOAuth(): Promise<OAuthStartResponse> {
    const response = await apiClient.post<ApiSuccessResponse<OAuthStartResponse>>(
      "/auth/oauth/google/start",
      {}
    );
    return response.data.data;
  },

  /**
   * Exchange Google authorization code & state token for Nexora session tokens
   * POST /api/v1/auth/oauth/google/callback
   */
  async handleGoogleOAuthCallback(
    payload: OAuthCallbackRequest
  ): Promise<AuthTokens> {
    const response = await apiClient.post<ApiSuccessResponse<AuthTokens>>(
      "/auth/oauth/google/callback",
      payload
    );
    return response.data.data;
  },

  /**
   * Initiate GitHub OAuth sign-in flow
   * POST /api/v1/auth/oauth/github/start
   */
  async startGitHubOAuth(): Promise<OAuthStartResponse> {
    const response = await apiClient.post<ApiSuccessResponse<OAuthStartResponse>>(
      "/auth/oauth/github/start",
      {}
    );
    return response.data.data;
  },

  /**
   * Exchange GitHub authorization code & state token for Nexora session tokens
   * POST /api/v1/auth/oauth/github/callback
   */
  async handleGitHubOAuthCallback(
    payload: OAuthCallbackRequest
  ): Promise<AuthTokens> {
    const response = await apiClient.post<ApiSuccessResponse<AuthTokens>>(
      "/auth/oauth/github/callback",
      payload
    );
    return response.data.data;
  },
};
