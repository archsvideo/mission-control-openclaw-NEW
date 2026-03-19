import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrades, getTradeAlerts, getPairPerformance, getRiskMetrics } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, TrendingDown, ShieldAlert, AlertTriangle, Eye, EyeOff, Download } from "lucide-react";
import { toast } from "sonner";

const alertTypeColor: Record<string, string> = {
  OPEN: "bg-info text-info-foreground",
  CLOSE: "bg-success text-success-foreground",
  STOP: "bg-destructive text-destructive-foreground",
  TP: "bg-success text-success-foreground",
  "TIME-STOP": "bg-warning text-warning-foreground",
};

export default function TradingOpsPage() {
  const { data: trades = [] } = useQuery({ queryKey: ["trades"], queryFn: getTrades });
  const { data: alerts = [] } = useQuery({ queryKey: ["tradeAlerts"], queryFn: getTradeAlerts });
  const { data: pairs = [] } = useQuery({ queryKey: ["pairPerf"], queryFn: getPairPerformance });
  const { data: risk } = useQuery({ queryKey: ["risk"], queryFn: getRiskMetrics });
  const [focusMode, setFocusMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");

  const openTrades = trades.filter((t) => t.status === "open");
  const closedTrades = trades.filter((t) => t.status === "closed");
  const totalUnrealized = openTrades.reduce((s, t) => s + t.pnl, 0);
  const totalRealized = closedTrades.reduce((s, t) => s + t.pnl, 0);

  const exportCSV = () => {
    const rows = closedTrades.map((t) => `${t.symbol},${t.direction},${t.entryPrice},${t.exitPrice},${t.pnl},${t.pnlPercent},${t.closedAt}`);
    const csv = `Symbol,Direction,Entry,Exit,PnL,PnL%,Closed\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "closed_trades.csv"; a.click();
    toast.success("CSV exported");
  };

  const tradeAge = (openedAt: string) => {
    const hours = Math.floor((Date.now() - new Date(openedAt).getTime()) / 3600000);
    return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d ${hours % 24}h`;
  };

  return (
    <div className={`space-y-6 ${focusMode ? "max-w-4xl mx-auto" : ""}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Trading Ops Console</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{focusMode ? <Eye className="h-3 w-3 inline mr-1" /> : <EyeOff className="h-3 w-3 inline mr-1" />}Focus</span>
          <Switch checked={focusMode} onCheckedChange={setFocusMode} />
        </div>
      </div>

      {/* Risk Panel */}
      {risk && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Risk/Trade</CardTitle></CardHeader><CardContent><span className="text-xl font-mono font-bold">{risk.riskPerTrade}%</span></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Open Risk</CardTitle></CardHeader><CardContent><span className="text-xl font-mono font-bold">{risk.openRisk}%</span></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Daily DD</CardTitle></CardHeader><CardContent><span className={`text-xl font-mono font-bold ${risk.dailyDD < -2 ? "text-destructive" : "text-muted-foreground"}`}>{risk.dailyDD}%</span></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Consec. Losses</CardTitle></CardHeader><CardContent><span className="text-xl font-mono font-bold">{risk.consecutiveLosses}</span></CardContent></Card>
          <Card className={risk.killSwitchActive ? "border-destructive" : ""}>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Kill Switch</CardTitle></CardHeader>
            <CardContent><span className={`text-xl font-mono font-bold ${risk.killSwitchActive ? "text-destructive" : "text-success"}`}>{risk.killSwitchActive ? "ACTIVE" : "OFF"}</span></CardContent>
          </Card>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Unrealized P&L</CardTitle></CardHeader><CardContent><span className={`text-2xl font-mono font-bold ${totalUnrealized >= 0 ? "text-success" : "text-destructive"}`}>${totalUnrealized.toLocaleString()}</span></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><TrendingDown className="h-4 w-4" /> Realized P&L</CardTitle></CardHeader><CardContent><span className={`text-2xl font-mono font-bold ${totalRealized >= 0 ? "text-success" : "text-destructive"}`}>${totalRealized.toLocaleString()}</span></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><ShieldAlert className="h-4 w-4" /> Total Exposure</CardTitle></CardHeader><CardContent><span className="text-2xl font-mono font-bold">${openTrades.reduce((s, t) => s + t.entryPrice * t.quantity, 0).toLocaleString()}</span></CardContent></Card>
      </div>

      {/* Open positions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Open Positions</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead><TableHead>Side</TableHead><TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">SL</TableHead><TableHead className="text-right">TP</TableHead>
                <TableHead className="text-right">Live</TableHead><TableHead className="text-right">Unreal. $</TableHead>
                <TableHead className="text-right">Unreal. R</TableHead><TableHead className="text-right">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openTrades.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-medium">{t.symbol}</TableCell>
                  <TableCell><Badge variant={t.direction === "long" ? "default" : "destructive"} className="text-xs">{t.direction}</Badge></TableCell>
                  <TableCell className="text-right font-mono">${t.entryPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{t.stopLoss ? `$${t.stopLoss}` : "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{t.takeProfit ? `$${t.takeProfit}` : "—"}</TableCell>
                  <TableCell className="text-right font-mono">${t.currentPrice.toLocaleString()}</TableCell>
                  <TableCell className={`text-right font-mono font-medium ${t.pnl >= 0 ? "text-success" : "text-destructive"}`}>${t.pnl.toLocaleString()}</TableCell>
                  <TableCell className={`text-right font-mono ${t.unrealizedR >= 0 ? "text-success" : "text-destructive"}`}>{t.unrealizedR > 0 ? "+" : ""}{t.unrealizedR.toFixed(1)}R</TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">{tradeAge(t.openedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!focusMode && (
        <>
          {/* Pair Performance */}
          <Card>
            <CardHeader><CardTitle className="text-base">Pair Performance</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Pair</TableHead><TableHead className="text-right">EV ($)</TableHead><TableHead className="text-right">Win Rate</TableHead><TableHead className="text-right">Profit Factor</TableHead><TableHead className="text-right">Trades</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pairs.map((p) => (
                    <TableRow key={p.pair}>
                      <TableCell className="font-mono font-medium">{p.pair}</TableCell>
                      <TableCell className={`text-right font-mono ${p.ev >= 0 ? "text-success" : "text-destructive"}`}>${p.ev}</TableCell>
                      <TableCell className="text-right font-mono">{p.winRate}%</TableCell>
                      <TableCell className={`text-right font-mono ${p.profitFactor >= 1.5 ? "text-success" : p.profitFactor >= 1 ? "text-warning" : "text-destructive"}`}>{p.profitFactor.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-mono">{p.trades}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Closed trades */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Closed Trades</CardTitle>
              <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3 w-3 mr-1" /> CSV</Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Symbol</TableHead><TableHead>Dir</TableHead><TableHead className="text-right">Entry</TableHead><TableHead className="text-right">Exit</TableHead><TableHead className="text-right">P&L</TableHead><TableHead className="text-right">Closed</TableHead></TableRow></TableHeader>
                <TableBody>
                  {closedTrades.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono font-medium">{t.symbol}</TableCell>
                      <TableCell><Badge variant={t.direction === "long" ? "default" : "destructive"} className="text-xs">{t.direction}</Badge></TableCell>
                      <TableCell className="text-right font-mono">${t.entryPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">${t.exitPrice?.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-mono font-medium ${t.pnl >= 0 ? "text-success" : "text-destructive"}`}>${t.pnl.toLocaleString()} ({t.pnlPercent > 0 ? "+" : ""}{t.pnlPercent}%)</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{t.closedAt ? new Date(t.closedAt).toLocaleDateString() : ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Alerts Feed */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Alerts Feed</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                  <Badge className={`text-[10px] ${alertTypeColor[a.type]}`}>{a.type}</Badge>
                  <span className="font-mono text-sm">{a.symbol}</span>
                  <span className="text-sm text-muted-foreground flex-1">{a.message}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{new Date(a.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
