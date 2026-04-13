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
  refresh_token: z.string(),
  token_type: z.string().default("bearer"),
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string(),
});

// Backend user response — transform to frontend User shape
export const UserResponseSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    email: z.string().email(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    phone: z.string().nullable(),
    is_active: z.boolean(),
    role: z.string(),
    created_at: z.string().nullable(),
  })
  .transform((raw) => ({
    id: raw.id,
    nombre: [raw.first_name, raw.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || raw.email.split("@")[0],
    email: raw.email,
    role: raw.role as RolesEnum,
  }));

export type UserResponse = z.infer<typeof UserResponseSchema>;
