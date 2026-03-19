import { useQuery } from "@tanstack/react-query";
import { getTimeline } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import type { TimelineEventType } from "@/types/models";

const typeColor: Record<TimelineEventType, string> = {
  agent: "border-info",
  task: "border-primary",
  trade: "border-success",
  campaign: "border-warning",
  integration: "border-destructive",
  system: "border-muted-foreground",
  content: "border-primary",
};

const severityDot: Record<string, string> = {
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-destructive",
  success: "bg-success",
};

export default function TimelinePage() {
  const { data: events = [] } = useQuery({ queryKey: ["timeline"], queryFn: getTimeline });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
      <div className="relative space-y-0">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        {events.map((e) => (
          <div key={e.id} className="relative flex gap-4 pl-10 py-3">
            <div className={`absolute left-3 top-4 h-3 w-3 rounded-full border-2 ${severityDot[e.severity]} ring-2 ring-background`} />
            <div className={`flex-1 rounded-md border-l-2 ${typeColor[e.type]} bg-card p-3`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{e.title}</span>
                <Badge variant="outline" className="text-[10px] capitalize">{e.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{e.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(e.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
