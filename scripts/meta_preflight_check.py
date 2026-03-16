import os, json, urllib.parse, urllib.request
from pathlib import Path

TOKEN = os.environ.get('META_ACCESS_TOKEN') or os.environ.get('FB_ACCESS_TOKEN') or os.environ.get('FACEBOOK_ACCESS_TOKEN')
if not TOKEN:
    raise SystemExit('META_TOKEN_MISSING')

ACT = 'act_817997474422827'
CAMPAIGN_ID = '120244890614810334'
ADSET_ID = '120244890638770334'
BASE = 'https://graph.facebook.com/v23.0/'
OUT = Path(r'C:\Users\Oscar\.openclaw\workspace\reports\meta-preflight-2026-03-16.json')


def get(path, params=None):
    params = params or {}
    params['access_token'] = TOKEN
    url = BASE + path + '?' + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=90) as r:
        return json.loads(r.read().decode())

res = {}
try:
    res['account'] = get(ACT, {'fields': 'id,name,account_status,currency,amount_spent'})
    res['campaign'] = get(CAMPAIGN_ID, {'fields': 'id,name,status,effective_status,objective'})
    res['adset'] = get(ADSET_ID, {'fields': 'id,name,status,effective_status,daily_budget,optimization_goal'})
    ads = get(f'{ADSET_ID}/ads', {'fields': 'id,name,status,effective_status,issues_info', 'limit': 100}).get('data', [])
    res['ads'] = {
        'total': len(ads),
        'with_issues': sum(1 for a in ads if a.get('effective_status') == 'WITH_ISSUES'),
        'active_like': sum(1 for a in ads if a.get('status') == 'ACTIVE' and a.get('effective_status') in ('ACTIVE', 'IN_PROCESS'))
    }
    res['ok'] = True
except Exception as e:
    res['ok'] = False
    res['error'] = str(e)

OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
