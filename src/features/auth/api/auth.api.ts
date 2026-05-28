import { http, type ApiRequestConfig } from "@/lib/api/http";
import type {
  AuthUser,
  DetailResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
} from "@/features/auth/types/auth.types";

export async function login(payload: LoginRequest) {
  const response = await http.post<LoginResponse>("/api/auth/login/", payload, {
    skipAuthRefresh: true,
  } as ApiRequestConfig);
  return response.data;
}

export async function refreshSession() {
  const response = await http.post<RefreshResponse>(
    "/api/auth/refresh/",
    {},
    { skipAuthRefresh: true } as ApiRequestConfig,
  );
  return response.data;
}

export async function getMe() {
  const response = await http.get<AuthUser>("/api/auth/me/");
  return response.data;
}

export async function logout() {
  const response = await http.post<DetailResponse>(
    "/api/auth/logout/",
    {},
    { skipAuthRefresh: true } as ApiRequestConfig,
  );
  return response.data;
}

export async function register(payload: RegisterRequest) {
  const response = await http.post("/api/auth/register/", payload, {
    skipAuthRefresh: true,
  } as ApiRequestConfig);
  return response.data;
}
