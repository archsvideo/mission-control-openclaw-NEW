import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getIntegrations, testConnection } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, BarChart3, Tag, Megaphone, MessageSquare, CreditCard, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { IntegrationHealth } from "@/types/models";

const iconMap: Record<string, React.ElementType> = {
  Mail, BarChart3, Tag, Megaphone, MessageSquare, CreditCard,
};

const healthColor: Record<IntegrationHealth, string> = {
  healthy: "bg-success",
  degraded: "bg-warning",
  down: "bg-destructive",
  not_configured: "bg-muted-foreground",
};

const healthLabel: Record<IntegrationHealth, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  down: "Down",
  not_configured: "Not Configured",
};

export default function IntegrationsPage() {
  const { data: integrations = [] } = useQuery({ queryKey: ["integrations"], queryFn: getIntegrations });
  const [testing, setTesting] = useState<string | null>(null);

  const handleTest = async (id: string) => {
    setTesting(id);
    const result = await testConnection(id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setTesting(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => {
          const Icon = iconMap[i.icon] || Mail;
          return (
            <Card key={i.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${healthColor[i.health]}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{i.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className={`text-xs`}>
                    <div className={`h-2 w-2 rounded-full mr-1.5 ${healthColor[i.health]}`} />
                    {healthLabel[i.health]}
                  </Badge>
                </div>
                <CardDescription>{i.message}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {i.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date(i.lastSync).toLocaleString()}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTest(i.id)}
                  disabled={testing === i.id}
                >
                  {testing === i.id ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : i.health === "healthy" ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
