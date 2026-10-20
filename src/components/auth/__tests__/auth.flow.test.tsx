import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";
import { PublicOnlyRoute } from "../PublicOnlyRoute";
import { LoginForm } from "../LoginForm";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/apis/auth.api";
import { ApiError } from "@/apis/client";

describe("Authentication Routes & Flow Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  describe("ProtectedRoute", () => {
    it("redirects unauthenticated user to /login", () => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Workspace Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Login Page Target")).toBeDefined();
      expect(screen.queryByText("Protected Workspace Content")).toBeNull();
    });

    it("renders children when authenticated with valid access token", () => {
      useAuthStore.getState().setAuth({
        accessToken: "valid-jwt",
        refreshToken: "valid-refresh",
        expiresIn: 900,
        user: {
          id: "u-1",
          email: "dev@nexora.io",
          fullName: "Nexora Dev",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      });

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Workspace Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Protected Workspace Content")).toBeDefined();
      expect(screen.queryByText("Login Page Target")).toBeNull();
    });
  });

  describe("PublicOnlyRoute", () => {
    it("allows unauthenticated visitor to see public auth page", () => {
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <div>Public Login Screen</div>
                </PublicOnlyRoute>
              }
            />
            <Route path="/home" element={<div>Home Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Public Login Screen")).toBeDefined();
      expect(screen.queryByText("Home Page Target")).toBeNull();
    });

    it("redirects authenticated user to /home", () => {
      useAuthStore.getState().setAuth({
        accessToken: "valid-jwt",
        refreshToken: "valid-refresh",
        expiresIn: 900,
        user: {
          id: "u-1",
          email: "dev@nexora.io",
          fullName: "Nexora Dev",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      });

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <div>Public Login Screen</div>
                </PublicOnlyRoute>
              }
            />
            <Route path="/home" element={<div>Home Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Home Page Target")).toBeDefined();
      expect(screen.queryByText("Public Login Screen")).toBeNull();
    });
  });

  describe("LoginForm", () => {
    it("submits valid credentials and updates store on success", async () => {
      const onSuccessMock = vi.fn();
      const mockTokens = {
        accessToken: "auth-access-token",
        refreshToken: "auth-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-999",
          email: "developer@nexora.io",
          fullName: "Nexora Developer",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      };

      vi.spyOn(authApi, "login").mockResolvedValueOnce(mockTokens);

      render(
        <MemoryRouter>
          <LoginForm onSuccess={onSuccessMock} />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByPlaceholderText("EnterpriseShield2025!");
      const submitButton = screen.getByRole("button", { name: /Sign in/i });

      fireEvent.change(emailInput, { target: { value: "developer@nexora.io" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          email: "developer@nexora.io",
          password: "Password123!",
        });
        expect(onSuccessMock).toHaveBeenCalled();
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().accessToken).toBe("auth-access-token");
        expect(useAuthStore.getState().user?.fullName).toBe("Nexora Developer");
      });
    });

    it("displays error banner when backend returns INVALID_CREDENTIALS", async () => {
      const onSuccessMock = vi.fn();
      vi.spyOn(authApi, "login").mockRejectedValueOnce(
        new ApiError("Invalid email or password", "INVALID_CREDENTIALS", 401)
      );

      render(
        <MemoryRouter>
          <LoginForm onSuccess={onSuccessMock} />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByPlaceholderText("EnterpriseShield2025!");
      const submitButton = screen.getByRole("button", { name: /Sign in/i });

      fireEvent.change(emailInput, { target: { value: "developer@nexora.io" } });
      fireEvent.change(passwordInput, { target: { value: "WrongPassword!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
        expect(screen.getByText("The email or password is incorrect.")).toBeDefined();
        expect(onSuccessMock).not.toHaveBeenCalled();
      });
    });

    it("does not show server validation details verbatim", async () => {
      vi.spyOn(authApi, "login").mockRejectedValueOnce(
        new ApiError("Dữ liệu không hợp lệ", "VALIDATION_ERROR", 400, [
          { field: "email", message: "Email không hợp lệ" },
        ])
      );

      render(
        <MemoryRouter>
          <LoginForm onSuccess={vi.fn()} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "developer@nexora.io" },
      });
      fireEvent.change(screen.getByPlaceholderText("EnterpriseShield2025!"), {
        target: { value: "Password123!" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert").textContent).toContain(
          "Please check your email and password and try again."
        );
      });
      expect(screen.queryByText("Email không hợp lệ")).toBeNull();
      expect(screen.queryByText("Dữ liệu không hợp lệ")).toBeNull();
    });
  });
});
