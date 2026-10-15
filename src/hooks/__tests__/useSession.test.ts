import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSession } from "../useSession";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/apis/auth.api";
import type { UserProfile } from "@/types";

describe("useSession Lifecycle & Race Condition Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  const mockProfileUser1: UserProfile = {
    id: "user-1",
    email: "user1@nexora.io",
    fullName: "User One",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: "2026-10-09T00:00:00.000Z",
    updatedAt: "2026-10-09T00:00:00.000Z",
  };

  const mockProfileUser2: UserProfile = {
    id: "user-2",
    email: "user2@nexora.io",
    fullName: "User Two",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: "2026-10-09T00:00:00.000Z",
    updatedAt: "2026-10-09T00:00:00.000Z",
  };

  it("does not call getMe when unauthenticated without tokens", () => {
    const spyGetMe = vi.spyOn(authApi, "getMe").mockResolvedValue(mockProfileUser1);

    const { result } = renderHook(() => useSession());

    expect(spyGetMe).not.toHaveBeenCalled();
    expect(result.current.isValidating).toBe(false);
  });

  it("calls getMe and updates user profile on mount with valid tokens", async () => {
    useAuthStore.getState().setAuth({
      accessToken: "token-user-1",
      refreshToken: "refresh-user-1",
      expiresIn: 900,
      user: null as unknown as UserProfile,
    });

    const spyGetMe = vi.spyOn(authApi, "getMe").mockResolvedValueOnce(mockProfileUser1);

    const { result } = renderHook(() => useSession());

    expect(result.current.isValidating).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(spyGetMe).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(mockProfileUser1);
    expect(result.current.isValidating).toBe(false);
  });

  it("does not redundantly call getMe on re-render if tokens have not changed", async () => {
    useAuthStore.getState().setAuth({
      accessToken: "token-user-1",
      refreshToken: "refresh-user-1",
      expiresIn: 900,
      user: mockProfileUser1,
    });

    const spyGetMe = vi.spyOn(authApi, "getMe").mockResolvedValue(mockProfileUser1);

    const { rerender } = renderHook(() => useSession());

    await act(async () => {
      await Promise.resolve();
    });

    expect(spyGetMe).toHaveBeenCalledTimes(1);

    // Re-render hook
    rerender();

    await act(async () => {
      await Promise.resolve();
    });

    expect(spyGetMe).toHaveBeenCalledTimes(1);
  });

  it("re-validates session when user logs in with new tokens in the same tab", async () => {
    // Initial mount unauthenticated
    const spyGetMe = vi.spyOn(authApi, "getMe").mockResolvedValue(mockProfileUser1);
    const { rerender } = renderHook(() => useSession());

    expect(spyGetMe).not.toHaveBeenCalled();

    // User logs in in the same tab
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: "token-user-1",
        refreshToken: "refresh-user-1",
        expiresIn: 900,
        user: null as unknown as UserProfile,
      });
    });

    rerender();

    await act(async () => {
      await Promise.resolve();
    });

    expect(spyGetMe).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(mockProfileUser1);
  });

  it("discards in-flight profile if user logs out before getMe resolves (no resurrection)", async () => {
    useAuthStore.getState().setAuth({
      accessToken: "token-user-1",
      refreshToken: "refresh-user-1",
      expiresIn: 900,
      user: null as unknown as UserProfile,
    });

    let resolveGetMe!: (profile: UserProfile) => void;
    vi.spyOn(authApi, "getMe").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGetMe = resolve;
        })
    );

    renderHook(() => useSession());

    // User logs out while request is in-flight
    act(() => {
      useAuthStore.getState().clearAuth();
    });

    // In-flight getMe completes for User 1
    await act(async () => {
      resolveGetMe(mockProfileUser1);
      await Promise.resolve();
    });

    // Profile must NOT be set; store must remain cleared!
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("discards in-flight profile if account switches to another user before getMe resolves", async () => {
    // User 1 starts session
    useAuthStore.getState().setAuth({
      accessToken: "token-user-1",
      refreshToken: "refresh-user-1",
      expiresIn: 900,
      user: null as unknown as UserProfile,
    });

    let resolveGetMeUser1!: (profile: UserProfile) => void;
    let resolveGetMeUser2!: (profile: UserProfile) => void;

    let callCount = 0;
    vi.spyOn(authApi, "getMe").mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) {
        return new Promise((resolve) => {
          resolveGetMeUser1 = resolve;
        });
      }
      return new Promise((resolve) => {
        resolveGetMeUser2 = resolve;
      });
    });

    const { rerender } = renderHook(() => useSession());

    // Switch account to User 2 while User 1 getMe is still in flight
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: "token-user-2",
        refreshToken: "refresh-user-2",
        expiresIn: 900,
        user: null as unknown as UserProfile,
      });
    });

    rerender();

    // User 1's getMe completes late
    await act(async () => {
      resolveGetMeUser1(mockProfileUser1);
      await Promise.resolve();
    });

    // User 1's profile must NOT overwrite the active User 2 session
    expect(useAuthStore.getState().user).not.toEqual(mockProfileUser1);

    // Now User 2's getMe completes
    await act(async () => {
      resolveGetMeUser2(mockProfileUser2);
      await Promise.resolve();
    });

    expect(useAuthStore.getState().user).toEqual(mockProfileUser2);
  });

  it("clears auth when getMe rejects, but does not clear auth if account already switched", async () => {
    useAuthStore.getState().setAuth({
      accessToken: "token-user-1",
      refreshToken: "refresh-user-1",
      expiresIn: 900,
      user: null as unknown as UserProfile,
    });

    let rejectGetMeUser1!: (err: Error) => void;
    let callCount = 0;
    vi.spyOn(authApi, "getMe").mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) {
        return new Promise((_, reject) => {
          rejectGetMeUser1 = reject;
        });
      }
      return Promise.resolve(mockProfileUser2);
    });

    const { rerender } = renderHook(() => useSession());

    // Account switches to User 2 with valid session
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: "token-user-2",
        refreshToken: "refresh-user-2",
        expiresIn: 900,
        user: mockProfileUser2,
      });
    });

    rerender();

    // User 1's request fails
    await act(async () => {
      rejectGetMeUser1(new Error("Token invalid"));
      await Promise.resolve();
    });

    // Failure of User 1's request must NOT clear User 2's auth!
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe("token-user-2");
    expect(useAuthStore.getState().user).toEqual(mockProfileUser2);
  });
});
