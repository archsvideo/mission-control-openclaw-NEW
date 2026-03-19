import type { Agent, Task, Trade, CampaignCreative, IntegrationStatus, TimelineEvent, ContentCalendarItem, WorkflowCheckpoint } from "@/types/models";

export const agents: Agent[] = [
  { id: "a1", name: "TradeBot Alpha", type: "Trading", status: "running", lastActive: "2026-03-19T14:30:00Z", tasksCompleted: 147, uptime: "12d 4h", description: "Executes swing trades on crypto pairs" },
  { id: "a2", name: "ContentWriter", type: "Marketing", status: "idle", lastActive: "2026-03-19T13:00:00Z", tasksCompleted: 83, uptime: "5d 11h", description: "Generates ad copy and blog posts" },
  { id: "a3", name: "DataPipeline", type: "ETL", status: "running", lastActive: "2026-03-19T14:28:00Z", tasksCompleted: 1204, uptime: "30d 2h", description: "Syncs analytics data across platforms" },
  { id: "a4", name: "EmailAgent", type: "Communication", status: "error", lastActive: "2026-03-19T10:15:00Z", tasksCompleted: 56, uptime: "0d 0h", description: "Manages email outreach sequences" },
  { id: "a5", name: "AdOptimizer", type: "Marketing", status: "paused", lastActive: "2026-03-19T12:00:00Z", tasksCompleted: 34, uptime: "2d 8h", description: "Optimizes Meta & Google ad bids" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Analyze BTC/USDT divergence", description: "RSI divergence detected on 4H", status: "running", priority: "high", assignedAgent: "a1", createdAt: "2026-03-19T08:00:00Z", updatedAt: "2026-03-19T14:00:00Z", tags: ["trading", "crypto"] },
  { id: "t2", title: "Write Q1 blog post", description: "Draft quarterly review", status: "inbox", priority: "medium", createdAt: "2026-03-18T10:00:00Z", updatedAt: "2026-03-18T10:00:00Z", tags: ["content"] },
  { id: "t3", title: "Fix Gmail SMTP auth", description: "Token expired, needs refresh", status: "blocked", priority: "critical", assignedAgent: "a4", createdAt: "2026-03-19T10:00:00Z", updatedAt: "2026-03-19T10:15:00Z", tags: ["integration", "email"] },
  { id: "t4", title: "Sync GA4 weekly report", description: "Pull last 7 days of data", status: "waiting", priority: "low", assignedAgent: "a3", createdAt: "2026-03-19T06:00:00Z", updatedAt: "2026-03-19T06:00:00Z", tags: ["analytics"] },
  { id: "t5", title: "Deploy new ad creatives", description: "Upload 3 new variants to Meta", status: "done", priority: "medium", assignedAgent: "a5", createdAt: "2026-03-17T09:00:00Z", updatedAt: "2026-03-18T16:00:00Z", tags: ["marketing", "meta"] },
  { id: "t6", title: "Monitor ETH position risk", description: "Check margin levels", status: "running", priority: "high", assignedAgent: "a1", createdAt: "2026-03-19T12:00:00Z", updatedAt: "2026-03-19T14:20:00Z", tags: ["trading"] },
  { id: "t7", title: "Set up GTM conversion tag", description: "Add purchase event tracking", status: "inbox", priority: "medium", createdAt: "2026-03-19T07:00:00Z", updatedAt: "2026-03-19T07:00:00Z", tags: ["analytics", "gtm"] },
  { id: "t8", title: "Optimize landing page CTA", description: "A/B test button colors", status: "waiting", priority: "low", createdAt: "2026-03-18T14:00:00Z", updatedAt: "2026-03-18T14:00:00Z", tags: ["marketing"] },
];

export const trades: Trade[] = [
  { id: "tr1", symbol: "BTC/USDT", direction: "long", status: "open", entryPrice: 67450, currentPrice: 68920, quantity: 0.5, pnl: 735, pnlPercent: 2.18, openedAt: "2026-03-17T10:00:00Z", stopLoss: 66000, takeProfit: 72000 },
  { id: "tr2", symbol: "ETH/USDT", direction: "long", status: "open", entryPrice: 3420, currentPrice: 3385, quantity: 5, pnl: -175, pnlPercent: -1.02, openedAt: "2026-03-18T14:00:00Z", stopLoss: 3300, takeProfit: 3800 },
  { id: "tr3", symbol: "SOL/USDT", direction: "short", status: "closed", entryPrice: 185, currentPrice: 172, exitPrice: 172, quantity: 20, pnl: 260, pnlPercent: 7.03, openedAt: "2026-03-15T08:00:00Z", closedAt: "2026-03-18T11:00:00Z" },
  { id: "tr4", symbol: "AAPL", direction: "long", status: "closed", entryPrice: 178.5, currentPrice: 182.3, exitPrice: 182.3, quantity: 50, pnl: 190, pnlPercent: 2.13, openedAt: "2026-03-10T15:30:00Z", closedAt: "2026-03-16T15:30:00Z" },
  { id: "tr5", symbol: "DOGE/USDT", direction: "long", status: "open", entryPrice: 0.082, currentPrice: 0.089, quantity: 50000, pnl: 350, pnlPercent: 8.54, openedAt: "2026-03-19T06:00:00Z", stopLoss: 0.075, takeProfit: 0.1 },
];

export const campaigns: CampaignCreative[] = [
  { id: "c1", name: "Spring Launch - Video A", platform: "meta", status: "active", spend: 1240, impressions: 85000, clicks: 2100, conversions: 42, ctr: 2.47, cpa: 29.52, roas: 3.2, startDate: "2026-03-01" },
  { id: "c2", name: "Retargeting - Carousel", platform: "meta", status: "active", spend: 680, impressions: 32000, clicks: 960, conversions: 28, ctr: 3.0, cpa: 24.29, roas: 4.1, startDate: "2026-03-05" },
  { id: "c3", name: "Search - Brand Terms", platform: "google", status: "active", spend: 520, impressions: 12000, clicks: 1800, conversions: 65, ctr: 15.0, cpa: 8.0, roas: 8.5, startDate: "2026-02-15" },
  { id: "c4", name: "Display - Awareness", platform: "google", status: "paused", spend: 2100, impressions: 450000, clicks: 4500, conversions: 18, ctr: 1.0, cpa: 116.67, roas: 0.8, startDate: "2026-02-01", endDate: "2026-03-10" },
  { id: "c5", name: "UGC Test - Short Form", platform: "tiktok", status: "active", spend: 340, impressions: 120000, clicks: 3600, conversions: 15, ctr: 3.0, cpa: 22.67, roas: 2.9, startDate: "2026-03-12" },
];

export const integrations: IntegrationStatus[] = [
  { id: "i1", name: "Gmail", type: "gmail", health: "down", lastSync: "2026-03-19T10:15:00Z", message: "OAuth token expired", icon: "Mail" },
  { id: "i2", name: "Google Analytics 4", type: "ga4", health: "healthy", lastSync: "2026-03-19T14:00:00Z", message: "Syncing every 15 min", icon: "BarChart3" },
  { id: "i3", name: "Google Tag Manager", type: "gtm", health: "healthy", lastSync: "2026-03-19T13:45:00Z", message: "3 active tags", icon: "Tag" },
  { id: "i4", name: "Meta Ads", type: "meta", health: "degraded", lastSync: "2026-03-19T12:30:00Z", message: "Rate limit warnings", icon: "Megaphone" },
  { id: "i5", name: "Slack", type: "slack", health: "healthy", lastSync: "2026-03-19T14:28:00Z", message: "Connected to #alerts", icon: "MessageSquare" },
  { id: "i6", name: "Stripe", type: "stripe", health: "not_configured", lastSync: "", message: "Not yet connected", icon: "CreditCard" },
];

export const timeline: TimelineEvent[] = [
  { id: "e1", type: "trade", title: "BTC/USDT position opened", description: "Long 0.5 BTC at $67,450", timestamp: "2026-03-19T14:30:00Z", severity: "info" },
  { id: "e2", type: "integration", title: "Gmail connection failed", description: "OAuth token expired — needs manual refresh", timestamp: "2026-03-19T10:15:00Z", severity: "error" },
  { id: "e3", type: "agent", title: "EmailAgent stopped", description: "Crashed due to auth failure", timestamp: "2026-03-19T10:16:00Z", severity: "error" },
  { id: "e4", type: "campaign", title: "New ad creatives deployed", description: "3 variants uploaded to Meta Ads", timestamp: "2026-03-18T16:00:00Z", severity: "success" },
  { id: "e5", type: "task", title: "SOL/USDT short closed", description: "Profit: +$260 (+7.03%)", timestamp: "2026-03-18T11:00:00Z", severity: "success" },
  { id: "e6", type: "system", title: "DataPipeline 30-day uptime", description: "Milestone: 30 days continuous operation", timestamp: "2026-03-18T08:00:00Z", severity: "info" },
  { id: "e7", type: "campaign", title: "Display campaign paused", description: "ROAS below threshold (0.8x)", timestamp: "2026-03-10T09:00:00Z", severity: "warning" },
  { id: "e8", type: "agent", title: "TradeBot Alpha resumed", description: "Back online after maintenance", timestamp: "2026-03-19T06:00:00Z", severity: "success" },
  { id: "e9", type: "integration", title: "Meta Ads rate limiting", description: "API calls throttled — degraded sync", timestamp: "2026-03-19T12:30:00Z", severity: "warning" },
  { id: "e10", type: "trade", title: "DOGE/USDT position opened", description: "Long 50,000 DOGE at $0.082", timestamp: "2026-03-19T06:00:00Z", severity: "info" },
];

export const contentCalendar: ContentCalendarItem[] = [
  { id: "cc1", date: "2026-03-19", contentId: "POST-001", channel: "linkedin", title: "AI Agents in Practice — 3 Lessons", status: "done", owner: "Oscar", assetLinks: ["https://example.com/post1-graphic.png"], notes: "Performed well, 2.4k impressions" },
  { id: "cc2", date: "2026-03-19", contentId: "POST-002", channel: "instagram", title: "Behind the scenes: Mission Control setup", status: "in_progress", owner: "Oscar", assetLinks: [], notes: "Shooting B-roll today" },
  { id: "cc3", date: "2026-03-20", contentId: "POST-003", channel: "linkedin", title: "Why solo founders need AI ops", status: "planned", owner: "Oscar", assetLinks: [], notes: "" },
  { id: "cc4", date: "2026-03-20", contentId: "POST-004", channel: "linkedin", title: "Before vs After: Manual workflow → AI-enhanced workflow", status: "planned", owner: "Oscar", assetLinks: ["[old-project.pdf]", "[new-ia-render-1.png]", "[new-ia-render-2.png]", "[final-copy.docx]"], notes: "Concept: side-by-side comparison of manual PM workflow vs AI-augmented. Include old project PDF, new IA renders, and final copy." },
  { id: "cc5", date: "2026-03-21", contentId: "POST-005", channel: "instagram", title: "Tool stack reveal — Reels format", status: "planned", owner: "Oscar", assetLinks: [], notes: "15-second reel" },
  { id: "cc6", date: "2026-03-18", contentId: "POST-000", channel: "linkedin", title: "Launch week recap", status: "done", owner: "Oscar", assetLinks: ["https://example.com/recap.png"], notes: "Solid engagement" },
  { id: "cc7", date: "2026-03-17", contentId: "POST-REF", channel: "blog", title: "OpenClaw product philosophy", status: "done", owner: "Oscar", assetLinks: [], notes: "Published on blog" },
];

export const workflowCheckpoints: WorkflowCheckpoint[] = [
  { id: "wf1", label: "Record priorities", time: "morning", completed: false, note: "" },
  { id: "wf2", label: "Progress update", time: "midday", completed: false, note: "" },
  { id: "wf3", label: "Done log + blockers", time: "end_of_day", completed: false, note: "" },
];
