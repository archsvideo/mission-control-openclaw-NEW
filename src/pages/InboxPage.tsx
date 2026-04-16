import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Archive, Search, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Email {
  id: string;
  from: string;
  email: string;
  subject: string;
  snippet: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  category: "leads" | "clients" | "platform" | "general";
}

const mockEmails: Email[] = [
  { id: "e1", from: "Sarah Chen", email: "sarah@acmecorp.io", subject: "Interested in your AI consulting services", snippet: "Hi, I came across your work on LinkedIn and wanted to discuss a potential project for our team...", timestamp: "2026-04-16T09:15:00Z", read: false, starred: false, category: "leads" },
  { id: "e2", from: "Meta Ads", email: "noreply@business.facebook.com", subject: "Campaign 'Spring Launch' budget 80% spent", snippet: "Your campaign has spent $992 of $1,240 budget. Estimated to exhaust in 2 days at current pace.", timestamp: "2026-04-16T08:42:00Z", read: false, starred: false, category: "platform" },
  { id: "e3", from: "James Miller", email: "james@skylight.dev", subject: "Re: Cabin renders — revision needed", snippet: "The client loved the exterior shots but wants warmer lighting on the interior views. Can we get...", timestamp: "2026-04-16T08:30:00Z", read: false, starred: true, category: "clients" },
  { id: "e4", from: "Google Ads", email: "ads-noreply@google.com", subject: "Performance alert: CTR drop on 'Brand Awareness'", snippet: "Your campaign CTR dropped 23% compared to last week. Consider refreshing creative assets.", timestamp: "2026-04-16T07:55:00Z", read: false, starred: false, category: "platform" },
  { id: "e5", from: "Stripe", email: "notifications@stripe.com", subject: "Payment received: $2,400.00 from Skylight Properties", snippet: "A payment of $2,400.00 USD was successfully processed. View receipt and details in your dashboard.", timestamp: "2026-04-16T07:20:00Z", read: true, starred: true, category: "platform" },
  { id: "e6", from: "Maria López", email: "maria@designstudio.mx", subject: "Quote request: Branding package for new venture", snippet: "We're launching a sustainability-focused brand and need complete visual identity. Budget around...", timestamp: "2026-04-15T22:10:00Z", read: false, starred: false, category: "leads" },
  { id: "e7", from: "n8n Workflow", email: "noreply@n8n.cloud", subject: "Workflow 'Lead Enrichment' failed — retry 2/3", snippet: "Node 'HTTP Request' returned 429. Rate limit exceeded on Clearbit API. Next retry in 5 minutes.", timestamp: "2026-04-15T21:45:00Z", read: true, starred: false, category: "platform" },
  { id: "e8", from: "David Park", email: "david@techventures.co", subject: "Follow-up: Meeting confirmed for Thursday", snippet: "Looking forward to our call on Thursday at 2pm EST. I'll send a Zoom link the morning of.", timestamp: "2026-04-15T19:30:00Z", read: true, starred: false, category: "clients" },
  { id: "e9", from: "Calendly", email: "notifications@calendly.com", subject: "New booking: Discovery Call with Alex Rivera", snippet: "Alex Rivera has booked a 30-min Discovery Call on April 18th at 10:00 AM. View event details.", timestamp: "2026-04-15T18:00:00Z", read: true, starred: true, category: "leads" },
  { id: "e10", from: "Meta Ads", email: "noreply@business.facebook.com", subject: "Ad rejected: 'Video B — Cabin Tour' policy violation", snippet: "Your ad was not approved due to policy violation: Misleading claims. Edit your ad to comply.", timestamp: "2026-04-15T16:20:00Z", read: true, starred: false, category: "platform" },
  { id: "e11", from: "Oscar Mendez", email: "oscar@openclaw.dev", subject: "Weekly sync notes — action items inside", snippet: "Here are the notes from our weekly sync. Key items: 1) Finalize trading strategy doc, 2) Review...", timestamp: "2026-04-15T15:00:00Z", read: true, starred: false, category: "general" },
  { id: "e12", from: "Ana Torres", email: "ana@realestate.cl", subject: "Re: Proposal for 3D visualization services", snippet: "We reviewed the proposal and have a few questions about the timeline and deliverable formats...", timestamp: "2026-04-15T14:15:00Z", read: true, starred: false, category: "clients" },
  { id: "e13", from: "Stripe", email: "notifications@stripe.com", subject: "Subscription renewed: Pro Plan — $49/mo", snippet: "Your Pro Plan subscription has been renewed. Next billing date: May 15, 2026.", timestamp: "2026-04-15T12:00:00Z", read: true, starred: false, category: "platform" },
  { id: "e14", from: "LinkedIn", email: "notifications@linkedin.com", subject: "5 people viewed your profile this week", snippet: "Your profile was viewed by people from tech, real estate, and consulting industries. See who viewed you.", timestamp: "2026-04-15T10:00:00Z", read: true, starred: false, category: "general" },
  { id: "e15", from: "Roberto Vega", email: "roberto@investgroup.pe", subject: "Inquiry: AI-powered property analysis tool", snippet: "Our fund is interested in an AI tool for property market analysis. Would love to explore a partnership...", timestamp: "2026-04-14T23:30:00Z", read: false, starred: false, category: "leads" },
];

const filterTabs = [
  { key: "all", label: "All" },
  { key: "leads", label: "Leads" },
  { key: "clients", label: "Clients" },
  { key: "platform", label: "Platform Alerts" },
] as const;

type FilterKey = (typeof filterTabs)[number]["key"];

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const categoryColors: Record<string, string> = {
  leads: "bg-accent-blue/20 text-accent-blue",
  clients: "bg-primary/20 text-primary",
  platform: "bg-warning/20 text-warning",
  general: "bg-muted text-muted-foreground",
};

export default function InboxPage() {
  const [emails, setEmails] = useState(mockEmails);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = emails;
    if (filter !== "all") list = list.filter((e) => e.category === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.from.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q) || e.snippet.toLowerCase().includes(q));
    }
    return list;
  }, [emails, filter, search]);

  const selected = emails.find((e) => e.id === selectedId);
  const unreadCount = emails.filter((e) => !e.read).length;

  const markRead = (id: string) => setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
  const toggleStar = (id: string) => setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
  const archive = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectEmail = (id: string) => {
    setSelectedId(id);
    markRead(id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold gradient-text">Inbox</h1>
        {unreadCount > 0 && <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30">{unreadCount} unread</Badge>}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                filter === tab.key ? "bg-accent-blue text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails..." className="pl-9 bg-white/5 border-white/10" />
        </div>
      </div>

      {/* Split pane */}
      <div className="flex gap-4 min-h-[calc(100vh-16rem)]">
        {/* Email list */}
        <Card className={cn("glass-card overflow-hidden flex-shrink-0 transition-all", selected ? "hidden md:block md:w-[380px]" : "w-full md:w-[380px]")}>
          <div className="divide-y divide-white/5 overflow-auto max-h-[calc(100vh-18rem)] scrollbar-thin">
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No emails found</p>
              </div>
            )}
            {filtered.map((email) => (
              <button
                key={email.id}
                onClick={() => selectEmail(email.id)}
                className={cn(
                  "w-full text-left p-3 hover:bg-white/5 transition-colors flex gap-3",
                  selectedId === email.id && "bg-accent-blue/10 border-l-2 border-accent-blue",
                  !email.read && "bg-white/[0.02]"
                )}
              >
                {/* Avatar */}
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0", categoryColors[email.category])}>
                  {initials(email.from)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!email.read && <span className="w-2 h-2 rounded-full bg-accent-blue shrink-0" />}
                    <span className={cn("text-sm truncate", !email.read ? "font-semibold text-foreground" : "text-muted-foreground")}>{email.from}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{timeAgo(email.timestamp)}</span>
                  </div>
                  <p className={cn("text-xs truncate", !email.read ? "text-foreground" : "text-muted-foreground")}>{email.subject}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{email.snippet}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Preview pane */}
        <Card className={cn("glass-card flex-1 overflow-auto", !selected && "hidden md:flex md:items-center md:justify-center")}>
          {!selected ? (
            <div className="text-center text-muted-foreground p-8">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Select an email to preview</p>
            </div>
          ) : (
            <div className="p-5 space-y-4 animate-fade-in">
              {/* Back button mobile */}
              <button onClick={() => setSelectedId(null)} className="md:hidden text-sm text-accent-blue mb-2">← Back</button>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold", categoryColors[selected.category])}>
                    {initials(selected.from)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selected.from}</p>
                    <p className="text-xs text-muted-foreground">{selected.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleStar(selected.id)} className={selected.starred ? "text-warning" : "text-muted-foreground"}>
                    <Star className="h-4 w-4" fill={selected.starred ? "currentColor" : "none"} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => archive(selected.id)} className="text-muted-foreground hover:text-destructive">
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold">{selected.subject}</h2>
                <p className="text-xs text-muted-foreground mt-1">{new Date(selected.timestamp).toLocaleString()}</p>
              </div>

              <Badge className={categoryColors[selected.category]}>{selected.category}</Badge>

              <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap pt-2 border-t border-white/10">
                {selected.snippet}
                {"\n\n"}
                This is a preview of the email content. In a production environment, the full email body would be fetched from the email provider API and rendered here with proper HTML formatting.
                {"\n\n"}
                Best regards,{"\n"}
                {selected.from}
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button size="sm" className="bg-accent-blue hover:bg-accent-blue/80 text-white">Reply</Button>
                <Button size="sm" variant="outline" className="border-white/10">Forward</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
