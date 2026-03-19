src/
│
├── app/                          ← Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/              ← layout compartido del dashboard
│   │   ├── layout.tsx            ← sidebar + topbar
│   │   ├── analisis/
│   │   │   └── page.tsx
│   │   ├── criticos/
│   │   │   └── page.tsx
│   │   ├── pedidos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── historial/
│   │   │   └── page.tsx
│   │   └── tendencias/
│   │       └── page.tsx
│   │
│   ├── api/                      ← Route handlers (si los necesitas en Next)
│   │   ├── productos/
│   │   │   └── route.ts
│   │   └── export/
│   │       └── route.ts          ← stream del Excel
│   │
│   ├── layout.tsx                ← root layout (fonts, providers)
│   └── globals.css
│
├── features/                     ← ★ el corazón del proyecto
│   │
│   ├── analisis/
│   │   ├── components/
│   │   │   ├── AnalisisView.tsx
│   │   │   ├── TablaProductos.tsx
│   │   │   ├── FiltersPanel.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   └── cells/
│   │   │       ├── RotCell.tsx
│   │   │       ├── StockCell.tsx
│   │   │       └── ModeloCell.tsx
│   │   ├── hooks/
│   │   │   ├── useProductosTable.ts   ← config de TanStack Table
│   │   │   ├── useFilters.ts
│   │   │   └── useExport.ts
│   │   ├── queries/
│   │   │   └── productos.queries.ts   ← TanStack Query fetchers
│   │   ├── types/
│   │   │   └── analisis.types.ts
│   │   └── index.ts                   ← exports públicos del feature
│   │
│   ├── pedidos/
│   │   ├── components/
│   │   │   ├── PedidosView.tsx
│   │   │   ├── PedidoCard.tsx
│   │   │   └── PedidoDetalle.tsx
│   │   ├── hooks/
│   │   │   └── usePedidos.ts
│   │   ├── queries/
│   │   │   └── pedidos.queries.ts
│   │   ├── types/
│   │   │   └── pedidos.types.ts
│   │   └── index.ts
│   │
│   ├── criticos/
│   │   └── ...
│   │
│   └── historial/
│       └── ...
│
├── components/                   ← solo componentes verdaderamente globales
│   ├── ui/                       ← átomos sin lógica de negocio
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Pill.tsx
│   │   ├── Tooltip.tsx
│   │   └── Spinner.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── SidebarItem.tsx
│       └── Topbar.tsx
│
├── lib/                          ← utilidades puras sin UI
│   ├── utils.ts                  ← cn(), clsx
│   ├── formatters.ts             ← formatStockNum(), formatRot()
│   ├── constants.ts              ← ROT_THRESHOLD, STORE_COLORS
│   └── api.ts                    ← fetch base client
│
├── hooks/                        ← hooks verdaderamente globales
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
│
├── stores/                       ← Zustand
│   ├── sidebar.store.ts          ← collapsed state
│   ├── filters.store.ts          ← filtros activos globales
│   └── ui.store.ts
│
├── types/                        ← tipos globales compartidos
│   ├── api.types.ts              ← responses del backend
│   ├── entities.types.ts         ← Producto, Tienda, Pedido
│   └── auth.types.ts             ← User, Role
│
└── config/
    ├── navigation.ts             ← definición de módulos del sidebar
    └── queryClient.ts            ← config de TanStack Query