from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json

creds=Credentials.from_authorized_user_file(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
svc=build('analyticsdata','v1beta',credentials=creds,cache_discovery=False)
prop='properties/514985064'

# 1) recent key events by source/medium
body1={
  'dimensions':[{'name':'sessionSourceMedium'},{'name':'eventName'}],
  'metrics':[{'name':'eventCount'}],
  'dateRanges':[{'startDate':'3daysAgo','endDate':'today'}],
  'dimensionFilter':{'filter':{'fieldName':'eventName','inListFilter':{'values':['begin_checkout','add_to_cart','purchase','generate_lead','form_submit','book_meeting','calendar_booking','click']}}},
  'limit':100
}
r1=svc.properties().runReport(property=prop, body=body1).execute()
print('REPORT1')
print(json.dumps(r1,ensure_ascii=False)[:4000])

# 2) top source/medium all events
body2={
  'dimensions':[{'name':'sessionSourceMedium'}],
  'metrics':[{'name':'eventCount'},{'name':'sessions'}],
  'dateRanges':[{'startDate':'3daysAgo','endDate':'today'}],
  'orderBys':[{'metric':{'metricName':'eventCount'},'desc':True}],
  'limit':20
}
r2=svc.properties().runReport(property=prop, body=body2).execute()
print('\nREPORT2')
print(json.dumps(r2,ensure_ascii=False)[:4000])
