import { useQuery } from "@tanstack/react-query";
import { getCompetitorRadar, getCompetitors } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ExternalLink, Radar, Eye, AlertTriangle, CheckCircle2, CircleSlash,
  FolderGit2, Github, FileText, Flame,
} from "lucide-react";
import type { CompetitorTier, RadarSignal } from "@/types/models";

const LIVE_REPO = {
  owner: "archsvideo",
  name: "content-calendar",
  url: "https://github.com/archsvideo/content-calendar",
  branch: "main",
};

function liveRepoPath(path: string) {
  return `${LIVE_REPO.url}/blob/${LIVE_REPO.branch}/${path}`;
}

function tierAccent(tier: number): string {
  switch (tier) {
    case 1: return "border-primary/40 bg-primary/5";
    case 2: return "border-info/40 bg-info/5";
    case 3: return "border-warning/40 bg-warning/5";
    default: return "border-muted-foreground/20";
  }
}

function TierCard({ tier }: { tier: CompetitorTier }) {
  const validated = tier.competitors.filter((c) => c.oscarValidated && !c.isPlaceholder).length;
  const pending = tier.competitors.filter((c) => c.isPlaceholder).length;

  return (
    <Card className={tierAccent(tier.tier)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-mono">Tier {tier.tier}</Badge>
              <CardTitle className="text-base leading-tight">{tier.label}</CardTitle>
            </div>
            {tier.description && (
              <CardDescription className="text-xs">{tier.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
            <span className="font-mono">{tier.competitors.length}</span>
            <span>entries</span>
          </div>
        </div>
        {(validated > 0 || pending > 0) && (
          <div className="flex items-center gap-3 text-[10px] pt-1">
            {validated > 0 && (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3 w-3" /> {validated} validated
              </span>
            )}
            {pending > 0 && (
              <span className="flex items-center gap-1 text-warning">
                <AlertTriangle className="h-3 w-3" /> {pending} awaiting Oscar
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {tier.competitors.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No handles yet.</p>
        )}
        {tier.competitors.map((c, idx) => (
          <div
            key={`${tier.tier}-${idx}`}
            className="rounded-md border bg-card/40 p-2 space-y-1"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <code className="text-xs font-mono leading-tight">{c.handle}</code>
              <div className="flex items-center gap-1 flex-wrap">
                {c.platform && (
                  <Badge variant="secondary" className="text-[10px]">{c.platform}</Badge>
                )}
                {c.oscarValidated && (
                  <Badge className="bg-success/15 text-success border-success/30 text-[10px]">validated</Badge>
                )}
                {c.oscarRejected && (
                  <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">rejected</Badge>
                )}
                {c.isPlaceholder && (
                  <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">placeholder</Badge>
                )}
              </div>
            </div>
            {c.whyFollow && (
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground/80 font-medium">Follow:</span> {c.whyFollow}
              </p>
            )}
            {c.whatNotCopy && (
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground/80 font-medium">No copy:</span> {c.whatNotCopy}
              </p>
            )}
          </div>
        ))}
        {tier.notes.map((note, i) => (
          <p key={i} className="text-[11px] italic text-muted-foreground border-l-2 border-warning/40 pl-2">
            {note}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

function SignalCard({ signal }: { signal: RadarSignal }) {
  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center gap-2">
          <Flame className="h-3.5 w-3.5 text-warning" />
          <p className="text-sm font-medium leading-snug">{signal.what}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-muted-foreground">
          {signal.source && <p><span className="text-foreground/80 font-medium">Fuente:</span> {signal.source}</p>}
          {signal.when && <p><span className="text-foreground/80 font-medium">Cuándo:</span> {signal.when}</p>}
          {signal.whyMatters && (
            <p className="sm:col-span-2">
              <span className="text-foreground/80 font-medium">Por qué:</span> {signal.whyMatters}
            </p>
          )}
          {signal.angle && (
            <p className="sm:col-span-2">
              <span className="text-foreground/80 font-medium">Ángulo:</span> {signal.angle}
            </p>
          )}
          {signal.candidateFor && (
            <p><span className="text-foreground/80 font-medium">Candidato:</span> {signal.candidateFor}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LiveRepoBanner({ updatedAt, repo }: { updatedAt?: string; repo?: string }) {
  const staleSince = updatedAt ? new Date(updatedAt) : null;
  const staleSec = staleSince ? Math.floor((Date.now() - staleSince.getTime()) / 1000) : null;
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Radar source</CardTitle>
              {staleSec !== null && (
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                  updated {formatAge(staleSec)} ago
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs font-mono break-all">
              {repo || "content-calendar"}
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <a href={LIVE_REPO.url} target="_blank" rel="noreferrer noopener">
              <Github className="h-3.5 w-3.5" />
              {LIVE_REPO.owner}/{LIVE_REPO.name}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0">
        <Button asChild size="sm" variant="ghost" className="justify-between text-xs">
          <a href={liveRepoPath("docs/competitors.md")} target="_blank" rel="noreferrer noopener">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              docs/competitors.md
            </span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </Button>
        <Button asChild size="sm" variant="ghost" className="justify-between text-xs">
          <a href={liveRepoPath("research/radar/")} target="_blank" rel="noreferrer noopener">
            <span className="flex items-center gap-1.5">
              <Radar className="h-3.5 w-3.5" />
              research/radar/
            </span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function formatAge(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function SeedFallbackTable() {
  const { data: entries = [] } = useQuery({ queryKey: ["competitors-seed"], queryFn: getCompetitors });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tracked Content (seed fallback)</CardTitle>
        <CardDescription className="text-xs">
          Bridge offline — showing seed data. Run{" "}
          <code className="text-xs">node scripts/write_competitors_radar.mjs</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Hook Type</TableHead>
              <TableHead>Format</TableHead>
              <TableHead className="text-right">Engagement</TableHead>
              <TableHead>Pattern</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">{e.platform}</Badge>
                    <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{e.hookType}</TableCell>
                <TableCell className="text-sm">{e.format}</TableCell>
                <TableCell className="text-right font-mono">{e.engagement.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.pattern}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function CompetitorRadarPage() {
  const { data: radar, isLoading } = useQuery({
    queryKey: ["competitor-radar"],
    queryFn: getCompetitorRadar,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Radar className="h-6 w-6 text-primary" /> Competitor Radar
        </h1>
        <p className="text-sm text-muted-foreground">Loading radar bridge…</p>
      </div>
    );
  }

  // No bridge data — fall back to the seed table so the tab is never blank.
  if (!radar) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Radar className="h-6 w-6 text-primary" /> Competitor Radar
        </h1>
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-3 flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span>
              No live bridge yet. The scheduled task will pick up{" "}
              <code className="text-xs">docs/competitors.md</code> and{" "}
              <code className="text-xs">research/radar/</code> once it runs.
            </span>
          </CardContent>
        </Card>
        <SeedFallbackTable />
      </div>
    );
  }

  const { tiers, counts, latestRadar, hashtags, rules, newsletters, errors } = radar;
  const signals = latestRadar?.signals ?? [];
  const sourcesScanned = latestRadar?.sourcesScanned ?? [];
  const doneSources = sourcesScanned.filter((s) => s.done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Radar className="h-6 w-6 text-primary" /> Competitor Radar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tiered competitive observation — Nova Studio scans, Oscar validates.
        </p>
      </div>

      <LiveRepoBanner updatedAt={radar.updatedAt} repo={radar.repo} />

      {/* Counts strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CountCard label="Tiers" value={counts.tiers} icon={<Radar className="h-4 w-4 text-primary" />} />
        <CountCard
          label="Handles"
          value={counts.competitors}
          icon={<Eye className="h-4 w-4 text-info" />}
          sub={counts.placeholders ? `${counts.placeholders} placeholder${counts.placeholders === 1 ? "" : "s"}` : undefined}
        />
        <CountCard
          label="Validated"
          value={counts.validated}
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
          sub={counts.validated === 0 ? "awaiting Oscar" : undefined}
        />
        <CountCard
          label="Hot signals"
          value={counts.signals}
          icon={<Flame className="h-4 w-4 text-warning" />}
          sub={latestRadar ? `radar ${latestRadar.date}` : undefined}
        />
      </div>

      {errors.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-3 space-y-1">
            <p className="text-xs font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Bridge reported {errors.length} issue{errors.length === 1 ? "" : "s"}
            </p>
            {errors.slice(0, 3).map((e, i) => (
              <p key={i} className="text-[11px] text-muted-foreground font-mono">
                [{e.code}] {e.message}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tiers">
        <TabsList>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="radar">
            Radar
            {signals.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px]">{signals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="mt-4 space-y-4">
          {tiers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Tier structure empty. Check <code className="text-xs">docs/competitors.md</code> parses.
            </p>
          )}
          {tiers.map((t) => (
            <TierCard key={t.tier} tier={t} />
          ))}
        </TabsContent>

        <TabsContent value="radar" className="mt-4 space-y-4">
          {latestRadar ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <CardTitle className="text-base">Latest radar · {latestRadar.date}</CardTitle>
                      <CardDescription className="text-xs">
                        {latestRadar.generatedBy || "unknown generator"} ·{" "}
                        <code className="text-[11px]">{latestRadar.file}</code>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {doneSources}/{sourcesScanned.length} sources scanned
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sourcesScanned.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Fuentes</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                        {sourcesScanned.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            {s.done ? (
                              <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                            ) : (
                              <CircleSlash className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <span className={s.done ? "" : "text-muted-foreground"}>{s.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {latestRadar.nextToWatch.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Próximos a vigilar</p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {latestRadar.nextToWatch.map((n, i) => (
                            <li key={i}>· {n}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Señales calientes
                </h2>
                {signals.length === 0 ? (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground italic text-center">
                      No hot signals logged in this radar yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {signals.map((s, i) => (
                      <SignalCard key={i} signal={s} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                No radar files found in <code className="text-xs">research/radar/</code>.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules" className="mt-4 space-y-4">
          {rules.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Observation rules</CardTitle>
                <CardDescription className="text-xs">
                  Nova Studio follows these when scanning. No engagement, no drama.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  {rules.map((r, i) => (
                    <li key={i} className="text-muted-foreground">{r}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {hashtags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Reference hashtags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {hashtags.map((h, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] font-mono">{h}</Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {newsletters.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Newsletters tracked</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {newsletters.map((n, i) => (
                    <li key={i}>· {n}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CountCard({
  label, value, icon, sub,
}: { label: string; value: number; icon: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          {icon}
        </div>
        <p className="text-2xl font-bold font-mono leading-none">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
