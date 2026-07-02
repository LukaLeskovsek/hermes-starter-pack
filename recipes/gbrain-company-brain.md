# Recipe — Your company brain (gbrain)

Give your agent your own knowledge so it stops guessing and starts citing.

> **Full install:** the complete, step-by-step recipe Claude runs — install, OpenAI embeddings, import your docs, wire into **both Claude and Hermes**, and schedule self-maintenance — is in **`SETUP-GBRAIN.md`** at the top of this pack. This file is the short conceptual version.

## The idea
**gbrain** is a local second brain. You point it at your company documents; it indexes them; then Hermes can query it and answer **with citations from your own docs** instead of from the open internet.

Three layers:
- **Raw sources** go in and are never modified.
- **gbrain** builds and maintains searchable pages from them.
- **Hermes** queries the brain when it needs company knowledge.

## Step 1 — Stand up a local brain
```bash
gbrain init --pglite            # a local database, zero setup
gbrain import ~/MyCompany        # index a folder of docs (Markdown, notes, exports)
gbrain query "what do we promise on delivery?"   # test: synthesis with citations
```
Checkpoint: one answer that cites **your** document. Rule: **no secrets in the brain** — don't import anything with passwords or private personal data.

## Step 2 — Wire Hermes to the brain
Two ways (ask Hermes to do it — paste this recipe in):
- **As a memory provider:** `hermes memory` → configure gbrain as the external memory/knowledge source.
- **As an MCP tool:** `hermes mcp add` → the gbrain MCP server, so the agent can call `search` / `query` as a tool.

> Confirm which your installed build supports; if unsure, `hermes doctor` and try the memory-provider path first.

## Step 3 — Prove it
Ask the company agent **the same question it guessed on before it had the brain.** Now it answers with a citation from your docs. That "yesterday guessed → today cites" moment is the whole point.

## Keep it fresh
Re-import after big document changes: `gbrain import ~/MyCompany`. With the learning loop, the agent maintains and cross-references pages as you add sources.

## Rules
- No secrets in the brain.
- Inbox/email content is **never** imported.
- The brain is company knowledge, not a dumping ground — fewer, cleaner sources beat everything.
