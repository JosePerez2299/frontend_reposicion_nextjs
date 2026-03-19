import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { navigation } from "@/config/navigation";
import Link from "next/link";

const badgeStyles: Record<string, string> = {
  red: "bg-destructive/10 text-destructive border border-destructive/20",
  amber: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  blue: "bg-primary/10 text-primary border border-primary/20",
};

export function NavSection({ section, items }: (typeof navigation)[number]) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem
                key={item.id}
                className={cn(
                  "border-l-2 border-transparent transition-colors",
                  isActive && "border-primary",
                )}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <Icon size={14} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge
                    className={cn(
                      "font-mono text-[9px]",
                      badgeStyles[item.badge.variant],
                    )}
                  >
                    {item.badge.value}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
