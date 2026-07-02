# SETUP-GBRAIN.md — the recipe Claude executes

**Audience: Claude Code, on a non-technical founder's laptop.**
**Goal: install gbrain as a LOCAL "second brain" (no database server), embed via the founder's OpenRouter key (the same one they likely set up for Hermes), import the founder's company documents, make it available inside BOTH Claude and Hermes, and schedule self-maintenance (sync + re-embed + nightly "dream").**

> **You (Claude) do the typing. The founder is non-technical.** Read this whole file first. Then run the steps in order. Before anything that installs, writes a key, or starts a service: say in ONE plain sentence what you're about to do and why, do it, show the result, and only then move on. Never paste a wall of commands at the founder — you run them. Translate every error into plain language and fix it before continuing.
>
> **Language:** if the founder writes in Slovenian, talk to them in Slovenian throughout. Keep tech terms (gbrain, embedding, MCP, API key, OpenAI) as-is.

**Prerequisites:** Claude Code works (Days 1–3) and Hermes is installed (Day 4, via `STARTER.md`). If Hermes isn't installed yet, do everything except Step 6, and come back to Step 6 later.

**Source of truth for commands:** gbrain's own `INSTALL_FOR_AGENTS.md` (github.com/garrytan/gbrain). Verified against gbrain **0.42.40.0** (2026-07-02): `engine: pglite` (local), 16 embedding providers incl. `openrouter:openai/text-embedding-3-small` (this recipe's default) and `ollama:nomic-embed-text` (no-key local). `gbrain init` auto-detects the provider from whichever key is set; we pin it with `--embedding-model` for determinism.

---

## What we're building (say this to the founder, plainly)

> "Right now, when you ask an AI a question about *your* company, it guesses. We're going to give it a memory of your business — your documents — that lives **on your laptop**. Then both Claude and Hermes can answer from *your* knowledge and tell you which document it came from. It's private (nothing leaves your machine except small text snippets sent to build the search index), and it keeps itself up to date automatically."

Three plain ideas:
- **gbrain** = the second brain. A small program + a local database file.
- **PGLite** = the database, but as a *file on your disk* — no server to run or manage.
- **Embeddings** = how the brain "understands" your docs so it can find the right one. We use **OpenRouter** for this — the same account many of you already set up for Hermes.

> **One brain, both tools — you build it ONCE.** `gbrain init` creates a single local database (`~/.gbrain/brain.pglite`). Both Claude and Hermes reach that *same* brain by running `gbrain serve`. You do **not** run `gbrain init` twice or make a brain per tool. Your documents are a *source* that feeds the one brain; import a doc once and it shows up in both Claude and Hermes.

---

## Ground rules (keep these true the whole way)
- **Local only. No Postgres, no cloud database.** Embedded PGLite — a database in a file.
- **OpenRouter embeddings** — model `openrouter:openai/text-embedding-3-small` (1536-dim). Cheapest hosted route (~$0.02 per **million** tokens; a few hundred documents costs a few cents), and it reuses the OpenRouter key most founders already made for Hermes — no new account. *(Fully-local alternative with no key at all: Ollama — see the note in Step 2.)*
- **No secrets in the brain.** Never import passwords, private keys, contracts you wouldn't want indexed, or an email inbox. Company *knowledge*, not company *secrets*.
- **One brain, two agents.** We build the brain once and expose the *same* brain to both Claude and Hermes.

---

## Step 0 — Which computer are we on?
Detect the OS exactly like `STARTER.md` Step 0: **macOS**, **Windows + WSL2** (an Ubuntu terminal inside Windows), or **native Windows (PowerShell)**.

> **On Windows, strongly prefer WSL2/Ubuntu for gbrain.** The self-maintenance daemon and scheduling are Unix-native. If the founder set up WSL for the week (per the pre-work packet), do *everything here inside the WSL/Ubuntu terminal*. Native Windows works for the basics but the overnight scheduler is fiddly — tell the founder that plainly and offer WSL.

Tell the founder which window they should be looking at, and confirm the prompt is that shell before you run anything.

In Step 4 you'll ask the founder where their documents live and store that path as **`$BRAIN_SRC`** — used throughout. It's their documents folder, separate from the gbrain program itself.

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

## Step 2 — Get (or reuse) an OpenRouter API key
The brain builds its search index through **OpenRouter**. Many founders already made an OpenRouter key for Hermes (STARTER.md, Path B) — **reuse that one** and skip the account steps.

First check: `echo $OPENROUTER_API_KEY` — if it prints `sk-or-...`, they already have it; go straight to Step 3.

If they don't have one:
1. Go to **openrouter.ai/settings/keys** → sign in (or create an account).
2. Add a little credit under **Credits** (OpenRouter is prepaid, not a subscription — $5 lasts a very long time for embeddings). No monthly commitment.
3. **Create Key** → copy it (starts with `sk-or-...`). Copy it now; they may not see it again.

Set it so every tool can use it:
```bash
echo 'export OPENROUTER_API_KEY=sk-or-REPLACE' >> ~/.zshrc   # or ~/.bashrc on WSL/Linux
export OPENROUTER_API_KEY=sk-or-REPLACE                       # for right now
```
(native Windows: `setx OPENROUTER_API_KEY "sk-or-..."` then reopen the terminal, and `$env:OPENROUTER_API_KEY="sk-or-..."` for the current window.)

> **Never** put the real key on a slide, in a shared doc, or in chat you keep. Treat it like a credit card.

> **No-card, fully-local alternative (Ollama).** If a founder would rather spend $0 and keep embeddings entirely on their machine: install **Ollama** (ollama.com), run `ollama pull nomic-embed-text`, and in Step 3 use `--embedding-model ollama:nomic-embed-text` instead (no API key needed). Trade-off: it downloads a ~275MB model and uses local RAM. Everything else in this recipe is identical — wherever a later step passes `OPENROUTER_API_KEY`, an Ollama setup needs no key at all.

---

## Step 3 — Create the brain (local) with OpenRouter embeddings
```bash
gbrain init --pglite --embedding-model openrouter:openai/text-embedding-3-small
gbrain doctor --json                                     # health check — read it to the founder in plain words
```
- `gbrain init` makes the local PGLite database — no server, just a file. Config saved at `~/.gbrain/config.json`.
- The `--embedding-model` flag pins OpenRouter so it's deterministic (gbrain would otherwise auto-detect from whichever key is set).
- **Ollama variant:** `gbrain init --pglite --embedding-model ollama:nomic-embed-text` (no key).
- **GATE:** `gbrain doctor` must come back healthy before you go on. If it mentions migrations, run `gbrain apply-migrations --yes` and re-check.

Tell the founder what "healthy" means: "the brain exists, it can reach OpenAI, and it's ready for your documents."

---

## Step 4 — Point the brain at the founder's documents
This is the heart of it. **First, ASK the founder where their company documents already live** — don't assume. Most founders already have a folder.

**4a. Ask for the source folder.** Say: *"Where are your company documents? A folder on your computer works — an Obsidian vault, a folder in Documents, an exported Notion/Google-Docs folder. Point me at it, or tell me you'd like to start a fresh one."*
- If they give you a path, use it. Store it as **`$BRAIN_SRC`** (an absolute path) and use it everywhere below. E.g. `BRAIN_SRC="/Users/them/Documents/CompanyDocs"` or an Obsidian vault path.
- If they have nothing yet, create a starter folder and tell them to drop files in over time:
  ```bash
  mkdir -p ~/brain && BRAIN_SRC="$HOME/brain"
  ```
- **What works best in that folder:** text/Markdown (`.md`, `.txt`) — playbooks, FAQs, product descriptions, policies, meeting notes, "about us," pricing rationale, tone-of-voice guides. Exported Notion/Obsidian/Google Docs are ideal.
- **What NOT to include:** passwords, NDAs/contracts you wouldn't want indexed, customer PII, an email export. Company *knowledge*, not *secrets*. If you spot obvious secrets in their folder, warn them before importing.

**4b. Enable ongoing auto-sync of that folder.** gbrain syncs a folder that's a git repo. If `$BRAIN_SRC` isn't one yet, initialize it (harmless — it only adds a hidden `.git`, changes nothing else):
```bash
cd "$BRAIN_SRC" && [ -d .git ] || git init
```
Confirm there are files: `ls "$BRAIN_SRC"`.

**4c. Ingest and embed:**
```bash
gbrain import "$BRAIN_SRC" --no-embed      # read the text of every document into the ONE brain
gbrain embed --stale                        # build embeddings via OpenRouter (costs a few cents)
```
Tell the founder embedding may take a minute and costs a few cents (or is free on Ollama).

**4d. Prove it works** — the payoff moment:
```bash
gbrain query "what are the main themes in my documents?"
```
The answer should reflect *their* content, with references. If it does, say so: "That came from *your* files, not the internet."

**4e. (Optional, nice) build the knowledge graph** so answers cross-reference and cite better:
```bash
gbrain extract links --source db
gbrain extract timeline --source db
gbrain stats
```

> Remember `$BRAIN_SRC` — Step 7's auto-maintenance points at it.

---

## Step 5 — Make the brain available inside CLAUDE
Register the local brain as a tool ("MCP server") for Claude Code, user scope so it works in all their projects:
```bash
claude mcp add gbrain -s user -e OPENROUTER_API_KEY="$OPENROUTER_API_KEY" -- gbrain serve
claude mcp list          # confirm 'gbrain' shows connected
```
- `gbrain serve` runs the local brain as a tool Claude can call. We pass the key with `-e` because Claude launches it as a separate process that won't see the shell profile. *(Ollama variant: no `-e` needed — `claude mcp add gbrain -s user -- gbrain serve`.)*

**MANDATORY TEST — Claude first (this is where the cohort is working).** Do not move to Hermes until this passes:
1. In this Claude session, confirm the tool is loaded: run `claude mcp list` and check `gbrain` shows **connected** (not "failed to connect").
2. Ask Claude a question that is **only** answerable from the founder's docs — pick something concrete from what they imported (e.g. "According to my documents, what are our delivery terms?").
3. **Pass = Claude answers from the brain and can point to the source doc.** Show the founder: "Claude now knows your company."
4. If it fails: `gbrain serve` by hand to see the error; check the key was passed with `-e`; re-run `claude mcp list`. Fix before continuing — a broken brain in Claude will be broken in Hermes too.

---

## Step 6 — Make the SAME brain available inside HERMES
One brain, second agent:
```bash
hermes mcp add gbrain --command gbrain --args serve --env OPENROUTER_API_KEY="$OPENROUTER_API_KEY"
hermes mcp list          # 'gbrain' should appear
hermes mcp test gbrain   # confirm it connects
```
*(Ollama variant: drop `--env` — `hermes mcp add gbrain --command gbrain --args serve`.)*

**MANDATORY TEST — Hermes second.** Do not call the setup done until this passes:
1. `hermes mcp test gbrain` returns OK.
2. Ask the Hermes agent (in the TUI, Desktop, or Telegram) the **same** company question you asked Claude.
3. **Pass = Hermes answers from the brain and cites the source.** This is the Day-5 "yesterday it guessed → today it cites" moment, now true in **both** tools.
4. If Claude passed but Hermes fails, it's almost always the key: re-run the add with `--env OPENROUTER_API_KEY=...`.

(If Hermes isn't installed yet, skip this step and run it after Day 4's `STARTER.md`.)

---

## Step 7 — Periodic ingestion + self-maintenance (set this up, don't skip)

**Explain the problem to the founder first, plainly:** *"Right now the brain knows the documents we just imported. But your business changes — you write new notes, update your pricing, add a policy. Without this step, the brain would slowly go stale. So we set it up to re-read your folder on a schedule and keep itself current — you just save files, it does the rest."*

**How periodic ingestion works (3 moving parts):**
1. **Detect** — gbrain looks at your documents folder (`$BRAIN_SRC`) and notices what's new or changed since last time (that's why we made it a git repo in Step 4b — it can diff).
2. **Ingest + embed** — new/changed docs get read in and embedded (via OpenRouter). Unchanged docs are skipped, so it's cheap and fast.
3. **Dream (nightly)** — the brain consolidates: connects related notes, fixes references, merges duplicates, writes summaries — so tomorrow's answers are sharper.

**Set it up — the one-command way (recommended):**
```bash
gbrain autopilot --install
```
This installs a background daemon that runs all three on a schedule automatically — the founder never has to think about it.

**Verify the schedule is actually installed** (don't assume):
```bash
gbrain autopilot --status        # or: gbrain autopilot (no args) to see state
```
Then prove ingestion works end to end (do this live so the founder trusts it):
1. Add or edit a file in `$BRAIN_SRC`, save.
2. Wait for the daemon, or force one pass: `gbrain sync --repo "$BRAIN_SRC" && gbrain embed --stale`.
3. Ask the new fact in Claude — it's there. **That proves periodic ingestion is live.**

**If autopilot isn't available on this machine, install the equivalent schedule explicitly:**
```bash
gbrain sync --install-cron                 # persistent periodic sync of your source folder
```
Or hand-schedule (cron on macOS/WSL, Task Scheduler on native Windows):
- every 15 min — ingest changes: `gbrain sync --repo "$BRAIN_SRC" && gbrain embed --stale`
- always-on alternative: `gbrain sync --watch` (a live watcher that ingests the moment you save)
- nightly — consolidate: `gbrain dream`
- weekly — health + backfill: `gbrain doctor --json && gbrain embed --stale`
- monthly — keep gbrain itself current: `gbrain check-update --json`

Tell the founder the payoff plainly: **"From now on, just save documents into your folder. The brain re-reads them on its own, and both Claude and Hermes stay current."**

---

## Step 8 — Final proof (one brain, live, current, in both tools)
The end-to-end check that ties Steps 5–7 together:
1. Have the founder add one fresh fact to a document in `$BRAIN_SRC` and save.
2. `gbrain sync --repo "$BRAIN_SRC" && gbrain embed --stale` (or wait for the autopilot daemon).
3. Ask that new fact in **Claude first** → it's cited. Then in **Hermes** → it's cited.

If all three pass, you're done: a private, local company brain that stays current on its own and answers inside both Claude and Hermes. Tell the founder they can close everything — it keeps running.

## Step 9 — Teach the founder to use it (don't skip the hand-off)
Setup ≠ adoption. Spend two minutes walking the founder through **`recipes/using-your-brain.md`** live. The one thing they must leave with: **they don't type `gbrain` commands — they just ask Claude or Hermes in plain language, and it uses the brain.** Demo 2–3 real questions about their own docs (ask for the source each time), show them that saving a file into their folder updates the brain on its own, and mention they can ask *"list my gbrain skills"* to see the built-in playbooks. Then point them at that tutorial file to keep.

---

## Troubleshooting (translate to the founder; fix before moving on)
| Symptom | Fix |
|---|---|
| `gbrain: command not found` | PATH didn't load. `export PATH="$HOME/.bun/bin:$PATH"`, or open a new terminal. Confirm with `gbrain --version`. |
| `gbrain doctor` flags migrations | `gbrain apply-migrations --yes`, then re-run doctor. |
| `embed` errors about the key / 401 | `OPENROUTER_API_KEY` missing or wrong. Re-check Step 2; `echo $OPENROUTER_API_KEY` should print `sk-or-...`. |
| OpenRouter "insufficient credits"/402 | Founder needs to add prepaid credit at openrouter.ai → Credits. |
| MCP shows "failed to connect" (Claude or Hermes) | The server didn't get the key. Re-run Step 5/6 passing `-e` / `--env OPENROUTER_API_KEY=...`. To see the real error, run `gbrain serve` by hand once. |
| `query` returns nothing useful | Did you run `gbrain embed --stale` after import? Are there actually files in `$BRAIN_SRC`? |
| Using Ollama, MCP connects but search fails | The Ollama daemon isn't running, or the model isn't pulled. `ollama list` should show `nomic-embed-text`; start Ollama and retry. |
| Windows scheduler won't stick | Move the whole setup into WSL2 (Step 0). Much smoother. |
| Global install failed | Use the git-clone + `bun link` fallback in Step 1. |

## Recap of the guarantees
Local PGLite (no Postgres) · OpenAI `text-embedding-3-small` · no secrets in the brain · one brain exposed to **both** Claude and Hermes · autopilot keeps it synced, re-embedded, and dreaming.
