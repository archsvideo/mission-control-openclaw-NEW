import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getIntegrations, testConnection } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, BarChart3, Tag, Megaphone, MessageSquare, CreditCard, RefreshCw, CheckCircle, XCircle, Waves } from "lucide-react";
import { toast } from "sonner";
import type { IntegrationHealth } from "@/types/models";

const iconMap: Record<string, React.ElementType> = { Mail, BarChart3, Tag, Megaphone, MessageSquare, CreditCard, Waves };
const healthColor: Record<IntegrationHealth, string> = { healthy: "bg-success", degraded: "bg-warning", down: "bg-destructive", not_configured: "bg-muted-foreground" };
const healthLabel: Record<IntegrationHealth, string> = { healthy: "Healthy", degraded: "Degraded", down: "Down", not_configured: "Not Configured" };

export default function IntegrationsPage() {
  const { data: integrations = [] } = useQuery({ queryKey: ["integrations"], queryFn: getIntegrations });
  const [testing, setTesting] = useState<string | null>(null);

  const handleTest = async (id: string) => {
    setTesting(id);
    const result = await testConnection(id);
    result.success ? toast.success(result.message) : toast.error(result.message);
    setTesting(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>

      {/* Diagnostics summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Booking Tracking</CardTitle></CardHeader>
          <CardContent><span className="text-lg font-mono font-bold text-success">Active</span><p className="text-xs text-muted-foreground">GA4 purchase events firing</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">GTM Publish</CardTitle></CardHeader>
          <CardContent><span className="text-lg font-mono font-bold text-success">v14 Live</span><p className="text-xs text-muted-foreground">Last published today</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">GA4 Events</CardTitle></CardHeader>
          <CardContent><span className="text-lg font-mono font-bold text-success">12 Active</span><p className="text-xs text-muted-foreground">No errors in 24h</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => {
          const Icon = iconMap[i.icon] || Mail;
          return (
            <Card key={i.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${healthColor[i.health]}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Icon className="h-5 w-5 text-muted-foreground" /><CardTitle className="text-base">{i.name}</CardTitle></div>
                  <Badge variant="secondary" className="text-xs"><div className={`h-2 w-2 rounded-full mr-1.5 ${healthColor[i.health]}`} />{healthLabel[i.health]}</Badge>
                </div>
                <CardDescription>{i.message}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {i.lastSync && <div><span className="text-muted-foreground">Last sync:</span> <span className="font-mono">{new Date(i.lastSync).toLocaleTimeString()}</span></div>}
                  {i.latency > 0 && <div><span className="text-muted-foreground">Latency:</span> <span className={`font-mono ${i.latency > 1000 ? "text-warning" : ""}`}>{i.latency}ms</span></div>}
                  {i.lastError && <div className="col-span-2"><span className="text-muted-foreground">Error:</span> <span className="text-destructive text-xs">{i.lastError}</span></div>}
                </div>
                <Button size="sm" variant="outline" onClick={() => handleTest(i.id)} disabled={testing === i.id}>
                  {testing === i.id ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : i.health === "healthy" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                  Test Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
