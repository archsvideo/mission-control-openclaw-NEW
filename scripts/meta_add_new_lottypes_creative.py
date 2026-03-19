import os, json, urllib.parse, urllib.request, pathlib

TOKEN = os.environ.get('META_ACCESS_TOKEN') or os.environ.get('FB_ACCESS_TOKEN') or os.environ.get('FACEBOOK_ACCESS_TOKEN')
if not TOKEN:
    raise SystemExit('META_TOKEN_MISSING')

ACT='act_817997474422827'
ADSET='120244890638770334'
PAGE_ID='781850591689066'
BASE='https://graph.facebook.com/v23.0/'
IMG_PATH=pathlib.Path(r"C:\Users\Oscar\.openclaw\media\inbound\file_262---78f791c2-8219-4a9b-aecd-5b5c3afb4741.jpg")
OUT=pathlib.Path(r"C:\Users\Oscar\.openclaw\workspace\reports\meta-add-lottypes-creative-2026-03-19.json")


def post_multipart(url, fields, file_field=None, file_path=None):
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    data = bytearray()

    for k, v in fields.items():
        data.extend(f'--{boundary}\r\n'.encode())
        data.extend(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode())
        data.extend(str(v).encode('utf-8'))
        data.extend(b'\r\n')

    if file_field and file_path:
        filename = file_path.name
        content = file_path.read_bytes()
        data.extend(f'--{boundary}\r\n'.encode())
        data.extend(f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'.encode())
        data.extend(b'Content-Type: image/jpeg\r\n\r\n')
        data.extend(content)
        data.extend(b'\r\n')

    data.extend(f'--{boundary}--\r\n'.encode())

    req = urllib.request.Request(url, data=bytes(data), method='POST')
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())


def post(path, payload):
    q=payload.copy(); q['access_token']=TOKEN
    b=urllib.parse.urlencode(q).encode('utf-8')
    req=urllib.request.Request(BASE+path, data=b, method='POST')
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())

res={'uploaded':None,'creative':None,'ad':None,'errors':[]}

if not IMG_PATH.exists():
    raise SystemExit(f'Image not found: {IMG_PATH}')

# 1) upload image to ad account
try:
    upload_url = BASE + f'{ACT}/adimages'
    fields = {'access_token': TOKEN}
    up = post_multipart(upload_url, fields, 'filename', IMG_PATH)
    # response may contain images dict by file name
    images = up.get('images') or {}
    if images:
        first = next(iter(images.values()))
        image_hash = first.get('hash')
    else:
        image_hash = up.get('hash')
    res['uploaded'] = {'response': up, 'image_hash': image_hash}
except Exception as e:
    res['errors'].append(f'upload: {e}')
    image_hash = None

if image_hash:
    # 2) create ad creative with that image
    msg = "One cabin design. Multiple lot possibilities. Adaptable to flat, sloped, or crawlspace sites."
    title = "One Cabin. Multiple Lot Types."
    desc = "Adaptable plans for real-world lots."
    try:
        creative = post(f'{ACT}/adcreatives', {
            'name': 'Skylight_Hook_LotTypes_2026-03-19',
            'object_story_spec': json.dumps({
                'page_id': PAGE_ID,
                'link_data': {
                    'message': msg,
                    'link': 'https://skylightcabin.arch-s.com/',
                    'name': title,
                    'description': desc,
                    'image_hash': image_hash,
                    'call_to_action': {
                        'type': 'LEARN_MORE',
                        'value': {'link': 'https://skylightcabin.arch-s.com/'}
                    }
                }
            })
        })
        res['creative'] = creative
        creative_id = creative.get('id')
    except Exception as e:
        res['errors'].append(f'create creative: {e}')
        creative_id = None

    # 3) create ad in active adset
    if creative_id:
        try:
            ad = post(f'{ACT}/ads', {
                'name': 'Hook_LotTypes_NewCreative_2026-03-19',
                'adset_id': ADSET,
                'creative': json.dumps({'creative_id': creative_id}),
                'status': 'ACTIVE'
            })
            res['ad'] = ad
        except Exception as e:
            res['errors'].append(f'create ad: {e}')

OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
