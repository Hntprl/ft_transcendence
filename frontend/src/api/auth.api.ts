import { apiClient } from "./client";
import type { LoginDto, RegisterDto, AuthResponse, User } from "../types/auth.types.ts";

const storeAccessToken = (token?: string) => {
  if (!token) return;
  localStorage.setItem("access_token", token);
};

export const loginApi = async (data: LoginDto) => {
  console.log("Attempting login with data:", data);
  const res = await apiClient.post<AuthResponse>("/auth/login", data);
  console.log("Login response:", res.data);
  const token = (res.data as any).accessToken ?? (res.data as any).access_token;
  storeAccessToken(token);
  return res.data;
};

export const loginWithGoogleApi = async (token: string) => {
  const res = await apiClient.post<AuthResponse>("/auth/google", { token });
  const accessToken = (res.data as any).accessToken ?? (res.data as any).access_token;
  storeAccessToken(accessToken);
  return res.data;
}

export const registerApi = async (data: RegisterDto) => {
  // Register then immediately log in to obtain tokens (backend currently returns the created user)
  await apiClient.post("/auth/register", data);
  // reuse loginApi to persist token
  return loginApi({ email: data.email, password: data.password });
};

export const refreshApi = async () => {
  const res = await apiClient.post<AuthResponse>("/auth/refresh");
  const token = (res.data as any).accessToken ?? (res.data as any).access_token;
  storeAccessToken(token);
  return res.data;
};

export const logoutApi = async () => {
  await apiClient.post("/auth/logout");
  localStorage.removeItem("access_token");
};

export const getMeApi = async (): Promise<User> => {
  const res = await apiClient.get<User>("/auth/me");
  return res.data;
};
