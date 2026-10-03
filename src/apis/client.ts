import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiErrorResponse, AuthTokens } from "@/types";

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    code: string = "UNKNOWN_ERROR",
    status: number = 500,
    details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Flag and queue to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error Transformation & Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest?.url || "";

    // Check if 401 should trigger token refresh (exclude auth endpoints or credential errors)
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      (url.includes("/auth/change-password") &&
        error.response?.data?.error?.code === "INVALID_CREDENTIALS");

    if (status === 401 && !originalRequest?._retry && !isAuthRoute) {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(transformAxiosError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            const token = useAuthStore.getState().accessToken;
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<{
          success: boolean;
          data: AuthTokens;
        }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        const newTokens = refreshResponse.data.data;
        useAuthStore.getState().setAuth(newTokens);
        processQueue(null);

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        useAuthStore.getState().clearAuth();
        return Promise.reject(transformAxiosError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(transformAxiosError(error));
  }
);

function transformAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
  const responseData = error.response?.data;
  const status = error.response?.status || 500;

  if (responseData && typeof responseData === "object" && "error" in responseData) {
    const errObj = responseData.error;
    return new ApiError(
      errObj.message || "An unexpected error occurred",
      errObj.code || "API_ERROR",
      status,
      errObj.details
    );
  }

  if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
    return new ApiError(
      "Request timed out. Please try again.",
      "REQUEST_TIMEOUT",
      408
    );
  }

  if (!error.response) {
    return new ApiError(
      "Unable to connect to the server. Please check your network connection or try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (
    status >= 500 &&
    (!responseData || typeof responseData !== "object" || !("error" in responseData))
  ) {
    return new ApiError(
      "Unable to reach the backend service. Please ensure the backend is running.",
      "BACKEND_UNAVAILABLE",
      status
    );
  }

  return new ApiError(
    error.message || "Server communication error",
    "UNKNOWN_ERROR",
    status
  );
}
