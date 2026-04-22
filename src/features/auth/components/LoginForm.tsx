
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoginRequestSchema, type LoginRequest } from "@/schemas/api/auth.schemas";
import { useLogin } from "@/queries/auth.queries";
import { getErrorMessage } from "@/lib/errors";

export default function LoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data, {
      onError: (error) => {
        const msg = getErrorMessage(error);
        // Map common errors to specific fields
        if (msg.toLowerCase().includes("usuario") || msg.toLowerCase().includes("username")) {
          setError("username", { type: "server", message: msg });
        } else if (
          msg.toLowerCase().includes("contraseña") ||
          msg.toLowerCase().includes("password") ||
          msg.toLowerCase().includes("credencial")
        ) {
          setError("password", { type: "server", message: msg });
        } else {
          // General error — set on username as fallback
          setError("username", { type: "server", message: msg });
        }
      },
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex w-12 h-12 items-center justify-center rounded-lg bg-primary ring-1 ring-primary/20">
          <img src="/icons/logo.svg" alt="RS Stellar" className="w-8 h-8 invert" />
        </div>
        <CardTitle className="text-2xl font-mono tracking-wide">
          REPOSICIÓN
        </CardTitle>
        <CardDescription>
          Inicia sesión en tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Server error alert */}
        {(errors.username?.type === "server" || errors.password?.type === "server") && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <div className="text-destructive">
              {(errors.username?.message || errors.password?.message) as string}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              type="text"
              placeholder="usuario"
              autoComplete="username"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loginMutation.isPending}
          >
            {(isSubmitting || loginMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
