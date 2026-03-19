import os, json, urllib.parse, urllib.request
from datetime import datetime

TOKEN = os.environ.get('META_ACCESS_TOKEN') or os.environ.get('FB_ACCESS_TOKEN') or os.environ.get('FACEBOOK_ACCESS_TOKEN')
if not TOKEN:
    raise SystemExit('META_TOKEN_MISSING')
BASE='https://graph.facebook.com/v23.0/'
ADSET='120244890638770334'
OUT=fr"C:\Users\Oscar\.openclaw\workspace\reports\meta-active-compare-{datetime.now().strftime('%Y-%m-%d')}.json"

def get(path, params):
    q=params.copy(); q['access_token']=TOKEN
    u=BASE+path+'?'+urllib.parse.urlencode(q)
    with urllib.request.urlopen(u, timeout=120) as r:
        return json.loads(r.read().decode())

ads=get(ADSET+'/ads',{'fields':'id,name,status,effective_status','limit':100}).get('data',[])
active=[a for a in ads if a.get('status')=='ACTIVE']
ids=[a['id'] for a in active]
ins=[]
if ids:
    ins=get('act_817997474422827/insights',{
        'level':'ad','date_preset':'last_3d','fields':'ad_id,ad_name,spend,impressions,clicks,ctr,cpc,actions',
        'filtering':json.dumps([{'field':'ad.id','operator':'IN','value':ids}]),'limit':100
    }).get('data',[])

by={i['ad_id']:i for i in ins}
out_rows=[]
for a in active:
    i=by.get(a['id'],{})
    lpv=0; chk=0
    for act in (i.get('actions') or []):
        t=act.get('action_type'); v=float(act.get('value') or 0)
        if t in ('landing_page_view','omni_landing_page_view'):
            if t=='landing_page_view': lpv+=v
        if t in ('initiate_checkout','offsite_conversion.fb_pixel_initiate_checkout','onsite_web_initiate_checkout','omni_initiated_checkout'):
            chk+=v
    spend=float(i.get('spend') or 0)
    out_rows.append({
        'ad_id':a['id'],'ad_name':a['name'],'effective_status':a.get('effective_status'),
        'spend':spend,'ctr':float(i.get('ctr') or 0),'cpc':float(i.get('cpc') or 0),
        'lpv':lpv,'checkout':chk,'lpv_per_dollar':(lpv/spend if spend>0 else 0)
    })
out_rows=sorted(out_rows,key=lambda x:(x['checkout'],x['lpv_per_dollar'],x['ctr']), reverse=True)
open(OUT,'w',encoding='utf-8').write(json.dumps({'generated_at':datetime.now().isoformat(),'active_count':len(active),'rows':out_rows},ensure_ascii=False,indent=2))
print(OUT)
