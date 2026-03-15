from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json

TOKEN=Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
WS="accounts/6319280242/containers/232612625/workspaces/7"
MID="G-1J2781XXKP"
OUT=Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-event-tags-create-2026-03-15.json")

creds=Credentials.from_authorized_user_file(str(TOKEN))
svc=build('tagmanager','v2',credentials=creds,cache_discovery=False)

triggers=svc.accounts().containers().workspaces().triggers().list(parent=WS).execute().get('trigger',[])
trigger_map={t.get('name'):t.get('triggerId') for t in triggers}
tags=svc.accounts().containers().workspaces().tags().list(parent=WS).execute().get('tag',[])
tag_names={t.get('name') for t in tags}

events=["select_bedroom","select_foundation","add_to_cart","begin_checkout","purchase"]
res={"created":[],"errors":[]}

for ev in events:
    name=f"GA4 - {ev}"
    if name in tag_names:
        continue
    trig=trigger_map.get(f"CE - {ev}")
    if not trig:
        res['errors'].append(f"missing trigger for {ev}")
        continue
    body={
      "name":name,
      "type":"gaawe",
      "parameter":[
        {"type":"template","key":"eventName","value":ev},
        {"type":"template","key":"measurementIdOverride","value":MID},
        {"type":"list","key":"eventParameters","list":[
          {"type":"map","map":[{"type":"template","key":"name","value":"value"},{"type":"template","key":"value","value":"{{DLV - value}}"}]},
          {"type":"map","map":[{"type":"template","key":"name","value":"currency"},{"type":"template","key":"value","value":"{{DLV - currency}}"}]},
          {"type":"map","map":[{"type":"template","key":"name","value":"event_id"},{"type":"template","key":"value","value":"{{DLV - event_id}}"}]},
          {"type":"map","map":[{"type":"template","key":"name","value":"bedroom_type"},{"type":"template","key":"value","value":"{{DLV - bedroom_type}}"}]},
          {"type":"map","map":[{"type":"template","key":"name","value":"foundation_type"},{"type":"template","key":"value","value":"{{DLV - foundation_type}}"}]}
        ]}
      ],
      "firingTriggerId":[str(trig)],
      "tagFiringOption":"oncePerEvent"
    }
    try:
      t=svc.accounts().containers().workspaces().tags().create(parent=WS,body=body).execute()
      res['created'].append({"name":name,"tagId":t.get('tagId')})
    except Exception as e:
      res['errors'].append(f"{ev}: {e}")

OUT.write_text(json.dumps(res,indent=2),encoding='utf-8')
print(OUT)
