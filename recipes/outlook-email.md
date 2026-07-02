# Recipe — Outlook / any mailbox (IMAP)

There's no branded "Outlook connector." The honest route is **IMAP/SMTP**, which works for Outlook, and any other mailbox. Hermes has an email skill for exactly this.

## What you need
From your Outlook/Microsoft account:
- IMAP + SMTP host/port (for Outlook: `outlook.office365.com` IMAP 993, SMTP `smtp.office365.com` 587).
- An **app password** (not your main password) if your account has 2FA — create it in your Microsoft account security settings.

## Setup
1. Install/enable the email skill (the IMAP/SMTP one — ask Hermes: *"set up the email skill for my Outlook over IMAP"*).
2. Fill the email block in your Hermes home `.env` (`~/.hermes/.env` on macOS/WSL, `%LOCALAPPDATA%\hermes\.env` on native Windows):
   ```
   EMAIL_ADDRESS=you@company.com
   EMAIL_PASSWORD=<app-password>
   IMAP_HOST=outlook.office365.com
   IMAP_PORT=993
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   ```
3. Test read-only first: *"Summarize my Outlook inbox."*

## Rules
- **Read-first, draft-only.** Don't enable sending until you've watched it draft correctly.
- App password over main password, always.
- Same privacy rule: mailbox content never goes into the company brain.

## The bigger connector (later)
For deep Microsoft 365 (Teams, SharePoint, Graph) you'd register an Entra app and add it as an MCP/skill — that's a real build, not a workshop step. IMAP gets you email + calendar coverage for the 80% case today.
