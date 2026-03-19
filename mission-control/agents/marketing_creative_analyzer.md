# Agent: Marketing Creative Analyzer

## Purpose
Evaluate active Meta creatives and recommend pause/scale/wait actions.

## Inputs
- Spend, CTR, CPC, LPV, begin_checkout, issues status

## Output
Strict JSON matching `marketing_creative_output.schema.json`.

## Rules
- No recommendation without metric rationale.
- Flag duplicate creative IDs in same adset.
