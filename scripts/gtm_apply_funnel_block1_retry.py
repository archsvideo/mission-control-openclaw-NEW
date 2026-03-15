from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from pathlib import Path
import json, time

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-funnel-block1-apply-2026-03-15.json")
WS = "accounts/6319280242/containers/232612625/workspaces/7"
MEASUREMENT_ID = "G-1J2781XXKP"

EVENTS = ["select_bedroom", "select_foundation", "add_to_cart", "begin_checkout", "purchase"]
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

result = {"created": {"variables": [], "triggers": [], "tags": []}, "errors": []}


def call_with_retry(fn, *args, **kwargs):
    delay = 2
    for i in range(6):
        try:
            return fn(*args, **kwargs)
        except HttpError as e:
            txt = str(e)
            if '429' in txt or 'rateLimitExceeded' in txt:
                time.sleep(delay)
                delay = min(delay * 2, 30)
                continue
            raise
    raise RuntimeError('rate limit persisted after retries')

# warm list once
existing_tags = call_with_retry(svc.accounts().containers().workspaces().tags().list(parent=WS).execute).get('tag', [])
existing_triggers = call_with_retry(svc.accounts().containers().workspaces().triggers().list(parent=WS).execute).get('trigger', [])
existing_vars = call_with_retry(svc.accounts().containers().workspaces().variables().list(parent=WS).execute).get('variable', [])

tag_by_name = {t.get('name'): t for t in existing_tags}
trig_by_name = {t.get('name'): t for t in existing_triggers}
var_by_name = {v.get('name'): v for v in existing_vars}

# variables
for name, dl_key in DL_VARS:
    if name in var_by_name:
        continue
    body = {
        "name": name,
        "type": "v",
        "parameter": [
            {"type": "template", "key": "name", "value": dl_key},
            {"type": "boolean", "key": "setDefaultValue", "value": "false"},
        ],
    }
    try:
        v = call_with_retry(svc.accounts().containers().workspaces().variables().create(parent=WS, body=body).execute)
        var_by_name[name] = v
        result['created']['variables'].append({"name": name, "variableId": v.get('variableId')})
    except Exception as e:
        result['errors'].append(f"variable {name}: {e}")

# triggers + tags
for ev in EVENTS:
    tname = f"CE - {ev}"
    if tname not in trig_by_name:
        body = {
            "name": tname,
            "type": "customEvent",
            "customEventFilter": [{
                "type": "equals",
                "parameter": [
                    {"type": "template", "key": "arg0", "value": "{{_event}}"},
                    {"type": "template", "key": "arg1", "value": ev},
                ],
            }],
        }
        try:
            trig = call_with_retry(svc.accounts().containers().workspaces().triggers().create(parent=WS, body=body).execute)
            trig_by_name[tname] = trig
            result['created']['triggers'].append({"name": tname, "triggerId": trig.get('triggerId')})
        except Exception as e:
            result['errors'].append(f"trigger {ev}: {e}")
            continue

    gname = f"GA4 - {ev}"
    if gname in tag_by_name:
        continue
    trig_id = str(trig_by_name[tname].get('triggerId'))
    body = {
        "name": gname,
        "type": "gaawe",
        "parameter": [
            {"type": "template", "key": "eventName", "value": ev},
            {"type": "template", "key": "measurementId", "value": MEASUREMENT_ID},
            {"type": "list", "key": "eventParameters", "list": [
                {"type": "map", "map": [{"type": "template", "key": "name", "value": "value"}, {"type": "template", "key": "value", "value": "{{DLV - value}}"}]},
                {"type": "map", "map": [{"type": "template", "key": "name", "value": "currency"}, {"type": "template", "key": "value", "value": "{{DLV - currency}}"}]},
                {"type": "map", "map": [{"type": "template", "key": "name", "value": "event_id"}, {"type": "template", "key": "value", "value": "{{DLV - event_id}}"}]},
                {"type": "map", "map": [{"type": "template", "key": "name", "value": "bedroom_type"}, {"type": "template", "key": "value", "value": "{{DLV - bedroom_type}}"}]},
                {"type": "map", "map": [{"type": "template", "key": "name", "value": "foundation_type"}, {"type": "template", "key": "value", "value": "{{DLV - foundation_type}}"}]},
            ]}
        ],
        "firingTriggerId": [trig_id],
        "tagFiringOption": "oncePerEvent",
    }
    try:
        tag = call_with_retry(svc.accounts().containers().workspaces().tags().create(parent=WS, body=body).execute)
        tag_by_name[gname] = tag
        result['created']['tags'].append({"name": gname, "tagId": tag.get('tagId')})
    except Exception as e:
        result['errors'].append(f"tag {ev}: {e}")

OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
