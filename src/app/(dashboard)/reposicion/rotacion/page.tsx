"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/config/api";
import axios from "axios";

export default function Rotacion() {
  const [ordenId, setOrdenId] = useState("1");
  const [loading, setLoading] = useState(false);

  const downloadPdf = async (orderId: number) => {
    const res = await api.download(`/orders/${orderId}/pdf`);

    const blob = new Blob([res.data], { type: "application/pdf" });

    // Intentar extraer nombre desde headers (backend)
    const contentDisposition = res.headers["content-disposition"];
    let filename = `order_${orderId}.pdf`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match?.[1]) filename = match[1];
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };
  
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
        <Button onClick={() => downloadPdf(Number(ordenId))} disabled={loading}>
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
