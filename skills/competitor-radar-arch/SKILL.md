---
name: competitor-radar-arch
description: Monitor and analyze architecture and ArchViz competitors on LinkedIn and Instagram, extract high-performing post patterns, and return actionable inspiration with source links. Use when Oscar asks to track competitors, find viral/relevant projects, collect references, compare positioning, or generate content ideas based on competitor posts.
---

# Competitor Radar (Architecture + ArchViz)

Use this skill to gather competitor intelligence fast and turn it into actions for ARCH-S.

## Inputs to request first

Ask for:
- Competitor handles or profile URLs (LinkedIn/Instagram)
- Time window (last 7/14/30 days)
- Focus (architecture projects, ArchViz renders, interior, cabins, etc.)
- Success filter (e.g., high engagement, >100k views when visible)

If the user gives partial input, proceed with what exists and flag missing fields.

## Workflow

1. Build a competitor list table:
   - platform
   - profile URL
   - niche
2. Collect recent posts per competitor (prefer latest 10-20 posts in time window).
3. Extract per-post signals:
   - link
   - date
   - format (reel/video/carrusel/imagen/texto)
   - hook (first line)
   - topic/project type
   - visible metrics (views/likes/comments)
   - CTA style
4. Score posts:
   - High impact: strong hook + clear visual value + clear CTA + high engagement
   - Medium: good concept but weaker packaging
   - Low: low clarity or weak audience signal
5. Output 3 blocks:
   - Top references (with links)
   - Pattern summary (what is working)
   - Action plan for Oscar (today/this week)

## Output format (always)

Return sections in this order:

1) **Top competitor posts (links)**
- 5-15 items, each with: platform, author, date, link, why it worked.

2) **What patterns are winning now**
- Hooks
- Visual style
- Offer/CTA
- Narrative angle

3) **How ARCH-S should adapt this**
- 3 post ideas for today
- 3 post ideas for this week
- 1 experimental format to test

4) **Confidence + caveats**
- Clarify when metrics were not publicly visible.
- Do not fabricate view counts.

## Rules

- Prioritize direct post links.
- If exact view counts are unavailable, say "not publicly visible".
- Never claim virality without evidence.
- Keep recommendations practical and short.

## Reusable prompt template

"Analyze these competitors on LinkedIn/Instagram for the last <WINDOW> days: <LIST>. Focus on <FOCUS>. Return top posts with links, winning patterns, and a concrete ARCH-S content plan for today + this week."