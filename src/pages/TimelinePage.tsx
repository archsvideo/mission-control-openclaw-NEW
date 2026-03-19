import { useQuery } from "@tanstack/react-query";
import { getTimeline } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { TimelineEventType } from "@/types/models";

const severityDot: Record<string, string> = {
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-destructive",
  success: "bg-success",
};

const typeLabel = (t: TimelineEventType) => t.replace(/_/g, " ");

export default function TimelinePage() {
  const { data: events = [] } = useQuery({ queryKey: ["timeline"], queryFn: getTimeline });
  const [search, setSearch] = useState("");

  const filtered = events.filter((e) =>
    search === "" || e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="relative space-y-0">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        {filtered.map((e) => (
          <div key={e.id} className="relative flex gap-4 pl-10 py-3">
            <div className={`absolute left-3 top-4 h-3 w-3 rounded-full border-2 ${severityDot[e.severity]} ring-2 ring-background`} />
            <div className="flex-1 rounded-md border-l-2 border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{e.title}</span>
                <Badge variant="outline" className="text-[10px] capitalize">{typeLabel(e.type)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{e.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(e.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="pl-10 text-sm text-muted-foreground">No events found.</p>}
      </div>
    </div>
  );
}
