import { useQuery } from "@tanstack/react-query";
import { getAgents, getTasks, getTrades, getIntegrations, getTimeline, getContractValidations, getCostGuardrails, getLeads } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ListTodo, TrendingUp, AlertTriangle, Activity, Zap, DollarSign, Plug, CalendarCheck, ShieldCheck, ShieldX } from "lucide-react";
import type { CostGuardrailStatus } from "@/types/models";

const guardrailColor: Record<CostGuardrailStatus, string> = { green: "bg-success", yellow: "bg-warning", red: "bg-destructive" };

export default function ControlTowerPage() {
  const { data: agents = [] } = useQuery({ queryKey: ["agents"], queryFn: getAgents });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });
  const { data: trades = [] } = useQuery({ queryKey: ["trades"], queryFn: getTrades });
  const { data: integrations = [] } = useQuery({ queryKey: ["integrations"], queryFn: getIntegrations });
  const { data: events = [] } = useQuery({ queryKey: ["timeline"], queryFn: getTimeline });
  const { data: contracts = [] } = useQuery({ queryKey: ["contracts"], queryFn: getContractValidations });
  const { data: guardrails = [] } = useQuery({ queryKey: ["guardrails"], queryFn: getCostGuardrails });
  const { data: leads = [] } = useQuery({ queryKey: ["leads"], queryFn: getLeads });

  const runningAgents = agents.filter((a) => a.status === "running").length;
  const runningTasks = tasks.filter((t) => t.status === "running").length;
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;
  const openTrades = trades.filter((t) => t.status === "open");
  const dailyPnl = openTrades.reduce((s, t) => s + t.pnl, 0);
  const apiCostToday = agents.reduce((s, a) => s + a.costToday, 0);
  const healthyIntegrations = integrations.filter((i) => i.health === "healthy").length;
  const healthScore = integrations.length ? Math.round((healthyIntegrations / integrations.length) * 100) : 0;
  const bookedLeads = leads.filter((l) => l.bookingStatus === "booked" || l.bookingStatus === "completed").length;

  const totalFailed = contracts.reduce((s, c) => s + c.failed, 0);
  const totalPassed = contracts.reduce((s, c) => s + c.passed, 0);
  const topFailing = [...contracts].sort((a, b) => b.failed - a.failed)[0];

  const alerts = [
    ...agents.filter((a) => a.status === "error").map((a) => ({ severity: "error" as const, msg: `${a.name} is down — ${a.currentTask}` })),
    ...integrations.filter((i) => i.health === "down").map((i) => ({ severity: "error" as const, msg: `${i.name}: ${i.lastError || i.message}` })),
    ...integrations.filter((i) => i.health === "degraded").map((i) => ({ severity: "warning" as const, msg: `${i.name}: ${i.message}` })),
    ...guardrails.filter((g) => g.status === "red").map((g) => ({ severity: "error" as const, msg: `${g.module} at ${g.percentUsed.toFixed(0)}% budget` })),
    ...guardrails.filter((g) => g.pauseCandidate).map((g) => ({ severity: "warning" as const, msg: `${g.module}: pause candidate (${g.repeatedFailures} failures)` })),
  ].sort((a, b) => (a.severity === "error" ? -1 : 1) - (b.severity === "error" ? -1 : 1));

  const stats = [
    { label: "Active Agents", value: `${runningAgents}/${agents.length}`, icon: Bot },
    { label: "Running Tasks", value: runningTasks, icon: ListTodo },
    { label: "Blocked Tasks", value: blockedTasks, icon: AlertTriangle },
    { label: "Open Trades", value: openTrades.length, icon: TrendingUp },
    { label: "Daily P&L", value: `$${dailyPnl.toLocaleString()}`, icon: Activity },
    { label: "API Cost Today", value: `$${apiCostToday.toFixed(2)}`, icon: DollarSign },
    { label: "Integration Health", value: `${healthScore}%`, icon: Plug },
    { label: "Bookings", value: bookedLeads, icon: CalendarCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Control Tower</h1>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold font-mono">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Needs Attention Now */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Needs Attention Now</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {alerts.length === 0 && <p className="text-sm text-muted-foreground">All clear ✓</p>}
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                <div className={`h-2 w-2 rounded-full shrink-0 ${a.severity === "error" ? "bg-destructive" : "bg-warning"}`} />
                <span className="text-sm">{a.msg}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contract Health */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Contract Health</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-success">{totalPassed}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-destructive">{totalFailed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
            {topFailing && topFailing.failed > 0 && (
              <div className="flex items-center gap-2 text-sm border-t pt-2">
                <ShieldX className="h-4 w-4 text-destructive" />
                <span>Top failing: <span className="font-medium">{topFailing.agentName}</span> ({topFailing.failed} failures)</span>
              </div>
            )}
            <div className="space-y-1.5">
              {contracts.map((c) => (
                <div key={c.agentId} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.agentName}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-success" style={{ width: `${(c.passed / c.totalChecks) * 100}%` }} />
                    </div>
                    <span className="font-mono w-10 text-right">{((c.passed / c.totalChecks) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Guardrails */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" /> Cost Guardrails</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {guardrails.map((g) => (
              <div key={g.module} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{g.module}</span>
                  <div className={`h-3 w-3 rounded-full ${guardrailColor[g.status]}`} />
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${guardrailColor[g.status]}`} style={{ width: `${Math.min(g.percentUsed, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${g.currentSpend.toFixed(2)}</span>
                  <span>${g.budgetLimit}</span>
                </div>
                {g.pauseCandidate && <Badge variant="outline" className="text-[10px] text-destructive border-destructive">Pause candidate</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Status + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Agent Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${a.status === "running" ? "bg-success animate-pulse-glow" : a.status === "error" ? "bg-destructive" : a.status === "paused" ? "bg-warning" : "bg-muted-foreground"}`} />
                  <span className="text-sm font-medium">{a.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">${a.costToday.toFixed(2)}</span>
                  <Badge variant="secondary" className="text-[10px]">{a.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {events.slice(0, 6).map((e) => (
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
    </div>
  );
}
