import { useQuery } from "@tanstack/react-query";
import { getAgents, getTasks, getTrades, getIntegrations, getTimeline } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ListTodo, TrendingUp, AlertTriangle, Activity, Zap } from "lucide-react";

const statusColor: Record<string, string> = {
  running: "bg-success text-success-foreground",
  idle: "bg-muted text-muted-foreground",
  error: "bg-destructive text-destructive-foreground",
  paused: "bg-warning text-warning-foreground",
};

export default function OverviewPage() {
  const { data: agents = [] } = useQuery({ queryKey: ["agents"], queryFn: getAgents });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });
  const { data: trades = [] } = useQuery({ queryKey: ["trades"], queryFn: getTrades });
  const { data: integrations = [] } = useQuery({ queryKey: ["integrations"], queryFn: getIntegrations });
  const { data: events = [] } = useQuery({ queryKey: ["timeline"], queryFn: getTimeline });

  const runningAgents = agents.filter((a) => a.status === "running").length;
  const errorAgents = agents.filter((a) => a.status === "error").length;
  const openTrades = trades.filter((t) => t.status === "open");
  const totalPnl = openTrades.reduce((s, t) => s + t.pnl, 0);
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;
  const unhealthyIntegrations = integrations.filter((i) => i.health !== "healthy").length;

  const stats = [
    { label: "Agents Running", value: `${runningAgents}/${agents.length}`, icon: Bot, accent: runningAgents > 0 },
    { label: "Open Trades", value: openTrades.length, icon: TrendingUp, accent: totalPnl > 0 },
    { label: "Unrealized P&L", value: `$${totalPnl.toLocaleString()}`, icon: Activity, accent: totalPnl > 0 },
    { label: "Blocked Tasks", value: blockedTasks, icon: AlertTriangle, accent: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Mission Overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.accent ? "text-primary" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Agents snapshot */}
        <Card>
          <CardHeader><CardTitle className="text-base">Agent Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${a.status === "running" ? "bg-success animate-pulse-glow" : a.status === "error" ? "bg-destructive" : "bg-muted-foreground"}`} />
                  <span className="text-sm font-medium">{a.name}</span>
                </div>
                <Badge variant="secondary" className={`text-xs ${statusColor[a.status]}`}>{a.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent events */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {events.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${e.severity === "error" ? "bg-destructive" : e.severity === "success" ? "bg-success" : e.severity === "warning" ? "bg-warning" : "bg-info"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Integration health bar */}
      <Card>
        <CardHeader><CardTitle className="text-base">Integration Health ({unhealthyIntegrations} issue{unhealthyIntegrations !== 1 ? "s" : ""})</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {integrations.map((i) => (
              <div key={i.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                <div className={`h-2.5 w-2.5 rounded-full ${i.health === "healthy" ? "bg-success" : i.health === "degraded" ? "bg-warning" : i.health === "down" ? "bg-destructive" : "bg-muted-foreground"}`} />
                <span className="text-sm">{i.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
