import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContentCalendar, getWorkflowCheckpoints } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Sun, Clock, Moon, FileText, Image, FileCheck, Send, Github, ExternalLink, FolderGit2 } from "lucide-react";
import type { ContentCalendarItem, ContentStatus } from "@/types/models";

const LIVE_REPO = {
  owner: "archsvideo",
  name: "content-calendar",
  url: "https://github.com/archsvideo/content-calendar",
  branch: "main",
  producedBy: "Nova Studio",
};

function liveRepoPath(path: string) {
  return `${LIVE_REPO.url}/blob/${LIVE_REPO.branch}/${path}`;
}

function todayIsoMadrid(): string {
  // Europe/Madrid YYYY-MM-DD — independent of the browser's local timezone.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function LiveRepoBanner() {
  const iso = todayIsoMadrid();
  const month = iso.slice(0, 7); // YYYY-MM
  const todayPath = `calendar/${month}/${iso}.md`;
  const radarPath = `research/radar/`;
  const docsPath = `docs/voice-guide.md`;

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Live calendar repo</CardTitle>
              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                {LIVE_REPO.producedBy}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Source of truth — Nova Studio escribe aquí, Oscar aprueba, luego se publica.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="default" className="gap-2">
            <a href={LIVE_REPO.url} target="_blank" rel="noreferrer noopener">
              <Github className="h-3.5 w-3.5" />
              {LIVE_REPO.owner}/{LIVE_REPO.name}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0">
        <Button asChild size="sm" variant="outline" className="justify-between text-xs">
          <a href={liveRepoPath(todayPath)} target="_blank" rel="noreferrer noopener">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Plan de hoy · {iso}
            </span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" className="justify-between text-xs">
          <a href={liveRepoPath(radarPath)} target="_blank" rel="noreferrer noopener">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Radar semanal
            </span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" className="justify-between text-xs">
          <a href={liveRepoPath(docsPath)} target="_blank" rel="noreferrer noopener">
            <span className="flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5" />
              Voice guide
            </span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

const statusStyle: Record<ContentStatus, string> = {
  planned: "bg-secondary text-secondary-foreground",
  in_progress: "bg-info/15 text-info border-info/30",
  done: "bg-success/15 text-success border-success/30",
  blocked: "bg-destructive/15 text-destructive border-destructive/30",
};

const channelLabel: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "IG",
  twitter: "Twitter",
  blog: "Blog",
  email: "Email",
};

const today = "2026-03-19";

function ContentCard({ item }: { item: ContentCalendarItem }) {
  return (
    <Card className="group hover:border-primary/30 transition-colors">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono text-muted-foreground">{item.contentId}</code>
          <Badge variant="outline" className={statusStyle[item.status] + " text-[10px] capitalize"}>
            {item.status.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-sm font-medium leading-snug">{item.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[10px]">{channelLabel[item.channel] ?? item.channel}</Badge>
          <span>·</span>
          <span>{item.owner}</span>
          <span>·</span>
          <span>{item.date}</span>
        </div>
        {item.assetLinks.length > 0 && (
          <div className="flex gap-1 flex-wrap pt-1">
            {item.assetLinks.map((link, i) => (
              <Badge key={i} variant="outline" className="text-[10px] font-mono gap-1">
                <FileText className="h-3 w-3" />{link.replace(/[\[\]]/g, "").split("/").pop()}
              </Badge>
            ))}
          </div>
        )}
        {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
      </CardContent>
    </Card>
  );
}

function Post004Card() {
  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-primary">POST-004</code>
          <Badge className="bg-primary/20 text-primary text-[10px]">Concept</Badge>
        </div>
        <CardTitle className="text-base">Before vs After: Manual → AI-Enhanced Workflow</CardTitle>
        <CardDescription>Side-by-side comparison showing the transformation from manual project management to AI-augmented operations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-md border border-dashed border-muted-foreground/30 p-3 text-center space-y-1">
            <FileText className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Old Project PDF</p>
            <p className="text-[10px] text-muted-foreground/60">old-project.pdf</p>
          </div>
          <div className="rounded-md border border-dashed border-muted-foreground/30 p-3 text-center space-y-1">
            <Image className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground">New IA Renders</p>
            <p className="text-[10px] text-muted-foreground/60">ia-render-1.png, ia-render-2.png</p>
          </div>
          <div className="rounded-md border border-dashed border-muted-foreground/30 p-3 text-center space-y-1">
            <FileCheck className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Final Copy</p>
            <p className="text-[10px] text-muted-foreground/60">final-copy.docx</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Channel: LinkedIn · Owner: Oscar · Status: Planned</p>
      </CardContent>
    </Card>
  );
}

export default function ContentCalendarPage() {
  const { data: items = [] } = useQuery({ queryKey: ["content-calendar"], queryFn: getContentCalendar });
  const { data: checkpoints = [] } = useQuery({ queryKey: ["workflow-checkpoints"], queryFn: getWorkflowCheckpoints });
  const [quickCapture, setQuickCapture] = useState("");
  const [completedWf, setCompletedWf] = useState<Set<string>>(new Set());

  const todayItems = items.filter((i) => i.date === today);
  const thisWeek = items.filter((i) => i.date >= "2026-03-17" && i.date <= "2026-03-23");
  const doneItems = items.filter((i) => i.status === "done");

  const toggleCheckpoint = (id: string) => {
    setCompletedWf((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const timeIcon = { morning: Sun, midday: Clock, end_of_day: Moon };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Content Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Day-to-day execution tracking</p>
        </div>
      </div>

      <LiveRepoBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="day">
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="done">Done Log</TabsTrigger>
            </TabsList>

            <TabsContent value="day" className="space-y-3 mt-4">
              {todayItems.length === 0 && <p className="text-sm text-muted-foreground">No items scheduled for today.</p>}
              {todayItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </TabsContent>

            <TabsContent value="week" className="space-y-3 mt-4">
              {["2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-21"].map((date) => {
                const dayItems = thisWeek.filter((i) => i.date === date);
                if (dayItems.length === 0) return null;
                const d = new Date(date);
                return (
                  <div key={date}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {date === today && <Badge variant="secondary" className="ml-2 text-[10px]">Today</Badge>}
                    </p>
                    <div className="space-y-2 ml-2 border-l-2 border-border pl-3">
                      {dayItems.map((item) => (
                        <ContentCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="done" className="space-y-3 mt-4">
              {doneItems.length === 0 && <p className="text-sm text-muted-foreground">No completed items yet.</p>}
              {doneItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </TabsContent>
          </Tabs>

          {/* POST-004 Concept Card */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Featured Concept</h2>
            <Post004Card />
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Quick Capture */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">What we did today</CardTitle>
              <CardDescription className="text-xs">Quick daily capture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Shipped POST-001, recorded B-roll for POST-002..."
                value={quickCapture}
                onChange={(e) => setQuickCapture(e.target.value)}
                className="text-sm min-h-[80px]"
              />
              <Button size="sm" className="w-full gap-2" disabled={!quickCapture.trim()}>
                <Send className="h-3 w-3" /> Log Entry
              </Button>
            </CardContent>
          </Card>

          {/* Oscar's Daily Workflow */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Oscar's Daily Workflow</CardTitle>
              <CardDescription className="text-xs">Recurring template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {checkpoints.map((cp) => {
                const Icon = timeIcon[cp.time];
                return (
                  <div
                    key={cp.id}
                    className="flex items-start gap-3 group cursor-pointer"
                    onClick={() => toggleCheckpoint(cp.id)}
                  >
                    <Checkbox checked={completedWf.has(cp.id)} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className={`text-sm ${completedWf.has(cp.id) ? "line-through text-muted-foreground" : ""}`}>
                          {cp.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground capitalize">{cp.time.replace("_", " ")}</p>
                    </div>
                  </div>
                );
              })}
              <Separator />
              <p className="text-[10px] text-muted-foreground">
                {completedWf.size}/{checkpoints.length} completed today
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
