from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json
from datetime import datetime

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-booking-fix-ws12-2026-03-18.json")
CONTAINER = "accounts/6319280242/containers/232612625"
MEASUREMENT_ID = "G-1J2781XXKP"

creds = Credentials.from_authorized_user_file(str(TOKEN))
svc = build('tagmanager', 'v2', credentials=creds, cache_discovery=False)
res = {"workspace": None, "created": {"triggers": [], "tags": []}, "errors": [], "version": None}

# create fresh workspace
ws = svc.accounts().containers().workspaces().create(parent=CONTAINER, body={"name": f"Booking fix ws12 {datetime.now().strftime('%Y%m%d-%H%M%S')}"}).execute()
WS = ws['path']
res['workspace'] = {"path": WS, "workspaceId": ws.get('workspaceId'), "name": ws.get('name')}

# read existing entities in this fresh ws snapshot
trigs = svc.accounts().containers().workspaces().triggers().list(parent=WS).execute().get('trigger', [])
tr_by_name = {t.get('name'): t for t in trigs}

def ensure_trigger(name, body):
    if name in tr_by_name:
        return tr_by_name[name]
    t = svc.accounts().containers().workspaces().triggers().create(parent=WS, body=body).execute()
    tr_by_name[name] = t
    res['created']['triggers'].append(name)
    return t

# ensure triggers
for ev in ["book_meeting", "calendar_booking", "generate_lead"]:
    n = f"CE - {ev}"
    body = {
        "name": n,
        "type": "customEvent",
        "customEventFilter": [{
            "type": "equals",
            "parameter": [
                {"type": "template", "key": "arg0", "value": "{{_event}}"},
                {"type": "template", "key": "arg1", "value": ev}
            ]
        }]
    }
    try:
        ensure_trigger(n, body)
    except Exception as e:
        res['errors'].append(f"trigger {n}: {e}")

try:
    ensure_trigger("Click - Calendly outbound", {
        "name": "Click - Calendly outbound",
        "type": "linkClick",
        "waitForTags": {"type": "boolean", "value": "false"},
        "checkValidation": {"type": "boolean", "value": "false"},
        "filter": [{
            "type": "contains",
            "parameter": [
                {"type": "template", "key": "arg0", "value": "{{Click URL}}"},
                {"type": "template", "key": "arg1", "value": "calendly.com"}
            ]
        }]
    })
except Exception as e:
    res['errors'].append(f"trigger calendly: {e}")

# refresh tags list
tags = svc.accounts().containers().workspaces().tags().list(parent=WS).execute().get('tag', [])
tag_names = {t.get('name') for t in tags}

pairs = [
    ("GA4 - book_meeting", "book_meeting", "CE - book_meeting"),
    ("GA4 - calendar_booking", "calendar_booking", "CE - calendar_booking"),
    ("GA4 - generate_lead", "generate_lead", "CE - generate_lead"),
    ("GA4 - calendly_click", "calendly_click", "Click - Calendly outbound"),
]

for tag_name, ev, trig_name in pairs:
    if tag_name in tag_names:
        continue
    trig = tr_by_name.get(trig_name)
    if not trig:
        res['errors'].append(f"missing trigger for {tag_name}")
        continue
    body = {
        "name": tag_name,
        "type": "gaawe",
        "parameter": [
            {"type": "template", "key": "eventName", "value": ev},
            {"type": "template", "key": "measurementIdOverride", "value": MEASUREMENT_ID}
        ],
        "firingTriggerId": [str(trig.get('triggerId'))],
        "tagFiringOption": "oncePerEvent"
    }
    try:
        svc.accounts().containers().workspaces().tags().create(parent=WS, body=body).execute()
        res['created']['tags'].append(tag_name)
    except Exception as e:
        res['errors'].append(f"tag {tag_name}: {e}")

# now create version once everything done
try:
    v = svc.accounts().containers().workspaces().create_version(path=WS, body={"name": "Booking events ws12", "notes": "Booking + Calendly tracking events"}).execute()
    cv = v.get('containerVersion', {})
    res['version'] = {"containerVersionId": cv.get('containerVersionId'), "path": cv.get('path'), "name": cv.get('name')}
except Exception as e:
    res['errors'].append(f"create_version: {e}")

OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
