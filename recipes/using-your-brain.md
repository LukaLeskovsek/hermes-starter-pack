# Using your company brain — a quick tutorial

Your brain is set up and wired into both Claude and Hermes. Here's how to actually get value from it every day. **You don't type `gbrain` commands** — you just talk to Claude or Hermes, and they use the brain for you.

## The one thing to understand
Before the brain, the AI answered from the internet and guesswork. Now, when you ask about *your* business, it looks inside *your* documents first and tells you where the answer came from. Same chat, better answers.

> Want the "how does this actually work" version (embeddings, the graph, what happens when you ask)? Read **`how-the-brain-works.md`** — a plain-language explainer, no jargon.

## Just ask — in plain language
In Claude or Hermes (Desktop, terminal, or Telegram), ask naturally:
- *"What do our documents say about our refund policy?"*
- *"Summarize our pricing rationale for the enterprise plan."*
- *"Draft a reply to this customer in our tone of voice"* (it pulls your tone-of-voice guide).
- *"What did we decide about X in last month's notes?"*
- *"According to our docs, who owns onboarding?"*

If it answers from your files, it can tell you **which document** — ask *"which doc is that from?"* to see the source.

## Five habits that get better answers
1. **Be specific.** "Our delivery terms for EU orders" beats "delivery." The brain matches on meaning, so more detail = a sharper match.
2. **Ask for the source.** "…and cite the document" keeps it honest and shows you where to update the doc if it's wrong.
3. **Add the doc, don't explain it twice.** If the AI didn't know something, put it in your documents folder and save — the brain re-reads on its own (periodic ingestion). Next time it just knows.
4. **Keep the folder clean.** One clear document per topic beats ten overlapping ones. Delete the stale, keep the true.
5. **No secrets.** Don't put passwords, contracts you wouldn't want indexed, or customer personal data in the brain. Knowledge, not secrets.

## Feeding the brain over time
- **Just save files** into your documents folder. The scheduled ingestion (set up in the install) picks up new and changed files automatically — usually within minutes.
- Good things to add as you go: meeting notes, decisions, FAQs, policies, product updates, "how we do X" playbooks.
- Want it now instead of waiting? Ask Claude: *"sync my brain now."*

## Depth vs cost — one dial (optional)
The brain has three effort levels. Most people never touch this — the default is fine and cheap.
- **conservative** (default) — fast, cheap, top ~10 sources. Great for everyday questions.
- **balanced** — wider, ~25 sources. For "pull everything we know about X."
- **tokenmax** — deepest and most expensive. For a big research pass.

Ask Claude to switch if you ever need more depth: *"use balanced search mode for this."* (Under the hood: `gbrain config set search.mode balanced`.)

## Skills — the brain's built-in playbooks
gbrain ships **~50 "skills"** — short written playbooks that teach the agent how to do specific jobs with your brain (verify a claim, crawl an archive, synthesize a topic, and more). You don't install or run them; **the agent uses them automatically** when your request matches. You rarely think about them — just know that "make me a summary page of everything we know about competitor X" is the kind of thing a skill handles well.

Curious what's available? Ask Claude *"list my gbrain skills"* (it runs `gbrain skills`).

## When something looks off
- Answer seems generic / not from your docs? Ask *"search my brain and cite the source."* If there's still nothing, the doc probably isn't in your folder yet — add it.
- Brain seems stale? Ask *"sync my brain now,"* or check the scheduled ingestion is running (`gbrain autopilot --status`).
- Deeper diagnosis: *"run gbrain doctor and tell me what's wrong."*

## The commands underneath (optional)
You almost never need these — Claude and Hermes run them for you. But if you want to drive the brain yourself in a terminal, or just understand what the agent is doing on your behalf, here are the handful that cover ~90% of real use. Run `gbrain <command> --help` for the rest.

**Asking**
| Command | What it does | When to reach for it |
| --- | --- | --- |
| `gbrain query "<question>"` | The main one. Hybrid search (meaning + keywords) that answers your question from your docs. Alias: `gbrain ask`. | Any real question — *"what's our refund window?"* Returns the answer with the sources it used. |
| `gbrain search "<terms>"` | Plain keyword search — no interpretation, just matches the words. | You know the exact term or name and want to see which pages mention it. |

**Feeding it**
| Command | What it does | When to reach for it |
| --- | --- | --- |
| `gbrain sync` | Pulls new and changed files from your documents folder into the brain, incrementally. | You just added or edited docs and want them searchable now instead of waiting for the scheduled run. |
| `gbrain import <dir>` | Bulk-loads a whole folder of markdown in one pass. | First-time load, or dropping in a big batch of documents at once. |
| `gbrain put <slug>` / `gbrain get <slug>` | Write or read a single page directly. | You want to add or check one note without touching the file system. |
| `gbrain embed --stale` | Recomputes the "meaning fingerprints" for anything that changed. | After a large edit, if search feels like it's missing recent changes. |

**Keeping it healthy**
| Command | What it does | When to reach for it |
| --- | --- | --- |
| `gbrain doctor --fast` | Quick health check — resolver, embeddings, database, connections. | Answers look off or stale, or something feels broken. First thing to run. |
| `gbrain stats` | How much is in your brain — pages, links, tags. | A quick "how big is my brain now" sanity check. |
| `gbrain list -n 20` | Lists your most recent pages. Add `--type` or `--tag` to filter. | You want to see what's actually in there. |
| `gbrain autopilot` | Runs the self-maintaining daemon that keeps the brain synced and tidy in the background. | Set-and-forget upkeep (usually installed for you during setup). |

**Tuning**
| Command | What it does | When to reach for it |
| --- | --- | --- |
| `gbrain config set search.mode balanced` | Switches the depth dial (`conservative` → `balanced` → `tokenmax`). | You want wider, deeper answers for a big research question — see *Depth vs cost* above. |

> Rule of thumb: if you can say it to Claude in plain language, do that. Drop to these commands only when you want to run something yourself, script it, or see exactly what the brain is doing.

## The payoff
Two tools — Claude for building, Hermes for operating — both answering from one private, always-current memory of your business. The more you feed it, the sharper it gets. That's the compounding.
