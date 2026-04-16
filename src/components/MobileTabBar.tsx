import { LayoutDashboard, Bot, TrendingUp, Mail, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const tabs = [
  { icon: LayoutDashboard, label: "Tower", to: "/" },
  { icon: Bot, label: "Agents", to: "/agents" },
  { icon: TrendingUp, label: "Trading", to: "/trading" },
  { icon: Mail, label: "Inbox", to: "/inbox" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-card border-t border-white/10 safe-bottom">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground transition-colors"
            activeClassName="text-accent-blue"
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
