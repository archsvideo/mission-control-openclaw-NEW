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

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export async function getAgents(): Promise<Agent[]> { await delay(); return agents; }
export async function getTasks(): Promise<Task[]> { await delay(); return tasks; }
export async function getTrades(): Promise<Trade[]> { await delay(); return trades; }
export async function getTradeAlerts(): Promise<TradeAlert[]> { await delay(); return [...tradeAlerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); }
export async function getPairPerformance(): Promise<PairPerformance[]> { await delay(); return pairPerformance; }
export async function getRiskMetrics(): Promise<RiskMetrics> { await delay(); return riskMetrics; }
export async function getCampaigns(): Promise<CampaignCreative[]> { await delay(); return campaigns; }
export async function getABHypotheses(): Promise<ABHypothesis[]> { await delay(); return abHypotheses; }
export async function getFunnelSteps(): Promise<FunnelStep[]> { await delay(); return funnelSteps; }
export async function getIntegrations(): Promise<IntegrationStatus[]> { await delay(); return integrations; }
export async function getTimeline(): Promise<TimelineEvent[]> { await delay(); return [...timeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); }
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
  const integration = integrations.find((i) => i.id === integrationId);
  if (!integration) return { success: false, message: "Integration not found" };
  if (integration.health === "healthy") return { success: true, message: "Connection OK" };
  return { success: false, message: integration.message };
}
