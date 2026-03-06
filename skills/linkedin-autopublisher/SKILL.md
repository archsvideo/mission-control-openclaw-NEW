---
name: linkedin-autopublisher
description: Publish image posts to personal LinkedIn account end-to-end (download assets, attach images, paste copy, post) without manual relay clicks.
---

# LinkedIn Autopublisher

## When to use
Use when Oscar asks to publish on LinkedIn and wants minimal/no manual intervention.

## Why this exists
Browser relay can fail on native OS file picker. This flow avoids picker dependency by using Playwright `setInputFiles()` directly on LinkedIn upload input.

## Inputs
- `copy.txt` (post text)
- image files (`.png/.jpg/.jpeg/.webp`)
- Optional Google Drive folder URL

## Runbook
1. Prepare assets:
   - If Drive link exists, download/extract to `tmp/linkedin_publish/<timestamp>/images/`
   - Save copy into `tmp/linkedin_publish/<timestamp>/copy.txt`
2. Run publisher script with explicit verification text:
   - `node scripts/linkedin_publish.mjs --copy <path-to-copy.txt> --images <img1> <img2> ... --verify-text "<unique snippet>"`
3. Verify success:
   - Script must confirm the snippet appears in `recent-activity/all`.
   - Script writes proof screenshot to `tmp/linkedin_publish/verify-proof.png`.
4. Report status clearly:
   - Success: "Publicado ✅"
   - Failure: exact blocking step + suggested fallback.

## Reliability rules
- Use persistent Chrome user data dir (already logged in LinkedIn).
- Do not call native file chooser; always use `input[type=file]` and `setInputFiles`.
- Keep one tab/session for the whole flow.
- Timeout each stage and print explicit step name.

## Safety
- Never publish without explicit user request.
- Use exact copy unless user asks to edit.
- If post target/account is ambiguous, stop and ask.
