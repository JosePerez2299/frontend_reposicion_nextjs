"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useMemo } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navigation } from "@/config/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { useAuthStore } from "@/stores/auth.store";
import type { RolesEnum } from "@/types/auth.types";
import type { NavItem } from "@/types/navigation.types";
import { NavSection } from "./NavSection";
import { UserCell } from "./UserCell";

function canSee(item: NavItem, role: RolesEnum | null | undefined) {
  if (!item.roles) return true;
  return !!role && item.roles.includes(role);
}

export function AppSidebar() {
  const mounted = useMounted();
  const role = useAuthStore((s) => s.user?.role);

  // El usuario sale de una cookie que el server no tiene: hasta montar solo se
  // muestran los ítems sin restricción de rol, así no hay hydration mismatch.
  const sections = useMemo(
    () =>
      navigation
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => canSee(item, mounted ? role : null)),
        }))
        .filter((section) => section.items.length > 0),
    [mounted, role],
  );

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
        {sections.map((section, i) => (
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
