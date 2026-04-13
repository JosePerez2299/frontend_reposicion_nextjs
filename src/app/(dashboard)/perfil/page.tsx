"use client";

import { Topbar } from "@/components/layout/Topbar";
import { useAuthStore } from "@/stores/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, Shield } from "lucide-react";

export default function PerfilPage() {
  const authUser = useAuthStore((s) => s.user);

  if (!authUser) return null;

  const initials = authUser.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Perfil" subtitle="Tu información de cuenta" />
      <div className="flex-1 overflow-auto p-6">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
              <span className="text-2xl font-semibold text-primary-foreground">
                {initials}
              </span>
            </div>
            <CardTitle>{authUser.nombre}</CardTitle>
            <CardDescription>{authUser.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium">{authUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Nombre</p>
                <p className="text-sm font-medium">{authUser.nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rol</p>
                <p className="text-sm font-medium capitalize">{authUser.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
