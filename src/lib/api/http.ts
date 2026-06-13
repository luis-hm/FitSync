import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { AuthUser, RefreshResponse } from "@/features/auth/types/auth.types";
import { queryClient } from "@/lib/query/query-client";
import { useAuthStore } from "@/stores/auth-store";

export type ApiRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const fallbackApiBaseUrl = "http://localhost:8000";
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const apiBaseUrl = (configuredApiBaseUrl || fallbackApiBaseUrl).replace(/\/$/, "");

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return (
    url.includes("/api/auth/login/") ||
    url.includes("/api/auth/refresh/") ||
    url.includes("/api/auth/logout/")
  );
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = http
      .post<RefreshResponse>(
        "/api/auth/refresh/",
        {},
        { skipAuthRefresh: true } as ApiRequestConfig,
      )
      .then((response) => {
        const access = response.data.access;
        useAuthStore.getState().setAccessToken(access);
        return access;
      })
      .then(async (access) => {
        try {
          const response = await axios.get<AuthUser>(`${apiBaseUrl}/api/auth/me/`, {
            headers: {
              Authorization: `Bearer ${access}`,
            },
            withCredentials: true,
          });
          const currentUserId = useAuthStore.getState().user?.id;
          if (currentUserId && currentUserId !== response.data.id) {
            queryClient.clear();
          }
          useAuthStore.getState().setUser(response.data);
        } catch {
          // Keep the refreshed access token even if user hydration fails transiently.
        }
        return access;
      })
      .catch(() => {
        queryClient.clear();
        useAuthStore.getState().clearSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

http.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  const apiConfig = config as ApiRequestConfig;

  if (accessToken && !apiConfig.skipAuthRefresh && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as ApiRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      config.skipAuthRefresh ||
      isAuthEndpoint(config.url)
    ) {
      return Promise.reject(error);
    }

    config._retry = true;
    const access = await refreshAccessToken();

    if (!access) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
      return Promise.reject(error);
    }

    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${access}`;
    return http.request(config);
  },
);
