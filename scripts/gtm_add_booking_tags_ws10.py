from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-booking-tags-ws10-2026-03-18.json")
WS = "accounts/6319280242/containers/232612625/workspaces/10"
MEASUREMENT_ID = "G-1J2781XXKP"

MAP = [
    ("book_meeting", "GA4 - book_meeting", "CE - book_meeting"),
    ("calendar_booking", "GA4 - calendar_booking", "CE - calendar_booking"),
    ("generate_lead", "GA4 - generate_lead", "CE - generate_lead"),
    ("calendly_click", "GA4 - calendly_click", "Click - Calendly outbound"),
]

creds = Credentials.from_authorized_user_file(str(TOKEN))
svc = build('tagmanager', 'v2', credentials=creds, cache_discovery=False)

res = {"created": [], "existing": [], "errors": [], "version": None}

triggers = svc.accounts().containers().workspaces().triggers().list(parent=WS).execute().get('trigger', [])
tr_by_name = {t.get('name'): t for t in triggers}

tags = svc.accounts().containers().workspaces().tags().list(parent=WS).execute().get('tag', [])
existing_names = {t.get('name') for t in tags}

for ev, tag_name, trig_name in MAP:
    try:
        if tag_name in existing_names:
            res['existing'].append(tag_name)
            continue
        trig = tr_by_name.get(trig_name)
        if not trig:
            res['errors'].append(f"missing trigger {trig_name}")
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
        svc.accounts().containers().workspaces().tags().create(parent=WS, body=body).execute()
        res['created'].append(tag_name)
    except Exception as e:
        res['errors'].append(f"{tag_name}: {e}")

try:
    v = svc.accounts().containers().workspaces().create_version(path=WS, body={"name": "Booking Events Fix v2", "notes": "Add GA4 booking tags with measurementIdOverride"}).execute()
    cv = v.get('containerVersion', {})
    res['version'] = {"containerVersionId": cv.get('containerVersionId'), "path": cv.get('path'), "name": cv.get('name')}
except Exception as e:
    res['errors'].append(f"create_version: {e}")

OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
