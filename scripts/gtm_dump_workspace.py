from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json
from pathlib import Path

TOKEN=Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
creds=Credentials.from_authorized_user_file(str(TOKEN))
svc=build('tagmanager','v2',credentials=creds,cache_discovery=False)
ws='accounts/6319280242/containers/232612625/workspaces/7'
out={}
out['tags']=svc.accounts().containers().workspaces().tags().list(parent=ws).execute().get('tag',[])
out['triggers']=svc.accounts().containers().workspaces().triggers().list(parent=ws).execute().get('trigger',[])
out['variables']=svc.accounts().containers().workspaces().variables().list(parent=ws).execute().get('variable',[])
Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-workspace-7-dump.json").write_text(json.dumps(out,indent=2),encoding='utf-8')
print('done')