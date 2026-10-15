"use client";

import { toast } from "sonner";
import { Info, Lock, RefreshCw, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/config/api";
import { getErrorMessage } from "@/lib/errors";
import { useMounted } from "@/hooks/use-mounted";
import { useAuthStore } from "@/stores/auth.store";
import { RolesEnum } from "@/types/auth.types";
import type { AdminStore } from "@/schemas/api/store.schemas";
import {
  useAdminStoresQuery,
  useUpdateEnabledStoresMutation,
  useUpdateStoreDepotsMutation,
} from "../queries/stores.queries";
import { useStoresSettingsDraft } from "../hooks/useStoresSettingsDraft";
import { DepotPicker } from "./DepotPicker";

export function StoresSettingsView() {
  const mounted = useMounted();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === RolesEnum.Admin;

  const query = useAdminStoresQuery(mounted && isAdmin);

  if (!mounted) return <LoadingState />;
  if (!isAdmin) return <NoPermission />;

  if (query.isLoading) return <LoadingState />;

  if (query.error) {
    if (query.error instanceof ApiError && query.error.status === 403) {
      return <NoPermission detail={getErrorMessage(query.error)} />;
    }
    return (
      <ErrorState
        message={getErrorMessage(query.error)}
        onRetry={() => query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  return <StoresSettingsTable stores={query.data ?? []} />;
}

// ---------------------------------------------------------------------------

function StoresSettingsTable({ stores }: { stores: AdminStore[] }) {
  const draft = useStoresSettingsDraft(stores);
  const enabledMutation = useUpdateEnabledStoresMutation();
  const depotsMutation = useUpdateStoreDepotsMutation();
  const savingStoreId = depotsMutation.isPending ? depotsMutation.variables?.storeId : undefined;

  const enabledCount = draft.enabledIds.size;
  const allEnabled = stores.length > 0 && enabledCount === stores.length;

  const saveEnabled = () => {
    // El endpoint reemplaza la lista: se envían todas las marcadas
    enabledMutation.mutate([...draft.enabledIds], {
      onSuccess: () => {
        draft.resetEnabled();
        toast.success("Tiendas habilitadas actualizadas");
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const saveDepots = (store: AdminStore) => {
    const { main, extras } = draft.getDepots(store);
    if (!main) return;
    depotsMutation.mutate(
      { storeId: store.id, body: { main_depot_id: main, stock_depot_ids: extras } },
      {
        onSuccess: () => {
          draft.resetRow(store.id);
          toast.success(`Almacenes de ${store.name} actualizados`);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          El almacén principal define ventas y rotación; los extra solo suman stock.
          La columna &quot;ERP&quot; es informativa: la visibilidad la decide &quot;Habilitada&quot;.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {enabledCount} de {stores.length} tiendas habilitadas
          {draft.isEnabledDirty && <span className="ml-2 text-amber-600">· cambios sin guardar</span>}
        </span>
        <div className="flex items-center gap-2">
          {draft.isEnabledDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={draft.resetEnabled}
              disabled={enabledMutation.isPending}
            >
              Descartar
            </Button>
          )}
          <Button
            size="sm"
            onClick={saveEnabled}
            disabled={!draft.isEnabledDirty || enabledMutation.isPending}
          >
            {enabledMutation.isPending ? <Spinner /> : <Save />}
            Guardar habilitadas
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">
                <EnabledToggle
                  checked={allEnabled}
                  indeterminate={enabledCount > 0 && !allEnabled}
                  onToggle={() => draft.setAllEnabled(!allEnabled)}
                  label="Habilitar todas"
                >
                  Habilitada
                </EnabledToggle>
              </TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>ERP</TableHead>
              <TableHead>Almacén principal</TableHead>
              <TableHead>Almacenes extra</TableHead>
              <TableHead className="w-[110px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => {
              const { main, extras } = draft.getDepots(store);
              const dirty = draft.isRowDirty(store);
              const saving = savingStoreId === store.id;

              return (
                <TableRow key={store.id}>
                  <TableCell>
                    <EnabledToggle
                      checked={draft.enabledIds.has(store.id)}
                      onToggle={() => draft.toggleEnabled(store.id)}
                      label={`Habilitar ${store.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-muted-foreground">{store.id}</span>
                      <span className="text-sm">{store.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {store.erp_active ? (
                      <Badge variant="secondary">Activa en ERP</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inactiva en ERP
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DepotPicker
                      mode="single"
                      availableDepots={store.available_depots}
                      value={main}
                      onChange={(v) => draft.setMain(store, v)}
                      disabled={saving}
                    />
                  </TableCell>
                  <TableCell>
                    <DepotPicker
                      mode="multi"
                      availableDepots={store.available_depots}
                      excludeIds={main ? [main] : []}
                      value={extras}
                      onChange={(v) => draft.setExtras(store, v)}
                      disabled={saving}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {dirty && !saving && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => draft.resetRow(store.id)}
                          title="Descartar cambios"
                          aria-label="Descartar cambios"
                        >
                          <RefreshCw />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={dirty ? "default" : "outline"}
                        onClick={() => saveDepots(store)}
                        disabled={!main || !dirty || depotsMutation.isPending}
                        title={!main ? "Elige un almacén principal para guardar" : undefined}
                      >
                        {saving ? <Spinner /> : <Save />}
                        Guardar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function EnabledToggle({
  checked,
  indeterminate,
  onToggle,
  label,
  children,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onToggle: () => void;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={onToggle}
      className="flex items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Checkbox checked={checked} indeterminate={indeterminate} />
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function NoPermission({ detail }: { detail?: string }) {
  return (
    <div className="p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Sin permisos
          </CardTitle>
          <CardDescription>
            {detail ?? "No tienes permisos para ver esta página. Solo los administradores pueden configurar tiendas."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>No se pudieron cargar las tiendas</CardTitle>
          <CardDescription className="text-destructive">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="sm" variant="outline" onClick={onRetry} disabled={retrying}>
            {retrying ? <Spinner /> : <RefreshCw />}
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
