export type Health = 'green' | 'yellow' | 'red';

export type AgentStatus = 'online' | 'offline' | 'busy' | 'paused';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  heartbeatAt: string;
  currentTask?: string;
  costTodayUsd: number;
  successRate: number;
}

export interface Task {
  id: string;
  title: string;
  ownerAgentId: string;
  status: 'inbox' | 'running' | 'waiting' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  updatedAt: string;
}

export interface Trade {
  id: string;
  pair: 'SOL/USD' | 'XBT/USD' | 'ETH/USD';
  side: 'LONG' | 'SHORT';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  livePrice: number;
  unrealizedPnl: number;
  unrealizedR: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
}

export interface IntegrationState {
  key: 'gmail' | 'ga4' | 'gtm' | 'meta' | 'kraken';
  status: Health;
  lastCheckAt: string;
  latencyMs?: number;
  lastError?: string;
}

export interface TimelineEvent {
  id: string;
  type: string;
  severity: Health;
  message: string;
  at: string;
}

export interface Guardrails {
  globalDailyBudgetUsd: number;
  moduleBudgetsUsd: Record<string, number>;
  budgetWarnPct: number;
  maxRetries: number;
  maxRepeatedErrors30m: number;
}
