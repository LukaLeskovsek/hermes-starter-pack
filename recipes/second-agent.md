# Recipe — A second agent, and how agents talk

Start with one agent. Add a second **only** when two roles genuinely don't share context (e.g. a private chief-of-staff vs a public research agent). Remember the cautionary tale: five disconnected agents failed; one agent with a shared brain won.

## Create a second agent (profile)
```bash
hermes profile create research      # a new isolated instance
hermes profile use research         # switch to it
hermes profile list                 # see them all
```
Each profile has its **own SOUL.md, own memory, own channel**. Copy `souls/research.SOUL.md` into that profile's home as its `SOUL.md`.

## How you talk to them
- Message a profile's channel (a second Telegram bot, or Slack/Discord).
- Open it in **Hermes Desktop** and switch profiles.
- Run it in the terminal with its profile active.

## How they talk to each other
1. **Delegation** — one agent spins up helper sub-agents for parallel work; each runs in isolation and returns only a summary. Good for "research these five things at once."
2. **Kanban** — `hermes kanban` is a shared board where agents hand tasks to each other. The chief-of-staff drops "research competitor X" on the board; the research agent picks it up.
3. **Direct message** — `hermes send --to <the other agent's channel> "..."` — one agent pings another.

## Keep it sane
- Shared brain (gbrain) is what makes multiple agents coherent — point both at the same brain.
- Don't split a job across agents just because you can. Unified memory is the feature.
- Two agents max until you have a concrete reason for a third.
