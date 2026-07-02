# STARTER.md — the recipe Claude executes

**Audience: Claude Code, running on a workshop attendee's own laptop.**
**Goal: install Hermes fresh, prove it works, then hand the baton to Hermes to build the starter jobs.**

Read this whole file first. Then execute the steps in order. **Pause for the founder's approval before each step that installs, writes a key, or starts a service.** Explain what you're about to do in one plain sentence, do it, show the result, then move on. Keep the founder in the driver's seat — they are non-technical, so no jargon dumps.

---

## Ground rules (do not skip)

- **Detect the environment first (Step 0).** macOS, Windows-via-WSL2, and native-Windows-PowerShell install differently and store files in different places. Figure out which one you're in before running anything, and use the matching commands + paths throughout.
- **Fresh install into the default location.** These are clean laptops — do **not** set `HERMES_HOME` and do **not** touch any existing Hermes. (The `facilitator/lab/` folder is the facilitator's own machine; ignore it here.)
- **Read-first, draft-only.** Nothing the agent does may send email, post, or write to an external system without the founder's explicit approval. Configure it that way and say so out loud.
- **One thing at a time.** Prove each step works before the next. If a step fails, run `hermes doctor` and fix that before continuing — do not pile on features.
- **Secrets go in the Hermes home's `.env`** (see Step 0 for where that is), settings in `config.yaml`. Never paste a secret into chat history or a slide.

---

## Step 0 — Identify the environment (do this first)

You (Claude) determine where you're running. Check the platform — e.g. run `uname -s` (Bash) or `$PSVersionTable` / `$IsWindows` (PowerShell), and on Linux check for a WSL marker (`uname -r` contains `microsoft`, or `/proc/version` mentions `WSL`). Pick ONE of three environments and use its column for the rest of this file:

| | **macOS** | **Windows + WSL2** | **native Windows (PowerShell)** |
|---|---|---|---|
| Shell the founder should be in | **Terminal** | **Ubuntu/WSL terminal** | **PowerShell** (Windows Terminal) |
| Hermes install | `curl -fsSL https://hermes-agent.nousresearch.com/install.sh \| bash` | same as macOS | `iex (irm https://hermes-agent.nousresearch.com/install.ps1)` |
| After install, reload shell | `source ~/.zshrc 2>/dev/null \|\| source ~/.bashrc` | `source ~/.bashrc` | (open a new PowerShell window) |
| **Hermes home** (`$HHOME`) | `~/.hermes` | `~/.hermes` (inside WSL) | `%LOCALAPPDATA%\hermes` (`$env:LOCALAPPDATA\hermes`) |
| `.env` / `SOUL.md` / `HANDOFF.md` live in | `$HHOME/…` | `$HHOME/…` | `$HHOME\…` |

**Ensure the founder is in the right shell.** If Claude Code is running somewhere else, tell them plainly which to open: macOS → **Terminal**; Windows → their **WSL/Ubuntu terminal** if they set up WSL for the week (per the pre-work), otherwise **PowerShell**. If you can't tell WSL vs native apart, ask: *"On Windows, did you set up WSL/Ubuntu for this week?"*

Remember your environment for every later step. Wherever this file says **`$HHOME`**, substitute the row above. Most `hermes …` commands are identical across all three — only the install line, the shell-reload, and file paths differ.

## Step 1 — Install Hermes

Explain: "I'll install Hermes. It's one command; takes ~2 minutes." Run the **install** and **reload** commands from your Step-0 column. A GUI desktop installer from the Hermes site also works if the founder prefers it.

Verify: `hermes --version` prints a version, and `hermes doctor` runs (same command on all platforms). Show the founder the doctor output and translate any red items into plain language. If `hermes` isn't found, reload the shell (Step-0 row) or open a new terminal window first.

## Step 2 — FORK: pick your brain (the model)

Ask the founder which they want. Recommend **B** unless they already pay for Claude.

- **A · Claude subscription (via Claude Code).** Cheapest if they already have Claude. ⚠️ **VERIFY before relying on it** — this route has failed before (Anthropic's classifier can reject the agent's tool list). Test it with a *real* task in Step 4, not just a hello. If it's rejected, fall back to B.
- **B · OpenRouter / API key (default).** `hermes setup --portal` for a one-login flow across 300+ models, or `hermes model` to paste an OpenRouter/OpenAI key. Set a **spend cap**.
- **C · Local model.** Private, free, but weaker at tool-calling — only if they insist on fully local.

Whichever path: pick a **strong tool-calling model** (a frontier model for A/B). Weak models are the #1 reason setups feel broken. Switch anytime with `hermes model`.

## Step 3 — Prove one working chat (the gate)

Run `hermes -z "In one sentence, what can you help me with?"` (or open `hermes --tui`).

**Do not proceed until this returns a clean, sensible reply.** If it errors or hallucinates, go back to Step 2 (model) and run `hermes doctor`. A plain chat must work before anything else.

## Step 4 — FORK: pick your channel (reach it from your phone)

Default to **Telegram**. (Slack / Discord are alternatives — same idea, different tokens; see `recipes/` if asked.)

Telegram:
1. Founder creates a bot: DM **@BotFather** → `/newbot` → copies the token. (They find their own user id via **@userinfobot**.)
2. `hermes gateway setup` → paste the bot token → set the allowlist to **only the founder's user id** (`TELEGRAM_ALLOWED_USERS`). **Never** enable `GATEWAY_ALLOW_ALL_USERS`.
3. `hermes gateway start`.
4. Founder messages the bot → `hermes pairing approve telegram <code>` to approve themselves.
5. **Test the kill switch:** `hermes gateway stop` (silence) → `hermes gateway start` (back). Make sure the founder sees this — it's their safety net.

If Step 2 was Path A, this is also where you confirm the subscription survives a real tool-using task (sending a Telegram message is one). If it's rejected, switch to Path B now.

## Step 5 — FORK: pick your first use case

Ask: "What's one recurring thing you'd love handled every morning?" Map their answer to the first blueprint Hermes will build in the hand-off:
- news / market / topics → **morning-brief**
- watching competitor or pricing pages → **web-monitor**
- their inbox → **inbox-summary** (needs Google OAuth — see `recipes/gmail-multi-account.md`; keep it as the third one so nothing stalls)

Note their choice; you'll pass it to Hermes below.

## Step 6 — Seed the soul + the handoff plan, then hand over

This is the baton pass. Claude installs; **Hermes builds.** The two don't share memory, so the baton is a **file Hermes re-reads** — that's how it knows where to pick up. Grounded in how Hermes loads context:
- `SOUL.md` auto-loads from the **Hermes home** (`$HHOME`, Step 0) on **every** session (any surface: Desktop / Telegram / CLI). So the pointer to the plan goes there.
- `AGENTS.md` auto-loads from the **current directory** only — useful for the CLI path, not reliable for Desktop/Telegram.
- Hermes updates a **non-reserved** file (`HANDOFF.md`) — editing `SOUL.md`/`AGENTS.md` trips the prompt-injection guard, so keep those static.

Do this (use your Step-0 `$HHOME` for every path — `~/.hermes/…` on macOS/WSL, `%LOCALAPPDATA%\hermes\…` on native Windows):

1. **Soul.** Ask the founder to pick a soul from `souls/` (default `chief-of-staff.SOUL.md`). Copy it to `$HHOME/SOUL.md`. Append this one standing line so the agent always finds its plan:
   > *"Your working plan is in HANDOFF.md in your Hermes home. At the start of every session, read it and do the NEXT unchecked step. When you finish a step, update HANDOFF.md (check it off, move NEXT, append to Log). Never edit this SOUL.md or AGENTS.md yourself."*
   Optionally edit one tone line together so they see behavior is just text.

2. **Handoff plan.** Copy `HANDOFF.template.md` → `$HHOME/HANDOFF.md`. Fill in the founder's use case (Step 5) and, if they chose a different first blueprint, reorder the checklist so their pick is step 1. This ordered checklist **is** the "where to pick up" state.

3. **Belt-and-suspenders for CLI.** Drop an `AGENTS.md` in the pack folder with the standing rules (read-first/draft-only, approval line, spend cap, no-secrets-in-brain) from `config.example.yaml` — so a `hermes` run launched from here also gets the rules.

4. **Kickoff** (hands control to Hermes). One line, so it works in Bash and PowerShell alike — and it points Hermes at its **own** home, so no per-OS path is needed here:
   ```
   hermes -z "You are set up. Read your SOUL.md and HANDOFF.md from your Hermes home. Do the NEXT unchecked step in the plan. Dry-run it and show me the output before scheduling. Wait for my approval, then check it off in HANDOFF.md and set NEXT to the following step. Read-first / draft-only throughout."
   ```

5. From here the founder works **with Hermes directly** — **Hermes Desktop** (`hermes desktop`) or Telegram. Each session, Hermes reads `HANDOFF.md`, sees what's checked, and continues at the next unchecked item — so it resumes correctly even after the laptop's been closed or the founder switches from CLI to phone. Its learning loop writes skills into the Hermes home's `skills/` folder.

**Your job as Claude is now done.** Tell the founder plainly: "Hermes has the plan and is running itself now — talk to it in the app or on Telegram. Each time you come back it'll pick up where it left off. I'm here if it gets stuck." Do not keep driving.

> **Resume tip for the founder:** to nudge it, just say *"continue my handoff plan"* in Hermes. To resume Hermes' own last session from the terminal: `hermes -c` (last) or `hermes -r "<title>"`.

---

## If something breaks
- `hermes doctor` first — it diagnoses most config/model issues.
- Recovery order: `hermes doctor` → `hermes model` → `hermes setup`.
- Gateway won't connect: `hermes gateway status`, then `stop` / `start`.
- More: `facilitator/troubleshooting.md`.

## Fallbacks
- If `/blueprint <name>` isn't available in the installed build, create the job as a plain `hermes cron` entry using the same fields from the blueprint spec. Confirm with `hermes cron list`.
- If Path A (subscription) is rejected mid-run, switch to Path B (`hermes model`) and continue — don't let it block the founder.
