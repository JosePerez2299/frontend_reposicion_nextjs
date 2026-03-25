"use client";

import { AnalisisView } from "@/features/analisis_reposicion";
import { AnalisisTopBar } from "@/features/analisis_reposicion/components/AnalisisTopBar";

const AnalisisVentas = () => {
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