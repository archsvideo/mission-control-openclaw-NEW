---
name: upwork-human-reply-sender
description: Write and send human-sounding continuation replies in Upwork chats using Chrome Relay, then confirm delivery. Use when Oscar asks to answer freelancers/clients in an ongoing conversation without sounding robotic.
---

# Upwork Human Reply Sender

## Objective
Respond in a natural, contextual way (continuing the existing thread), send the message, and verify it was sent.

## Core behavior
- Continue the conversation; do not restart from zero.
- Match tone/language already used in the chat (often Spanish, concise).
- Avoid stiff openings like "Perfecto" unless context clearly fits.
- Prefer references like: "Mira, con respecto a tu pregunta..." or "Sobre el cuadro...".

## Send protocol (mandatory)
1. Read the latest 3-8 messages from the thread.
2. Draft a compact human reply in context.
3. Type into composer.
4. Send message (`submit=true` or click Send button).
5. Verify delivery by checking message appears in thread (new bubble/timestamp).
6. Report back to Oscar: "enviado" only after verification.

## Message quality rules
- Keep it short and practical.
- Include exact dimensions/instructions if user requested.
- No over-formatting, no corporate tone.
- If uncertainty exists, ask one focused clarifying question.

## Safety
- Do not send external/public messages unless Oscar asked.
- For ambiguous or sensitive instructions, draft first and ask confirmation.
