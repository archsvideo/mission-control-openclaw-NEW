import os, json, time, urllib.parse, urllib.request
from pathlib import Path

TOKEN = os.environ.get('META_ACCESS_TOKEN') or os.environ.get('FB_ACCESS_TOKEN') or os.environ.get('FACEBOOK_ACCESS_TOKEN')
if not TOKEN:
    raise SystemExit('META_TOKEN_MISSING')

ACT = 'act_817997474422827'
CAMPAIGN_ID = '120244890614810334'
ADSET_ID = '120244890638770334'
SOURCE_CREATIVE_IDS = ['863697389512954', '1501145054513234', '1486699365749586']

BASE = 'https://graph.facebook.com/v23.0/'
OUT = Path(r'C:\Users\Oscar\.openclaw\workspace\reports\meta-autodeploy-2026-03-16.json')


def req(path, params=None, method='GET'):
    params = params or {}
    params['access_token'] = TOKEN
    if method == 'GET':
        url = BASE + path + '?' + urllib.parse.urlencode(params)
        with urllib.request.urlopen(url, timeout=90) as r:
            return json.loads(r.read().decode())
    body = urllib.parse.urlencode(params).encode('utf-8')
    rq = urllib.request.Request(BASE + path, data=body, method='POST')
    with urllib.request.urlopen(rq, timeout=90) as r:
        return json.loads(r.read().decode())


def safe_post(path, params):
    try:
        return {'ok': True, 'data': req(path, params, 'POST')}
    except urllib.error.HTTPError as e:
        return {'ok': False, 'error': e.read().decode()}


res = {'steps': [], 'created_ads': [], 'errors': []}

# 1) Ensure campaign/adset active
res['steps'].append({'campaign_active': safe_post(CAMPAIGN_ID, {'status': 'ACTIVE'})})
res['steps'].append({'adset_active': safe_post(ADSET_ID, {'status': 'ACTIVE'})})

# 2) Pause WITH_ISSUES ads
ads = req(f'{ADSET_ID}/ads', {'fields': 'id,name,status,effective_status,issues_info', 'limit': 100}).get('data', [])
for a in ads:
    if a.get('effective_status') == 'WITH_ISSUES':
        r = safe_post(a['id'], {'status': 'PAUSED'})
        res['steps'].append({'pause_with_issues': {'ad_id': a['id'], 'name': a.get('name'), 'result': r}})

# 3) Create 3 ads from known creatives (API-only)
for i, cid in enumerate(SOURCE_CREATIVE_IDS, start=1):
    name = f'AutoDeploy_Reuse_{i}_{int(time.time())}'
    r = safe_post(f'{ACT}/ads', {
        'name': name,
        'adset_id': ADSET_ID,
        'creative': json.dumps({'creative_id': cid}),
        'status': 'ACTIVE'
    })
    if r['ok']:
        res['created_ads'].append({'name': name, 'creative_id': cid, 'ad_id': r['data'].get('id')})
    else:
        res['errors'].append({'name': name, 'creative_id': cid, 'error': r['error']})

# 4) Post-check
time.sleep(2)
final_ads = req(f'{ADSET_ID}/ads', {'fields': 'id,name,status,effective_status,updated_time', 'limit': 100}).get('data', [])
res['final'] = {
    'campaign': req(CAMPAIGN_ID, {'fields': 'id,name,status,effective_status'}),
    'adset': req(ADSET_ID, {'fields': 'id,name,status,effective_status,daily_budget'}),
    'ads': final_ads,
    'counts': {
        'active_like': sum(1 for a in final_ads if a.get('status') == 'ACTIVE' and a.get('effective_status') in ('ACTIVE', 'IN_PROCESS', 'PENDING_BILLING_INFO')),
        'with_issues': sum(1 for a in final_ads if a.get('effective_status') == 'WITH_ISSUES'),
        'total': len(final_ads)
    }
}

OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
