import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input defaultValue="Solo Founder" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="founder@openclaw.ai" type="email" />
          </div>
          <Button size="sm" onClick={() => toast.success("Profile saved")}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Control what alerts you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Agent errors", desc: "Get notified when an agent crashes", default: true },
            { label: "Trade alerts", desc: "P&L thresholds and stop-loss triggers", default: true },
            { label: "Integration failures", desc: "Connection health warnings", default: true },
            { label: "Marketing reports", desc: "Daily campaign summaries", default: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys</CardTitle>
          <CardDescription>Manage your service credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">API key management will be available when backend is connected.</p>
          <Button variant="outline" size="sm" disabled>Generate Key</Button>
        </CardContent>
      </Card>
    </div>
  );
}
