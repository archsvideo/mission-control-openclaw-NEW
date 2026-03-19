import { useQuery } from "@tanstack/react-query";
import { getLeads } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, CalendarCheck, AlertTriangle, ChevronRight, Send, Star } from "lucide-react";
import { toast } from "sonner";
import type { LeadStage } from "@/types/models";

const stages: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "meeting", label: "Meeting" },
  { key: "proposal", label: "Proposal" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

const stageColor: Record<LeadStage, string> = {
  new: "bg-info/10 border-info",
  contacted: "bg-primary/10 border-primary",
  qualified: "bg-success/10 border-success",
  meeting: "bg-warning/10 border-warning",
  proposal: "bg-primary/10 border-primary",
  won: "bg-success/10 border-success",
  lost: "bg-destructive/10 border-destructive",
};

const bookingBadge: Record<string, string> = {
  none: "bg-muted text-muted-foreground",
  pending: "bg-warning text-warning-foreground",
  booked: "bg-success text-success-foreground",
  completed: "bg-primary text-primary-foreground",
  no_show: "bg-destructive text-destructive-foreground",
};

export default function LeadPipelinePage() {
  const { data: leads = [] } = useQuery({ queryKey: ["leads"], queryFn: getLeads });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Lead-to-Meeting OS</h1>

      {/* Pipeline overview */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stages.map((s) => {
          const count = leads.filter((l) => l.stage === s.key).length;
          return (
            <div key={s.key} className={`flex items-center gap-2 rounded-md border px-4 py-2 min-w-fit ${stageColor[s.key]}`}>
              <span className="text-sm font-medium">{s.label}</span>
              <Badge variant="secondary" className="text-xs font-mono">{count}</Badge>
            </div>
          );
        })}
      </div>

      {/* Lead cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead) => (
          <Card key={lead.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${lead.stage === "won" ? "bg-success" : lead.stage === "lost" ? "bg-destructive" : lead.stage === "meeting" ? "bg-warning" : "bg-primary"}`} />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{lead.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-warning" />
                  <span className="text-xs font-mono">{lead.score}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{lead.company}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Source:</span> <span className="font-medium">{lead.source}</span></div>
                <div><span className="text-muted-foreground">Stage:</span> <Badge variant="outline" className="text-[10px] capitalize ml-1">{lead.stage}</Badge></div>
                <div><span className="text-muted-foreground">Next:</span> <span className="font-medium">{lead.nextAction}</span></div>
                <div><span className="text-muted-foreground">Booking:</span> <Badge className={`text-[10px] ml-1 ${bookingBadge[lead.bookingStatus]}`}>{lead.bookingStatus}</Badge></div>
              </div>

              {lead.emailHistory.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-[10px] text-muted-foreground mb-1">Recent emails:</p>
                  {lead.emailHistory.slice(-2).map((e, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs py-0.5">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate flex-1">{e.subject}</span>
                      <Badge variant="outline" className="text-[10px]">{e.status}</Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => toast.info(`Drafting follow-up for ${lead.name}...`)}><Send className="h-3 w-3 mr-1" /> Follow-up</Button>
                {lead.bookingStatus !== "booked" && lead.bookingStatus !== "completed" && (
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Meeting booked for ${lead.name}`)}><CalendarCheck className="h-3 w-3 mr-1" /> Book</Button>
                )}
                {lead.stage !== "won" && lead.stage !== "lost" && (
                  <Button size="sm" variant="ghost" onClick={() => toast.warning(`Escalated ${lead.name}`)}><AlertTriangle className="h-3 w-3 mr-1" /> Escalate</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
