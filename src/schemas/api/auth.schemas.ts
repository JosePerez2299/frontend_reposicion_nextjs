import { z } from "zod";
import { RolesEnum } from "@/types/auth.types";

// ── Request schemas ──────────────────────────────────────────────

export const LoginRequestSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// ── Response schemas ─────────────────────────────────────────────

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default("bearer"),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(RolesEnum),
});

export const MeResponseSchema = z.object({
  user: UserResponseSchema,
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
