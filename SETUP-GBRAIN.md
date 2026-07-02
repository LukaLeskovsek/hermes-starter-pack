# SETUP-GBRAIN.md — the recipe Claude executes

**Audience: Claude Code, on a non-technical founder's laptop.**
**Goal: install gbrain as a LOCAL "second brain" (no database server), embed with OpenAI, import the founder's company documents, make it available inside BOTH Claude and Hermes, and schedule self-maintenance (sync + re-embed + nightly "dream").**

> **You (Claude) do the typing. The founder is non-technical.** Read this whole file first. Then run the steps in order. Before anything that installs, writes a key, or starts a service: say in ONE plain sentence what you're about to do and why, do it, show the result, and only then move on. Never paste a wall of commands at the founder — you run them. Translate every error into plain language and fix it before continuing.
>
> **Language:** if the founder writes in Slovenian, talk to them in Slovenian throughout. Keep tech terms (gbrain, embedding, MCP, API key, OpenAI) as-is.

**Prerequisites:** Claude Code works (Days 1–3) and Hermes is installed (Day 4, via `STARTER.md`). If Hermes isn't installed yet, do everything except Step 6, and come back to Step 6 later.

**Source of truth for commands:** gbrain's own `INSTALL_FOR_AGENTS.md` (github.com/garrytan/gbrain). Verified working combo (2026-07-02): gbrain **0.42.40.0**, `engine: pglite` (local), `embedding_model: openai:text-embedding-3-small`.

---

## What we're building (say this to the founder, plainly)

> "Right now, when you ask an AI a question about *your* company, it guesses. We're going to give it a memory of your business — your documents — that lives **on your laptop**. Then both Claude and Hermes can answer from *your* knowledge and tell you which document it came from. It's private (nothing leaves your machine except tiny anonymized text snippets sent to OpenAI to build the index), and it keeps itself up to date automatically."

Three plain ideas:
- **gbrain** = the second brain. A small program + a local database file.
- **PGLite** = the database, but as a *file on your disk* — no server to run or manage.
- **Embeddings** = how the brain "understands" your docs so it can find the right one. We use OpenAI for this (cheap, good).

---

## Ground rules (keep these true the whole way)
- **Local only. No Postgres, no cloud database.** Embedded PGLite — a database in a file.
- **OpenAI embeddings** — model `text-embedding-3-small`. Cheap (~$0.02 per **million** words of text; a few hundred documents costs pennies).
- **No secrets in the brain.** Never import passwords, private keys, contracts you wouldn't want indexed, or an email inbox. Company *knowledge*, not company *secrets*.
- **One brain, two agents.** We build the brain once and expose the *same* brain to both Claude and Hermes.

---

## Step 0 — Which computer are we on?
Detect the OS exactly like `STARTER.md` Step 0: **macOS**, **Windows + WSL2** (an Ubuntu terminal inside Windows), or **native Windows (PowerShell)**.

> **On Windows, strongly prefer WSL2/Ubuntu for gbrain.** The self-maintenance daemon and scheduling are Unix-native. If the founder set up WSL for the week (per the pre-work packet), do *everything here inside the WSL/Ubuntu terminal*. Native Windows works for the basics but the overnight scheduler is fiddly — tell the founder that plainly and offer WSL.

Tell the founder which window they should be looking at, and confirm the prompt is that shell before you run anything.

Wherever this file says `~/brain`, that's a folder for the founder's documents (separate from the gbrain program itself).

---

## Step 1 — Install Bun, then gbrain
gbrain runs on **Bun** (a fast JavaScript runtime — the engine gbrain is built on). Explain it as "the engine gbrain needs; one install, then we're done with it."

macOS / WSL / Linux:
```bash
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
```
Also append that `export PATH...` line to the founder's `~/.zshrc` (macOS) or `~/.bashrc` (WSL/Linux) so it survives new terminals — do this for them.

Native Windows (PowerShell):
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Then, on every platform:
```bash
bun install -g github:garrytan/gbrain
gbrain --version        # expect 0.42.x — show the founder, "gbrain is installed"
```

**If the global install fails** (permissions, PATH), use the deterministic fallback and tell the founder it's normal:
```bash
git clone https://github.com/garrytan/gbrain.git ~/gbrain && cd ~/gbrain && bun install && bun link
gbrain --version
```

---

## Step 2 — Get (or reuse) an OpenAI API key
The brain needs an OpenAI key to build its index. Walk the founder through it if they don't have one — this is the step non-tech people get stuck on, so go slowly:

1. Go to **platform.openai.com** → sign in (or create an account).
2. Add a payment method under **Billing** (embeddings are cents, but OpenAI requires a card). Suggest a low usage limit, e.g. $10/month, under Billing → Limits.
3. Go to **API keys** → **Create new secret key** → copy it (starts with `sk-...`). They can only see it once.

Then set it so every tool can use it:
```bash
echo 'export OPENAI_API_KEY=sk-REPLACE_WITH_THEIRS' >> ~/.zshrc   # or ~/.bashrc on WSL/Linux
export OPENAI_API_KEY=sk-REPLACE_WITH_THEIRS                       # for right now
```
(native Windows: `setx OPENAI_API_KEY "sk-..."` then reopen the terminal, and `$env:OPENAI_API_KEY="sk-..."` for the current window.)

> **Never** put the real key on a slide, in a shared doc, or in chat you keep. It's like a credit card.

---

## Step 3 — Create the brain (local) + turn on OpenAI embeddings
```bash
gbrain init                                              # creates the local PGLite brain — no server, just a file
gbrain config set embedding_model openai:text-embedding-3-small
gbrain doctor --json                                     # health check — read it to the founder in plain words
```
- `gbrain init` makes the local database. Config is saved at `~/.gbrain/config.json`.
- **GATE:** `gbrain doctor` must come back healthy before you go on. If it mentions migrations, run `gbrain apply-migrations --yes` and re-check.

Tell the founder what "healthy" means: "the brain exists, it can reach OpenAI, and it's ready for your documents."

---

## Step 4 — Add the founder's documents and build the memory
This is the heart of it. Go step by step.

**4a. Make a folder for their docs** (separate from the gbrain program):
```bash
mkdir -p ~/brain && cd ~/brain && git init
```

**4b. Help the founder add documents.** Tell them plainly what to put in and how:
- **What works best:** text and Markdown (`.md`, `.txt`) — notes, playbooks, FAQs, product descriptions, policies, meeting notes, "about us," pricing rationale, tone-of-voice guides. Exported Notion/Obsidian/Google Docs (as Markdown or text) are ideal.
- **How to add them:** just **drag the files into the `~/brain` folder** in Finder (macOS) / File Explorer (Windows). You (Claude) can also copy a folder they point you at: `cp -R "/path/they/name" ~/brain/`.
- **What NOT to add:** passwords, contracts/NDAs you wouldn't want indexed, customer PII, an email export. Company knowledge, not secrets.
- **Optional but tidy:** group into subfolders like `company/`, `product/`, `people/`, `concepts/` — helps the brain organize. Not required to start.

Confirm there's at least a few files before continuing (`ls ~/brain`).

**4c. Ingest and embed:**
```bash
gbrain import ~/brain/ --no-embed        # read the text of every document into the brain
gbrain embed --stale                      # build OpenAI embeddings (this is the step that costs a few cents)
```
Tell the founder embedding may take a minute and costs pennies.

**4d. Prove it works** — this is the payoff moment:
```bash
gbrain query "what are the main themes in my documents?"
```
The answer should reflect *their* content, with references. If it does, say so: "That answer came from *your* files, not the internet."

**4e. (Optional, nice) build the knowledge graph** so answers cross-reference and cite better:
```bash
gbrain extract links --source db
gbrain extract timeline --source db
gbrain stats
```

---

## Step 5 — Make the brain available inside CLAUDE
Register the local brain as a tool ("MCP server") for Claude Code, user scope so it works in all their projects:
```bash
claude mcp add gbrain -s user -e OPENAI_API_KEY="$OPENAI_API_KEY" -- gbrain serve
claude mcp list          # confirm 'gbrain' shows connected
```
- `gbrain serve` runs the local brain as a tool Claude can call. We pass the key with `-e` because Claude launches it as a separate process that won't see the shell profile.
- **Verify live:** in a Claude chat, ask a question only answerable from their docs. Claude should answer and cite the brain. Show the founder — "Claude now knows your company."

---

## Step 6 — Make the SAME brain available inside HERMES
One brain, second agent:
```bash
hermes mcp add gbrain --command gbrain --args serve --env OPENAI_API_KEY="$OPENAI_API_KEY"
hermes mcp list          # 'gbrain' should appear
hermes mcp test gbrain   # confirm it connects
```
Ask the Hermes agent the same company question — it answers from the brain too. This is the Day-5 "yesterday it guessed → today it cites" moment, now true in **both** tools.

(If Hermes isn't installed yet, skip this step and run it after Day 4's `STARTER.md`.)

---

## Step 7 — Keep it alive: dreaming, syncing, staying current
Install the self-maintaining daemon so the founder never has to think about upkeep:
```bash
gbrain autopilot --install
```
Explain what it does, plainly:
- **Sync** — when the founder adds or edits a document in `~/brain`, the brain picks it up automatically.
- **Re-embed stale** — new/changed content gets fresh OpenAI embeddings.
- **Dream (nightly)** — "while you sleep, the brain tidies up: it connects related notes, fixes references, merges duplicates, and writes short summaries, so tomorrow's answers are sharper." (`gbrain dream` is the one-shot version.)

If `autopilot --install` isn't available or the founder wants it spelled out, schedule these manually (cron on macOS/WSL, Task Scheduler on native Windows):
- every 15 min: `gbrain sync --repo ~/brain && gbrain embed --stale`  (or run continuously: `gbrain sync --watch`)
- nightly: `gbrain dream`
- weekly: `gbrain doctor --json && gbrain embed --stale`
- keep gbrain itself up to date: `gbrain check-update --json`

Confirm the daemon is running and tell the founder: "You can just drop documents into the `~/brain` folder from now on — it updates itself."

---

## Step 8 — Final proof (one brain, live, in both tools)
1. Have the founder add one fresh fact to a document in `~/brain` and save.
2. `gbrain sync --repo ~/brain && gbrain embed --stale` (or wait for autopilot).
3. Ask that new fact in **Claude** → it's cited. Ask it in **Hermes** → it's cited.

That's the whole thing: a private, local company brain that stays current and answers inside both Claude and Hermes.

---

## Troubleshooting (translate to the founder; fix before moving on)
| Symptom | Fix |
|---|---|
| `gbrain: command not found` | PATH didn't load. `export PATH="$HOME/.bun/bin:$PATH"`, or open a new terminal. Confirm with `gbrain --version`. |
| `gbrain doctor` flags migrations | `gbrain apply-migrations --yes`, then re-run doctor. |
| `embed` errors about the key / 401 | `OPENAI_API_KEY` missing or wrong. Re-check Step 2; `echo $OPENAI_API_KEY` should print `sk-...`. |
| OpenAI "quota"/billing error | Founder needs a payment method + a usage limit on platform.openai.com → Billing. |
| MCP shows "failed to connect" (Claude or Hermes) | The server didn't get the key. Re-run Step 5/6 passing `-e` / `--env OPENAI_API_KEY=...`. To see the real error, run `gbrain serve` by hand once. |
| `query` returns nothing useful | Did you run `gbrain embed --stale` after import? Are there actually files in `~/brain`? |
| Windows scheduler won't stick | Move the whole setup into WSL2 (Step 0). Much smoother. |
| Global install failed | Use the git-clone + `bun link` fallback in Step 1. |

## Recap of the guarantees
Local PGLite (no Postgres) · OpenAI `text-embedding-3-small` · no secrets in the brain · one brain exposed to **both** Claude and Hermes · autopilot keeps it synced, re-embedded, and dreaming.
