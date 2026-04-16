import {
  LayoutDashboard, Bot, ListTodo, TrendingUp, Megaphone, Plug, Clock, Settings,
  Zap, Brain, Command, Users, Eye, Radar, HardDrive, CalendarDays, Mail
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const coreItems = [
  { title: "Control Tower", url: "/", icon: LayoutDashboard },
  { title: "Agents", url: "/agents", icon: Bot },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Inbox", url: "/inbox", icon: Mail, badge: 6 },
];

const opsItems = [
  { title: "Trading Ops", url: "/trading", icon: TrendingUp },
  { title: "Lead Pipeline", url: "/leads", icon: Users },
  { title: "Skylight CRO", url: "/skylight", icon: Eye },
  { title: "Competitor Radar", url: "/radar", icon: Radar },
  { title: "Revit Queue", url: "/revit", icon: HardDrive },
  { title: "Marketing", url: "/marketing", icon: Megaphone },
  { title: "Content Calendar", url: "/content-calendar", icon: CalendarDays },
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
      {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="hover:bg-white/5 transition-all rounded-lg"
                  activeClassName="sidebar-glow-active bg-accent/10 text-accent font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                  {!collapsed && "badge" in item && item.badge ? (
                    <Badge className="ml-auto h-5 min-w-5 flex items-center justify-center bg-accent-blue/20 text-accent-blue text-[10px] border-0">
                      {item.badge}
                    </Badge>
                  ) : null}
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
      <SidebarContent className="scrollbar-thin">
        <div className="flex items-center gap-2 px-4 py-4">
          <Zap className="h-6 w-6 text-accent shrink-0" />
          {!collapsed && <span className="font-mono text-sm font-bold tracking-tight gradient-text">OpenClaw V4</span>}
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
