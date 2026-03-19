import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCampaigns, getABHypotheses, getFunnelSteps, getLeads } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, ArrowDown, Beaker, Eye, LayoutGrid, LineChart, Users } from "lucide-react";

export default function SkylightCROPage() {
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: getCampaigns });
  const { data: hypotheses = [] } = useQuery({ queryKey: ["abTests"], queryFn: getABHypotheses });
  const { data: funnel = [] } = useQuery({ queryKey: ["funnel"], queryFn: getFunnelSteps });
  const { data: leads = [] } = useQuery({ queryKey: ["leads"], queryFn: getLeads });

  const active = campaigns.filter((c) => c.status === "active");
  const totalSpend = active.reduce((s, c) => s + c.spend, 0);
  const avgRoas = active.length ? active.reduce((s, c) => s + c.roas, 0) / active.length : 0;

  // Duplicate creative detection
  const creativeAdsets = campaigns.reduce<Record<string, string[]>>((acc, c) => {
    if (!acc[c.creativeId]) acc[c.creativeId] = [];
    acc[c.creativeId].push(c.adsetId);
    return acc;
  }, {});
  const duplicates = Object.entries(creativeAdsets).filter(([, adsets]) => adsets.length > 1);

  const clientLeads = leads.filter((l) => l.stage !== "lost");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Skylight CRO Lab</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><LayoutGrid className="h-3 w-3 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="creatives"><Eye className="h-3 w-3 mr-1" /> Creatives Lab</TabsTrigger>
          <TabsTrigger value="experiments"><Beaker className="h-3 w-3 mr-1" /> Experiments</TabsTrigger>
          <TabsTrigger value="funnel"><LineChart className="h-3 w-3 mr-1" /> Funnel</TabsTrigger>
          <TabsTrigger value="leads"><Users className="h-3 w-3 mr-1" /> Client Leads</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Spend</CardTitle></CardHeader><CardContent><span className="text-2xl font-mono font-bold">${totalSpend.toLocaleString()}</span></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg ROAS</CardTitle></CardHeader><CardContent><span className={`text-2xl font-mono font-bold ${avgRoas >= 2 ? "text-success" : "text-warning"}`}>{avgRoas.toFixed(1)}x</span></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">A/B Tests</CardTitle></CardHeader><CardContent><span className="text-2xl font-mono font-bold">{hypotheses.filter((h) => h.status === "running").length} running</span></CardContent></Card>
          </div>
          {duplicates.length > 0 && (
            <Card className="border-warning">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Duplicate Creatives Detected</CardTitle></CardHeader>
              <CardContent>
                {duplicates.map(([creativeId, adsets]) => (
                  <div key={creativeId} className="text-sm py-1"><span className="font-mono font-medium">{creativeId}</span> found in adsets: {adsets.join(", ")}</div>
                ))}
              </CardContent>
            </Card>
          )}
          {/* Booking tracking health */}
          <Card>
            <CardHeader><CardTitle className="text-base">Booking Tracking Health</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {[{ label: "Booked", count: leads.filter((l) => l.bookingStatus === "booked").length, color: "text-success" },
                  { label: "Pending", count: leads.filter((l) => l.bookingStatus === "pending").length, color: "text-warning" },
                  { label: "No-show", count: leads.filter((l) => l.bookingStatus === "no_show").length, color: "text-destructive" },
                  { label: "Completed", count: leads.filter((l) => l.bookingStatus === "completed").length, color: "text-primary" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`text-xl font-mono font-bold ${s.color}`}>{s.count}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creatives Lab */}
        <TabsContent value="creatives" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Creative Performance</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creative</TableHead><TableHead>ID</TableHead><TableHead>Platform</TableHead><TableHead>Status</TableHead>
                    <TableHead className="text-right">Spend</TableHead><TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">LPV</TableHead><TableHead className="text-right">Checkout</TableHead>
                    <TableHead className="text-right">ROAS</TableHead><TableHead>Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs">{c.creativeId}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{c.platform}</Badge></TableCell>
                      <TableCell><Badge className={`text-xs ${c.status === "active" ? "bg-success text-success-foreground" : c.status === "paused" ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"}`}>{c.status}</Badge></TableCell>
                      <TableCell className="text-right font-mono">${c.spend.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{c.ctr}%</TableCell>
                      <TableCell className="text-right font-mono">{c.lpv.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{c.beginCheckout}</TableCell>
                      <TableCell className={`text-right font-mono font-medium ${c.roas >= 2 ? "text-success" : c.roas >= 1 ? "text-warning" : "text-destructive"}`}>{c.roas}x</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{c.recommendation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experiments */}
        <TabsContent value="experiments" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">A/B Hypothesis Board</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {hypotheses.map((h) => (
              <Card key={h.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{h.name}</CardTitle>
                    <Badge variant="outline" className={`text-[10px] ${h.status === "running" ? "border-success text-success" : h.status === "concluded" ? "border-primary text-primary" : "border-muted-foreground"}`}>{h.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{h.hypothesis}</p>
                  <div className="text-xs"><span className="text-muted-foreground">Variant:</span> {h.variant}</div>
                  <div className="text-xs"><span className="text-muted-foreground">Metric:</span> {h.metric}</div>
                  {h.result && <div className="text-xs font-medium text-success">{h.result}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Funnel */}
        <TabsContent value="funnel" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {funnel.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <div className="w-full rounded-md bg-accent overflow-hidden" style={{ maxWidth: `${100 - i * 20}%` }}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-medium">{step.label}</span>
                        <span className="font-mono font-bold">{step.value.toLocaleString()}</span>
                      </div>
                    </div>
                    {step.rate !== undefined && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <ArrowDown className="h-3 w-3" /> {step.rate}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Leads */}
        <TabsContent value="leads" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Client Leads</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Company</TableHead><TableHead>Score</TableHead><TableHead>Stage</TableHead><TableHead>Booking</TableHead><TableHead>Last Contact</TableHead></TableRow></TableHeader>
                <TableBody>
                  {clientLeads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>{l.company}</TableCell>
                      <TableCell className="font-mono">{l.score}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{l.stage}</Badge></TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs capitalize">{l.bookingStatus}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.lastContact ? new Date(l.lastContact).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
