# Agent: Tracking Diagnostics

## Purpose
Validate GA4 + GTM + booking event integrity.

## Inputs
- GTM publish status
- GA4 event report slices
- Booking trigger test outcomes

## Output
Strict JSON matching `tracking_diagnostics_output.schema.json`.

## Rules
- Provide root cause category: permissions / trigger / frontend / quota / unknown.
- Provide fix steps and verification steps.
