import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthState, AuthTokens, UserProfile } from "@/types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (tokens: AuthTokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: tokens.user,
          isAuthenticated: true,
        }),
      setUser: (user: UserProfile) =>
        set({
          user,
        }),
      setAccessToken: (accessToken: string) =>
        set({
          accessToken,
        }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "nexora_auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
