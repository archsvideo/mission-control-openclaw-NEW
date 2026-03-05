---
name: viral-arch-content-radar
description: Find and analyze viral architecture content on LinkedIn and TikTok, focused on replicable project-style posts (masterplans, architectural details, construction process, interiors, before/after). Use when Oscar asks for viral references, competitor inspiration, recurring content research, or concise briefs to create similar high-performance posts automatically.
---

# Viral Architecture Content Radar

Always prioritize **replicable project content**, not generic selfie/office posts.

## Inputs (ask once, then reuse)
- Time window: 7/14/30 days
- Platforms: LinkedIn, TikTok, or both
- Focus: masterplans, details, interiors, construction process, before/after
- Language: EN/ES

If missing, default to: last 7 days, both platforms, EN+ES.

## Mandatory filtering rules
Keep only content that includes at least one:
1. Project visuals (real or concept) with architectural value
2. Process breakdown (steps, decisions, constraints)
3. Before/after transformation
4. Technical-detail explanation (materials, circulation, structure, lighting)

Reject:
- Selfie-first posts with no project substance
- Generic motivational text without design evidence
- Pure trend bait unrelated to architecture process/value

## Viral scoring (0-100)
Score each candidate:
- Hook strength (0-20)
- Visual clarity/impact (0-20)
- Replicability for ARCH-S (0-25)
- Engagement signal visibility (0-20)
- CTA/comment trigger quality (0-15)

Minimum pass: 70.

## Research workflow
1. Collect candidates from platform search/feed/manual links.
2. Extract per item:
   - direct post/video link
   - author
   - date
   - format (carousel/video/post)
   - hook (first line/caption)
   - project type
   - visible engagement (if public)
3. Score using rubric above.
4. Keep top 5-10 only.
5. Convert winners into ARCH-S production briefs.

## Output format (concise, always)

### 1) Top Viral References (replicable)
For each item include:
- Platform | Link | Author | Why it won | Replication angle

### 2) Winning Patterns This Week
- Hooks
- Visual types
- Narrative structures
- CTA patterns

### 3) ARCH-S Content Blueprint (today)
- 3 content ideas
- For each: hook + visual brief + caption angle + CTA

### 4) Production Prompts (ready)
Provide:
- 1 prompt for concept/masterplan
- 1 prompt for detail/interior
- 1 prompt for before/after storytelling

### 5) Confidence/Caveats
- State if views/metrics were not publicly visible
- Never invent numbers

## Automation mode (daily 08:00)
When requested as daily brief:
- Deliver only top 3 references + 3 actionable ideas
- Keep under 250 words + links
- Focus on what Oscar can produce same day

## Freepik Spaces integration rule
When creating visual outputs for Oscar:
- Prefer node flow: **Texto -> Asistente -> Generador de imagen -> Lista**
- Force model: **Google Nano Banana 2** (never Auto)
- Prefer **2K** resolution when available
- Generate multiple variants via list-connected workflow
