---
name: freepik-relay-autocheck
description: Monitor long Freepik Relay jobs autonomously with periodic checks and proactive user updates. Use when Oscar asks to generate images/videos that take time and wants automatic status without needing to ping.
---

# Freepik Relay AutoCheck

## Goal
Keep long Freepik jobs visible and proactive: detect completion, send updates, and deliver outputs immediately.

## Defaults
- Check interval: every 4-5 minutes (shorter only if user asks)
- Update cadence: send progress on each check if still processing
- Delivery rule: once ready, send artifact immediately without waiting for user

## Workflow
1. Start generation job (image/video) and store baseline latest output ID.
2. Enter monitor loop with 4-5 minute checks.
3. On each check:
   - Read latest Freepik output IDs.
   - Compare against baseline.
   - If unchanged: send short status (`still processing`, ETA if visible).
   - If changed: download newest output and send it to user immediately.
4. Stop loop only when:
   - output delivered,
   - explicit user stop,
   - hard failure.

## Progress message format
- `Status: processing`
- `Last check: <time>`
- `Result: not ready yet / ready and sent`
- `Next check: <time>`

## Reliability rules
- Do not use long blocking waits on browser actions.
- Prefer short polling actions over one long wait call.
- If relay drops, restart gateway, reconnect tab, continue loop from last known ID.
- Never wait silently after launching a long job.

## Freepik architecture defaults
- Always use Google Nano Banana 2 unless user overrides.
- Always upload latest user-provided reference before regenerate.
- For geometry tasks, prioritize reference geometry over style/creativity.
