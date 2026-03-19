import { Agent, Guardrails, IntegrationState, Task, TimelineEvent, Trade } from '../types';

export const agents: Agent[] = [
  { id: 'chief', name: 'chief-orchestrator', role: 'orchestrator', status: 'online', heartbeatAt: new Date().toISOString(), currentTask: 'mission-control-v4', costTodayUsd: 1.2, successRate: 0.89 },
  { id: 'trading', name: 'trading-orchestrator', role: 'trading', status: 'busy', heartbeatAt: new Date().toISOString(), currentTask: 'manage_open_positions', costTodayUsd: 2.8, successRate: 0.71 },
  { id: 'skylight', name: 'skylight-cro-orchestrator', role: 'marketing', status: 'online', heartbeatAt: new Date().toISOString(), currentTask: 'creative_compare', costTodayUsd: 1.5, successRate: 0.76 }
];

export const tasks: Task[] = [
  { id: 't1', title: 'Validate booking tracking', ownerAgentId: 'tracking', status: 'running', priority: 'critical', updatedAt: new Date().toISOString() },
  { id: 't2', title: 'Review active creatives 24h', ownerAgentId: 'skylight', status: 'waiting', priority: 'high', updatedAt: new Date().toISOString() }
];

export const trades: Trade[] = [
  { id: 'tr1', pair: 'SOL/USD', side: 'SHORT', entry: 88.09, stopLoss: 88.88, takeProfit: 86.51, livePrice: 88.29, unrealizedPnl: -12.7, unrealizedR: -0.25, status: 'open', openedAt: new Date().toISOString() },
  { id: 'tr2', pair: 'ETH/USD', side: 'SHORT', entry: 2131.34, stopLoss: 2152.61, takeProfit: 2088.80, livePrice: 2134.08, unrealizedPnl: -6.5, unrealizedR: -0.13, status: 'open', openedAt: new Date().toISOString() }
];

export const integrations: IntegrationState[] = [
  { key: 'gmail', status: 'green', lastCheckAt: new Date().toISOString(), latencyMs: 240 },
  { key: 'ga4', status: 'green', lastCheckAt: new Date().toISOString(), latencyMs: 310 },
  { key: 'gtm', status: 'yellow', lastCheckAt: new Date().toISOString(), lastError: 'booking event pending validation' },
  { key: 'meta', status: 'green', lastCheckAt: new Date().toISOString() },
  { key: 'kraken', status: 'green', lastCheckAt: new Date().toISOString() }
];

export const timeline: TimelineEvent[] = [
  { id: 'e1', type: 'trade_closed', severity: 'green', message: 'XBT/USD SHORT hit TP (+2.04R)', at: new Date().toISOString() },
  { id: 'e2', type: 'creative_published', severity: 'green', message: 'Hook_Included_UserPick published', at: new Date().toISOString() },
  { id: 'e3', type: 'contract_validation_failed', severity: 'yellow', message: 'tracking_diagnostics output missing field', at: new Date().toISOString() }
];

export const guardrails: Guardrails = {
  globalDailyBudgetUsd: 12,
  moduleBudgetsUsd: {
    trading_intelligence: 4,
    marketing_automation: 3,
    tracking_diagnostics: 2,
    comms: 3
  },
  budgetWarnPct: 70,
  maxRetries: 1,
  maxRepeatedErrors30m: 3
};
