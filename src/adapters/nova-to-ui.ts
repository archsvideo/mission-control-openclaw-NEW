// src/adapters/nova-to-ui.ts
// Maps Nova/OpenClaw runtime state into exact UI model shapes from src/types/models.ts.
// Covers: agents, tasks, timeline, Meta campaigns, Meta integrations, trading risk.

// ---- Nova runtime shapes (read-only) ----
interface NovaAgent {
  id: string; name: string; status: string; currentTaskId: string | null;
  lastAction: string | null; lastSeenAt: string; nextTask: string | null; module: string;
}
interface NovaTask {
  id: string; title: string; module: string; status: string; priority: string;
  ownerAgent: string; lastUpdate: string; nextStep: string | null;
  blocker: string | null; startedAt: string | null; updatedAt: string; completedAt: string | null;
}
interface NovaTimelineEvent {
  id: string; ts: string; type: string; severity: string; module: string;
  agent: string; taskId: string | null; message: string; metadata: Record<string, unknown> | null;
}
export interface NovaState {
  updatedAt: string;
  mission: { status: string; focus: string; alerts: string[] };
  agents: NovaAgent[];
  tasks: NovaTask[];
  timeline: NovaTimelineEvent[];
  system: Record<string, { status: string; lastCheck: string; detail: string | null }>;
  modules: Record<string, { status: string }>;
}

// ---- Meta report shapes ----
interface MetaAdRow {
  ad_id: string; ad_name: string; effective_status: string;
  spend: number; ctr: number; cpc: number; lpv: number;
  checkout: number; lpv_per_dollar: number;
}
interface MetaCurrentState { generated_at: string; active_count: number; rows: MetaAdRow[]; }
interface MetaScorecard {
  ad_name: string; ad_id: string; role: string; score: number;
  verdict: string; confidence: string; reasons: string[];
}
interface MetaAction { type: string; ad_name: string; reason: string; confidence: string; }
interface MetaRecommendations {
  updatedAt: string; winner: MetaAdRow; challengers: MetaAdRow[];
  actions: MetaAction[]; scorecards: MetaScorecard[]; summary: string;
}

// ---- Trading report shapes ----
interface TradingRisk {
  riskPerTradePct: number; openRiskPct: number;
  killSwitchActive: boolean; consecutiveLosses: number;
}
export interface TradingState {
  updatedAt: string; environment: string; system_mode: string;
  trading_enabled: boolean; mode: string;
  risk: TradingRisk;
  broker: { pendingOrders: number; openOrders: unknown[]; recentOrders: unknown[] };
}

// ---- Status maps ----

const AGENT_STATUS: Record<string, string> = {
  idle: "idle", running: "running", blocked: "paused", error: "error", offline: "paused",
};
const TASK_STATUS: Record<string, string> = {
  queued: "inbox", running: "running", blocked: "blocked", done: "done", error: "blocked",
};
const TIMELINE_TYPE: Record<string, string> = {
  task_started: "task", task_progress: "task", task_blocked: "task",
  task_done: "task", task_error: "task",
  agent_status: "agent", system_health: "system", notification: "integration", info: "system",
};

function mapSeverity(severity: string, type: string): string {
  if (severity === "warn" || severity === "warning") return "warning";
  if (severity === "error" || severity === "critical") return "error";
  if (type === "task_done") return "success";
  return "info";
}

// ---- Agent/Task/Timeline adapters ----

export function adaptAgent(a: NovaAgent) {
  return {
    id: a.id,
    name: a.name,
    role: a.module,
    type: "runtime",
    status: AGENT_STATUS[a.status] ?? "paused",
    lastActive: a.lastSeenAt,
    tasksCompleted: 0,
    uptime: "—",
    description: a.lastAction || a.currentTaskId || "No description",
    heartbeat: a.lastSeenAt,
    currentTask: a.currentTaskId || a.nextTask || "Idle",
    costToday: 0,
    successRate: 0,
  };
}

export function adaptTask(t: NovaTask) {
  return {
    id: t.id,
    title: t.title,
    description: t.lastUpdate || t.nextStep || t.blocker || "",
    status: TASK_STATUS[t.status] ?? "inbox",
    priority: t.priority || "medium",
    assignedAgent: t.ownerAgent,
    createdAt: t.startedAt || t.updatedAt,
    updatedAt: t.updatedAt,
    tags: [t.module, t.priority].filter(Boolean),
  };
}

export function adaptTimelineEvent(e: NovaTimelineEvent) {
  return {
    id: e.id,
    type: TIMELINE_TYPE[e.type] ?? "system",
    title: e.message,
    description: [e.module, e.taskId].filter(Boolean).join(" · "),
    timestamp: e.ts,
    severity: mapSeverity(e.severity, e.type),
  };
}

// ---- Meta campaign adapter ----

const META_STATUS_MAP: Record<string, string> = {
  ACTIVE: "active", PAUSED: "paused", IN_PROCESS: "paused",
  DELETED: "completed", ARCHIVED: "completed",
};

function buildRecommendation(
  adName: string,
  actions: MetaAction[],
  scorecards: MetaScorecard[],
  isControl: boolean,
  isPaused: boolean
): string {
  const parts: string[] = [];
  if (isControl) parts.push("[CONTROL]");
  if (isPaused) parts.push("⚠ PAUSED — control-gap risk");
  const action = actions.find((a: MetaAction) => a.ad_name === adName);
  if (action) parts.push(`${action.type}: ${action.reason}`);
  const card = scorecards.find((s: MetaScorecard) => s.ad_name === adName);
  if (card) parts.push(`Score ${card.score} (${card.verdict})`);
  return parts.join(" · ") || "";
}

export function adaptMetaCampaigns(
  current: MetaCurrentState | null,
  recs: MetaRecommendations | null,
  top3Paused: boolean
) {
  const allAds: MetaAdRow[] = [];
  const actions = recs?.actions ?? [];
  const scorecards = recs?.scorecards ?? [];

  const seen = new Set<string>();
  if (current?.rows) {
    for (const r of current.rows) { allAds.push(r); seen.add(r.ad_id); }
  }
  if (recs?.winner && !seen.has(recs.winner.ad_id)) { allAds.push(recs.winner); seen.add(recs.winner.ad_id); }
  if (recs?.challengers) {
    for (const c of recs.challengers) {
      if (!seen.has(c.ad_id)) { allAds.push(c); seen.add(c.ad_id); }
    }
  }

  const TOP3_ID = "120245050696100334";

  return allAds.map((ad: MetaAdRow) => {
    const isTop3 = ad.ad_id === TOP3_ID;
    const effectiveStatus = isTop3 && top3Paused ? "PAUSED" : (ad.effective_status || "ACTIVE");
    const clicks = ad.cpc > 0 ? Math.round(ad.spend / ad.cpc) : 0;
    const impressions = ad.ctr > 0 && clicks > 0 ? Math.round(clicks / (ad.ctr / 100)) : 0;

    return {
      id: ad.ad_id,
      name: ad.ad_name,
      creativeId: ad.ad_id,
      adsetId: "",
      platform: "meta" as const,
      status: (META_STATUS_MAP[effectiveStatus] ?? "active") as "active" | "paused" | "completed",
      spend: ad.spend,
      impressions,
      clicks,
      conversions: ad.checkout || 0,
      ctr: ad.ctr,
      cpa: ad.checkout > 0 ? ad.spend / ad.checkout : 0,
      roas: ad.lpv_per_dollar || 0,
      lpv: ad.lpv || 0,
      beginCheckout: ad.checkout || 0,
      recommendation: buildRecommendation(ad.ad_name, actions, scorecards, isTop3, isTop3 && top3Paused),
      startDate: current?.generated_at || recs?.updatedAt || new Date().toISOString(),
    };
  });
}

// ---- Meta integrations adapter ----

export function adaptMetaIntegrations(pageBlocked: boolean, adsPartial: boolean, top3Paused: boolean) {
  const now = new Date().toISOString();
  const metaAds = {
    id: "meta",
    name: "Meta Ads",
    type: "meta" as const,
    health: (adsPartial ? "degraded" : "healthy") as "healthy" | "degraded" | "down" | "not_configured",
    lastSync: now,
    latency: 0,
    lastError: top3Paused ? "Control ad TOP3 is paused — control-gap risk" : "",
    message: adsPartial
      ? "Ads API partial: campaign read/pause works. Page/Inbox blocked."
      : "Ads API operational",
    icon: "📢",
  };
  const metaPage = {
    id: "meta-page",
    name: "Meta Page/Inbox",
    type: "meta" as const,
    health: (pageBlocked ? "down" : "healthy") as "healthy" | "degraded" | "down" | "not_configured",
    lastSync: now,
    latency: 0,
    lastError: pageBlocked ? "Page token expired (code 190/463). Missing pages_read_engagement." : "",
    message: pageBlocked
      ? "Page/Inbox/comments/feed blocked. Token expired, permissions missing."
      : "Page API operational",
    icon: "📄",
  };
  return [metaAds, metaPage];
}

// ---- Trading risk adapter ----

export function adaptTradingRisk(ts: TradingState) {
  return {
    riskPerTrade: ts.risk.riskPerTradePct,
    openRisk: ts.risk.openRiskPct,
    dailyDD: 0,
    consecutiveLosses: ts.risk.consecutiveLosses,
    killSwitchActive: ts.risk.killSwitchActive,
  };
}

// ---- Trading alerts adapter ----

export function adaptTradingAlerts(ts: TradingState) {
  const alerts: Array<{
    id: string;
    type: "OPEN" | "CLOSE" | "STOP" | "TP" | "TIME-STOP";
    symbol: string;
    message: string;
    timestamp: string;
  }> = [];

  if (ts.mode === "demo-v2" && ts.environment === "OKX Demo") {
    alerts.push({
      id: "alert-demo-only",
      type: "STOP",
      symbol: "SYSTEM",
      message: "Trading stack is demo-only. No live execution lane validated.",
      timestamp: ts.updatedAt,
    });
  }

  if (ts.broker.pendingOrders === 0 && ts.broker.openOrders.length === 0) {
    alerts.push({
      id: "alert-no-positions",
      type: "STOP",
      symbol: "SYSTEM",
      message: "No open strategy positions and no pending orders. Edge not validated by closed trades.",
      timestamp: ts.updatedAt,
    });
  }

  return alerts;
}
