import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  LayoutDashboard, Bot, ListTodo, TrendingUp, Megaphone, Plug, Clock, Settings,
  CalendarDays, Users, Radar, HardDrive, Brain, Eye
} from "lucide-react";

const commands = [
  { label: "Control Tower", path: "/", icon: LayoutDashboard },
  { label: "Agents", path: "/agents", icon: Bot },
  { label: "Tasks", path: "/tasks", icon: ListTodo },
  { label: "Trading Ops", path: "/trading", icon: TrendingUp },
  { label: "Lead Pipeline", path: "/leads", icon: Users },
  { label: "Skylight CRO Lab", path: "/skylight", icon: Eye },
  { label: "Competitor Radar", path: "/radar", icon: Radar },
  { label: "Revit Queue", path: "/revit", icon: HardDrive },
  { label: "Marketing", path: "/marketing", icon: Megaphone },
  { label: "Content Calendar", path: "/content-calendar", icon: CalendarDays },
  { label: "Integrations", path: "/integrations", icon: Plug },
  { label: "Timeline", path: "/timeline", icon: Clock },
  { label: "Memory", path: "/memory", icon: Brain },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Go to..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {commands.map((cmd) => (
            <CommandItem key={cmd.path} onSelect={() => { navigate(cmd.path); setOpen(false); }}>
              <cmd.icon className="mr-2 h-4 w-4" />
              {cmd.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
