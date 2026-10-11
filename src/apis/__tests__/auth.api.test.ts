import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi } from "../auth.api";
import { profileApi } from "../profile.api";
import { apiClient, ApiError } from "../client";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        post: vi.fn(),
        get: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
      post: vi.fn(),
    },
  };
});

describe("authApi & profileApi Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  describe("authApi.login", () => {
    it("successfully sends login request and unwraps data envelope", async () => {
      const mockTokens = {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-123",
          email: "dev@nexora.io",
          fullName: "Dev User",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      };

      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: mockTokens },
      });

      const result = await authApi.login({
        email: "dev@nexora.io",
        password: "Password123!",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "dev@nexora.io",
        password: "Password123!",
      });
      expect(result).toEqual(mockTokens);
    });
  });

  describe("authApi.register", () => {
    it("returns 202 Accepted response envelope with email notice", async () => {
      const mockResponse = {
        success: true,
        message: "Kiểm tra email để hoàn tất đăng ký",
      };

      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authApi.register({
        email: "newuser@nexora.io",
        password: "Password123!",
        fullName: "New User",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/auth/register", {
        email: "newuser@nexora.io",
        password: "Password123!",
        fullName: "New User",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("authApi.verifyRegistration", () => {
    it("completes verification and returns token payload", async () => {
      const mockTokens = {
        accessToken: "verified-access-token",
        refreshToken: "verified-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-456",
          email: "verified@nexora.io",
          fullName: "Verified User",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      };

      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: mockTokens },
      });

      const result = await authApi.verifyRegistration({ token: "valid-verify-token" });

      expect(apiClient.post).toHaveBeenCalledWith("/auth/verify-registration", {
        token: "valid-verify-token",
      });
      expect(result).toEqual(mockTokens);
    });
  });

  describe("authApi.refreshToken", () => {
    it("requests token pair refreshment using refresh token", async () => {
      const mockNewTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-123",
          email: "dev@nexora.io",
          fullName: "Dev User",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      };

      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: mockNewTokens },
      });

      const result = await authApi.refreshToken({ refreshToken: "old-refresh-token" });

      expect(apiClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken: "old-refresh-token",
      });
      expect(result).toEqual(mockNewTokens);
    });
  });

  describe("authApi.logout & logoutAll", () => {
    it("calls /auth/logout endpoint", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: {} },
      });

      await authApi.logout();
      expect(apiClient.post).toHaveBeenCalledWith("/auth/logout");
    });

    it("calls /auth/logout-all endpoint", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: {} },
      });

      await authApi.logoutAll();
      expect(apiClient.post).toHaveBeenCalledWith("/auth/logout-all");
    });
  });

  describe("authApi.getMe", () => {
    it("retrieves current authenticated user profile", async () => {
      const mockProfile = {
        id: "u-123",
        email: "dev@nexora.io",
        fullName: "Dev User",
        avatarUrl: null,
        status: "ACTIVE",
        createdAt: "2026-10-09T00:00:00.000Z",
        updatedAt: "2026-10-09T00:00:00.000Z",
      };

      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { success: true, data: mockProfile },
      });

      const profile = await authApi.getMe();
      expect(apiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(profile).toEqual(mockProfile);
    });
  });

  describe("authApi.forgotPassword & resetPassword", () => {
    it("submits forgot-password request", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: {} },
      });

      await authApi.forgotPassword({ email: "forgot@nexora.io" });
      expect(apiClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "forgot@nexora.io",
      });
    });

    it("submits reset-password request", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: {} },
      });

      await authApi.resetPassword({
        token: "reset-jwt-token",
        newPassword: "NewPassword123!",
      });
      expect(apiClient.post).toHaveBeenCalledWith("/auth/reset-password", {
        token: "reset-jwt-token",
        newPassword: "NewPassword123!",
      });
    });
  });

  describe("profileApi.updateProfile", () => {
    it("calls PATCH /auth/me with payload and returns updated profile", async () => {
      const mockUpdatedUser = {
        id: "u-123",
        email: "dev@nexora.io",
        fullName: "Updated Name",
        avatarUrl: "https://example.com/avatar.jpg",
        status: "ACTIVE",
        createdAt: "2026-10-09T00:00:00.000Z",
        updatedAt: "2026-10-09T00:00:00.000Z",
      };

      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { success: true, data: mockUpdatedUser },
      });

      const result = await profileApi.updateProfile({
        fullName: "Updated Name",
        avatarUrl: "https://example.com/avatar.jpg",
      });

      expect(apiClient.patch).toHaveBeenCalledWith("/auth/me", {
        fullName: "Updated Name",
        avatarUrl: "https://example.com/avatar.jpg",
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe("ApiError class structure", () => {
    it("correctly models status, error code, and validation details", () => {
      const details = [{ field: "email", message: "Email is invalid" }];
      const err = new ApiError("Validation failed", "VALIDATION_ERROR", 400, details);

      expect(err.name).toBe("ApiError");
      expect(err.message).toBe("Validation failed");
      expect(err.code).toBe("VALIDATION_ERROR");
      expect(err.status).toBe(400);
      expect(err.details).toEqual(details);
    });
  });
});
