import { useQuery } from "@tanstack/react-query";
import { getAgents } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Heart } from "lucide-react";
import type { AgentStatus } from "@/types/models";
import { toast } from "sonner";

const statusVariant: Record<AgentStatus, string> = {
  running: "bg-success text-success-foreground",
  idle: "bg-muted text-muted-foreground",
  error: "bg-destructive text-destructive-foreground",
  paused: "bg-warning text-warning-foreground",
};

export default function AgentsPage() {
  const { data: agents = [] } = useQuery({ queryKey: ["agents"], queryFn: getAgents });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${agent.status === "running" ? "bg-success" : agent.status === "error" ? "bg-destructive" : agent.status === "paused" ? "bg-warning" : "bg-muted-foreground"}`} />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <Badge className={`${statusVariant[agent.status]} text-xs`}>{agent.status}</Badge>
              </div>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Role:</span> <span className="font-mono">{agent.role}</span></div>
                <div><span className="text-muted-foreground">Uptime:</span> <span className="font-mono">{agent.uptime}</span></div>
                <div><span className="text-muted-foreground">Tasks:</span> <span className="font-mono">{agent.tasksCompleted}</span></div>
                <div><span className="text-muted-foreground">Cost today:</span> <span className="font-mono">${agent.costToday.toFixed(2)}</span></div>
                <div><span className="text-muted-foreground">Success:</span> <span className={`font-mono ${agent.successRate >= 80 ? "text-success" : agent.successRate >= 60 ? "text-warning" : "text-destructive"}`}>{agent.successRate}%</span></div>
                <div><span className="text-muted-foreground">Heartbeat:</span> <span className="font-mono text-[10px]">{new Date(agent.heartbeat).toLocaleTimeString()}</span></div>
              </div>
              <div className="text-xs border-t pt-2">
                <span className="text-muted-foreground">Current:</span> <span className="text-sm">{agent.currentTask}</span>
              </div>
              <div className="flex gap-2 pt-1">
                {agent.status === "running" ? (
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Pausing ${agent.name}...`)}><Pause className="h-3 w-3 mr-1" /> Pause</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Resuming ${agent.name}...`)}><Play className="h-3 w-3 mr-1" /> Resume</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => toast.info(`Retrying ${agent.name}...`)}><RotateCcw className="h-3 w-3 mr-1" /> Retry</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
