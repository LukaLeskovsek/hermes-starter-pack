# Hermes Starter Pack

Your guided path to a working personal operator agent. **You don't need the terminal** — Claude Code does the typing, and after install, Hermes takes over and builds the rest itself.

## How to use this

1. Open **Claude Code** inside this folder (`hermes-starter-pack/`):
   - **macOS** → in **Terminal**.
   - **Windows** → in your **WSL/Ubuntu terminal** if you set up WSL for the week, otherwise in **PowerShell**.
2. Say this (paste it in your language):

   > 🇸🇮 **"Preberi STARTER.md in mi nastavi Hermesa — vodi me in se pred vsakim korakom ustavi za mojo odobritev."**
   >
   > 🇬🇧 **"Read STARTER.md and set up my Hermes — guide me and pause for my approval at each step."**

   Claude replies in whatever language you write to it — write in Slovenian and it guides you in Slovenian.

3. Claude figures out your operating system, installs the right way, asks you to choose a path at each fork, and approves each action with you. When Hermes is installed and chatting, Claude hands over to Hermes, which builds your first jobs.

That's it. Everything below is for reference — Claude reads it for you.

> **Where does Hermes keep my files?** macOS / WSL: `~/.hermes/`. Native Windows: `%LOCALAPPDATA%\hermes\`. Claude uses the right one automatically; you rarely need to touch it.

## What you'll end up with

- A working Hermes agent on your laptop, reachable from your phone (Telegram).
- Three recurring jobs, from simplest to most capable:
  1. **Morning brief** — a daily summary in Telegram (no connectors).
  2. **Web monitor** — tells you what changed on pages you care about.
  3. **Inbox summary** — reads your Gmail + Calendar, drafts replies (read-first, you approve).
- A **company brain** (gbrain) so the agent answers from your own documents, not the internet.
- The building blocks to add your own tools later (Outlook, Shopify, Zoho, a second Gmail…).

## What's in this folder

| File / folder | What it is |
|---|---|
| `STARTER.md` | The recipe Claude executes. Your fresh install, step by step. |
| `HANDOFF.template.md` | The written plan Claude leaves for Hermes — the checklist Hermes reads to know what to build next and where to resume. |
| `env.example` | Template for your keys and settings (Claude fills a copy in). |
| `config.example.yaml` | Safe defaults — approval tiers, read-first. |
| `blueprints/` | The three starter jobs, as specs Hermes builds from. |
| `souls/` | `SOUL.md` persona templates — pick who your agent is. |
| `recipes/` | Add-your-own-tool guides for Friday (Outlook, Shopify, Zoho, gbrain…). |
| `facilitator/` | Run-of-show, safety checklist, troubleshooting (for the facilitator). |

## The two rules we keep all week

1. **Read-first, draft-only.** The agent reads and proposes. It never sends or writes without your approval — until you've earned trust with logged, safe runs.
2. **One job first.** Don't automate everything. Get one recurring job compounding, judge it in two weeks, then add the next.

---

*Pinned versions (2026-07-01): Hermes v0.17.0, gbrain 0.42.40.0. If a command differs, run `hermes doctor` and trust the installed CLI over these docs.*
