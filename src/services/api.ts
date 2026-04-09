import type {
  Agent, Task, Trade, TradeAlert, PairPerformance, RiskMetrics,
  CampaignCreative, ABHypothesis, FunnelStep, IntegrationStatus,
  TimelineEvent, ContentCalendarItem, WorkflowCheckpoint,
  Lead, CompetitorEntry, RevitJob, ContractValidation, CostGuardrail, MemoryEntry
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

// Runtime-backed: Agents, Tasks, Timeline
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

// Runtime-backed: Campaigns (Meta reports)
export async function getCampaigns(): Promise<CampaignCreative[]> {
  const [current, recs] = await Promise.all([fetchMetaCurrent(), fetchMetaRecs()]);
  if (current || recs) {
    const top3InCurrent = current?.rows?.find((r: any) => r.ad_id === "120245050696100334");
    const top3Paused = !top3InCurrent || top3InCurrent.effective_status === "PAUSED";
    return adaptMetaCampaigns(current, recs, top3Paused) as CampaignCreative[];
  }
  await delay(); return campaigns;
}

// Runtime-backed: Integrations (Meta health + seed)
export async function getIntegrations(): Promise<IntegrationStatus[]> {
  const metaEntries = adaptMetaIntegrations(true, true, true) as IntegrationStatus[];
  await delay();
  const nonMeta = integrations.filter((i: IntegrationStatus) => i.type !== "meta");
  return [...metaEntries, ...nonMeta];
}

// Runtime-backed: Risk Metrics (trading state)
export async function getRiskMetrics(): Promise<RiskMetrics> {
  const ts = await fetchTrading();
  if (ts) return adaptTradingRisk(ts) as RiskMetrics;
  await delay(); return riskMetrics;
}

// Runtime-backed: Trade Alerts (trading state + seed)
export async function getTradeAlerts(): Promise<TradeAlert[]> {
  const ts = await fetchTrading();
  const runtimeAlerts = ts ? adaptTradingAlerts(ts) as TradeAlert[] : [];
  await delay();
  const seedSorted = [...tradeAlerts].sort((a: TradeAlert, b: TradeAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return [...runtimeAlerts, ...seedSorted];
}

// Seed-backed
export async function getTrades(): Promise<Trade[]> { await delay(); return trades; }
export async function getPairPerformance(): Promise<PairPerformance[]> { await delay(); return pairPerformance; }
export async function getABHypotheses(): Promise<ABHypothesis[]> { await delay(); return abHypotheses; }
export async function getFunnelSteps(): Promise<FunnelStep[]> { await delay(); return funnelSteps; }
export async function getContentCalendar(): Promise<ContentCalendarItem[]> { await delay(); return contentCalendar; }
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
