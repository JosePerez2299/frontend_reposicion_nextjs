import { api } from "@/config/api";
import {
  LoginRequestSchema,
  MeResponseSchema,
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
  const raw = await api.get("/auth/me");
  return MeResponseSchema.parse(raw);
}

export async function getUserProfile() {
  const raw = await api.get("/auth/me");
  return UserResponseSchema.parse(raw.user);
}
