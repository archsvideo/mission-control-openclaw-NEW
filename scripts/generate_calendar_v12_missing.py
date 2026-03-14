import os, csv, json, base64, pathlib, urllib.request, time
api_key=os.environ.get('GOOGLE_API_KEY')
base=pathlib.Path(r"C:\Users\Oscar\.openclaw\workspace\reports\calendar-v12-arch-pro")
rows=list(csv.DictReader((base/'manifest.csv').open('r',encoding='utf-8')))
model='gemini-3.1-flash-image-preview'
url=f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
for r in rows:
    d=int(r['day'])
    out=base/'assets'/f"day-{d:02d}.jpg"
    if out.exists():
        continue
    prompt=r['image_prompt_detailed'].strip()+" No people, no text. Vertical 4:5 social post composition. High-end architectural visualization, realistic and buildable."
    payload={"contents":[{"role":"user","parts":[{"text":prompt}]}],"generationConfig":{"responseModalities":["TEXT","IMAGE"]}}
    req=urllib.request.Request(url,data=json.dumps(payload).encode('utf-8'),headers={'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(req,timeout=240) as resp:
        data=json.loads(resp.read().decode('utf-8'))
    b64=None
    for c in data.get('candidates',[]):
        for p in c.get('content',{}).get('parts',[]):
            i=p.get('inlineData')
            if i and i.get('data'):
                b64=i['data']; break
        if b64: break
    if not b64:
        print('no image',d); continue
    out.write_bytes(base64.b64decode(b64)); print('saved',out)
    time.sleep(1.2)
print('done')