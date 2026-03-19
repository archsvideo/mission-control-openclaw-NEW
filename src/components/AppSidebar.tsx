import {
  LayoutDashboard,
  Bot,
  ListTodo,
  TrendingUp,
  Megaphone,
  Plug,
  Clock,
  Settings,
  Zap,
  CalendarDays,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Agents", url: "/agents", icon: Bot },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Trading", url: "/trading", icon: TrendingUp },
  { title: "Marketing", url: "/marketing", icon: Megaphone },
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "Timeline", url: "/timeline", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-4">
          <Zap className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-mono text-sm font-bold tracking-tight text-foreground">
              OpenClaw
            </span>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/50"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
