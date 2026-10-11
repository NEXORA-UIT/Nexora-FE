import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { OAuthButtons } from "../OAuthButtons";
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/apis/auth.api";
import { ApiError } from "@/apis/client";
import { ROUTES } from "@/constants/routes";

describe("OAuth Integration Flow Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    useAuthStore.getState().clearAuth();
  });

  describe("OAuthButtons Component", () => {
    it("initiates Google OAuth flow and redirects browser", async () => {
      const mockAssign = vi.fn();
      vi.stubGlobal("location", { assign: mockAssign });

      vi.spyOn(authApi, "startGoogleOAuth").mockResolvedValueOnce({
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth?state=google-token-123",
        loginToken: "google-token-123",
      });

      render(
        <MemoryRouter>
          <OAuthButtons />
        </MemoryRouter>
      );

      const googleBtn = screen.getByRole("button", { name: /Continue with Google/i });
      fireEvent.click(googleBtn);

      await waitFor(() => {
        expect(authApi.startGoogleOAuth).toHaveBeenCalled();
        expect(sessionStorage.getItem("nexora_oauth_state_google")).toBe("google-token-123");
        expect(mockAssign).toHaveBeenCalledWith(
          "https://accounts.google.com/o/oauth2/v2/auth?state=google-token-123"
        );
      });

      vi.unstubAllGlobals();
    });

    it("displays error banner when Google OAuth is not configured on server", async () => {
      vi.spyOn(authApi, "startGoogleOAuth").mockRejectedValueOnce(
        new ApiError("Google OAuth not configured", "OAUTH_NOT_CONFIGURED", 503)
      );

      render(
        <MemoryRouter>
          <OAuthButtons />
        </MemoryRouter>
      );

      const googleBtn = screen.getByRole("button", { name: /Continue with Google/i });
      fireEvent.click(googleBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Google OAuth is not configured on the server/i)
        ).toBeDefined();
      });
    });

    it("initiates GitHub OAuth flow and redirects browser", async () => {
      const mockAssign = vi.fn();
      vi.stubGlobal("location", { assign: mockAssign });

      vi.spyOn(authApi, "startGitHubOAuth").mockResolvedValueOnce({
        authorizationUrl: "https://github.com/login/oauth/authorize?state=github-token-456",
        loginToken: "github-token-456",
      });

      render(
        <MemoryRouter>
          <OAuthButtons />
        </MemoryRouter>
      );

      const githubBtn = screen.getByRole("button", { name: /Continue with GitHub/i });
      fireEvent.click(githubBtn);

      await waitFor(() => {
        expect(authApi.startGitHubOAuth).toHaveBeenCalled();
        expect(sessionStorage.getItem("nexora_oauth_state_github")).toBe("github-token-456");
        expect(mockAssign).toHaveBeenCalledWith(
          "https://github.com/login/oauth/authorize?state=github-token-456"
        );
      });

      vi.unstubAllGlobals();
    });

    it("displays error banner when GitHub OAuth is not configured on server", async () => {
      vi.spyOn(authApi, "startGitHubOAuth").mockRejectedValueOnce(
        new ApiError("GitHub OAuth not configured", "OAUTH_NOT_CONFIGURED", 503)
      );

      render(
        <MemoryRouter>
          <OAuthButtons />
        </MemoryRouter>
      );

      const githubBtn = screen.getByRole("button", { name: /Continue with GitHub/i });
      fireEvent.click(githubBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/GitHub OAuth is not configured on the server/i)
        ).toBeDefined();
      });
    });
  });

  describe("OAuthCallbackPage Component", () => {
    it("handles successful Google OAuth callback and synchronizes session", async () => {
      sessionStorage.setItem("nexora_oauth_state_google", "valid-state-123");

      const mockTokens = {
        accessToken: "google-access-jwt",
        refreshToken: "google-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-google",
          email: "googleuser@example.com",
          fullName: "Google User",
          avatarUrl: "https://google.com/photo.jpg",
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      };

      vi.spyOn(authApi, "handleGoogleOAuthCallback").mockResolvedValueOnce(mockTokens);

      render(
        <MemoryRouter initialEntries={["/oauth/callback/google?code=google-code&state=valid-state-123"]}>
          <Routes>
            <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
            <Route path={ROUTES.HOME} element={<div>Home Dashboard Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(authApi.handleGoogleOAuthCallback).toHaveBeenCalledWith({
          code: "google-code",
          state: "valid-state-123",
        });
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().accessToken).toBe("google-access-jwt");
        expect(useAuthStore.getState().user?.email).toBe("googleuser@example.com");
        expect(screen.getByText("Home Dashboard Target")).toBeDefined();
        // Verifies state was consumed
        expect(sessionStorage.getItem("nexora_oauth_state_google")).toBeNull();
      });
    });

    it("handles successful GitHub OAuth callback and synchronizes session", async () => {
      sessionStorage.setItem("nexora_oauth_state_github", "valid-gh-state-789");

      const mockTokens = {
        accessToken: "github-access-jwt",
        refreshToken: "github-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-github",
          email: "githubuser@example.com",
          fullName: "GitHub Developer",
          avatarUrl: "https://avatars.githubusercontent.com/u/1",
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      };

      vi.spyOn(authApi, "handleGitHubOAuthCallback").mockResolvedValueOnce(mockTokens);

      render(
        <MemoryRouter initialEntries={["/oauth/callback/github?code=github-code&state=valid-gh-state-789"]}>
          <Routes>
            <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
            <Route path={ROUTES.HOME} element={<div>Home Dashboard Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(authApi.handleGitHubOAuthCallback).toHaveBeenCalledWith({
          code: "github-code",
          state: "valid-gh-state-789",
        });
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().user?.email).toBe("githubuser@example.com");
        expect(screen.getByText("Home Dashboard Target")).toBeDefined();
        expect(sessionStorage.getItem("nexora_oauth_state_github")).toBeNull();
      });
    });

    it("handles user cancellation gracefully", async () => {
      render(
        <MemoryRouter initialEntries={["/oauth/callback/google?error=access_denied"]}>
          <Routes>
            <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Sign in with Google was cancelled/i)
        ).toBeDefined();
        expect(screen.getByText(/Back to login/i)).toBeDefined();
      });
    });

    it("rejects invalid or mismatched OAuth state (anti-CSRF protection)", async () => {
      sessionStorage.setItem("nexora_oauth_state_google", "legitimate-token");

      render(
        <MemoryRouter initialEntries={["/oauth/callback/google?code=some-code&state=attacker-injected-token"]}>
          <Routes>
            <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid OAuth state token/i)
        ).toBeDefined();
        expect(authApi.handleGoogleOAuthCallback).not.toHaveBeenCalled();
      });
    });

    it("displays error when GitHub email is not verified", async () => {
      sessionStorage.setItem("nexora_oauth_state_github", "my-state");

      vi.spyOn(authApi, "handleGitHubOAuthCallback").mockRejectedValueOnce(
        new ApiError("No verified email", "VERIFIED_EMAIL_REQUIRED", 400)
      );

      render(
        <MemoryRouter initialEntries={["/oauth/callback/github?code=code-1&state=my-state"]}>
          <Routes>
            <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/does not have a verified public email address/i)
        ).toBeDefined();
      });
    });

    it("displays error when GitHub email belongs to an existing account (ACCOUNT_LINK_REQUIRED)", async () => {
      sessionStorage.setItem("nexora_oauth_state_github", "my-state");

      vi.spyOn(authApi, "handleGitHubOAuthCallback").mockRejectedValueOnce(
        new ApiError("Account link required", "ACCOUNT_LINK_REQUIRED", 409)
      );

      render(
        <MemoryRouter initialEntries={["/oauth/callback/github?code=code-1&state=my-state"]}>
          <Routes>
            <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/already belongs to an existing Nexora user/i)
        ).toBeDefined();
      });
    });
  });
});
