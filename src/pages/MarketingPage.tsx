import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Eye, MousePointerClick, Target } from "lucide-react";

export default function MarketingPage() {
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: getCampaigns });

  const active = campaigns.filter((c) => c.status === "active");
  const totalSpend = active.reduce((s, c) => s + c.spend, 0);
  const totalConversions = active.reduce((s, c) => s + c.conversions, 0);
  const avgRoas = active.length ? active.reduce((s, c) => s + c.roas, 0) / active.length : 0;
  const totalImpressions = active.reduce((s, c) => s + c.impressions, 0);

  const funnelStages = [
    { label: "Impressions", value: totalImpressions, icon: Eye },
    { label: "Clicks", value: active.reduce((s, c) => s + c.clicks, 0), icon: MousePointerClick },
    { label: "Conversions", value: totalConversions, icon: Target },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Spend</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-mono font-bold">${totalSpend.toLocaleString()}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg ROAS</CardTitle></CardHeader>
          <CardContent><span className={`text-2xl font-mono font-bold ${avgRoas >= 2 ? "text-success" : avgRoas >= 1 ? "text-warning" : "text-destructive"}`}>{avgRoas.toFixed(1)}x</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-mono font-bold">{totalConversions}</span></CardContent>
        </Card>
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader><CardTitle className="text-base">Active Funnel</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {funnelStages.map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-2 flex-1">
                <div className="flex-1 rounded-md bg-accent p-4 text-center">
                  <stage.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-mono font-bold">{stage.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{stage.label}</div>
                </div>
                {i < funnelStages.length - 1 && <span className="text-muted-foreground text-lg">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Creative performance table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Creative Performance</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creative</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">CPA</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{c.platform}</Badge></TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${c.status === "active" ? "bg-success text-success-foreground" : c.status === "paused" ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">${c.spend.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{c.ctr}%</TableCell>
                  <TableCell className="text-right font-mono">${c.cpa.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-mono font-medium ${c.roas >= 2 ? "text-success" : c.roas >= 1 ? "text-warning" : "text-destructive"}`}>{c.roas}x</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
