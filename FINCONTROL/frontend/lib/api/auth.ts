import { apiRequest, clearStoredToken, getStoredToken, setStoredToken } from "./client";
import { UserPrincipal } from "./types";

export interface RegisterPayload {
  organization_name: string;
  email: string;
  display_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function getMe(): Promise<UserPrincipal> {
  return apiRequest<UserPrincipal>("/auth/me", {}, () => ({
    id: "00000000-0000-0000-0000-000000000001",
    email: "avery@example.com",
    display_name: "Avery Analyst",
    organization_id: "00000000-0000-0000-0000-000000000002",
    organization_name: "Acme FinTech",
    role: "owner",
  }));
}

export function logout() {
  clearStoredToken();
}

export { clearStoredToken, getStoredToken, setStoredToken };
