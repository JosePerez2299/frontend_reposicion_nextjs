"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface TopbarProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function Topbar({ title, subtitle, children }: TopbarProps) {
  return (
    <header className="flex items-center gap-3 h-12 px-4 border-b border-border flex-shrink-0 bg-secondary">
      <SidebarTrigger className="md:hidden" />
      <Separator orientation="vertical" className="h-4 md:hidden" />

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">{title}</span>
        {subtitle && (
          <>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</span>
          </>
        )}
      </div>

      {children && (
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {children}
        </div>
      )}
    </header>
  )
}