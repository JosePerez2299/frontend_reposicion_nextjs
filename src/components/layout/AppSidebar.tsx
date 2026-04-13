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
import { UserCell } from "./UserCell";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-12 border-sidebar-border">
        <div className="flex items-center justify-between px-1 py-1">
          {/* logo + nombre — se ocultan al colapsar */}
          <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="w-8 h-8 rounded-md bg-primary ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0">
              <img src="/icons/logo.svg" alt="RS Stellar" className="w-5 h-5 invert" />
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
        <UserCell />
      </SidebarFooter>
    </Sidebar>
  );
}
