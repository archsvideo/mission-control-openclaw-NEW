---
name: link-plus-preview-delivery
description: Deliver visual-first results for image tasks by always sending both a direct link and a small preview image. Use when Oscar asks to find, download, compare, or share images so he can verify quickly without opening each link.
---

# Link + Preview Delivery

## Objective
For any image-related output, provide:
1) direct link/source URL, and
2) preview image (small screenshot or original image attachment).

## Default workflow
1. Locate image URLs.
2. Download image(s) when needed.
3. Attach preview(s) in chat (Telegram/other supported channel).
4. Include short caption with source link and file name.
5. Confirm what each preview corresponds to.

## Output format (mandatory)
- `Preview:` attached image
- `Link:` direct URL
- `Note:` one-line context (e.g., "1st floor plan")

## Quality rules
- Never send link-only for visual tasks unless user explicitly asks.
- Prefer compact previews; user can open full link for detail.
- If multiple images, label clearly: `Image 1`, `Image 2`, etc.
