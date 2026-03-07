# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Device Profile (Oscar)

### Main laptop (as of 2026-03-06)
- Device name: Oscarbot
- CPU: Intel Core i5-13420H (13th Gen)
- RAM: 8 GB (7.73 GB usable)
- GPU: Intel UHD Graphics (integrated)
- Reported dedicated VRAM: 128 MB (shared memory available via system RAM)
- Storage: 477 GB total (approx. 69 GB used at capture time)
- OS: Windows 64-bit (x64)

### Revit practical limits on this machine
- Suitable: small-to-medium models, light documentation, early automation scripting (pyRevit/Dynamo), focused single-model sessions.
- Risky/slow: large federated models, heavy real-time visualization, concurrent Revit + render + browser + many apps.
- Recommended baseline for smoother work: 16 GB RAM minimum (32 GB ideal) and dedicated GPU if possible.

### Web browsing preference
- For internet/webpage access tasks, prefer using the `agent-browser` skill/workflow.

### Freepik generation defaults (Oscar)
- Always use model: **Google Nano Banana 2**.
- For sketch-to-real render tasks, prioritize geometry lock over creativity.
- Always upload the latest user-provided reference capture before generating.
- Keep monitor loop active and proactively notify when output is ready (no user ping required).

### Long-task progress protocol (Oscar)
- For tasks estimated >60s, send a progress update every 40-60s.
- Use milestone updates: `start -> collecting -> filtering -> delivering`.
- If no valid result after 3-5 minutes, send explicit status: `0 valid yet` + next action.
- Never stay silent after saying "I'm doing it"; always post at least one intermediate update.
- Break long tasks into small batches and report each batch before continuing.
