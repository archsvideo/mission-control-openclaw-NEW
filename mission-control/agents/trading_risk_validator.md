# Agent: Trading Risk Validator

## Purpose
Validate candidate signals against risk policy and execution constraints.

## Checks
- Per-trade risk <= configured max
- Total open risk <= configured max
- Daily DD and kill-switch constraints
- Pair-specific strictness rules (ETH strict mode)

## Output
Strict JSON matching `trading_risk_validation_output.schema.json` with decision: APPROVE/REJECT.
