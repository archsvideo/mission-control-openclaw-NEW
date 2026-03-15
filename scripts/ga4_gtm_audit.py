from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\ga4-gtm-api-audit-2026-03-15.json")

creds = Credentials.from_authorized_user_file(str(TOKEN))

res = {"gtm": {}, "ga4": {}}

# GTM
try:
    gtm = build('tagmanager', 'v2', credentials=creds, cache_discovery=False)
    accounts = gtm.accounts().list().execute().get('account', [])
    res['gtm']['accounts'] = []
    for acc in accounts:
        acc_path = acc.get('path')
        acc_item = {
            'accountId': acc.get('accountId'),
            'name': acc.get('name'),
            'containers': []
        }
        containers = gtm.accounts().containers().list(parent=acc_path).execute().get('container', [])
        for c in containers:
            c_path = c.get('path')
            c_item = {
                'containerId': c.get('containerId'),
                'name': c.get('name'),
                'publicId': c.get('publicId'),
                'workspaces': []
            }
            workspaces = gtm.accounts().containers().workspaces().list(parent=c_path).execute().get('workspace', [])
            for w in workspaces:
                w_path = w.get('path')
                try:
                    tags = gtm.accounts().containers().workspaces().tags().list(parent=w_path).execute().get('tag', [])
                except Exception:
                    tags = []
                try:
                    triggers = gtm.accounts().containers().workspaces().triggers().list(parent=w_path).execute().get('trigger', [])
                except Exception:
                    triggers = []
                try:
                    vars_ = gtm.accounts().containers().workspaces().variables().list(parent=w_path).execute().get('variable', [])
                except Exception:
                    vars_ = []

                c_item['workspaces'].append({
                    'workspaceId': w.get('workspaceId'),
                    'name': w.get('name'),
                    'tagCount': len(tags),
                    'triggerCount': len(triggers),
                    'variableCount': len(vars_),
                    'tagNames': [t.get('name') for t in tags[:30]],
                    'triggerNames': [t.get('name') for t in triggers[:30]],
                })
            acc_item['containers'].append(c_item)
        res['gtm']['accounts'].append(acc_item)
except Exception as e:
    res['gtm']['error'] = str(e)

# GA4
try:
    admin = build('analyticsadmin', 'v1beta', credentials=creds, cache_discovery=False)
    summaries = admin.accountSummaries().list(pageSize=50).execute().get('accountSummaries', [])
    props = []
    for s in summaries:
        for p in s.get('propertySummaries', []):
            props.append({
                'property': p.get('property'),
                'displayName': p.get('displayName'),
                'propertyType': p.get('propertyType'),
                'parentAccount': s.get('account')
            })

    ga4_props = []
    for p in props:
        prop_name = p['property']
        item = dict(p)
        item['conversionEvents'] = []
        item['customDimensions'] = []
        item['customMetrics'] = []
        try:
            ce = admin.properties().conversionEvents().list(parent=prop_name).execute().get('conversionEvents', [])
            item['conversionEvents'] = [
                {
                    'eventName': x.get('eventName'),
                    'countingMethod': x.get('countingMethod'),
                    'createTime': x.get('createTime')
                } for x in ce
            ]
        except Exception as e:
            item['conversionEventsError'] = str(e)

        try:
            cd = admin.properties().customDimensions().list(parent=prop_name).execute().get('customDimensions', [])
            item['customDimensions'] = [
                {'parameterName': x.get('parameterName'), 'displayName': x.get('displayName'), 'scope': x.get('scope')} for x in cd
            ]
        except Exception as e:
            item['customDimensionsError'] = str(e)

        try:
            cm = admin.properties().customMetrics().list(parent=prop_name).execute().get('customMetrics', [])
            item['customMetrics'] = [
                {'parameterName': x.get('parameterName'), 'displayName': x.get('displayName'), 'measurementUnit': x.get('measurementUnit')} for x in cm
            ]
        except Exception as e:
            item['customMetricsError'] = str(e)

        ga4_props.append(item)

    res['ga4']['properties'] = ga4_props
except Exception as e:
    res['ga4']['error'] = str(e)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
