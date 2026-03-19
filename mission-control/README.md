# Mission Control Agent System

This folder defines the multi-agent architecture used by Mission Control:

- `agents/` domain agent specs
- `contracts/` JSON schemas for strict outputs

## Core Pattern
- One **orchestrator** receives requests.
- Specialized **subagents** execute domain tasks.
- Every subagent output is validated against a JSON schema.
- Failed schema -> retry once -> escalate.

## Initial Subagents
- trading_signal_detector
- trading_risk_validator
- marketing_creative_analyzer
- tracking_diagnostics
- email_followup_writer

## Model Routing (policy)
- primary: codex
- fallback: gemini-flash (non-intraday-execution tasks only)

## Next Step
Wire these contracts into the Lovable v2 UI and backend service layer.
