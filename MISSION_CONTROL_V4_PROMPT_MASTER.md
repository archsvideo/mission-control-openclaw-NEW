# PROMPT MAESTRO FINAL — MISSION CONTROL V4

Build Mission Control V4 as a single, production-ready web app for a solo founder running AI operations across trading, marketing, tracking, comms, and Revit automation.

## Core principle

This is not a demo dashboard.
It must be an operational control system with real workflows, strict contracts, guardrails, and decision support.

---

## 1) App architecture (single app, multi-module)

Keep one app/repo, with modules inside:

1. Control Tower
2. Trading Ops Console
3. Lead-to-Meeting OS
4. Skylight CRO Lab
5. Competitor Radar
6. Revit Automation Queue
7. Integrations
8. Timeline
9. Memory
10. Settings

Use shared state, shared event bus, shared timeline, shared memory.

---

## 2) Agent architecture (must be explicit)

Implement Orchestrator + domain subagents:

- chief-orchestrator
- trading-orchestrator
- lead-orchestrator
- skylight-cro-orchestrator
- radar-orchestrator
- revit-orchestrator
- tracking-diagnostics
- email-followup-writer

For each agent show:

- status (online/offline/busy)
- heartbeat
- current task
- cost today
- success rate
- pause/resume/retry actions

---

## 3) Strict output contracts (non-negotiable)

Use contract validation for all agent outputs (schema-driven).
If output fails schema:

1. mark as validation_failed
2. retry once
3. escalate_to_human

Add visible Contract Health panel:

- pass count
- fail count
- last failed contract
- top failing agent

---

## 4) Control Tower (executive cockpit)

Top KPI cards:

- Active Agents
- Running Tasks
- Blocked Tasks
- Open Trades
- Daily PnL
- API Cost Today
- Integration Health Score
- Booking Event Health

Add Needs Attention Now (top 5 alerts) with severity:

- red = critical
- amber = warning
- green = healthy

---

## 5) Trading Ops Console (clean and tactical)

Must include:

- Open positions (pair, side, entry, SL, TP, live price, unrealized $, unrealized R, age)
- Closed trades (sortable, filterable, CSV export)
- Risk panel (risk/trade, open risk %, DD daily, consecutive losses, kill switch)
- Pair performance (SOL/XBT/ETH EV, win rate, PF)
- Alerts feed: OPEN / CLOSE / STOP / TP / TIME-STOP

Add Focus Mode (hide non-essential panels for fast decisions).

---

## 6) Lead-to-Meeting OS

Pipeline stages:
New -> Contacted -> Qualified -> Meeting -> Proposal -> Won/Lost

Each lead:

- source
- score
- owner
- last contact
- next action date
- booking status
- email history

Add quick actions:

- draft follow-up
- send follow-up
- mark meeting booked
- escalate

---

## 7) Skylight CRO Lab (conversion module)

Subpages:

- Overview
- Creatives Lab
- Landing Experiments
- Funnel & Attribution
- Client Leads

Include:

- creative performance table (spend, CTR, LPV, begin_checkout, status, recommendation)
- duplicate creative_id detector in same adset
- A/B hypothesis board
- funnel visualization: LPV -> add_to_cart -> begin_checkout -> booking/purchase
- booking tracking health state (healthy/degraded/broken)

---

## 8) Competitor Radar

Track competitor content:

- source URL
- platform
- engagement
- hook type
- format
- inferred pattern

Actions:

- create idea
- add to content queue
- mark tested

---

## 9) Revit Automation Queue

Queue with:

- job type
- file
- status
- runtime
- logs
- retry/escalate actions

Templates:

- generate views
- export sheets
- parameter batch updates

---

## 10) Integrations page

Integrations:

- Gmail API
- GA4
- GTM
- Meta API
- Kraken feed

Per integration:

- status
- last check
- latency
- last error
- test now button

Also include:

- booking tracking diagnostics
- GTM publish diagnostics
- GA4 event visibility diagnostics

---

## 11) Cost Guardrails + anti-burn (mandatory)

Load and enforce cost/risk policy from guardrail config:

- global daily budget
- per-module budget
- retry/loop protection
- warning thresholds
- trading safety limits

Traffic lights:

- green <70%
- yellow 70–99%
- red >=100% or loop protection triggered

Add automatic flags:

- module over budget
- repeated API failures
- low-value agent > 7 days (pause candidate)

---

## 12) Timeline + Memory

Timeline event types:

- delegated_to_subagent
- contract_validation_failed
- retry_triggered
- escalation_to_human
- trade_opened/trade_closed
- lead_updated
- email_sent
- creative_published
- gtm_published
- revit_job_started/failed

Memory module:

- daily journal
- weekly lessons
- decision log
- searchable entries/tags

---

## 13) UX quality bar

- Premium, calm, high-clarity design (no clutter)
- Dark/light mode polished
- Excellent mobile readability
- Empty/loading/error states on every module
- Global command bar (Cmd/Ctrl+K)
- Saved views + CSV export where relevant

---

## 14) Deliverable format

After implementation, return:

1. Changelog of files/pages updated
2. Route map of all modules
3. What is mocked vs what is wired
4. Test checklist for critical flows:

- trade lifecycle
- lead follow-up
- booking event tracking
- cost guardrails alerts

---

## Nota

Si quieres, después te doy el PROMPT V5 (conexión datos reales) para que deje de usar mock y conecte tus archivos/reportes actuales (trading/paper, reports/meta-*, GA4, GTM, Gmail logs).
