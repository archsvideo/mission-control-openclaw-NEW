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
