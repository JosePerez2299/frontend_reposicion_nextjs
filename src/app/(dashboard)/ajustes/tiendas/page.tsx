"use client"

import { Topbar } from "@/components/layout/Topbar"
import { StoresSettingsView } from "@/features/ajustes/components/StoresSettingsView"

export default function AjustesTiendas() {
  return (
    <div className="">
      <Topbar title="Tiendas" subtitle="Tiendas visibles y sus almacenes" sticky={true} className="bg-muted/80 mb-2"/>
      <StoresSettingsView />
    </div>
  )
}
