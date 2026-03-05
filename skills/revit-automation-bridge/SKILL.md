---
name: revit-automation-bridge
description: Plan and execute safe Revit automation workflows using API, Dynamo, pyRevit, or MCP bridge patterns. Use when Oscar asks to automate Revit tasks, connect AI agents to Revit models, batch-edit parameters, generate views/sheets/schedules, or design a controlled Revit automation pipeline for architecture/interior projects.
---

# Revit Automation Bridge

Use this skill to turn Revit work into safe, repeatable automations.

## Default operating mode

Start in **read-only** unless the user explicitly asks for write actions.

Safety levels:
1. Read-only (inspect model, collect data, QA checks)
2. Non-destructive write (views, sheets, schedules, naming)
3. Controlled model edits (parameters/elements with scope + rollback)

Never jump directly to level 3.

## Intake (ask first)

Collect:
- Revit version (2024/2025/2026)
- Current stack (Dynamo, pyRevit, add-ins, MCP bridge)
- Goal (time saved, QA, documentation speed, etc.)
- Allowed scope (read-only / limited write / full write)
- Pilot project file and backup/rollback policy

If missing data, proceed with assumptions and mark them clearly.

## Recommended architecture

1. **Bridge layer**
   - Revit add-in / pyRevit route / MCP server endpoint
2. **Command catalog**
   - Explicit tools: list warnings, read rooms, create views, etc.
3. **Policy layer**
   - Allowed commands, blocked commands, required confirmations
4. **Execution + logging**
   - Every action logged with timestamp and affected elements

## High-value automations for ARCH-S

Prioritize these first:

1. Documentation automation
- Auto-create sheets from selected views
- Standardized naming conventions
- View/sheet placement helpers

2. Model QA
- Clash-risk/warning reports
- Missing parameter checks
- Room/area consistency checks

3. Parameter batch ops
- Bulk update shared parameters
- Normalize type/instance naming
- Validate required metadata before issue

4. Export routines
- Batch exports (PDF/DWG/IFC/NWC as needed)
- Revision-safe output folders

## Output format (always)

Return in this order:

1) **Automation goal**
2) **Chosen method** (Dynamo / pyRevit / API / MCP)
3) **Risk level** (1/2/3)
4) **Step-by-step implementation**
5) **Rollback plan**
6) **Pilot test checklist**
7) **Next automation candidate**

## Decision guide (tool choice)

- Use **Dynamo** for visual logic and team-friendly automations.
- Use **pyRevit/Python** for quick custom tools and flexible scripts.
- Use **C# API add-in** for robust production-grade tooling.
- Use **MCP bridge** when AI-agent interaction is required (query/command style).

## Rules

- Do not claim direct model edits without verified bridge access.
- Prefer pilot on a copy model first.
- Log assumptions explicitly.
- Favor repeatable workflows over one-off hacks.

## Reusable prompt template

"Design a Revit automation plan for <TASK> on Revit <VERSION> using <STACK>. Keep risk at level <1/2/3>. Include implementation steps, rollback, and a pilot checklist."