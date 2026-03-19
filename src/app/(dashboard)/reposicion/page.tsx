"use client";

import { AnalisisView } from "@/features/analisis_reposicion";
import { AnalisisTopBar } from "@/features/analisis_reposicion/components/AnalisisTopBar";
import { Topbar } from "@/components/layout/Topbar";
import { useState } from "react";

const AnalisisVentas = () => {
  return (
    <div className="hidden md:flex flex-col h-screen">
      <AnalisisTopBar title="Análisis de Ventas" subtitle="Repositorio de reposición" />
      <AnalisisView />
    </div>
  );
};

export default AnalisisVentas;
