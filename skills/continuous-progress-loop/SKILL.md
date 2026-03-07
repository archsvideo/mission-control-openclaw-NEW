---
name: continuous-progress-loop
description: Keep long tasks responsive with proactive progress updates. Use when a task may take more than 60 seconds, involves multi-step web/tool automation, research batches, scraping, or any workflow where the user needs frequent status without waiting silently. Trigger on requests like "keep me updated", "don’t get stuck", "send progress every X seconds", or when prior runs had silent stalls.
---

# Continuous Progress Loop

Use this protocol for long-running work so the user never loses visibility.

## Rules

1. Split long work into short execution blocks (20-60s each).
2. Send a status update after each block.
3. Use fixed milestones:
   - `1/4 start`
   - `2/4 collecting`
   - `3/4 filtering/validating`
   - `4/4 delivering`
4. If no valid result after 3-5 minutes, report explicitly:
   - `0 valid yet`
   - what was tried
   - what will be changed next
5. Never say "I’m doing it" and go silent.

## Update Format

- `Status X/4: <phase>`
- `Done:` short bullet(s)
- `Next:` one line
- `ETA:` short estimate

## Execution Pattern

1. Announce block start.
2. Run one short tool block.
3. Report output immediately.
4. Continue automatically to next block unless user stops.

## Autonomous Monitor Mode (for image/video generation)

When a task is known to take time (rendering, generation, uploads, queue waits), do not wait for a new user message.

1. Start monitor loop with 45-90s check interval.
2. After each check, proactively send a short progress update (or send result if ready).
3. If ready, deliver artifact immediately via channel tool and stop loop.
4. If not ready after 3-5 minutes, send `0 valid yet` with next action.
5. Keep checking until success, failure, or explicit user stop.

Use milestone tags in updates:
- `start`
- `queued/processing`
- `ready/delivered`

## Failure Handling

If a tool fails:

- Report the failure in plain language.
- State fallback path.
- Continue with fallback in next short block.

## Quality Gate Before Final Delivery

Before final message, include:

- what met user criteria
- what did not meet criteria
- links/artifacts produced
- confidence note (no invented metrics)
