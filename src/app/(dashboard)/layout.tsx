import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-hidden min-w-0">
          {/* topbar con trigger visible en mobile */}
          <header className="flex items-center gap-2 h-11 px-4 border-b border-border md:hidden">
            <SidebarTrigger />
            <span className="font-mono text-sm font-medium">REPOSICIÓN</span>
          </header>

          {children}
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
