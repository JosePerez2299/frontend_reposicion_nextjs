import { useCallback, useMemo, useState } from "react";
import type { AdminStore } from "@/schemas/api/store.schemas";

export interface DepotDraft {
  main: string | null;
  extras: string[];
}

function sameSet(a: Iterable<string>, b: Iterable<string>) {
  const sa = new Set(a);
  const sb = new Set(b);
  return sa.size === sb.size && [...sa].every((v) => sb.has(v));
}

function serverDepots(store: AdminStore): DepotDraft {
  return {
    main: store.main_depot,
    extras: store.stock_depots.filter((d) => d !== store.main_depot),
  };
}

/**
 * Cambios locales de la pantalla Ajustes → Tiendas, separados del estado del servidor:
 * - habilitadas: un único borrador que se guarda de una vez (el PUT reemplaza la lista);
 * - almacenes: un borrador por tienda, solo para las filas editadas.
 */
export function useStoresSettingsDraft(stores: AdminStore[]) {
  const [enabledDraft, setEnabledDraft] = useState<Set<string> | null>(null);
  const [depotDrafts, setDepotDrafts] = useState<Record<string, DepotDraft>>({});

  const serverEnabled = useMemo(
    () => new Set(stores.filter((s) => s.enabled).map((s) => s.id)),
    [stores],
  );

  const enabledIds = enabledDraft ?? serverEnabled;
  const isEnabledDirty = enabledDraft !== null && !sameSet(enabledDraft, serverEnabled);

  const toggleEnabled = useCallback(
    (id: string) => {
      setEnabledDraft((prev) => {
        const next = new Set(prev ?? serverEnabled);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [serverEnabled],
  );

  const setAllEnabled = useCallback(
    (enabled: boolean) => {
      setEnabledDraft(enabled ? new Set(stores.map((s) => s.id)) : new Set());
    },
    [stores],
  );

  const resetEnabled = useCallback(() => setEnabledDraft(null), []);

  const getDepots = useCallback(
    (store: AdminStore): DepotDraft => depotDrafts[store.id] ?? serverDepots(store),
    [depotDrafts],
  );

  const isRowDirty = useCallback(
    (store: AdminStore) => {
      const draft = depotDrafts[store.id];
      if (!draft) return false;
      const server = serverDepots(store);
      return draft.main !== server.main || !sameSet(draft.extras, server.extras);
    },
    [depotDrafts],
  );

  const setMain = useCallback((store: AdminStore, main: string | null) => {
    setDepotDrafts((prev) => {
      const current = prev[store.id] ?? serverDepots(store);
      return {
        ...prev,
        // El principal no puede ser también extra
        [store.id]: { main, extras: current.extras.filter((d) => d !== main) },
      };
    });
  }, []);

  const setExtras = useCallback((store: AdminStore, extras: string[]) => {
    setDepotDrafts((prev) => {
      const current = prev[store.id] ?? serverDepots(store);
      return {
        ...prev,
        [store.id]: { main: current.main, extras: extras.filter((d) => d !== current.main) },
      };
    });
  }, []);

  const resetRow = useCallback((id: string) => {
    setDepotDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return {
    enabledIds,
    isEnabledDirty,
    toggleEnabled,
    setAllEnabled,
    resetEnabled,
    getDepots,
    isRowDirty,
    setMain,
    setExtras,
    resetRow,
  };
}
