"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/queries/auth.queries";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserCell() {
  const authUser = useAuthStore((s) => s.user);
  const handleLogout = useLogout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!authUser || !mounted) return null;

  const initials = authUser.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 px-2 h-auto py-2 font-normal hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-primary-foreground">
              {initials}
            </span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden overflow-hidden flex-1 min-w-0 text-left">
            <p className="text-[11px] font-medium text-sidebar-foreground whitespace-nowrap truncate">
              {authUser.nombre}
            </p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap truncate">
              {authUser.role}
            </p>
          </div>
          <Settings className="h-3.5 w-3.5 group-data-[collapsible=icon]:hidden text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">
          {authUser.nombre}
          <span className="block text-[10px] font-normal text-muted-foreground truncate">
            {authUser.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/perfil" className="cursor-pointer">
              <User className="h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
