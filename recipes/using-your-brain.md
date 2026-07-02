# Using your company brain — a quick tutorial

Your brain is set up and wired into both Claude and Hermes. Here's how to actually get value from it every day. **You don't type `gbrain` commands** — you just talk to Claude or Hermes, and they use the brain for you.

## The one thing to understand
Before the brain, the AI answered from the internet and guesswork. Now, when you ask about *your* business, it looks inside *your* documents first and tells you where the answer came from. Same chat, better answers.

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

## The payoff
Two tools — Claude for building, Hermes for operating — both answering from one private, always-current memory of your business. The more you feed it, the sharper it gets. That's the compounding.
