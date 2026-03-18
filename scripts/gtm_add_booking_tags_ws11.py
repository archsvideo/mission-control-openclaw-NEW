from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-booking-tags-ws11-2026-03-18.json")
WS = "accounts/6319280242/containers/232612625/workspaces/11"
MEASUREMENT_ID = "G-1J2781XXKP"

PAIRS = [
    ("GA4 - book_meeting", "book_meeting", "CE - book_meeting"),
    ("GA4 - calendar_booking", "calendar_booking", "CE - calendar_booking"),
    ("GA4 - generate_lead", "generate_lead", "CE - generate_lead"),
    ("GA4 - calendly_click", "calendly_click", "Click - Calendly outbound"),
]

creds = Credentials.from_authorized_user_file(str(TOKEN))
svc = build('tagmanager', 'v2', credentials=creds, cache_discovery=False)
res = {"created": [], "errors": [], "version": None}

trigs = svc.accounts().containers().workspaces().triggers().list(parent=WS).execute().get('trigger', [])
tr_by_name = {t.get('name'): t.get('triggerId') for t in trigs}

for tag_name, event_name, trig_name in PAIRS:
    try:
        trig_id = tr_by_name.get(trig_name)
        if not trig_id:
            res['errors'].append(f"missing trigger {trig_name}")
            continue
        body = {
            "name": tag_name,
            "type": "gaawe",
            "parameter": [
                {"type": "template", "key": "eventName", "value": event_name},
                {"type": "template", "key": "measurementIdOverride", "value": MEASUREMENT_ID}
            ],
            "firingTriggerId": [str(trig_id)],
            "tagFiringOption": "oncePerEvent"
        }
        svc.accounts().containers().workspaces().tags().create(parent=WS, body=body).execute()
        res['created'].append(tag_name)
    except Exception as e:
        res['errors'].append(f"{tag_name}: {e}")

try:
    v = svc.accounts().containers().workspaces().create_version(path=WS, body={"name": "Booking tags ws11", "notes": "Add GA4 booking tags"}).execute()
    cv = v.get('containerVersion', {})
    res['version'] = {"containerVersionId": cv.get('containerVersionId'), "path": cv.get('path'), "name": cv.get('name')}
except Exception as e:
    res['errors'].append(f"create_version: {e}")

OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
