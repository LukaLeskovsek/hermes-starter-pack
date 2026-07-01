# Recipe — Gmail + Calendar (and multiple accounts)

The built-in **google-workspace** skill covers Gmail, Calendar, Drive, Docs, Sheets — using **your own** Google OAuth client. The base setup is one account; below is how to add more.

## One account (the base setup, from Ramp #3)
1. Google Cloud console → **new project**.
2. Enable **Gmail API** and **Google Calendar API**.
3. **Create credentials → OAuth client ID → Desktop app** → download the client-secret JSON.
4. Enable the google-workspace skill and run its setup: give it the client secret, request scopes `email,calendar`, complete the browser auth, paste the auth code.
5. Test: *"What's in my inbox today?"*

Scopes to keep minimal this week: read + draft. No send scope until you've earned trust.

## Multiple Gmail accounts
Google OAuth tokens are per-account, so "multi-account" = multiple authorized tokens:
- Re-run the skill's auth flow for **each** account, storing each under its own token/profile name (e.g. `personal`, `work`).
- Then tell Hermes which account to use per task ("check my *work* inbox"), or run a separate **profile** per account (see `second-agent.md`) so each has its own token and channel.
- Keep a clear naming convention — the agent should never guess which mailbox you mean.

## Privacy rules
- Prefer a **test/secondary account** while learning.
- **Read-first, draft-only** until you trust it.
- Inbox content is **never** imported into the company brain.
