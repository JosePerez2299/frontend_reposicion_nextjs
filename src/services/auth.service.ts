import { api } from "@/config/api";
import {
  LoginRequestSchema,
  RefreshTokenSchema,
  RegisterRequestSchema,
  TokenResponseSchema,
  UserResponseSchema,
  type LoginRequest,
  type RegisterRequest,
} from "@/schemas/api/auth.schemas";

export async function loginApi(data: LoginRequest) {
  const raw = await api.post("/auth/login", LoginRequestSchema.parse(data));
  return TokenResponseSchema.parse(raw);
}

export async function registerApi(data: RegisterRequest) {
  const raw = await api.post(
    "/auth/register",
    RegisterRequestSchema.parse(data),
  );
  return TokenResponseSchema.parse(raw);
}

export async function getMeApi() {
  const raw = await api.get<Record<string, unknown>>("/auth/me");
  // Backend returns the user object directly, not wrapped in { user: ... }
  return UserResponseSchema.parse(raw);
}

export async function refreshTokenApi(data: { refresh_token: string }) {
  const raw = await api.post(
    "/auth/refresh",
    RefreshTokenSchema.parse(data),
  );
  return TokenResponseSchema.parse(raw);
}
