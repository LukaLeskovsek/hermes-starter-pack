# Blueprint 3 — Inbox summary

**Ramp level: 3 of 3. Your first real connector.** This one reads your actual email and calendar. Keep it last — it has real setup, and by now the brief and monitor already work, so the room never stalls.

## What it does
Every morning, Hermes reads your Gmail + Calendar and sends you: what needs a reply, what's on today, and any conflicts. **Read-first, draft-only** — it can prepare a draft reply, but it never sends without your approval.

## Prerequisite: connect Google Workspace
This uses Hermes' built-in **google-workspace** skill with **your own** Google OAuth client (not a shared key). One-time setup:
1. Google Cloud console → new project → enable **Gmail API + Calendar API** → create an **OAuth client (Desktop app)** → download the JSON.
2. Enable the skill and run its setup: point it at your client secret, authorize `email,calendar` scopes, paste the auth code.
3. See `recipes/gmail-multi-account.md` for the exact commands and for connecting more than one account.

> **Privacy:** use a **test/secondary Google account** in the room if a real inbox feels risky. Inbox content is **never** imported into the company brain.

## Fields to fill
| Field | Example |
|---|---|
| `time` | `08:15` |
| `deliver` | `telegram` |
| `mode` | `read-first, draft-only` (required this week) |
| `draft_count` | "draft replies for the top 2–3 only" |

## Dry-run first
Ask: *"What's in my inbox today? What's on my calendar this week?"* Confirm it answers from real data. Then let it draft **one** reply into Gmail Drafts — you read and send it yourself.

## Expected output
```
Inbox · Tue 8:15
Needs reply (3): …
Today's calendar: …  (conflict: 14:00 double-booked)
2 draft replies saved to Gmail Drafts — review before sending.
```

## Why this one last
It's the most valuable and the most sensitive. It's where "read-first, draft-only" stops being a slogan and becomes the thing that keeps a bad auto-send from ever happening.
