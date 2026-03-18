from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json
from datetime import datetime

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-booking-events-newws-2026-03-18.json")
CONTAINER = "accounts/6319280242/containers/232612625"
MEASUREMENT_ID = "G-1J2781XXKP"

CUSTOM_EVENTS = ["book_meeting", "calendar_booking", "generate_lead"]

creds = Credentials.from_authorized_user_file(str(TOKEN))
svc = build('tagmanager', 'v2', credentials=creds, cache_discovery=False)

result = {"workspace": None, "created": {"triggers": [], "tags": []}, "errors": [], "version": None}

# 1) create fresh workspace
ws_name = f"Booking events fix {datetime.now().strftime('%Y%m%d-%H%M%S')}"
ws = svc.accounts().containers().workspaces().create(parent=CONTAINER, body={"name": ws_name}).execute()
WS = ws["path"]
result["workspace"] = {"name": ws.get("name"), "path": WS, "workspaceId": ws.get("workspaceId")}


def list_all():
    tags = svc.accounts().containers().workspaces().tags().list(parent=WS).execute().get('tag', [])
    triggers = svc.accounts().containers().workspaces().triggers().list(parent=WS).execute().get('trigger', [])
    return tags, triggers


def ensure_custom_event_trigger(event_name):
    _, triggers = list_all()
    name = f"CE - {event_name}"
    for t in triggers:
        if t.get('name') == name:
            return t
    body = {
        "name": name,
        "type": "customEvent",
        "customEventFilter": [{
            "type": "equals",
            "parameter": [
                {"type": "template", "key": "arg0", "value": "{{_event}}"},
                {"type": "template", "key": "arg1", "value": event_name}
            ]
        }]
    }
    t = svc.accounts().containers().workspaces().triggers().create(parent=WS, body=body).execute()
    result['created']['triggers'].append(name)
    return t


def ensure_calendly_click_trigger():
    _, triggers = list_all()
    name = "Click - Calendly outbound"
    for t in triggers:
        if t.get('name') == name:
            return t

    body = {
        "name": name,
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
    result['created']['triggers'].append(name)
    return t


def ensure_ga4_tag(tag_name, event_name, trigger_id):
    tags, _ = list_all()
    for t in tags:
        if t.get('name') == tag_name:
            return t

    body = {
        "name": tag_name,
        "type": "gaawe",
        "parameter": [
            {"type": "template", "key": "eventName", "value": event_name},
            {"type": "template", "key": "measurementId", "value": MEASUREMENT_ID}
        ],
        "firingTriggerId": [str(trigger_id)],
        "tagFiringOption": "oncePerEvent"
    }
    t = svc.accounts().containers().workspaces().tags().create(parent=WS, body=body).execute()
    result['created']['tags'].append(tag_name)
    return t


for ev in CUSTOM_EVENTS:
    try:
        trig = ensure_custom_event_trigger(ev)
        ensure_ga4_tag(f"GA4 - {ev}", ev, trig.get('triggerId'))
    except Exception as e:
        result['errors'].append(f"{ev}: {e}")

try:
    c_trig = ensure_calendly_click_trigger()
    ensure_ga4_tag("GA4 - calendly_click", "calendly_click", c_trig.get('triggerId'))
except Exception as e:
    result['errors'].append(f"calendly_click: {e}")

# create container version
try:
    v = svc.accounts().containers().workspaces().create_version(path=WS, body={"name": "Booking Events Fix", "notes": "Booking + calendly events"}).execute()
    cv = v.get('containerVersion', {})
    result['version'] = {"containerVersionId": cv.get('containerVersionId'), "path": cv.get('path'), "name": cv.get('name')}
except Exception as e:
    result['errors'].append(f"create_version: {e}")

OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
