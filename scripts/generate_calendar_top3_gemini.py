import os, csv, base64, json, pathlib, urllib.request

API_KEY = os.environ.get('GOOGLE_API_KEY')
if not API_KEY:
    raise SystemExit('GOOGLE_API_KEY not set')

manifest = pathlib.Path(r"C:\Users\Oscar\.openclaw\workspace\reports\calendar-v11b\manifest.csv")
out_dir = pathlib.Path(r"C:\Users\Oscar\.openclaw\workspace\reports\calendar-v11b\assets")
out_dir.mkdir(parents=True, exist_ok=True)

rows = []
with manifest.open('r', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        d = int(r['day'])
        if d <= 3:
            rows.append(r)

model = 'gemini-3.1-flash-image-preview'  # Nano Banana 2
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"

style = (
    "Architectural social post visual, photorealistic but editorial, clean composition, "
    "natural daylight, high detail materials, no text, no watermark, 16:9, premium architecture studio style."
)

for r in rows:
    day = int(r['day'])
    hook = r['hook'].strip()
    tags = r['tags'].strip()
    pillar = r['pillar'].strip()
    prompt = (
        f"{style} Theme: {pillar}. Concept hook: {hook}. "
        f"Visual cues: {tags}. Focus on one strong central idea, cinematic depth, realistic scale and structure."
    )

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read().decode('utf-8'))

    b64 = None
    for cand in data.get('candidates', []):
        for part in cand.get('content', {}).get('parts', []):
            inline = part.get('inlineData')
            if inline and inline.get('data'):
                b64 = inline['data']
                break
        if b64:
            break

    if not b64:
        raise RuntimeError(f"No image data for day {day}: {json.dumps(data)[:600]}")

    img = base64.b64decode(b64)
    out_path = out_dir / f"day-{day:02d}.jpg"
    out_path.write_bytes(img)
    print(f"saved {out_path}")

print('done')
