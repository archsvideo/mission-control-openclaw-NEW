import os, json, urllib.parse, urllib.request

TOKEN = os.environ.get('META_ACCESS_TOKEN') or os.environ.get('FB_ACCESS_TOKEN') or os.environ.get('FACEBOOK_ACCESS_TOKEN')
if not TOKEN:
    raise SystemExit('META_TOKEN_MISSING')

BASE='https://graph.facebook.com/v23.0/'
ACT='act_817997474422827'
ADSET='120244890638770334'  # current active adset
REPORT=r'C:\Users\Oscar\.openclaw\workspace\reports\meta-apply-top3-focus-2026-03-19.json'

# winners from old campaign (ad ids)
OLD_WINNER_AD_IDS=[
    '120240183636090334',  # Complete_files_and_architect_support
    '120240183636060334',  # Diferent_cabin_sizes_for_family
]

# winner from current campaign
CURRENT_KEEP_AD_IDS=['120244986730030334']  # BestCreative_1


def get(path, params):
    q=params.copy(); q['access_token']=TOKEN
    u=BASE+path+'?'+urllib.parse.urlencode(q)
    with urllib.request.urlopen(u, timeout=90) as r:
        return json.loads(r.read().decode())


def post(path, data):
    q=data.copy(); q['access_token']=TOKEN
    b=urllib.parse.urlencode(q).encode('utf-8')
    req=urllib.request.Request(BASE+path, data=b, method='POST')
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode())

res={'old_winner_creatives':[],'created':[],'paused':[],'errors':[]}

# 1) resolve creative ids for old winner ads
for ad_id in OLD_WINNER_AD_IDS:
    try:
        ad = get(ad_id, {'fields':'id,name,creative{id,name}'})
        cid=(ad.get('creative') or {}).get('id')
        if cid:
            res['old_winner_creatives'].append({'ad_id':ad_id,'ad_name':ad.get('name'),'creative_id':cid})
    except Exception as e:
        res['errors'].append(f'resolve creative {ad_id}: {e}')

# target creative set = old winner creatives + current best creative
target_creatives=set([x['creative_id'] for x in res['old_winner_creatives'] if x.get('creative_id')])
try:
    cur_best = get(CURRENT_KEEP_AD_IDS[0], {'fields':'id,name,creative{id,name}'})
    cur_cid=(cur_best.get('creative') or {}).get('id')
    if cur_cid:
        target_creatives.add(cur_cid)
except Exception as e:
    res['errors'].append(f'resolve current best creative: {e}')

# 2) current ads in adset
ads = get(ADSET+'/ads', {'fields':'id,name,status,effective_status,creative{id,name}','limit':100}).get('data',[])
active_by_creative={}
for a in ads:
    cid=(a.get('creative') or {}).get('id')
    if a.get('status')=='ACTIVE' and cid:
        active_by_creative[cid]=a

# 3) create missing target creatives in current adset
for cid in target_creatives:
    if cid not in active_by_creative:
        try:
            cr = get(cid, {'fields':'id,name'})
            name = cr.get('name') or f'ImportedCreative_{cid[-6:]}'
            new_ad = post(ACT+'/ads', {
                'name': f'TOP3_{name[:50]}',
                'adset_id': ADSET,
                'creative': json.dumps({'creative_id': cid}),
                'status': 'ACTIVE'
            })
            res['created'].append({'creative_id':cid,'ad_id':new_ad.get('id')})
        except Exception as e:
            res['errors'].append(f'create from creative {cid}: {e}')

# 4) pause non-target active ads (except WITH_ISSUES paused already)
ads2 = get(ADSET+'/ads', {'fields':'id,name,status,effective_status,creative{id,name}','limit':100}).get('data',[])
for a in ads2:
    if a.get('status')!='ACTIVE':
        continue
    cid=(a.get('creative') or {}).get('id')
    if cid not in target_creatives:
        try:
            post(a['id'], {'status':'PAUSED'})
            res['paused'].append({'ad_id':a['id'],'name':a.get('name'),'creative_id':cid})
        except Exception as e:
            res['errors'].append(f"pause {a.get('id')}: {e}")

res['final']=get(ADSET+'/ads', {'fields':'id,name,status,effective_status,creative{id,name}','limit':100})

with open(REPORT,'w',encoding='utf-8') as f:
    json.dump(res, f, ensure_ascii=False, indent=2)
print(REPORT)
