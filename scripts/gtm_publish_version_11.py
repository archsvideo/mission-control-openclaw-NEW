from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path
import json

TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")
OUT = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\gtm-publish-version-11-2026-03-18.json")
VERSION_PATH = "accounts/6319280242/containers/232612625/versions/11"

creds = Credentials.from_authorized_user_file(str(TOKEN))
svc = build('tagmanager', 'v2', credentials=creds, cache_discovery=False)

res = {}
try:
    r = svc.accounts().containers().versions().publish(path=VERSION_PATH).execute()
    res['publish'] = r
except Exception as e:
    res['error'] = str(e)

OUT.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(OUT))
