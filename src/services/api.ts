import type {
  Agent, Task, Trade, TradeAlert, PairPerformance, RiskMetrics,
  CampaignCreative, ABHypothesis, FunnelStep, IntegrationStatus,
  TimelineEvent, ContentCalendarItem, WorkflowCheckpoint,
  Lead, CompetitorEntry, CompetitorRadarState,
  RevitJob, ContractValidation, CostGuardrail, MemoryEntry
} from "@/types/models";
import {
  agents, tasks, trades, tradeAlerts, pairPerformance, riskMetrics,
  campaigns, abHypotheses, funnelSteps, integrations, timeline,
  contentCalendar, workflowCheckpoints, leads, competitors, revitJobs,
  contractValidations, costGuardrails, memoryEntries
} from "@/data/seed";
import {
  adaptAgent, adaptTask, adaptTimelineEvent,
  adaptMetaCampaigns, adaptMetaIntegrations,
  adaptTradingRisk, adaptTradingAlerts,
  type NovaState, type TradingState,
} from "@/adapters/nova-to-ui";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ---- Fetchers with cache ----

interface CacheEntry<T> { data: T; at: number; }
const TTL = 5000;

let _nova: CacheEntry<NovaState> | null = null;
async function fetchNova(): Promise<NovaState | null> {
  const now = Date.now();
  if (_nova && now - _nova.at < TTL) return _nova.data;
  try {
    const res = await fetch("/reports/mission-control/current-state.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.updatedAt || !Array.isArray(d.agents) || !Array.isArray(d.tasks)) return null;
    _nova = { data: d as NovaState, at: now };
    return _nova.data;
  } catch { return null; }
}

let _metaCurrent: CacheEntry<any> | null = null;
async function fetchMetaCurrent(): Promise<any | null> {
  const now = Date.now();
  if (_metaCurrent && now - _metaCurrent.at < TTL) return _metaCurrent.data;
  try {
    const res = await fetch("/reports/meta/current-state.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    _metaCurrent = { data: d, at: now };
    return d;
  } catch { return null; }
}

let _metaRecs: CacheEntry<any> | null = null;
async function fetchMetaRecs(): Promise<any | null> {
  const now = Date.now();
  if (_metaRecs && now - _metaRecs.at < TTL) return _metaRecs.data;
  try {
    const res = await fetch("/reports/meta/recommendations.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    _metaRecs = { data: d, at: now };
    return d;
  } catch { return null; }
}

let _trading: CacheEntry<TradingState> | null = null;
async function fetchTrading(): Promise<TradingState | null> {
  const now = Date.now();
  if (_trading && now - _trading.at < TTL) return _trading.data;
  try {
    const res = await fetch("/reports/trading/official_trading_state.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.risk) return null;
    _trading = { data: d as TradingState, at: now };
    return _trading.data;
  } catch { return null; }
}

// ---- Live: trades bridge (Bot A state + Bot B audit logs) ----

export interface TradesReportState {
  updatedAt: string;
  generatedBy: string;
  staleAfterSeconds: number;
  lookbackDays: number;
  counts: {
    trades: number;
    open: number;
    closed: number;
    pairs: number;
    alerts: number;
  };
  trades: Trade[];
  alerts: TradeAlert[];
  pairs: PairPerformance[];
  sources: Record<string, string>;
  warnings: Array<{ code: string; message: string }>;
  errors: Array<{ code: string; message: string }>;
}

const TTL_TRADES = 5000;
let _tradesReport: CacheEntry<TradesReportState> | null = null;
async function fetchTradesReport(): Promise<TradesReportState | null> {
  const now = Date.now();
  if (_tradesReport && now - _tradesReport.at < TTL_TRADES) return _tradesReport.data;
  try {
    const res = await fetch("/reports/trading/trades.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.updatedAt || !Array.isArray(d.trades)) return null;
    _tradesReport = { data: d as TradesReportState, at: now };
    return _tradesReport.data;
  } catch { return null; }
}

// ---- Live: content-calendar bridge (local repo) ----

export interface ContentCalendarReportState {
  updatedAt: string;
  generatedBy: string;
  repo: string;
  staleAfterSeconds: number;
  counts: {
    files: number;
    items: number;
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
  };
  items: ContentCalendarItem[];
  files: Array<{ file: string; date: string; pieces: number; updatedAt: string; frontmatter_status: string | null }>;
  errors: Array<{ code: string; message: string; file?: string }>;
}

const TTL_CONTENT = 15_000;
let _contentReport: CacheEntry<ContentCalendarReportState> | null = null;
async function fetchContentReport(): Promise<ContentCalendarReportState | null> {
  const now = Date.now();
  if (_contentReport && now - _contentReport.at < TTL_CONTENT) return _contentReport.data;
  try {
    const res = await fetch("/reports/content/calendar.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.updatedAt || !Array.isArray(d.items)) return null;
    _contentReport = { data: d as ContentCalendarReportState, at: now };
    return _contentReport.data;
  } catch { return null; }
}

export async function getTradesReport(): Promise<TradesReportState | null> {
  return fetchTradesReport();
}
export async function getContentCalendarReport(): Promise<ContentCalendarReportState | null> {
  return fetchContentReport();
}

// ---- Live: competitor-radar bridge ----

const TTL_COMPETITORS = 15_000;
let _competitorsReport: CacheEntry<CompetitorRadarState> | null = null;
async function fetchCompetitorsReport(): Promise<CompetitorRadarState | null> {
  const now = Date.now();
  if (_competitorsReport && now - _competitorsReport.at < TTL_COMPETITORS) return _competitorsReport.data;
  try {
    const res = await fetch("/reports/content/competitors.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.updatedAt || !Array.isArray(d.tiers)) return null;
    _competitorsReport = { data: d as CompetitorRadarState, at: now };
    return _competitorsReport.data;
  } catch { return null; }
}

export async function getCompetitorRadar(): Promise<CompetitorRadarState | null> {
  return fetchCompetitorsReport();
}

// ---- MC v2: Ops log + GitHub activity ----

export interface OpsLogEntry {
  jobId: string;
  title: string;
  enabled: boolean;
  schedule: string;
  lastRunAt: string | null;
  lastStatus: string;
  lastDurationMs: number | null;
  lastDeliveryStatus: string | null;
  consecutiveErrors: number;
  nextRunAt: string | null;
}
export interface OpsLogState {
  updatedAt: string;
  source: string;
  reason?: string;
  agents: {
    main: OpsLogEntry[];
    trade: OpsLogEntry[];
    meta: OpsLogEntry[];
    studio: OpsLogEntry[];
  };
  totals?: { jobs: number; enabled: number };
}

let _opsLog: CacheEntry<OpsLogState> | null = null;
async function fetchOpsLog(): Promise<OpsLogState | null> {
  const now = Date.now();
  if (_opsLog && now - _opsLog.at < TTL) return _opsLog.data;
  try {
    const res = await fetch("/reports/mission-control/ops-log.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.updatedAt || !d?.agents) return null;
    _opsLog = { data: d as OpsLogState, at: now };
    return _opsLog.data;
  } catch { return null; }
}

export async function getOpsLog(): Promise<OpsLogState | null> {
  return fetchOpsLog();
}

export interface GithubEvent {
  id: string;
  type: string;
  repo: string | null;
  actor: string | null;
  ts: string;
  title: string;
  detail: string | null;
}
export interface GithubActivityState {
  updatedAt: string;
  source: string;
  reason?: string;
  events: GithubEvent[];
  repos: string[];
  username?: string | null;
  errors?: string[] | null;
}

let _github: CacheEntry<GithubActivityState> | null = null;
async function fetchGithubActivity(): Promise<GithubActivityState | null> {
  const now = Date.now();
  if (_github && now - _github.at < TTL) return _github.data;
  try {
    const res = await fetch("/reports/mission-control/github-activity.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.updatedAt) return null;
    _github = { data: d as GithubActivityState, at: now };
    return _github.data;
  } catch { return null; }
}

export async function getGithubActivity(): Promise<GithubActivityState | null> {
  return fetchGithubActivity();
}

// ---- Bots health (Bot A + Bot B) ----

export interface BotsStateBot {
  id: "bot_a" | "bot_b";
  name: string;
  strategy: string;
  root: string;
  status: "running" | "degraded" | "stale" | "dead" | "unknown";
  status_reason: string;
  pid?: number | null;
  pid_alive?: boolean | null;
  pid_recorded_at?: string | null;
  environment: string | null;
  mode: string | null;
  trading_enabled: boolean;
  symbols: string[];
  equity: {
    balance: number | null;
    initial: number | null;
    unrealized: number | null;
    pnl_today: number | null;
    pnl_pct_today: number | null;
  };
  positions_open: number | null;
  activity_today: {
    cycles?: number | null;
    signals_generated?: number;
    signals_executed?: number;
    orders_filled?: number;
    positions_closed: number;
    wins: number;
    losses: number;
    win_rate_pct: number | null;
  };
  last_cycle_at: string | null;
  last_cycle_age_sec: number | null;
  last_service_log_at: string | null;
  last_service_log_age_sec: number | null;
  active_sl_tp_symbols: string[];
  active_sl_tp: Record<string, {
    stop_loss?: number; take_profit?: number; entry_price?: number;
    side?: string; trailing?: boolean;
    highest_price?: number; lowest_price?: number;
  }>;
  recent_errors: { ts: string | null; message: string }[];
  recent_watchdog_restarts?: { ts: string | null; line: string }[];
  risk?: {
    riskPerTradePct: number; openRiskPct: number;
    killSwitchActive: boolean; consecutiveLosses: number;
  } | null;
  state_file_age_sec?: number | null;
}
export interface BotsState {
  updatedAt: string;
  generatedBy: string;
  staleAfterSeconds: number;
  python_processes: {
    pythonw_count: number;
    pythonw_pids: number[];
    python_count: number;
    python_pids: number[];
    bot_a_pythonw_count: number;
    bot_a_pythonw_expected_max: number;
    duplicate_terminals: boolean;
  };
  bots: BotsStateBot[];
  warnings: { severity: string; code: string; message: string; pids?: number[] }[];
  errors: { code: string; message: string }[];
}

let _bots: CacheEntry<BotsState> | null = null;
async function fetchBots(): Promise<BotsState | null> {
  const now = Date.now();
  // Shorter cache than other reports — the bots dashboard is the live view
  // that matters most when the laptop is under duress.
  const TTL_BOTS = 2000;
  if (_bots && now - _bots.at < TTL_BOTS) return _bots.data;
  try {
    const res = await fetch("/reports/trading/bots.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.updatedAt || !Array.isArray(d?.bots)) return null;
    _bots = { data: d as BotsState, at: now };
    return _bots.data;
  } catch { return null; }
}

export async function getBotsState(): Promise<BotsState | null> {
  return fetchBots();
}

// ---- Unified Inbox (Gmail + Microsoft 365) ----

export type InboxCategory = "leads" | "clients" | "platform" | "general";
export type InboxProvider = "gmail" | "microsoft";

export interface InboxMessage {
  id: string;
  accountSlug: string;
  accountLabel: string;
  provider: InboxProvider;
  from: string;
  email: string;
  subject: string;
  snippet: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  category: InboxCategory;
  threadId?: string;
  webLink?: string;
}

export interface InboxAccount {
  slug: string;
  label: string;
  provider: InboxProvider;
  status: "ok" | "error";
  fetched: number;
  duration_ms: number;
  error?: string;
}

export interface InboxState {
  updatedAt: string;
  generatedBy: string;
  accounts: InboxAccount[];
  counts: { all: number; leads: number; clients: number; platform: number; general: number };
  messages: InboxMessage[];
  errors: { slug?: string; code?: string; error?: string; message?: string }[];
}

let _inbox: CacheEntry<InboxState> | null = null;
async function fetchInbox(): Promise<InboxState | null> {
  const now = Date.now();
  // 15s window — bridge refreshes every 5 min, but the UI should feel snappy
  // on tab switch and on manual refresh.
  const TTL_INBOX = 15_000;
  if (_inbox && now - _inbox.at < TTL_INBOX) return _inbox.data;
  try {
    const res = await fetch("/reports/mission-control/inbox.json", { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.updatedAt || !Array.isArray(d?.messages)) return null;
    _inbox = { data: d as InboxState, at: now };
    return _inbox.data;
  } catch { return null; }
}

export async function getInbox(): Promise<InboxState | null> {
  return fetchInbox();
}

export async function getErrorEvents(): Promise<TimelineEvent[]> {
  const nova = await fetchNova();
  if (!nova) return [];
  return nova.timeline
    .filter((e: any) => e.severity === "error" || e.severity === "warning")
    .map(adaptTimelineEvent)
    .sort(
      (a: { timestamp: string }, b: { timestamp: string }) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) as TimelineEvent[];
}

// ---- Runtime-backed: Agents, Tasks, Timeline (from Nova) ----

export async function getAgents(): Promise<Agent[]> {
  const nova = await fetchNova();
  if (nova && nova.agents.length > 0) return nova.agents.map(adaptAgent) as Agent[];
  await delay(); return agents;
}

export async function getTasks(): Promise<Task[]> {
  const nova = await fetchNova();
  if (nova && nova.tasks.length > 0) return nova.tasks.map(adaptTask) as Task[];
  await delay(); return tasks;
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  const nova = await fetchNova();
  if (nova && nova.timeline.length > 0) {
    return nova.timeline.map(adaptTimelineEvent).sort(
      (a: { timestamp: string }, b: { timestamp: string }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) as TimelineEvent[];
  }
  await delay(); return [...timeline].sort((a: TimelineEvent, b: TimelineEvent) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ---- Runtime-backed: Campaigns (from Meta reports) ----

export async function getCampaigns(): Promise<CampaignCreative[]> {
  const [current, recs] = await Promise.all([fetchMetaCurrent(), fetchMetaRecs()]);
  if (current || recs) {
    const top3InCurrent = current?.rows?.find((r: any) => r.ad_id === "120245050696100334");
    const top3Paused = !top3InCurrent || top3InCurrent.effective_status === "PAUSED";
    return adaptMetaCampaigns(current, recs, top3Paused) as CampaignCreative[];
  }
  await delay(); return campaigns;
}

// ---- Runtime-backed: Integrations (Meta state + seed for non-Meta) ----

export async function getIntegrations(): Promise<IntegrationStatus[]> {
  const metaEntries = adaptMetaIntegrations(true, true, true) as IntegrationStatus[];
  await delay();
  const nonMeta = integrations.filter((i: IntegrationStatus) => i.type !== "meta");
  return [...metaEntries, ...nonMeta];
}

// ---- Runtime-backed: Risk Metrics (from trading state) ----

export async function getRiskMetrics(): Promise<RiskMetrics> {
  const ts = await fetchTrading();
  if (ts) return adaptTradingRisk(ts) as RiskMetrics;
  await delay(); return riskMetrics;
}

// ---- Runtime-backed: Trade Alerts (trades bridge -> trading state -> seed) ----

export async function getTradeAlerts(): Promise<TradeAlert[]> {
  const report = await fetchTradesReport();
  if (report && report.alerts.length) return report.alerts;

  const ts = await fetchTrading();
  const runtimeAlerts = ts ? adaptTradingAlerts(ts) as TradeAlert[] : [];
  await delay();
  const seedSorted = [...tradeAlerts].sort((a: TradeAlert, b: TradeAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return [...runtimeAlerts, ...seedSorted];
}

// ---- Live-with-seed-fallback ----

export async function getTrades(): Promise<Trade[]> {
  const report = await fetchTradesReport();
  if (report && report.trades.length) return report.trades;
  await delay();
  return trades;
}
export async function getPairPerformance(): Promise<PairPerformance[]> {
  const report = await fetchTradesReport();
  if (report && report.pairs.length) return report.pairs;
  await delay();
  return pairPerformance;
}
export async function getContentCalendar(): Promise<ContentCalendarItem[]> {
  const report = await fetchContentReport();
  if (report && report.items.length) return report.items;
  await delay();
  return contentCalendar;
}

// ---- Seed-backed (unchanged) ----

export async function getABHypotheses(): Promise<ABHypothesis[]> { await delay(); return abHypotheses; }
export async function getFunnelSteps(): Promise<FunnelStep[]> { await delay(); return funnelSteps; }
export async function getWorkflowCheckpoints(): Promise<WorkflowCheckpoint[]> { await delay(); return workflowCheckpoints; }
export async function getLeads(): Promise<Lead[]> { await delay(); return leads; }
export async function getCompetitors(): Promise<CompetitorEntry[]> { await delay(); return competitors; }
export async function getRevitJobs(): Promise<RevitJob[]> { await delay(); return revitJobs; }
export async function getContractValidations(): Promise<ContractValidation[]> { await delay(); return contractValidations; }
export async function getCostGuardrails(): Promise<CostGuardrail[]> { await delay(); return costGuardrails; }
export async function getMemoryEntries(): Promise<MemoryEntry[]> { await delay(); return memoryEntries; }

export async function testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
  await delay(800);
  const integration = integrations.find((i: IntegrationStatus) => i.id === integrationId);
  if (!integration) return { success: false, message: "Integration not found" };
  if (integration.health === "healthy") return { success: true, message: "Connection OK" };
  return { success: false, message: integration.message };
}
