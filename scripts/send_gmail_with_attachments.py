import base64
import mimetypes
from email.message import EmailMessage
from pathlib import Path
import argparse

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

ROOT = Path(r"C:\Users\Oscar\.openclaw\workspace")
TOKEN_PATH = ROOT / "secrets" / "google-oauth-token-gmail.json"

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly"
]


def load_creds():
    if not TOKEN_PATH.exists():
        raise SystemExit(f"Missing Gmail token: {TOKEN_PATH}. Run gmail_auth_setup.py first.")
    creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN_PATH.write_text(creds.to_json(), encoding='utf-8')
    return creds


def build_message(sender, to, subject, body, attachments):
    msg = EmailMessage()
    msg['To'] = to
    if sender:
        msg['From'] = sender
    msg['Subject'] = subject
    msg.set_content(body)

    for p in attachments:
        fp = Path(p)
        if not fp.exists():
            continue
        ctype, _ = mimetypes.guess_type(str(fp))
        if ctype is None:
            ctype = 'application/octet-stream'
        maintype, subtype = ctype.split('/', 1)
        data = fp.read_bytes()
        msg.add_attachment(data, maintype=maintype, subtype=subtype, filename=fp.name)
    return msg


def normalize_body_text(s: str) -> str:
    # Convert escaped literals ("\\n") into real newlines if provided from CLI
    return s.replace('\\n', '\n')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--to', required=True)
    ap.add_argument('--subject', required=True)
    ap.add_argument('--body', required=True)
    ap.add_argument('--from_email', default='')
    ap.add_argument('--attach', nargs='*', default=[])
    args = ap.parse_args()

    creds = load_creds()
    svc = build('gmail', 'v1', credentials=creds, cache_discovery=False)

    body = normalize_body_text(args.body)
    msg = build_message(args.from_email, args.to, args.subject, body, args.attach)
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
    sent = svc.users().messages().send(userId='me', body={'raw': raw}).execute()
    print(sent.get('id'))


if __name__ == '__main__':
    main()
