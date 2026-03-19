import { useQuery } from "@tanstack/react-query";
import { getRevitJobs } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertTriangle, Clock, CheckCircle, Loader2, XCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import type { RevitJobStatus } from "@/types/models";

const statusConfig: Record<RevitJobStatus, { icon: React.ElementType; color: string; label: string }> = {
  queued: { icon: Clock, color: "bg-muted text-muted-foreground", label: "Queued" },
  running: { icon: Loader2, color: "bg-info text-info-foreground", label: "Running" },
  completed: { icon: CheckCircle, color: "bg-success text-success-foreground", label: "Completed" },
  failed: { icon: XCircle, color: "bg-destructive text-destructive-foreground", label: "Failed" },
  retrying: { icon: RotateCcw, color: "bg-warning text-warning-foreground", label: "Retrying" },
};

export default function RevitQueuePage() {
  const { data: jobs = [] } = useQuery({ queryKey: ["revitJobs"], queryFn: getRevitJobs });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Revit Automation Queue</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => {
          const cfg = statusConfig[job.status];
          const Icon = cfg.icon;
          return (
            <Card key={job.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${job.status === "completed" ? "bg-success" : job.status === "failed" ? "bg-destructive" : job.status === "running" ? "bg-info" : job.status === "retrying" ? "bg-warning" : "bg-muted-foreground"}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{job.name}</CardTitle>
                  <Badge className={`text-[10px] ${cfg.color}`}>
                    <Icon className={`h-3 w-3 mr-1 ${job.status === "running" ? "animate-spin" : ""}`} />
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Template: {job.template}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs">
                  <span className="text-muted-foreground">Runtime:</span> <span className="font-mono">{job.runtime}s</span>
                </div>
                {job.logs.length > 0 && (
                  <div className="bg-muted rounded-md p-2 max-h-20 overflow-y-auto">
                    {job.logs.map((log, i) => (
                      <p key={i} className="text-[10px] font-mono text-muted-foreground">{log}</p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {(job.status === "failed" || job.status === "retrying") && (
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Retrying ${job.name}...`)}><RotateCcw className="h-3 w-3 mr-1" /> Retry</Button>
                  )}
                  {job.status === "failed" && (
                    <Button size="sm" variant="ghost" onClick={() => toast.warning(`Escalated ${job.name}`)}><AlertTriangle className="h-3 w-3 mr-1" /> Escalate</Button>
                  )}
                  {job.status === "queued" && (
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Starting ${job.name}...`)}><PlayCircle className="h-3 w-3 mr-1" /> Start</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
