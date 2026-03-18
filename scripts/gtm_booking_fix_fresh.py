from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json
from datetime import datetime

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-booking-fix-fresh-2026-03-18.json")
CONTAINER = "accounts/6319280242/containers/232612625"
MEASUREMENT_ID = "G-1J2781XXKP"

EVENTS = ["book_meeting", "calendar_booking", "generate_lead"]

creds = Credentials.from_authorized_user_file(str(TOKEN))
svc = build('tagmanager', 'v2', credentials=creds, cache_discovery=False)
res = {"workspace": None, "created": {"triggers": [], "tags": []}, "errors": [], "version": None}

# Create fresh editable workspace
ws = svc.accounts().containers().workspaces().create(
    parent=CONTAINER,
    body={"name": f"Booking fix fresh {datetime.now().strftime('%Y%m%d-%H%M%S')}"}
).execute()
WS = ws["path"]
res["workspace"] = {"path": WS, "name": ws.get("name"), "workspaceId": ws.get("workspaceId")}


def ensure_trigger_custom(ev):
    body = {
        "name": f"CE - {ev}",
        "type": "customEvent",
        "customEventFilter": [{
            "type": "equals",
            "parameter": [
                {"type": "template", "key": "arg0", "value": "{{_event}}"},
                {"type": "template", "key": "arg1", "value": ev}
            ]
        }]
    }
    t = svc.accounts().containers().workspaces().triggers().create(parent=WS, body=body).execute()
    res['created']['triggers'].append(body['name'])
    return t


def ensure_trigger_calendly_click():
    body = {
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
    }
    t = svc.accounts().containers().workspaces().triggers().create(parent=WS, body=body).execute()
    res['created']['triggers'].append(body['name'])
    return t


def create_ga4_event_tag(tag_name, event_name, trigger_id):
    body = {
        "name": tag_name,
        "type": "gaawe",
        "parameter": [
            {"type": "template", "key": "eventName", "value": event_name},
            {"type": "template", "key": "measurementIdOverride", "value": MEASUREMENT_ID}
        ],
        "firingTriggerId": [str(trigger_id)],
        "tagFiringOption": "oncePerEvent"
    }
    svc.accounts().containers().workspaces().tags().create(parent=WS, body=body).execute()
    res['created']['tags'].append(tag_name)


try:
    for ev in EVENTS:
        tr = ensure_trigger_custom(ev)
        create_ga4_event_tag(f"GA4 - {ev}", ev, tr.get('triggerId'))

    trc = ensure_trigger_calendly_click()
    create_ga4_event_tag("GA4 - calendly_click", "calendly_click", trc.get('triggerId'))
except Exception as e:
    res['errors'].append(f"apply: {e}")

# Create version snapshot
try:
    v = svc.accounts().containers().workspaces().create_version(
        path=WS,
        body={"name": "Booking Events Fix Fresh", "notes": "Adds book_meeting/calendar_booking/generate_lead + calendly_click"}
    ).execute()
    cv = v.get('containerVersion', {})
    res['version'] = {"containerVersionId": cv.get('containerVersionId'), "path": cv.get('path'), "name": cv.get('name')}
except Exception as e:
    res['errors'].append(f"create_version: {e}")

OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
