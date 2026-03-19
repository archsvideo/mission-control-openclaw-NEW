export type AgentStatus = "running" | "idle" | "error" | "paused";

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  lastActive: string;
  tasksCompleted: number;
  uptime: string;
  description: string;
}

export type TaskStatus = "inbox" | "running" | "waiting" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed";

export interface Trade {
  id: string;
  symbol: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  currentPrice: number;
  exitPrice?: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
  closedAt?: string;
  stopLoss?: number;
  takeProfit?: number;
}

export interface CampaignCreative {
  id: string;
  name: string;
  platform: "meta" | "google" | "tiktok";
  status: "active" | "paused" | "completed";
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
  roas: number;
  startDate: string;
  endDate?: string;
}

export type IntegrationHealth = "healthy" | "degraded" | "down" | "not_configured";

export interface IntegrationStatus {
  id: string;
  name: string;
  type: "gmail" | "ga4" | "gtm" | "meta" | "slack" | "stripe";
  health: IntegrationHealth;
  lastSync: string;
  message: string;
  icon: string;
}

export type ContentStatus = "planned" | "in_progress" | "done" | "blocked";
export type ContentChannel = "linkedin" | "instagram" | "twitter" | "blog" | "email";

export interface ContentCalendarItem {
  id: string;
  date: string;
  contentId: string;
  channel: ContentChannel;
  title: string;
  status: ContentStatus;
  owner: string;
  assetLinks: string[];
  notes: string;
}

export interface WorkflowCheckpoint {
  id: string;
  label: string;
  time: "morning" | "midday" | "end_of_day";
  completed: boolean;
  note: string;
}

export type TimelineEventType = "agent" | "task" | "trade" | "campaign" | "integration" | "system" | "content";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "success";
}
