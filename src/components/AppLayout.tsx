import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileTabBar } from "@/components/MobileTabBar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full grain-overlay">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-white/[0.06] px-4 shrink-0 glass-card rounded-none border-x-0 border-t-0">
            <SidebarTrigger />
            <span className="ml-3 font-mono text-xs text-muted-foreground">Mission Control</span>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 scrollbar-thin">{children}</main>
        </div>
        <MobileTabBar />
      </div>
    </SidebarProvider>
  );
}
