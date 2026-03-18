from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

ROOT = Path(r"C:\Users\Oscar\.openclaw\workspace")
TOKEN_PATH = ROOT / "secrets" / "google-oauth-token-gmail.json"
CLIENT_PATH = ROOT / "secrets" / "google-oauth-client.json"

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly"
]

if not CLIENT_PATH.exists():
    raise SystemExit(f"Missing OAuth client file: {CLIENT_PATH}")

flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_PATH), SCOPES)
flow.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"

auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline", include_granted_scopes="true")
print("OPEN_THIS_URL")
print(auth_url)
code = input("PASTE_CODE: ").strip()

flow.fetch_token(code=code)
creds = flow.credentials
TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")
print(str(TOKEN_PATH))
