#!/usr/bin/env python3
"""
Safe Prompt Builder (non-explicit) for portrait/image generation workflows.

Usage:
  python scripts/safe_prompt_builder.py --preset glam --identity-lock high --out prompt.txt
  python scripts/safe_prompt_builder.py --preset romance --custom "emerald dress, rainy street" 
"""

import argparse

PRESETS = {
    "glam": {
        "base": "High-end editorial glamour portrait, photorealistic, premium styling, elegant confidence.",
        "style": "luxury fashion, cinematic lighting, refined makeup, polished composition",
    },
    "romance": {
        "base": "Cinematic romantic portrait with soft atmosphere and emotional tone.",
        "style": "golden hour/backlight, subtle haze, graceful styling, tasteful mood",
    },
    "luxury": {
        "base": "Premium luxury portrait in modern interior with magazine-quality framing.",
        "style": "marble/wood textures, soft contrast, rich color grading, poised body language",
    },
}

IDENTITY_LOCK = {
    "low": "Preserve overall likeness.",
    "medium": "Preserve identity and facial proportions.",
    "high": "Preserve exact identity, facial structure, and camera-facing proportions.",
}

SAFE_NEGATIVE = (
    "no nudity, no explicit sexual content, no fetish styling, no anatomy distortion, "
    "no identity drift, no extra limbs, no cartoon, no low-res, no watermark"
)


def build_prompt(preset: str, identity_lock: str, custom: str) -> str:
    p = PRESETS[preset]
    parts = [
        p["base"],
        p["style"],
        IDENTITY_LOCK[identity_lock],
        "Natural skin texture, realistic eyes/hair detail, 2K output quality.",
    ]
    if custom:
        parts.append(f"Custom direction: {custom.strip()}.")
    return " ".join(parts)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preset", choices=PRESETS.keys(), default="glam")
    ap.add_argument("--identity-lock", choices=IDENTITY_LOCK.keys(), default="high")
    ap.add_argument("--custom", default="")
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    prompt = build_prompt(args.preset, args.identity_lock, args.custom)
    result = f"PROMPT:\n{prompt}\n\nNEGATIVE PROMPT:\n{SAFE_NEGATIVE}\n"

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(result)
        print(f"Saved: {args.out}")
    else:
        print(result)


if __name__ == "__main__":
    main()
