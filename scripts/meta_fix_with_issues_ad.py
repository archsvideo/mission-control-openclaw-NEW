import os, json, urllib.parse, urllib.request

TOKEN = os.environ.get('META_ACCESS_TOKEN') or os.environ.get('FB_ACCESS_TOKEN') or os.environ.get('FACEBOOK_ACCESS_TOKEN')
if not TOKEN:
    raise SystemExit('META_TOKEN_MISSING')

BASE='https://graph.facebook.com/v23.0/'
ADSET='120244890638770334'
ACT='act_817997474422827'
REPORT=r'C:\Users\Oscar\.openclaw\workspace\reports\meta-fix-with-issues-2026-03-19.json'


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

res={'issues_ads':[],'actions':[],'errors':[]}

ads=get(ADSET+'/ads',{'fields':'id,name,status,effective_status,configured_status,creative{id,name},issues_info,ad_review_feedback,recommendations','limit':100}).get('data',[])

# 1) detect ads with issues
issues=[a for a in ads if a.get('effective_status')=='WITH_ISSUES' or (a.get('issues_info') not in (None,[],{}))]
res['issues_ads']=issues

# 2) ensure at least one ACTIVE ad exists and is healthy
healthy_active=[a for a in ads if a.get('status')=='ACTIVE' and a.get('effective_status') in ('ACTIVE','PENDING_REVIEW','IN_PROCESS')]
if not healthy_active:
    # if none active, try to activate best creative ad by name if exists
    candidate=next((a for a in ads if 'BestCreative_1' in (a.get('name') or '')), None)
    if candidate:
        try:
            post(candidate['id'],{'status':'ACTIVE'})
            res['actions'].append({'type':'activate','ad_id':candidate['id'],'name':candidate.get('name')})
        except Exception as e:
            res['errors'].append(f'activate candidate failed: {e}')

# 3) pause WITH_ISSUES ads to prevent optimizer drag
for a in issues:
    if a.get('status')!='PAUSED':
        try:
            post(a['id'],{'status':'PAUSED'})
            res['actions'].append({'type':'pause_with_issues','ad_id':a['id'],'name':a.get('name')})
        except Exception as e:
            res['errors'].append(f"pause {a.get('id')}: {e}")

# 4) optional optimization: duplicate healthy active ad if only 1 active creative
ads2=get(ADSET+'/ads',{'fields':'id,name,status,effective_status,creative{id,name}','limit':100}).get('data',[])
active=[a for a in ads2 if a.get('status')=='ACTIVE']
active_creative_ids=list({(a.get('creative') or {}).get('id') for a in active if (a.get('creative') or {}).get('id')})

if len(active_creative_ids)==1 and active:
    src=active[0]
    src_cid=(src.get('creative') or {}).get('id')
    # create one additional ad from same proven creative for delivery resilience
    try:
        new_ad=post(ACT+'/ads',{
            'name':'BestCreative_1_Backup_AutoFix',
            'adset_id':ADSET,
            'creative':json.dumps({'creative_id':src_cid}),
            'status':'ACTIVE'
        })
        res['actions'].append({'type':'create_backup_ad','source_creative':src_cid,'new_ad_id':new_ad.get('id')})
    except Exception as e:
        res['errors'].append(f'create backup ad failed: {e}')

res['final']=get(ADSET+'/ads',{'fields':'id,name,status,effective_status,creative{id,name},issues_info','limit':100})

with open(REPORT,'w',encoding='utf-8') as f:
    json.dump(res,f,ensure_ascii=False,indent=2)
print(REPORT)
