export type AgentStatus = "running" | "idle" | "error" | "paused";

export interface Agent {
  id: string;
  name: string;
  role: string;
  type: string;
  status: AgentStatus;
  lastActive: string;
  tasksCompleted: number;
  uptime: string;
  description: string;
  heartbeat: string;
  currentTask: string;
  costToday: number;
  successRate: number;
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
  unrealizedR: number;
  openedAt: string;
  closedAt?: string;
  stopLoss?: number;
  takeProfit?: number;
}

export interface TradeAlert {
  id: string;
  type: "OPEN" | "CLOSE" | "STOP" | "TP" | "TIME-STOP";
  symbol: string;
  message: string;
  timestamp: string;
}

export interface PairPerformance {
  pair: string;
  ev: number;
  winRate: number;
  profitFactor: number;
  trades: number;
}

export interface RiskMetrics {
  riskPerTrade: number;
  openRisk: number;
  dailyDD: number;
  consecutiveLosses: number;
  killSwitchActive: boolean;
}

export interface CampaignCreative {
  id: string;
  name: string;
  creativeId: string;
  adsetId: string;
  platform: "meta" | "google" | "tiktok";
  status: "active" | "paused" | "completed";
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
  roas: number;
  lpv: number;
  beginCheckout: number;
  recommendation: string;
  startDate: string;
  endDate?: string;
}

export interface ABHypothesis {
  id: string;
  name: string;
  hypothesis: string;
  status: "draft" | "running" | "concluded";
  variant: string;
  metric: string;
  result?: string;
}

export interface FunnelStep {
  label: string;
  value: number;
  rate?: number;
}

export type IntegrationHealth = "healthy" | "degraded" | "down" | "not_configured";

export interface IntegrationStatus {
  id: string;
  name: string;
  type: "gmail" | "ga4" | "gtm" | "meta" | "slack" | "stripe" | "kraken";
  health: IntegrationHealth;
  lastSync: string;
  latency: number;
  lastError: string;
  message: string;
  icon: string;
}

export type ContentStatus = "planned" | "in_progress" | "done" | "blocked";
export type ContentChannel = "linkedin" | "instagram" | "twitter" | "blog" | "email" | "tiktok" | "youtube";

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

export type TimelineEventType =
  | "agent" | "task" | "trade" | "campaign" | "integration" | "system" | "content"
  | "delegated_to_subagent" | "contract_validation_failed" | "retry_triggered"
  | "escalation_to_human" | "trade_opened" | "trade_closed" | "lead_updated"
  | "email_sent" | "creative_published" | "gtm_published" | "revit_job_started" | "revit_job_failed";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "success";
}

export type LeadStage = "new" | "contacted" | "qualified" | "meeting" | "proposal" | "won" | "lost";

export interface Lead {
  id: string;
  name: string;
  company: string;
  source: string;
  score: number;
  owner: string;
  stage: LeadStage;
  lastContact: string;
  nextAction: string;
  bookingStatus: "none" | "pending" | "booked" | "completed" | "no_show";
  emailHistory: { date: string; subject: string; status: "sent" | "opened" | "replied" }[];
  createdAt: string;
}

export interface CompetitorEntry {
  id: string;
  sourceUrl: string;
  platform: string;
  engagement: number;
  hookType: string;
  format: string;
  pattern: string;
  testedInternally: boolean;
  createdAt: string;
}

// ---- Competitor Radar (live from content-calendar repo) ----

export interface CompetitorProfile {
  handle: string;
  platform: string;
  whyFollow: string;
  whatNotCopy: string;
  oscarValidated: boolean;
  oscarRejected: boolean;
  isPlaceholder: boolean;
}

export interface CompetitorTier {
  tier: number;
  label: string;
  description: string;
  notes: string[];
  competitors: CompetitorProfile[];
}

export interface RadarSource {
  done: boolean;
  label: string;
}

export interface RadarSignal {
  source: string;
  when: string;
  what: string;
  whyMatters: string;
  angle: string;
  candidateFor: string;
}

export interface RadarSnapshot {
  date: string;
  file: string;
  generatedBy: string;
  sourcesScanned: RadarSource[];
  signalsFound: number;
  signals: RadarSignal[];
  noise: string[];
  nextToWatch: string[];
  updatedAt: string;
}

export interface CompetitorRadarState {
  updatedAt: string;
  generatedBy: string;
  repo: string;
  staleAfterSeconds: number;
  counts: {
    tiers: number;
    competitors: number;
    validated: number;
    placeholders: number;
    signals: number;
    radarFiles: number;
  };
  tiers: CompetitorTier[];
  hashtags: string[];
  newsletters: string[];
  rules: string[];
  latestRadar: RadarSnapshot | null;
  radarHistory: Array<{
    date: string;
    file: string;
    signalsFound: number;
    generatedBy: string;
    updatedAt: string;
  }>;
  errors: Array<{ code: string; message: string; file?: string }>;
}

export type RevitJobStatus = "queued" | "running" | "completed" | "failed" | "retrying";

export interface RevitJob {
  id: string;
  name: string;
  template: string;
  status: RevitJobStatus;
  runtime: number;
  logs: string[];
  createdAt: string;
  completedAt?: string;
}

export interface ContractValidation {
  agentId: string;
  agentName: string;
  totalChecks: number;
  passed: number;
  failed: number;
  lastFailure?: string;
}

export type CostGuardrailStatus = "green" | "yellow" | "red";

export interface CostGuardrail {
  module: string;
  budgetLimit: number;
  currentSpend: number;
  percentUsed: number;
  status: CostGuardrailStatus;
  repeatedFailures: number;
  pauseCandidate: boolean;
}

export interface MemoryEntry {
  id: string;
  type: "journal" | "lesson" | "decision";
  title: string;
  content: string;
  tags: string[];
  date: string;
}
