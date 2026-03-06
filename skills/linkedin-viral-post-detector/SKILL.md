---
name: linkedin-viral-post-detector
description: Detect and rank viral LinkedIn posts by extracting engagement signals (reactions, comments, shares, and when available views) and returning direct post permalinks. Use when Oscar asks for high-viral architecture/competitor posts with links he can open.
---

# LinkedIn Viral Post Detector

## Objective
Find truly high-traction posts and return **direct post URLs** plus evidence.

## Data sources
- Chrome Relay (preferred for Oscar account context)
- OpenClaw browser profile (fallback)

## Required output per post
- Author/page
- Reactions
- Comments
- Shares
- Views (only if explicitly visible in UI)
- Direct post URL (`/feed/update/urn:li:activity:<ID>/` or `/posts/...`)
- Viral score + confidence

## Viral scoring
Use this default score when signals are available:

`viral_score = reactions + (comments * 2) + (shares * 3) + (views / 100)`

If views are not visible, compute score without views and mark `views: not visible`.

## Operating procedure
1. Query/search niche (e.g. `#architecture`, `#archviz`, competitor names).
2. Filter to posts only; ignore ads unless requested.
3. Extract post candidates from `data-urn="urn:li:activity:..."` and visible metrics.
4. Build permalink from URN: `https://www.linkedin.com/feed/update/urn:li:activity:<ID>/`.
5. Validate permalink opens correctly.
6. Return top-ranked posts (default top 3).

## Quality rules
- Never return profile links when post links were requested.
- If metrics are partially hidden, include only verified numbers and label unknown fields.
- Prefer posts with high comments+shares over vanity likes.
- Keep responses short and actionable.
