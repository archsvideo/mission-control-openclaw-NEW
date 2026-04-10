import {
  LayoutDashboard, Bot, ListTodo, TrendingUp, Megaphone, Plug, Clock, Settings,
  Zap, Brain, Command
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const coreItems = [
  { title: "Control Tower", url: "/", icon: LayoutDashboard },
  { title: "Agents", url: "/agents", icon: Bot },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
];

const opsItems = [
  { title: "Trading Ops", url: "/trading", icon: TrendingUp },
  { title: "Marketing", url: "/marketing", icon: Megaphone },
];

const infoItems = [
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "Timeline", url: "/timeline", icon: Clock },
  { title: "Memory", url: "/memory", icon: Brain },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items, collapsed }: { label: string; items: typeof coreItems; collapsed: boolean }) {
  return (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end={item.url === "/"} className="hover:bg-accent/50" activeClassName="bg-accent text-primary font-medium">
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-4">
          <Zap className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && <span className="font-mono text-sm font-bold tracking-tight text-foreground">OpenClaw V4</span>}
        </div>
        <NavGroup label="Core" items={coreItems} collapsed={collapsed} />
        <NavGroup label="Operations" items={opsItems} collapsed={collapsed} />
        <NavGroup label="Intel & Config" items={infoItems} collapsed={collapsed} />
      </SidebarContent>
      <SidebarFooter className="p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-2">
            <Command className="h-3 w-3" /> <span>Ctrl+K</span>
          </div>
        )}
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
