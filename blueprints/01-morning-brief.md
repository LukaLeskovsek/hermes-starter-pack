# Blueprint 1 — Morning brief

**Ramp level: 1 of 3. No connectors. Instant payoff.** The easiest possible first job — a daily summary in your chat, every morning.

## What it does
Every morning at a set time, Hermes searches the web for the topics you care about, summarizes them, and sends the brief to your Telegram.

## Fields to fill (Hermes will ask)
| Field | Example |
|---|---|
| `time` | `08:00` |
| `topics` | "AI agents, Slovenian startup funding, my competitor Acme" |
| `deliver` | `telegram` (your home channel) |
| `length` | "5 bullets, one line each" |

## How to create it
Inside a Hermes chat: `/blueprint morning-brief` and answer the questions.
Or ask in plain language: *"Every weekday at 8am, search these topics and send me a 5-bullet brief on Telegram: …"*

**Fallback** (if `/blueprint` isn't in your build): create it as a cron job — `hermes cron` — with schedule `0 8 * * 1-5` and the same prompt. Confirm with `hermes cron list`.

## Dry-run first
Ask Hermes to **run it once now** and show you the brief before scheduling. Check the topics and length are right. Only then schedule it.

## Expected output
A short message in Telegram, e.g.:
```
Morning brief · Tue 8:00
• <topic 1>: one-line summary
• <topic 2>: …
```

## Why this one first
Zero setup, visible every day. And it's the clearest demo of the learning loop: after two weeks it learns which topics make you ask follow-ups, and trims the ones you ignore. The day-30 brief looks nothing like day one.
