import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/apis/auth.api";

/**
 * Hook to restore and validate the user session on application mount.
 * If credentials exist in local storage, synchronizes profile with GET /api/v1/auth/me.
 * If the access token is expired, the apiClient transparently refreshes it.
 * If refresh fails, cleans up the session and reverts to unauthenticated state.
 */
export function useSession() {
  const [isValidating, setIsValidating] = React.useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const validatedSessionRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // If credentials are completely cleared (e.g. on logout), reset tracked session
    if (!accessToken && !refreshToken) {
      validatedSessionRef.current = null;
      return;
    }

    const currentSessionIdentity = refreshToken || accessToken;

    // Skip validation if this exact credential pair has already been validated
    if (validatedSessionRef.current === currentSessionIdentity) {
      return;
    }

    let isMounted = true;

    async function restoreSession() {
      setIsValidating(true);
      try {
        const profile = await authApi.getMe();
        if (!isMounted) return;

        // Race-condition guard: Only commit profile if current store credentials still match
        const activeIdentity =
          useAuthStore.getState().refreshToken || useAuthStore.getState().accessToken;

        if (activeIdentity === currentSessionIdentity && activeIdentity !== null) {
          validatedSessionRef.current = currentSessionIdentity;
          setUser(profile);
        }
      } catch {
        if (!isMounted) return;

        // Only clear auth if the failed request still belongs to the active session
        const activeIdentity =
          useAuthStore.getState().refreshToken || useAuthStore.getState().accessToken;

        if (activeIdentity === currentSessionIdentity && activeIdentity !== null) {
          validatedSessionRef.current = null;
          clearAuth();
        }
      } finally {
        if (isMounted) {
          const activeIdentity =
            useAuthStore.getState().refreshToken || useAuthStore.getState().accessToken;

          // Clear loading indicator if this was the active request or credentials cleared
          if (activeIdentity === currentSessionIdentity || !activeIdentity) {
            setIsValidating(false);
          }
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, refreshToken, setUser, clearAuth]);

  return { isValidating };
}
