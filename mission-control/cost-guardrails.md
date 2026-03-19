# Anti-Burn API Guardrails (Applied)

## Objective
Prevent runaway API costs and silent failures while keeping core automations running.

## 1) Hard Daily Budget Caps
- Global API budget/day: **$12**
- Per-module caps:
  - Trading intelligence: $4/day
  - Marketing automation: $3/day
  - Tracking diagnostics: $2/day
  - Comms (email + misc): $3/day

## 2) Model Routing Policy
- Primary: Codex for strategy/review workflows
- Fallback: Gemini Flash (non-critical only)
- Intraday execution decisions: **no LLM dependency**

## 3) Loop Protection
- Max retries per failing job: **1**
- Exponential backoff on API errors
- Auto-disable workflow if same error repeats >3 times in 30 min

## 4) Safety Stops
- Trading kill switch: 3 consecutive losses
- Daily DD stop: 2%
- Open risk cap: 1%

## 5) Alerting
Trigger Telegram alert when any condition is met:
- 70% daily API budget consumed
- Any module exceeds its per-module cap
- 3 repeated API failures in 30 min
- Workflow auto-disabled by loop protection

## 6) Operational Checklist (daily)
1. Check budget panel in Mission Control
2. Check failed jobs count
3. Check active loops/retries
4. Confirm kill switch state
5. Confirm integrations health (Gmail/GA4/GTM/Meta/Kraken)

## 7) Weekly Governance
- Compare cost vs output value by module
- Pause any module with poor cost-to-value ratio for 7 days
- Keep only top-performing workflows active
