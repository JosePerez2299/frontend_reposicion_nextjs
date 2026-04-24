"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadPdf } from "@/services/pedidos.service";
import { getErrorMessage } from "@/lib/errors";

export default function Rotacion() {
  const [ordenId, setOrdenId] = useState("1");
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">Prueba PDF — Rotación</h1>
      <div className="flex items-center gap-2 max-w-xs">
        <Input
          type="number"
          value={ordenId}
          onChange={(e) => setOrdenId(e.target.value)}
          placeholder="ID de orden"
        />
        <Button
          onClick={async () => {
            setLoading(true);
            try {
              await downloadPdf(Number(ordenId));
            } catch (error) {
              toast.error(getErrorMessage(error));
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          Descargar
        </Button>
      </div>
    </div>
  );
}
