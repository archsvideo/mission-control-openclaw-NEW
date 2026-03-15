import json
from pathlib import Path

CLIENT = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-client.json")
TOKEN = Path(r"C:\Users\Oscar\.openclaw\workspace\secrets\google-oauth-token.json")

SCOPES = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/tagmanager.readonly",
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.publish",
    "https://www.googleapis.com/auth/tagmanager.manage.accounts",
]


def main():
    from google_auth_oauthlib.flow import InstalledAppFlow
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT), SCOPES)
    creds = flow.run_local_server(host="127.0.0.1", port=8765, open_browser=True)
    TOKEN.write_text(creds.to_json(), encoding="utf-8")
    print(f"TOKEN_SAVED {TOKEN}")


if __name__ == "__main__":
    main()
