import os, json, urllib.parse, urllib.request, pathlib, argparse

TOKEN = os.environ.get('META_ACCESS_TOKEN') or os.environ.get('FB_ACCESS_TOKEN') or os.environ.get('FACEBOOK_ACCESS_TOKEN')
if not TOKEN:
    raise SystemExit('META_TOKEN_MISSING')

ACT='act_817997474422827'
BASE='https://graph.facebook.com/v23.0/'
PAGE_ID='781850591689066'
ADSET_DEFAULT='120244890638770334'


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


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--image', required=True)
    ap.add_argument('--adset', default=ADSET_DEFAULT)
    ap.add_argument('--name', default='Hook_Custom_2026-03-19')
    ap.add_argument('--headline', default='Everything You Need Is Included.')
    ap.add_argument('--body', default='Complete build pack with architectural, structural and MEP-ready documents.')
    ap.add_argument('--link', default='https://skylightcabin.arch-s.com/')
    ap.add_argument('--out', default=r'C:\Users\Oscar\.openclaw\workspace\reports\meta-add-image-creative-latest.json')
    args=ap.parse_args()

    img=pathlib.Path(args.image)
    if not img.exists():
        raise SystemExit(f'Image not found: {img}')

    res={'uploaded':None,'creative':None,'ad':None,'errors':[]}

    upload_url = BASE + f'{ACT}/adimages'
    up = post_multipart(upload_url, {'access_token':TOKEN}, 'filename', img)
    images = up.get('images') or {}
    image_hash = (next(iter(images.values())).get('hash') if images else up.get('hash'))
    res['uploaded']={'image_hash':image_hash}

    creative = post(f'{ACT}/adcreatives', {
        'name': f"Creative_{args.name}",
        'object_story_spec': json.dumps({
            'page_id': PAGE_ID,
            'link_data': {
                'message': args.body,
                'link': args.link,
                'name': args.headline,
                'description': 'Buy Now and Start Building!',
                'image_hash': image_hash,
                'call_to_action': {'type':'LEARN_MORE','value':{'link':args.link}}
            }
        })
    })
    res['creative']=creative

    ad = post(f'{ACT}/ads', {
        'name': args.name,
        'adset_id': args.adset,
        'creative': json.dumps({'creative_id': creative.get('id')}),
        'status': 'ACTIVE'
    })
    res['ad']=ad

    pathlib.Path(args.out).write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
    print(args.out)


if __name__ == '__main__':
    main()
