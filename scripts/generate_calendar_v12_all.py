import os, csv, json, base64, pathlib, urllib.request, time

api_key = os.environ.get('GOOGLE_API_KEY')
if not api_key:
    raise SystemExit('GOOGLE_API_KEY missing')

base = pathlib.Path(r"C:\Users\Oscar\.openclaw\workspace\reports\calendar-v12-arch-pro")
manifest_path = base / "manifest.csv"
out_dir = base / "assets"
out_dir.mkdir(parents=True, exist_ok=True)

rows = list(csv.DictReader(manifest_path.open('r', encoding='utf-8')))

model = 'gemini-3.1-flash-image-preview'  # Nano Banana 2
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

for r in rows:
    day = int(r['day'])
    prompt = r['image_prompt_detailed'].strip()
    full_prompt = (
        prompt
        + " Keep architecture accurate and buildable. No people. No text overlays. No logos."
        + " Vertical social composition, aspect ratio 4:5 portrait (for LinkedIn/Instagram post),"
        + " high-end architectural visualization quality, editorial composition, realistic materials and lighting."
    )

    payload = {
        "contents": [{"role": "user", "parts": [{"text": full_prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )

    try:
        with urllib.request.urlopen(req, timeout=240) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"day {day:02d} failed request: {e}")
        continue

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
        print(f"day {day:02d} no image returned")
        continue

    out_path = out_dir / f"day-{day:02d}.jpg"
    out_path.write_bytes(base64.b64decode(b64))
    print('saved', out_path)
    time.sleep(1.2)

print('done')
