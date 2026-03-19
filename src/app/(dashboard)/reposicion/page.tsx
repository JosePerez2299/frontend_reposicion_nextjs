import AnalisisView from "@/features/analisis_reposicion/AnalisisView";
import { Topbar } from "@/components/layout/Topbar";
import { AnalisisTopBar } from "@/features/analisis_reposicion/components/AnalisisTopBar";

const AnalisisVentas = () => {
  return (
    <div className="hidden md:flex flex-col h-screen">
      <Topbar title="Análisis de Ventas" subtitle="Repositorio de reposición">
        <AnalisisTopBar />
      </Topbar> 
      <AnalisisView />
    </div>
  );
};

export default AnalisisVentas;
