---
name: telegram-dual-chat-ops
description: Operate two Telegram contexts in parallel: private strategic chat with Oscar and active collaboration in a shared group (e.g., Oscar + Carlos + assistant). Use when Oscar wants the assistant to read group messages and reply there while keeping a separate private control chat.
---

# Telegram Dual Chat Ops

## Goal
Maintain:
1) Private DM with Oscar (strategy / complex ops)
2) Group chat with collaborators (execution / live replies)

## Required setup (one-time)
1. Add the assistant bot/account to the target Telegram group.
2. Disable bot privacy mode in BotFather (`/setprivacy` -> Disable) so group messages are visible.
3. Ensure the group uses the correct numeric chat id (usually `-100...`).
4. Test with one message from Carlos and verify assistant receives it in group context.

## Operating rules
- In private DM: plan, draft, approve.
- In group: concise replies, context-aware, collaborative tone.
- If user asks for group reply from private DM, send with `message` tool to the group id.
- If group message is not visible in current context, request forward or switch to group thread.

## Reply pattern in group
- Acknowledge Carlos quickly.
- Add 1 concrete improvement.
- Offer 1 optional variation (short vs long copy).

## Fallback
If live group read is unavailable, use bridge mode:
1) Oscar forwards Carlos message
2) assistant drafts response
3) assistant sends to group id
