import { apiClient } from "@/shared/api/client";
import type { LoginDto, RegisterDto, AuthResponse } from "../types/auth.types.ts";

export const loginApi = async (data: LoginDto) => {
  const res = await apiClient.post<AuthResponse>("/auth/login", data);
  return res.data;
};

export const registerApi = async (data: RegisterDto) => {
  const res = await apiClient.post<AuthResponse>("/auth/register", data);
  return res.data;
};

export const logoutApi = async () => {
  await apiClient.post("/auth/logout");
  localStorage.removeItem("access_token");
};
