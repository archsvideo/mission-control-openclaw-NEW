---
name: freepik-kling-viral-workflow
description: Create architecture social content from a sketch using Freepik Pikaso with Google Nano Banana 2 (2K image) and Kling 2.5 (5s video), then draft a LinkedIn-ready post. Use when Oscar asks to automate image+video generation from concept sketches and wants repeatable end-to-end execution.
---

# Freepik + Kling Viral Workflow

## Inputs
- One base sketch/render/photo (project concept)
- Style target (default: photoreal cinematic architecture)
- Output aspect ratio (default: 9:16 for social)

## Defaults (Oscar)
- Image model: **Google Nano Banana 2**
- Image resolution: **2K**
- Video model: **Kling 2.5**
- Video duration: **5 seconds**

## Execution Procedure
1. Open Freepik Pikaso image generator in Chrome Relay session.
2. Verify model is `Google Nano Banana 2` and resolution is `2K`.
3. Upload the user sketch as a reference image.
4. Paste a geometry-preserving prompt and generate image.
5. Pick best result and click `Crear vídeo`.
6. In video settings, select `Kling 2.5` and set duration `5s`.
7. Use low-to-medium motion strength to avoid geometry warping.
8. Generate and download final image + video.
9. Return assets plus a short LinkedIn post draft.

## Prompt Templates

### Image prompt (geometry lock)
`Transform this architectural sketch into a photorealistic contemporary project. Preserve EXACT geometry, massing, perspective, camera angle, and site relationship. Keep all main volumes unchanged. Use realistic materials, natural lighting, cinematic atmosphere, and professional architectural photography quality. Do not redesign, do not add extra buildings, do not alter composition.`

### Video prompt (subtle motion)
`Cinematic architectural shot with slow dolly-in and light parallax. Maintain exact building geometry and framing. Add subtle environmental motion (water/trees/light haze), smooth professional movement, no warping, no morphing.`

## Quality Checklist
- Geometry and camera match original concept
- Materials read as realistic and coherent
- Water/landscape effects are believable, not exaggerated
- No visual artifacts, text, or watermark
- Final export is social-ready (prefer 9:16 when requested)

## Delivery Format
- `Image:` best 2K render
- `Video:` 5s Kling 2.5 clip
- `Post copy:` hook + 2-4 lines + CTA
- `Notes:` what was preserved and what was stylized

## Failure Handling
- If Freepik queue is long, report ETA and keep user updated.
- If browser relay/gateway fails, stop automation and ask user to restart gateway/relay, then resume from latest completed step.
- If output warps geometry, rerun with lower motion and stricter “preserve exact geometry” wording.
