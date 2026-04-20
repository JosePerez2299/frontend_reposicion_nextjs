"use client";

import { useEffect } from "react";
import { AnalisisView } from "@/features/analisis_reposicion";
import { AnalisisTopBar } from "@/features/analisis_reposicion/components/AnalisisTopBar";
import { useAnalisisStore } from "@/stores/resposicion-analisis.store";
import { useQueryClient } from "@tanstack/react-query";

const AnalisisVentas = () => {
  const reset = useAnalisisStore((s) => s.reset);
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["analisis"] });
    };
  }, [reset, queryClient]);

  return (
    <div className="hidden md:flex flex-col h-screen overflow-hidden">
      <div className="flex-none">
        <AnalisisTopBar
          title="Análisis de Ventas"
          subtitle="Repositorio de reposición"
        />
      </div>

      <div className="flex-1 min-h-0">
        <AnalisisView />
      </div>  
    </div>
  );
};

export default AnalisisVentas;