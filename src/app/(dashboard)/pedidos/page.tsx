"use client"

import { Topbar } from "@/components/layout/Topbar"
import PedidosView from "@/features/pedidos/components/PedidosView"

export default function Pedidos() {
  return (
    <div className="">
      <Topbar title="Pedidos" subtitle="Gestiona los pedidos de tu empresa" sticky={true} className="bg-muted/80 mb-2"/>
      <PedidosView />
    </div>
  )
} 