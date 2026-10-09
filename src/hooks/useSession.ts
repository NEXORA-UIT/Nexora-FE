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
  const hasRestored = React.useRef(false);

  React.useEffect(() => {
    if (hasRestored.current) return;
    if (!accessToken && !refreshToken) return;

    hasRestored.current = true;
    let isMounted = true;

    async function restoreSession() {
      setIsValidating(true);
      try {
        const profile = await authApi.getMe();
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
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
