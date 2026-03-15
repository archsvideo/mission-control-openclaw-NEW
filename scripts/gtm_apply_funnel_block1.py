from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-funnel-block1-apply-2026-03-15.json")
WS = "accounts/6319280242/containers/232612625/workspaces/7"
MEASUREMENT_ID = "G-1J2781XXKP"

EVENTS = [
    "select_bedroom",
    "select_foundation",
    "add_to_cart",
    "begin_checkout",
    "purchase",
]

DL_VARS = [
    ("DLV - event_name", "event_name"),
    ("DLV - value", "value"),
    ("DLV - currency", "currency"),
    ("DLV - event_id", "event_id"),
    ("DLV - bedroom_type", "bedroom_type"),
    ("DLV - foundation_type", "foundation_type"),
]

creds = Credentials.from_authorized_user_file(str(TOKEN))
svc = build('tagmanager', 'v2', credentials=creds, cache_discovery=False)

result = {"created": {"variables": [], "triggers": [], "tags": []}, "errors": [], "version": None}


def list_all():
    tags = svc.accounts().containers().workspaces().tags().list(parent=WS).execute().get('tag', [])
    triggers = svc.accounts().containers().workspaces().triggers().list(parent=WS).execute().get('trigger', [])
    variables = svc.accounts().containers().workspaces().variables().list(parent=WS).execute().get('variable', [])
    return tags, triggers, variables


def ensure_variable(name, dl_key):
    _, _, vars_ = list_all()
    for v in vars_:
        if v.get('name') == name:
            return v
    body = {
        "name": name,
        "type": "v",
        "parameter": [
            {"type": "template", "key": "name", "value": dl_key},
            {"type": "boolean", "key": "setDefaultValue", "value": "false"},
        ],
    }
    v = svc.accounts().containers().workspaces().variables().create(parent=WS, body=body).execute()
    result['created']['variables'].append({"name": name, "variableId": v.get('variableId')})
    return v


def ensure_trigger(event_name):
    _, triggers, _ = list_all()
    name = f"CE - {event_name}"
    for t in triggers:
        if t.get('name') == name:
            return t
    body = {
        "name": name,
        "type": "customEvent",
        "customEventFilter": [
            {
                "type": "equals",
                "parameter": [
                    {"type": "template", "key": "arg0", "value": "{{_event}}"},
                    {"type": "template", "key": "arg1", "value": event_name},
                ],
            }
        ],
    }
    t = svc.accounts().containers().workspaces().triggers().create(parent=WS, body=body).execute()
    result['created']['triggers'].append({"name": name, "triggerId": t.get('triggerId')})
    return t


def ensure_tag(event_name, trigger_id):
    tags, _, _ = list_all()
    name = f"GA4 - {event_name}"
    for t in tags:
        if t.get('name') == name:
            return t

    body = {
        "name": name,
        "type": "gaawe",
        "parameter": [
            {"type": "template", "key": "eventName", "value": event_name},
            {"type": "template", "key": "measurementId", "value": MEASUREMENT_ID},
            {
                "type": "list",
                "key": "eventParameters",
                "list": [
                    {
                        "type": "map",
                        "map": [
                            {"type": "template", "key": "name", "value": "value"},
                            {"type": "template", "key": "value", "value": "{{DLV - value}}"},
                        ],
                    },
                    {
                        "type": "map",
                        "map": [
                            {"type": "template", "key": "name", "value": "currency"},
                            {"type": "template", "key": "value", "value": "{{DLV - currency}}"},
                        ],
                    },
                    {
                        "type": "map",
                        "map": [
                            {"type": "template", "key": "name", "value": "event_id"},
                            {"type": "template", "key": "value", "value": "{{DLV - event_id}}"},
                        ],
                    },
                    {
                        "type": "map",
                        "map": [
                            {"type": "template", "key": "name", "value": "bedroom_type"},
                            {"type": "template", "key": "value", "value": "{{DLV - bedroom_type}}"},
                        ],
                    },
                    {
                        "type": "map",
                        "map": [
                            {"type": "template", "key": "name", "value": "foundation_type"},
                            {"type": "template", "key": "value", "value": "{{DLV - foundation_type}}"},
                        ],
                    },
                ],
            },
        ],
        "firingTriggerId": [str(trigger_id)],
        "tagFiringOption": "oncePerEvent",
    }
    t = svc.accounts().containers().workspaces().tags().create(parent=WS, body=body).execute()
    result['created']['tags'].append({"name": name, "tagId": t.get('tagId')})
    return t


# apply
for n, k in DL_VARS:
    try:
        ensure_variable(n, k)
    except Exception as e:
        result['errors'].append(f"variable {n}: {e}")

for ev in EVENTS:
    try:
        trig = ensure_trigger(ev)
    except Exception as e:
        result['errors'].append(f"trigger {ev}: {e}")
        continue
    try:
        ensure_tag(ev, trig.get('triggerId'))
    except Exception as e:
        result['errors'].append(f"tag {ev}: {e}")

# create workspace version snapshot
try:
    v = svc.accounts().containers().workspaces().create_version(parent=WS, body={"name": "Funnel Block 1 API", "notes": "Created by OpenClaw via GTM API"}).execute()
    result['version'] = {
        'containerVersionId': v.get('containerVersion', {}).get('containerVersionId'),
        'name': v.get('containerVersion', {}).get('name')
    }
except Exception as e:
    result['errors'].append(f"create_version: {e}")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
