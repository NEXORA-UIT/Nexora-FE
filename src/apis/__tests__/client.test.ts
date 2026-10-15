import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { apiClient, ApiError, _resetClientStateForTesting } from "../client";
import { useAuthStore } from "@/stores/auth.store";

function createAxiosError(
  status: number,
  message: string,
  data?: unknown,
  requestConfig?: InternalAxiosRequestConfig
): AxiosError {
  const config = requestConfig || ({
    headers: new axios.AxiosHeaders(),
    url: "/api/v1/test-resource",
    method: "get",
  } as InternalAxiosRequestConfig);

  const response: AxiosResponse = {
    data: data ?? { error: { code: "UNAUTHORIZED", message } },
    status,
    statusText: status === 401 ? "Unauthorized" : "Error",
    headers: {},
    config,
  };

  const err = new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, response);
  err.response = response;
  return err;
}

describe("apiClient Interceptors & Refresh Queue Suite", () => {
  const originalAdapter = apiClient.defaults.adapter;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    if (_resetClientStateForTesting) {
      _resetClientStateForTesting();
    }
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  describe("Request Interceptor", () => {
    it("attaches Authorization header when accessToken exists in store", async () => {
      useAuthStore.getState().setAuth({
        accessToken: "valid-token-abc",
        refreshToken: "refresh-token-xyz",
        expiresIn: 900,
        user: {
          id: "u-1",
          email: "test@nexora.io",
          fullName: "Test User",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      });

      let capturedConfig: InternalAxiosRequestConfig | undefined;
      apiClient.defaults.adapter = async (config) => {
        capturedConfig = config;
        return {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      };

      const response = await apiClient.get("/test-endpoint");
      expect(response.status).toBe(200);
      expect(capturedConfig).toBeDefined();
      expect(capturedConfig?.headers?.Authorization).toBe("Bearer valid-token-abc");
    });

    it("does not attach Authorization header when accessToken is absent", async () => {
      let capturedConfig: InternalAxiosRequestConfig | undefined;
      apiClient.defaults.adapter = async (config) => {
        capturedConfig = config;
        return {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      };

      await apiClient.get("/test-endpoint");
      expect(capturedConfig).toBeDefined();
      expect(capturedConfig?.headers?.Authorization).toBeUndefined();
    });
  });

  describe("Response Interceptor & Token Refresh", () => {
    it("immediately clears auth and rejects if 401 encountered without refreshToken", async () => {
      useAuthStore.getState().setAuth({
        accessToken: "expired-token",
        refreshToken: null as unknown as string,
        expiresIn: 900,
        user: null as unknown as import("@/types").UserProfile,
      });

      apiClient.defaults.adapter = async () => {
        throw createAxiosError(401, "Token expired");
      };

      await expect(apiClient.get("/test-resource")).rejects.toThrow(ApiError);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("transparently refreshes token on 401, updates auth store, and retries request", async () => {
      useAuthStore.getState().setAuth({
        accessToken: "expired-token",
        refreshToken: "valid-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-1",
          email: "user@nexora.io",
          fullName: "User One",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      });

      let attempts = 0;
      apiClient.defaults.adapter = async (config) => {
        attempts += 1;
        if (attempts === 1) {
          throw createAxiosError(401, "Token expired");
        }
        return {
          data: { success: true, message: "Retried successfully" },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      };

      const spyRefreshPost = vi.spyOn(axios, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            accessToken: "new-fresh-access-token",
            refreshToken: "new-fresh-refresh-token",
            expiresIn: 900,
            user: useAuthStore.getState().user,
          },
        },
      });

      const response = await apiClient.get("/test-resource");

      expect(spyRefreshPost).toHaveBeenCalledTimes(1);
      expect(attempts).toBe(2);
      expect(response.data.message).toBe("Retried successfully");
      expect(useAuthStore.getState().accessToken).toBe("new-fresh-access-token");
      expect(useAuthStore.getState().refreshToken).toBe("new-fresh-refresh-token");
    });

    it("queues concurrent 401 requests, calls refresh once, and retries all queued requests", async () => {
      useAuthStore.getState().setAuth({
        accessToken: "expired-token",
        refreshToken: "valid-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-1",
          email: "user@nexora.io",
          fullName: "User One",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      });

      let requestCount = 0;
      apiClient.defaults.adapter = async (config) => {
        requestCount += 1;
        // First 3 calls fail with 401
        if (requestCount <= 3) {
          throw createAxiosError(401, "Unauthorized");
        }
        // Retried calls succeed
        return {
          data: { success: true, url: config.url },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      };

      // Add delay to refresh to simulate network latency and ensure queueing
      const spyRefreshPost = vi.spyOn(axios, "post").mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return {
          data: {
            success: true,
            data: {
              accessToken: "new-token-batch",
              refreshToken: "new-refresh-batch",
              expiresIn: 900,
              user: useAuthStore.getState().user,
            },
          },
        };
      });

      // Fire 3 simultaneous requests
      const [res1, res2, res3] = await Promise.all([
        apiClient.get("/res-1"),
        apiClient.get("/res-2"),
        apiClient.get("/res-3"),
      ]);

      expect(spyRefreshPost).toHaveBeenCalledTimes(1);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res3.status).toBe(200);
      expect(useAuthStore.getState().accessToken).toBe("new-token-batch");
    });

    it("rejects all queued requests with ApiError and clears auth when refresh fails", async () => {
      useAuthStore.getState().setAuth({
        accessToken: "expired-token",
        refreshToken: "invalid-refresh-token",
        expiresIn: 900,
        user: {
          id: "u-1",
          email: "user@nexora.io",
          fullName: "User One",
          avatarUrl: null,
          status: "ACTIVE",
          createdAt: "2026-10-09T00:00:00.000Z",
          updatedAt: "2026-10-09T00:00:00.000Z",
        },
      });

      apiClient.defaults.adapter = async () => {
        throw createAxiosError(401, "Unauthorized");
      };

      const refreshAxiosError = createAxiosError(401, "Refresh token expired or invalid", {
        error: { code: "REFRESH_TOKEN_EXPIRED", message: "Refresh token has expired" },
      });

      vi.spyOn(axios, "post").mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        throw refreshAxiosError;
      });

      // Fire 2 concurrent requests that will be queued
      const results = await Promise.allSettled([
        apiClient.get("/res-1"),
        apiClient.get("/res-2"),
      ]);

      expect(results[0].status).toBe("rejected");
      expect(results[1].status).toBe("rejected");

      const err0 = (results[0] as PromiseRejectedResult).reason;
      const err1 = (results[1] as PromiseRejectedResult).reason;

      expect(err0).toBeInstanceOf(ApiError);
      expect(err1).toBeInstanceOf(ApiError);
      expect(err0.code).toBe("REFRESH_TOKEN_EXPIRED");
      expect(err1.code).toBe("REFRESH_TOKEN_EXPIRED");
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("normalizes errors to ApiError if retried queued request fails after successful refresh", async () => {
      useAuthStore.getState().setAuth({
        accessToken: "expired-token",
        refreshToken: "valid-refresh-token",
        expiresIn: 900,
        user: null as unknown as import("@/types").UserProfile,
      });

      apiClient.defaults.adapter = async (config) => {
        const authHeader = (config.headers?.Authorization as string) || "";
        if (!authHeader.includes("new-token-ok")) {
          // Initial calls before refresh fail with 401
          throw createAxiosError(401, "Unauthorized", undefined, config);
        }
        if (config.url?.includes("res-fail")) {
          // Retried call fails with 403 Forbidden
          throw createAxiosError(
            403,
            "Access Denied",
            {
              error: { code: "FORBIDDEN", message: "Access Denied" },
            },
            config
          );
        }
        return {
          data: { success: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      };

      vi.spyOn(axios, "post").mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return {
          data: {
            success: true,
            data: {
              accessToken: "new-token-ok",
              refreshToken: "new-refresh-ok",
              expiresIn: 900,
            },
          },
        };
      });

      const [res1, res2] = await Promise.allSettled([
        apiClient.get("/res-ok"),
        apiClient.get("/res-fail"),
      ]);

      expect(res1.status).toBe("fulfilled");
      expect(res2.status).toBe("rejected");

      const failError = (res2 as PromiseRejectedResult).reason;
      expect(failError).toBeInstanceOf(ApiError);
      expect(failError.code).toBe("FORBIDDEN");
      expect(failError.status).toBe(403);
    });

    it("handles non-Axios runtime errors during refresh by wrapping in ApiError", async () => {
      useAuthStore.getState().setAuth({
        accessToken: "expired-token",
        refreshToken: "valid-refresh-token",
        expiresIn: 900,
        user: null as unknown as import("@/types").UserProfile,
      });

      apiClient.defaults.adapter = async (config) => {
        throw createAxiosError(401, "Unauthorized", undefined, config);
      };

      vi.spyOn(axios, "post").mockRejectedValueOnce(
        new Error("Network connection dropped abruptly")
      );

      await expect(apiClient.get("/res-network-drop")).rejects.toThrow(ApiError);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });
});
