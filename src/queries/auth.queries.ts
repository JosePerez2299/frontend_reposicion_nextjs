import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { getMeApi, loginApi, registerApi } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { hardLogout } from "@/lib/hard-logout";
import type { LoginRequest, RegisterRequest } from "@/schemas/api/auth.schemas";
import { getErrorMessage } from "@/lib/errors";

// ── Login ────────────────────────────────────────────────────────

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: async (tokenRes) => {
      // 1. Save both tokens to cookies so axios interceptor can use them
      Cookies.set("auth_token", tokenRes.access_token, { expires: 7 });
      Cookies.set("refresh_token", tokenRes.refresh_token, { expires: 7 });
      
      // 2. Now /me request will have the token via Authorization header
      const user = await getMeApi();

      // 3. Save full session to Zustand store (both tokens)
      setSession(user, tokenRes.access_token, tokenRes.refresh_token);

      toast.success("Sesión iniciada correctamente");
      router.push("/");
      router.refresh();
    },
    onError: () => {
      // Error is handled inline by the form — no toast here
    },
  });
}

// ── Register ─────────────────────────────────────────────────────

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: () => {
      toast.success("Registro exitoso. Ahora inicia sesión.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ── Me (current session) ─────────────────────────────────────────

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await getMeApi();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ── Logout ───────────────────────────────────────────────────────

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    // Keep existing QueryClient instance usage (in case there are multiple in runtime),
    // but also run shared hardLogout() to reset feature stores + auth.
    queryClient.clear();
    hardLogout();

    toast.info("Sesión cerrada");
    router.push("/login");
    router.refresh();
  };
}
