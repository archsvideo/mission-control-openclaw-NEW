import type {
  Agent, Task, Trade, TradeAlert, PairPerformance, RiskMetrics,
  CampaignCreative, ABHypothesis, FunnelStep, IntegrationStatus,
  TimelineEvent, ContentCalendarItem, WorkflowCheckpoint,
  Lead, CompetitorEntry, RevitJob, ContractValidation, CostGuardrail, MemoryEntry
} from "@/types/models";

export const agents: Agent[] = [
  { id: "a1", name: "Chief Orchestrator", role: "chief-orchestrator", type: "Orchestrator", status: "running", lastActive: "2026-03-19T14:30:00Z", tasksCompleted: 892, uptime: "30d 4h", description: "Coordinates all sub-agents and manages escalations", heartbeat: "2026-03-19T14:30:00Z", currentTask: "Monitoring sub-agent health", costToday: 2.14, successRate: 99.2 },
  { id: "a2", name: "Trading Orchestrator", role: "trading-orchestrator", type: "Trading", status: "running", lastActive: "2026-03-19T14:28:00Z", tasksCompleted: 347, uptime: "12d 4h", description: "Executes swing trades on crypto pairs", heartbeat: "2026-03-19T14:28:00Z", currentTask: "Monitoring BTC/USDT position", costToday: 1.87, successRate: 72.4 },
  { id: "a3", name: "Lead Orchestrator", role: "lead-orchestrator", type: "Sales", status: "running", lastActive: "2026-03-19T14:25:00Z", tasksCompleted: 156, uptime: "8d 2h", description: "Manages lead pipeline and follow-ups", heartbeat: "2026-03-19T14:25:00Z", currentTask: "Scoring new inbound leads", costToday: 0.92, successRate: 85.1 },
  { id: "a4", name: "Skylight CRO", role: "skylight-cro-orchestrator", type: "Marketing", status: "running", lastActive: "2026-03-19T14:20:00Z", tasksCompleted: 83, uptime: "5d 11h", description: "Optimizes ad creatives and landing pages", heartbeat: "2026-03-19T14:20:00Z", currentTask: "Analyzing creative performance", costToday: 1.45, successRate: 78.3 },
  { id: "a5", name: "Radar Scout", role: "radar-orchestrator", type: "Intelligence", status: "idle", lastActive: "2026-03-19T13:00:00Z", tasksCompleted: 234, uptime: "15d 8h", description: "Monitors competitor content and patterns", heartbeat: "2026-03-19T13:00:00Z", currentTask: "Idle — next scan in 2h", costToday: 0.34, successRate: 91.7 },
  { id: "a6", name: "Revit Automator", role: "revit-orchestrator", type: "Automation", status: "paused", lastActive: "2026-03-19T12:00:00Z", tasksCompleted: 67, uptime: "2d 8h", description: "Runs Revit batch jobs and automations", heartbeat: "2026-03-19T12:00:00Z", currentTask: "Paused — awaiting job queue", costToday: 0.0, successRate: 88.9 },
  { id: "a7", name: "Tracking Diagnostics", role: "tracking-diagnostics", type: "ETL", status: "running", lastActive: "2026-03-19T14:29:00Z", tasksCompleted: 1204, uptime: "30d 2h", description: "Monitors GA4/GTM/booking tracking health", heartbeat: "2026-03-19T14:29:00Z", currentTask: "Validating GA4 event stream", costToday: 0.56, successRate: 96.8 },
  { id: "a8", name: "Email Follow-up Writer", role: "email-followup-writer", type: "Communication", status: "error", lastActive: "2026-03-19T10:15:00Z", tasksCompleted: 56, uptime: "0d 0h", description: "Drafts and sends follow-up emails", heartbeat: "2026-03-19T10:15:00Z", currentTask: "Stopped — Gmail auth failure", costToday: 0.0, successRate: 64.3 },
];

export const tasks: Task[] = [
  { id: "t1", title: "Analyze BTC/USDT divergence", description: "RSI divergence detected on 4H", status: "running", priority: "high", assignedAgent: "a2", createdAt: "2026-03-19T08:00:00Z", updatedAt: "2026-03-19T14:00:00Z", tags: ["trading", "crypto"] },
  { id: "t2", title: "Write Q1 blog post", description: "Draft quarterly review", status: "inbox", priority: "medium", createdAt: "2026-03-18T10:00:00Z", updatedAt: "2026-03-18T10:00:00Z", tags: ["content"] },
  { id: "t3", title: "Fix Gmail SMTP auth", description: "Token expired, needs refresh", status: "blocked", priority: "critical", assignedAgent: "a8", createdAt: "2026-03-19T10:00:00Z", updatedAt: "2026-03-19T10:15:00Z", tags: ["integration", "email"] },
  { id: "t4", title: "Sync GA4 weekly report", description: "Pull last 7 days of data", status: "waiting", priority: "low", assignedAgent: "a7", createdAt: "2026-03-19T06:00:00Z", updatedAt: "2026-03-19T06:00:00Z", tags: ["analytics"] },
  { id: "t5", title: "Deploy new ad creatives", description: "Upload 3 new variants to Meta", status: "done", priority: "medium", assignedAgent: "a4", createdAt: "2026-03-17T09:00:00Z", updatedAt: "2026-03-18T16:00:00Z", tags: ["marketing", "meta"] },
  { id: "t6", title: "Monitor ETH position risk", description: "Check margin levels", status: "running", priority: "high", assignedAgent: "a2", createdAt: "2026-03-19T12:00:00Z", updatedAt: "2026-03-19T14:20:00Z", tags: ["trading"] },
  { id: "t7", title: "Score inbound leads", description: "Process 12 new leads from landing page", status: "running", priority: "high", assignedAgent: "a3", createdAt: "2026-03-19T07:00:00Z", updatedAt: "2026-03-19T14:00:00Z", tags: ["leads"] },
  { id: "t8", title: "Optimize landing page CTA", description: "A/B test button colors", status: "waiting", priority: "low", createdAt: "2026-03-18T14:00:00Z", updatedAt: "2026-03-18T14:00:00Z", tags: ["marketing"] },
];

export const trades: Trade[] = [
  { id: "tr1", symbol: "BTC/USDT", direction: "long", status: "open", entryPrice: 67450, currentPrice: 68920, quantity: 0.5, pnl: 735, pnlPercent: 2.18, unrealizedR: 1.2, openedAt: "2026-03-17T10:00:00Z", stopLoss: 66000, takeProfit: 72000 },
  { id: "tr2", symbol: "ETH/USDT", direction: "long", status: "open", entryPrice: 3420, currentPrice: 3385, quantity: 5, pnl: -175, pnlPercent: -1.02, unrealizedR: -0.6, openedAt: "2026-03-18T14:00:00Z", stopLoss: 3300, takeProfit: 3800 },
  { id: "tr3", symbol: "SOL/USDT", direction: "short", status: "closed", entryPrice: 185, currentPrice: 172, exitPrice: 172, quantity: 20, pnl: 260, pnlPercent: 7.03, unrealizedR: 2.1, openedAt: "2026-03-15T08:00:00Z", closedAt: "2026-03-18T11:00:00Z" },
  { id: "tr4", symbol: "XBT/USD", direction: "long", status: "closed", entryPrice: 67200, currentPrice: 67800, exitPrice: 67800, quantity: 0.3, pnl: 180, pnlPercent: 0.89, unrealizedR: 0.5, openedAt: "2026-03-10T15:30:00Z", closedAt: "2026-03-16T15:30:00Z" },
  { id: "tr5", symbol: "DOGE/USDT", direction: "long", status: "open", entryPrice: 0.082, currentPrice: 0.089, quantity: 50000, pnl: 350, pnlPercent: 8.54, unrealizedR: 2.8, openedAt: "2026-03-19T06:00:00Z", stopLoss: 0.075, takeProfit: 0.1 },
];

export const tradeAlerts: TradeAlert[] = [
  { id: "ta1", type: "OPEN", symbol: "BTC/USDT", message: "Long entry at $67,450", timestamp: "2026-03-17T10:00:00Z" },
  { id: "ta2", type: "OPEN", symbol: "ETH/USDT", message: "Long entry at $3,420", timestamp: "2026-03-18T14:00:00Z" },
  { id: "ta3", type: "CLOSE", symbol: "SOL/USDT", message: "Short closed at $172 (+7.03%)", timestamp: "2026-03-18T11:00:00Z" },
  { id: "ta4", type: "TP", symbol: "XBT/USD", message: "Take profit hit at $67,800", timestamp: "2026-03-16T15:30:00Z" },
  { id: "ta5", type: "OPEN", symbol: "DOGE/USDT", message: "Long entry at $0.082", timestamp: "2026-03-19T06:00:00Z" },
  { id: "ta6", type: "STOP", symbol: "TEST/USDT", message: "Stop loss triggered at $1.20 (-5.2%)", timestamp: "2026-03-19T09:00:00Z" },
];

export const pairPerformance: PairPerformance[] = [
  { pair: "SOL/USDT", ev: 142, winRate: 68, profitFactor: 2.1, trades: 22 },
  { pair: "XBT/USD", ev: 98, winRate: 61, profitFactor: 1.8, trades: 18 },
  { pair: "ETH/USDT", ev: -23, winRate: 48, profitFactor: 0.9, trades: 31 },
  { pair: "BTC/USDT", ev: 210, winRate: 72, profitFactor: 2.6, trades: 15 },
  { pair: "DOGE/USDT", ev: 45, winRate: 55, profitFactor: 1.3, trades: 9 },
];

export const riskMetrics: RiskMetrics = {
  riskPerTrade: 1.5,
  openRisk: 4.2,
  dailyDD: -0.8,
  consecutiveLosses: 1,
  killSwitchActive: false,
};

export const campaigns: CampaignCreative[] = [
  { id: "c1", name: "Spring Launch - Video A", creativeId: "CR-001", adsetId: "AS-01", platform: "meta", status: "active", spend: 1240, impressions: 85000, clicks: 2100, conversions: 42, ctr: 2.47, cpa: 29.52, roas: 3.2, lpv: 1800, beginCheckout: 120, recommendation: "Scale — strong ROAS", startDate: "2026-03-01" },
  { id: "c2", name: "Retargeting - Carousel", creativeId: "CR-002", adsetId: "AS-01", platform: "meta", status: "active", spend: 680, impressions: 32000, clicks: 960, conversions: 28, ctr: 3.0, cpa: 24.29, roas: 4.1, lpv: 820, beginCheckout: 95, recommendation: "Maintain — consistent performer", startDate: "2026-03-05" },
  { id: "c3", name: "Search - Brand Terms", creativeId: "CR-003", adsetId: "AS-02", platform: "google", status: "active", spend: 520, impressions: 12000, clicks: 1800, conversions: 65, ctr: 15.0, cpa: 8.0, roas: 8.5, lpv: 1500, beginCheckout: 200, recommendation: "Top performer — protect budget", startDate: "2026-02-15" },
  { id: "c4", name: "Display - Awareness", creativeId: "CR-004", adsetId: "AS-03", platform: "google", status: "paused", spend: 2100, impressions: 450000, clicks: 4500, conversions: 18, ctr: 1.0, cpa: 116.67, roas: 0.8, lpv: 3200, beginCheckout: 25, recommendation: "Kill — below ROAS threshold", startDate: "2026-02-01", endDate: "2026-03-10" },
  { id: "c5", name: "UGC Test - Short Form", creativeId: "CR-005", adsetId: "AS-04", platform: "tiktok", status: "active", spend: 340, impressions: 120000, clicks: 3600, conversions: 15, ctr: 3.0, cpa: 22.67, roas: 2.9, lpv: 2800, beginCheckout: 60, recommendation: "Test further — promising CPM", startDate: "2026-03-12" },
  { id: "c6", name: "Spring Launch - Video B", creativeId: "CR-001", adsetId: "AS-05", platform: "meta", status: "active", spend: 450, impressions: 28000, clicks: 700, conversions: 12, ctr: 2.5, cpa: 37.5, roas: 2.1, lpv: 600, beginCheckout: 40, recommendation: "⚠️ Duplicate CR-001 in AS-05", startDate: "2026-03-10" },
];

export const abHypotheses: ABHypothesis[] = [
  { id: "ab1", name: "CTA Color Test", hypothesis: "Green CTA will outperform blue by 15%+", status: "running", variant: "Green vs Blue", metric: "begin_checkout rate", result: undefined },
  { id: "ab2", name: "Headline Length", hypothesis: "Short headlines (<8 words) convert better", status: "concluded", variant: "Short vs Long", metric: "CTR", result: "Short +22% CTR (p=0.03)" },
  { id: "ab3", name: "Social Proof Placement", hypothesis: "Above-fold testimonials increase LPV→checkout", status: "draft", variant: "Above vs Below fold", metric: "LPV to checkout rate" },
];

export const funnelSteps: FunnelStep[] = [
  { label: "LPV", value: 10720 },
  { label: "Add to Cart", value: 2840, rate: 26.5 },
  { label: "Begin Checkout", value: 540, rate: 19.0 },
  { label: "Booking / Purchase", value: 162, rate: 30.0 },
];

export const integrations: IntegrationStatus[] = [
  { id: "i1", name: "Gmail", type: "gmail", health: "down", lastSync: "2026-03-19T10:15:00Z", latency: 0, lastError: "OAuth token expired", message: "OAuth token expired", icon: "Mail" },
  { id: "i2", name: "Google Analytics 4", type: "ga4", health: "healthy", lastSync: "2026-03-19T14:00:00Z", latency: 120, lastError: "", message: "Syncing every 15 min", icon: "BarChart3" },
  { id: "i3", name: "Google Tag Manager", type: "gtm", health: "healthy", lastSync: "2026-03-19T13:45:00Z", latency: 85, lastError: "", message: "3 active tags", icon: "Tag" },
  { id: "i4", name: "Meta Ads", type: "meta", health: "degraded", lastSync: "2026-03-19T12:30:00Z", latency: 2400, lastError: "Rate limit hit 3x today", message: "Rate limit warnings", icon: "Megaphone" },
  { id: "i5", name: "Slack", type: "slack", health: "healthy", lastSync: "2026-03-19T14:28:00Z", latency: 45, lastError: "", message: "Connected to #alerts", icon: "MessageSquare" },
  { id: "i6", name: "Stripe", type: "stripe", health: "not_configured", lastSync: "", latency: 0, lastError: "", message: "Not yet connected", icon: "CreditCard" },
  { id: "i7", name: "Kraken", type: "kraken", health: "healthy", lastSync: "2026-03-19T14:29:00Z", latency: 67, lastError: "", message: "Live price feed active", icon: "Waves" },
];

export const timeline: TimelineEvent[] = [
  { id: "e1", type: "trade_opened", title: "BTC/USDT position opened", description: "Long 0.5 BTC at $67,450", timestamp: "2026-03-19T14:30:00Z", severity: "info" },
  { id: "e2", type: "integration", title: "Gmail connection failed", description: "OAuth token expired", timestamp: "2026-03-19T10:15:00Z", severity: "error" },
  { id: "e3", type: "contract_validation_failed", title: "Email agent output rejected", description: "Schema validation failed on follow-up draft — missing subject field", timestamp: "2026-03-19T10:16:00Z", severity: "error" },
  { id: "e4", type: "retry_triggered", title: "Retry: email-followup-writer", description: "Auto-retry #1 after contract validation failure", timestamp: "2026-03-19T10:17:00Z", severity: "warning" },
  { id: "e5", type: "escalation_to_human", title: "Escalation: Email agent", description: "Retry failed — escalated to human review", timestamp: "2026-03-19T10:18:00Z", severity: "error" },
  { id: "e6", type: "creative_published", title: "New ad creatives deployed", description: "3 variants uploaded to Meta Ads", timestamp: "2026-03-18T16:00:00Z", severity: "success" },
  { id: "e7", type: "trade_closed", title: "SOL/USDT short closed", description: "Profit: +$260 (+7.03%)", timestamp: "2026-03-18T11:00:00Z", severity: "success" },
  { id: "e8", type: "delegated_to_subagent", title: "Task delegated to Radar Scout", description: "Competitor scan #47 assigned", timestamp: "2026-03-18T08:00:00Z", severity: "info" },
  { id: "e9", type: "lead_updated", title: "Lead qualified: Acme Corp", description: "Score updated to 82, moved to Qualified stage", timestamp: "2026-03-19T11:00:00Z", severity: "success" },
  { id: "e10", type: "email_sent", title: "Follow-up sent to DataFlow Inc", description: "Meeting booking request — 3rd touch", timestamp: "2026-03-19T09:30:00Z", severity: "info" },
  { id: "e11", type: "gtm_published", title: "GTM container published", description: "Version 14 — added purchase event tag", timestamp: "2026-03-19T13:45:00Z", severity: "success" },
  { id: "e12", type: "revit_job_started", title: "Revit batch job started", description: "Floor plan export — 12 sheets", timestamp: "2026-03-19T12:00:00Z", severity: "info" },
];

export const contentCalendar: ContentCalendarItem[] = [
  { id: "cc1", date: "2026-03-19", contentId: "POST-001", channel: "linkedin", title: "AI Agents in Practice — 3 Lessons", status: "done", owner: "Oscar", assetLinks: ["https://example.com/post1-graphic.png"], notes: "2.4k impressions" },
  { id: "cc2", date: "2026-03-19", contentId: "POST-002", channel: "instagram", title: "Behind the scenes: Mission Control", status: "in_progress", owner: "Oscar", assetLinks: [], notes: "Shooting B-roll today" },
  { id: "cc3", date: "2026-03-20", contentId: "POST-003", channel: "linkedin", title: "Why solo founders need AI ops", status: "planned", owner: "Oscar", assetLinks: [], notes: "" },
  { id: "cc4", date: "2026-03-20", contentId: "POST-004", channel: "linkedin", title: "Before vs After: Manual → AI-enhanced workflow", status: "planned", owner: "Oscar", assetLinks: ["[old-project.pdf]", "[new-ia-render-1.png]", "[new-ia-render-2.png]", "[final-copy.docx]"], notes: "Side-by-side comparison concept" },
  { id: "cc5", date: "2026-03-21", contentId: "POST-005", channel: "instagram", title: "Tool stack reveal — Reels format", status: "planned", owner: "Oscar", assetLinks: [], notes: "15-second reel" },
  { id: "cc6", date: "2026-03-18", contentId: "POST-000", channel: "linkedin", title: "Launch week recap", status: "done", owner: "Oscar", assetLinks: [], notes: "Solid engagement" },
];

export const workflowCheckpoints: WorkflowCheckpoint[] = [
  { id: "wf1", label: "Record priorities", time: "morning", completed: false, note: "" },
  { id: "wf2", label: "Progress update", time: "midday", completed: false, note: "" },
  { id: "wf3", label: "Done log + blockers", time: "end_of_day", completed: false, note: "" },
];

export const leads: Lead[] = [
  { id: "l1", name: "Sarah Chen", company: "Acme Corp", source: "LinkedIn Ad", score: 82, owner: "Oscar", stage: "qualified", lastContact: "2026-03-19T09:00:00Z", nextAction: "Send case study", bookingStatus: "none", emailHistory: [{ date: "2026-03-17T10:00:00Z", subject: "Intro — OpenClaw for Acme", status: "opened" }, { date: "2026-03-19T09:00:00Z", subject: "Follow-up: case study", status: "sent" }], createdAt: "2026-03-15T08:00:00Z" },
  { id: "l2", name: "James Miller", company: "DataFlow Inc", source: "Website", score: 65, owner: "Oscar", stage: "contacted", lastContact: "2026-03-18T14:00:00Z", nextAction: "Book discovery call", bookingStatus: "pending", emailHistory: [{ date: "2026-03-18T14:00:00Z", subject: "Re: Your inquiry", status: "replied" }], createdAt: "2026-03-16T12:00:00Z" },
  { id: "l3", name: "Maria Gonzalez", company: "BuildRight", source: "Referral", score: 91, owner: "Oscar", stage: "meeting", lastContact: "2026-03-19T11:00:00Z", nextAction: "Prepare demo", bookingStatus: "booked", emailHistory: [{ date: "2026-03-17T10:00:00Z", subject: "Intro from Alex", status: "replied" }, { date: "2026-03-19T11:00:00Z", subject: "Meeting confirmed — Thursday", status: "opened" }], createdAt: "2026-03-14T09:00:00Z" },
  { id: "l4", name: "Tom Baker", company: "ScaleUp.io", source: "Google Ad", score: 45, owner: "Oscar", stage: "new", lastContact: "", nextAction: "Initial outreach", bookingStatus: "none", emailHistory: [], createdAt: "2026-03-19T13:00:00Z" },
  { id: "l5", name: "Priya Patel", company: "UrbanArch", source: "LinkedIn Ad", score: 73, owner: "Oscar", stage: "proposal", lastContact: "2026-03-18T16:00:00Z", nextAction: "Follow up on proposal", bookingStatus: "completed", emailHistory: [{ date: "2026-03-15T10:00:00Z", subject: "Proposal: AI Ops Package", status: "opened" }, { date: "2026-03-18T16:00:00Z", subject: "Any questions on the proposal?", status: "sent" }], createdAt: "2026-03-10T10:00:00Z" },
  { id: "l6", name: "Derek Olson", company: "CraftBuild", source: "Website", score: 28, owner: "Oscar", stage: "lost", lastContact: "2026-03-12T10:00:00Z", nextAction: "Archive", bookingStatus: "no_show", emailHistory: [{ date: "2026-03-12T10:00:00Z", subject: "Following up on our call", status: "sent" }], createdAt: "2026-03-05T08:00:00Z" },
];

export const competitors: CompetitorEntry[] = [
  { id: "cp1", sourceUrl: "https://linkedin.com/post/competitor1-ai-ops", platform: "LinkedIn", engagement: 4200, hookType: "Contrarian take", format: "Carousel", pattern: "Problem → Myth → Reality → CTA", testedInternally: false, createdAt: "2026-03-18T10:00:00Z" },
  { id: "cp2", sourceUrl: "https://instagram.com/p/competitor2-bts", platform: "Instagram", engagement: 12000, hookType: "Behind the scenes", format: "Reel", pattern: "Day-in-the-life → Tool reveal → Result", testedInternally: true, createdAt: "2026-03-17T14:00:00Z" },
  { id: "cp3", sourceUrl: "https://twitter.com/competitor3/thread", platform: "Twitter/X", engagement: 890, hookType: "Thread/listicle", format: "Thread", pattern: "Bold claim → 7 lessons → Summary", testedInternally: false, createdAt: "2026-03-16T09:00:00Z" },
  { id: "cp4", sourceUrl: "https://tiktok.com/@competitor4/video1", platform: "TikTok", engagement: 45000, hookType: "Before/After", format: "Short video", pattern: "Problem → Manual clip → AI clip → Reaction", testedInternally: false, createdAt: "2026-03-19T08:00:00Z" },
];

export const revitJobs: RevitJob[] = [
  { id: "rj1", name: "Floor Plan Export — Building A", template: "floor-plan-export", status: "completed", runtime: 142, logs: ["Started export", "Processing 12 sheets", "Export complete"], createdAt: "2026-03-19T10:00:00Z", completedAt: "2026-03-19T10:02:22Z" },
  { id: "rj2", name: "Section Views — Phase 2", template: "section-views", status: "running", runtime: 67, logs: ["Started processing", "Generating section 3/8"], createdAt: "2026-03-19T13:00:00Z" },
  { id: "rj3", name: "Material Schedule Update", template: "material-schedule", status: "failed", runtime: 23, logs: ["Started processing", "Error: missing material mapping", "Job failed — retry queued"], createdAt: "2026-03-19T11:00:00Z" },
  { id: "rj4", name: "3D Render Batch", template: "3d-render", status: "queued", runtime: 0, logs: [], createdAt: "2026-03-19T14:00:00Z" },
  { id: "rj5", name: "Door Schedule Refresh", template: "door-schedule", status: "retrying", runtime: 15, logs: ["Attempt 1 failed", "Retrying..."], createdAt: "2026-03-19T12:30:00Z" },
];

export const contractValidations: ContractValidation[] = [
  { agentId: "a1", agentName: "Chief Orchestrator", totalChecks: 892, passed: 890, failed: 2, lastFailure: "2026-03-15T10:00:00Z" },
  { agentId: "a2", agentName: "Trading Orchestrator", totalChecks: 347, passed: 341, failed: 6, lastFailure: "2026-03-19T08:00:00Z" },
  { agentId: "a3", agentName: "Lead Orchestrator", totalChecks: 156, passed: 154, failed: 2 },
  { agentId: "a4", agentName: "Skylight CRO", totalChecks: 83, passed: 81, failed: 2, lastFailure: "2026-03-18T14:00:00Z" },
  { agentId: "a5", agentName: "Radar Scout", totalChecks: 234, passed: 234, failed: 0 },
  { agentId: "a6", agentName: "Revit Automator", totalChecks: 67, passed: 62, failed: 5, lastFailure: "2026-03-19T11:00:00Z" },
  { agentId: "a7", agentName: "Tracking Diagnostics", totalChecks: 1204, passed: 1200, failed: 4 },
  { agentId: "a8", agentName: "Email Follow-up Writer", totalChecks: 56, passed: 42, failed: 14, lastFailure: "2026-03-19T10:16:00Z" },
];

export const costGuardrails: CostGuardrail[] = [
  { module: "Trading Ops", budgetLimit: 50, currentSpend: 28.4, percentUsed: 56.8, status: "green", repeatedFailures: 0, pauseCandidate: false },
  { module: "Lead-to-Meeting", budgetLimit: 30, currentSpend: 18.2, percentUsed: 60.7, status: "green", repeatedFailures: 0, pauseCandidate: false },
  { module: "Skylight CRO", budgetLimit: 40, currentSpend: 32.1, percentUsed: 80.3, status: "yellow", repeatedFailures: 2, pauseCandidate: false },
  { module: "Competitor Radar", budgetLimit: 15, currentSpend: 4.8, percentUsed: 32.0, status: "green", repeatedFailures: 0, pauseCandidate: false },
  { module: "Revit Automation", budgetLimit: 20, currentSpend: 19.8, percentUsed: 99.0, status: "red", repeatedFailures: 5, pauseCandidate: true },
  { module: "Email Agent", budgetLimit: 10, currentSpend: 0, percentUsed: 0, status: "green", repeatedFailures: 8, pauseCandidate: true },
  { module: "Tracking/ETL", budgetLimit: 25, currentSpend: 12.4, percentUsed: 49.6, status: "green", repeatedFailures: 0, pauseCandidate: false },
];

export const memoryEntries: MemoryEntry[] = [
  { id: "m1", type: "journal", title: "Day 1: Mission Control V4 launch", content: "Deployed all 10 modules. Chief orchestrator stable. Email agent needs Gmail fix. Trading running smooth.", tags: ["launch", "v4"], date: "2026-03-19" },
  { id: "m2", type: "lesson", title: "Gmail OAuth tokens expire every 7 days", content: "Need to implement proactive token refresh 24h before expiry. Current reactive approach causes agent downtime.", tags: ["integration", "gmail", "auth"], date: "2026-03-19" },
  { id: "m3", type: "decision", title: "Kill switch threshold: 3% daily DD", content: "Set kill switch at 3% daily drawdown. Consecutive losses limit: 4. After testing, 3% balances protection vs false triggers.", tags: ["trading", "risk"], date: "2026-03-18" },
  { id: "m4", type: "lesson", title: "Short-form video outperforms carousels 3:1", content: "TikTok and Reels consistently driving 3x engagement vs carousel formats. Reallocating 60% creative budget to video.", tags: ["marketing", "creative"], date: "2026-03-17" },
  { id: "m5", type: "journal", title: "Lead pipeline growing — need qualification filter", content: "12 new inbound leads this week. Need to tighten scoring to focus on high-intent prospects only.", tags: ["leads", "process"], date: "2026-03-18" },
  { id: "m6", type: "decision", title: "Revit batch jobs: max 2 concurrent", content: "Limiting concurrent Revit jobs to 2 to prevent resource contention. Queue overflow handled by priority sorting.", tags: ["revit", "infra"], date: "2026-03-16" },
];
