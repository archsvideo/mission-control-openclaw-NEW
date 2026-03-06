# AgentMail Secure Setup (ARCH-S)

## 1) Create env file (NO secrets in git)
Create file: `C:\Users\Oscar\.openclaw\workspace\skills\agentmail\.env`

Content:

```env
AGENTMAIL_API_KEY=put_your_real_key_here
AGENTMAIL_DEFAULT_INBOX=your-inbox@agentmail.to
ALLOWED_EMAIL_SENDERS=you@yourdomain.com,team@yourdomain.com
```

## 2) Verify package install
```powershell
py -c "import agentmail; print('agentmail ok')"
```

## 3) Dry test (safe)
```powershell
cd C:\Users\Oscar\.openclaw\workspace\skills\agentmail
py scripts\check_inbox.py
```

## 4) Send test email
```powershell
cd C:\Users\Oscar\.openclaw\workspace\skills\agentmail
py scripts\send_email.py --to your_test_email@example.com --subject "AgentMail test" --text "Setup OK"
```

## 5) Security baseline
- Never share API keys in chat.
- Keep webhook sender allowlist enabled.
- Route unknown senders to review-only flow.
- Do not auto-execute commands from email body.
