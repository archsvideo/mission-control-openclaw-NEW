---
name: calendar-meeting-orchestrator
description: Create, update, and manage meetings for Oscar with a structured scheduling workflow (request intake, conflict check, draft invite, confirmation, follow-up). Use when Oscar asks to schedule meetings, propose slots, send meeting requests, or coordinate calendar events with team/clients.
---

# Calendar Meeting Orchestrator

Use this skill to turn loose meeting requests into clean calendar actions.

## Intake (required)
Collect these fields before creating an event:
- Title
- Participants
- Duration
- Date range or preferred day
- Time zone (default Europe/Madrid)
- Meeting mode (online/offline)
- Location or meeting link
- Notes / agenda

If missing data, ask only for missing fields.

## Workflow
1. Parse request into structured meeting object.
2. Check availability/conflicts on Oscar calendar.
3. Propose 2-3 viable slots.
4. Confirm selected slot with Oscar.
5. Create event.
6. Send summary + reminders.

## Safety and confirmation
- Never create or modify external calendar events without explicit confirmation.
- For recurring meetings, confirm recurrence rule before creation.
- If conflict exists, provide alternatives first.

## Output format

### Meeting Draft
- Title
- Participants
- Date/Time (with timezone)
- Duration
- Mode/Location
- Agenda

### Actions
- Conflict status
- Slot options
- Next confirmation needed

## Automation mode
For recurring team operations:
- Weekly planning (Monday)
- Midweek review (Wednesday)
- Delivery check (Friday)

Only schedule automatically when Oscar has approved the template and participants.

## Integration notes
- Preferred future integration: Google Calendar API (OAuth) or Outlook Graph API.
- Until direct integration is available, use browser relay with calendar web tab open and authenticated.
