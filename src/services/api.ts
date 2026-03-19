/**
 * Service layer — swap mock imports for real API calls when backend is ready.
 * All functions return promises for easy async migration.
 */
import type { Agent, Task, Trade, CampaignCreative, IntegrationStatus, TimelineEvent, ContentCalendarItem, WorkflowCheckpoint } from "@/types/models";
import { agents, tasks, trades, campaigns, integrations, timeline, contentCalendar, workflowCheckpoints } from "@/data/seed";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export async function getAgents(): Promise<Agent[]> {
  await delay();
  return agents;
}

export async function getTasks(): Promise<Task[]> {
  await delay();
  return tasks;
}

export async function getTrades(): Promise<Trade[]> {
  await delay();
  return trades;
}

export async function getCampaigns(): Promise<CampaignCreative[]> {
  await delay();
  return campaigns;
}

export async function getIntegrations(): Promise<IntegrationStatus[]> {
  await delay();
  return integrations;
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  await delay();
  return [...timeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
  await delay(800);
  const integration = integrations.find((i) => i.id === integrationId);
  if (!integration) return { success: false, message: "Integration not found" };
  if (integration.health === "healthy") return { success: true, message: "Connection OK" };
  return { success: false, message: integration.message };
}
