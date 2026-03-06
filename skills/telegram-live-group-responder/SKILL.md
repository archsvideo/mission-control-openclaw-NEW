---
name: telegram-live-group-responder
description: Enable real-time Telegram group collaboration while keeping a private DM with Oscar. Use when Oscar wants the assistant to read new group messages live and respond without manual forwarding.
---

# Telegram Live Group Responder

## What this skill does
Define the operating setup so the assistant can:
- stay in private DM for strategy,
- respond in a shared Telegram group in real time.

## Hard requirement
Real-time read/reply only works when the runtime has an active session bound to that Telegram group chat.

## One-time setup checklist
1. Add bot/account to the target group.
2. In BotFather, disable privacy mode for the bot (`/setprivacy` -> Disable).
3. Make bot admin with at least read/send permissions.
4. Confirm final supergroup chat id (usually `-100...`) after any migration.
5. Trigger group session activation from inside the group (`@bot /new` then `@bot responde test`).

## Runtime behavior
- DM with Oscar: planning, approvals, complex instructions.
- Group session: immediate context-aware replies to Carlos + team.
- If no live inbound events are seen, do bridge fallback temporarily:
  - read forwarded message from Oscar,
  - reply directly to group id.

## Diagnostic commands/procedure
- Send a test message to group id.
- Verify inbound mention in group produces assistant response.
- If outbound works but inbound fails, re-check: privacy mode, admin permissions, session activation in group, and updated `-100...` id.

## Important limitation
A skill cannot force transport-level subscription by itself. It standardizes setup and behavior; platform session binding must still be active for live inbound group events.
