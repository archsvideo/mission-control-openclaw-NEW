import { useQuery } from "@tanstack/react-query";
import { getTrades } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, ShieldAlert } from "lucide-react";

export default function TradingPage() {
  const { data: trades = [] } = useQuery({ queryKey: ["trades"], queryFn: getTrades });

  const openTrades = trades.filter((t) => t.status === "open");
  const closedTrades = trades.filter((t) => t.status === "closed");
  const totalUnrealized = openTrades.reduce((s, t) => s + t.pnl, 0);
  const totalRealized = closedTrades.reduce((s, t) => s + t.pnl, 0);
  const totalExposure = openTrades.reduce((s, t) => s + t.entryPrice * t.quantity, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trading</h1>

      {/* Risk panel */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Unrealized P&L</CardTitle></CardHeader>
          <CardContent><span className={`text-2xl font-mono font-bold ${totalUnrealized >= 0 ? "text-success" : "text-destructive"}`}>${totalUnrealized.toLocaleString()}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><TrendingDown className="h-4 w-4" /> Realized P&L</CardTitle></CardHeader>
          <CardContent><span className={`text-2xl font-mono font-bold ${totalRealized >= 0 ? "text-success" : "text-destructive"}`}>${totalRealized.toLocaleString()}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><ShieldAlert className="h-4 w-4" /> Total Exposure</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-mono font-bold">${totalExposure.toLocaleString()}</span></CardContent>
        </Card>
      </div>

      {/* Open trades */}
      <Card>
        <CardHeader><CardTitle className="text-base">Open Positions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Dir</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">SL / TP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openTrades.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-medium">{t.symbol}</TableCell>
                  <TableCell><Badge variant={t.direction === "long" ? "default" : "destructive"} className="text-xs">{t.direction}</Badge></TableCell>
                  <TableCell className="text-right font-mono">${t.entryPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${t.currentPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{t.quantity}</TableCell>
                  <TableCell className={`text-right font-mono font-medium ${t.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                    ${t.pnl.toLocaleString()} ({t.pnlPercent > 0 ? "+" : ""}{t.pnlPercent}%)
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {t.stopLoss ? `$${t.stopLoss}` : "—"} / {t.takeProfit ? `$${t.takeProfit}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Closed trades */}
      <Card>
        <CardHeader><CardTitle className="text-base">Closed Trades</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Dir</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Closed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closedTrades.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-medium">{t.symbol}</TableCell>
                  <TableCell><Badge variant={t.direction === "long" ? "default" : "destructive"} className="text-xs">{t.direction}</Badge></TableCell>
                  <TableCell className="text-right font-mono">${t.entryPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${t.exitPrice?.toLocaleString()}</TableCell>
                  <TableCell className={`text-right font-mono font-medium ${t.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                    ${t.pnl.toLocaleString()} ({t.pnlPercent > 0 ? "+" : ""}{t.pnlPercent}%)
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{t.closedAt ? new Date(t.closedAt).toLocaleDateString() : ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
