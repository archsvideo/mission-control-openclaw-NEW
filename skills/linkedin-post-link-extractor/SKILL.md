---
name: linkedin-post-link-extractor
description: Extract direct LinkedIn post permalinks from feed/search pages using Chrome Relay or OpenClaw browser. Use when Oscar asks for exact post URLs (not profile/feed links), especially for viral architecture competitor research.
---

# LinkedIn Post Link Extractor

## Goal
Return direct post links like:
- `https://www.linkedin.com/feed/update/urn:li:activity:<ID>/`
- or canonical `/posts/...` URL when available.

## Workflow
1. Prefer Chrome Relay when account/feed context matters.
2. Open LinkedIn search for topic (e.g. `#architecture`) and filter to `Publicaciones`.
3. Rank candidates by visible engagement (reactions/comments/shares).
4. For each target post, open the three-dots menu and use share/copy link if available.
5. If copy-link is unavailable, derive permalink from activity URN:
   - Find `highlightedUpdateUrn=urn:li:activity:<ID>` in any visible href.
   - Build: `https://www.linkedin.com/feed/update/urn:li:activity:<ID>/`
6. Validate by opening the generated link and confirming it loads the post.

## Output format
- Author
- Visible metrics
- Direct post URL
- Confidence (high/medium/low)

## Rules
- Never return profile links when user asked for post links.
- If exact permalink is blocked by UI overlays, state limitation and provide URN-based permalink with confidence label.
- Exclude promoted posts unless user asks to include ads.
