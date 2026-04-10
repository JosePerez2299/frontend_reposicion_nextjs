"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navigation } from "@/config/navigation";
import { NavSection } from "./NavSection";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-12 border-sidebar-border">
        <div className="flex items-center justify-between px-1 py-1">
          {/* logo + nombre — se ocultan al colapsar */}
          <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="w-6 h-6 p-4 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <span className="font-mono text-[11px] font-semibold text-primary-foreground">
                RS
              </span>
            </div>
            <span className="font-mono text-sm font-medium text-sidebar-foreground truncate">
              REPOSICIÓN
            </span>
          </div>

          {/* trigger + theme toggle — trigger SIEMPRE visible, theme toggle solo cuando está expandido */}
          <div className="flex items-center gap-1">
            <div className="group-data-[collapsible=icon]:hidden">
              <ThemeToggle />
            </div>
            <SidebarTrigger className="flex-shrink-0" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((section, i) => (
          <div key={section.section}>
            {i > 0 && <SidebarSeparator />}
            <NavSection {...section} />
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-primary-foreground">
              MG
            </span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
            <p className="text-[11px] font-medium text-sidebar-foreground whitespace-nowrap">
              M. García
            </p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Reposición
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
