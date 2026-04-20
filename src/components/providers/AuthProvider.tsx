"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMe } from "@/queries/auth.queries";
import { refreshTokenApi } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { hardLogout } from "@/lib/hard-logout";
import { getJwtExpiryMs } from "@/lib/jwt";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WARNING_SECONDS = 60;

function formatRemaining(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

function SessionExpiryDialog() {
  const router = useRouter();
  const pathname = usePathname();

  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isExtending, setIsExtending] = useState(false);
  const hasRedirectedRef = useRef(false);

  const expiresAtMs = useMemo(() => {
    if (!accessToken) return null;
    return getJwtExpiryMs(accessToken);
  }, [accessToken]);

  const remainingSeconds = useMemo(() => {
    if (!expiresAtMs) return null;
    return (expiresAtMs - now) / 1000;
  }, [expiresAtMs, now]);

  // Tick only while authenticated.
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isAuthenticated]);

  // Open warning dialog when close to expiry.
  useEffect(() => {
    if (!isAuthenticated) {
      setOpen(false);
      return;
    }

    // Don't show warning on auth pages.
    if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
      setOpen(false);
      return;
    }

    if (remainingSeconds === null) {
      setOpen(false);
      return;
    }

    if (remainingSeconds <= 0) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        hardLogout();
        router.push("/login");
        router.refresh();
      }
      return;
    }

    if (remainingSeconds <= WARNING_SECONDS) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isAuthenticated, pathname, remainingSeconds, router]);

  const handleExtend = async () => {
    if (isExtending) return;
    if (!refreshToken) {
      toast.error("No hay refresh token. Inicia sesión nuevamente.");
      hardLogout();
      router.push("/login");
      router.refresh();
      return;
    }

    try {
      setIsExtending(true);
      const res = await refreshTokenApi({ refresh_token: refreshToken });
      setTokens(res.access_token, res.refresh_token);
      toast.success("Sesión extendida");
      setOpen(false);
      hasRedirectedRef.current = false;
    } catch {
      toast.error("No se pudo extender la sesión. Inicia sesión nuevamente.");
      hardLogout();
      router.push("/login");
      router.refresh();
    } finally {
      setIsExtending(false);
    }
  };

  if (!isAuthenticated || !expiresAtMs || remainingSeconds === null) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Tu sesión está por expirar</DialogTitle>
          <DialogDescription>
            Para seguir trabajando, extiende tu sesión antes de que termine el tiempo.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm">
          <div className="text-muted-foreground">Tiempo restante</div>
          <div className="mt-1 font-mono text-2xl font-semibold">
            {formatRemaining(remainingSeconds)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Ahora no
          </Button>
          <Button onClick={handleExtend} disabled={isExtending}>
            {isExtending ? "Extendiendo..." : "Extender sesión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AuthSessionCheck({ children }: { children: React.ReactNode }) {
  // useMe() automatically fires when isAuthenticated is true
  // and fetches /me to restore the user profile from token
  useMe();

  return (
    <>
      {children}
      <SessionExpiryDialog />
    </>
  );
}
