# Blueprint 2 — Web monitor

**Ramp level: 2 of 3. Adds a browser. Still no account connectors.** One step up from the brief: instead of general topics, it watches specific pages and tells you only what changed.

## What it does
On a schedule, Hermes visits pages you name (competitor site, pricing page, a job board, a news source), compares them to last time, and messages you the **diff** — what's new since yesterday.

## Fields to fill
| Field | Example |
|---|---|
| `pages` | "acme.com/pricing, acme.com/blog, a specific job board search URL" |
| `schedule` | `every 12h` or `0 7 * * *` (daily 7am) |
| `deliver` | `telegram` |
| `quiet` | "say nothing if nothing changed" (silent on quiet runs) |

## How to create it
`/blueprint` inside Hermes, or plain language: *"Check these pages twice a day and tell me only what changed since last time. Stay silent if nothing changed."*

**Fallback:** `hermes cron` with your schedule and the same instruction.

## Dry-run first
Run it once. Confirm it can actually load the pages (Hermes ships a stealth browser, so sites that block bots usually still work) and that the "what changed" summary is useful. Then schedule.

## Expected output
```
Web monitor · changes overnight
• acme.com/pricing: Pro plan went €29 → €39
• acme.com/blog: new post "…"
(job board: no change)
```

## Why this one second
It introduces the idea of the agent *doing* something on the web on a schedule, and the "only tell me the diff" pattern — but still touches none of your accounts, so nothing can go wrong. Good confidence-builder before the inbox.
