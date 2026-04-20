import { queryClient } from "@/config/query-client";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { useAuthStore } from "@/stores/auth.store";

export function hardLogout() {
  try {
    queryClient.clear();
  } catch {
    // ignore
  }

  try {
    useAnalisisStore.getState().reset();
  } catch {
    // ignore
  }

  useAuthStore.getState().logout();
}
