# Recipe — Zoho CRM (via MCP)

Same story as Shopify: a **build**, not a one-click connect. Zoho CRM reaches Hermes through an **MCP server** over Zoho's REST API. Good use cases: daily pipeline summary, "leads with no follow-up in 7 days," draft follow-up emails (draft-only).

## The shape
```
Hermes  →  Zoho CRM MCP server  →  Zoho CRM REST API (OAuth)
```

## Steps
1. In the **Zoho API console**, register a **Self Client / Server-based app** → get client id/secret → generate an OAuth token with read scopes (`ZohoCRM.modules.READ` etc.). Read scopes first.
2. Get a Zoho MCP server (community one, or a thin custom wrapper Claude scaffolds).
3. Register it: `hermes mcp add` → provide the OAuth credentials (in `.env`). Note Zoho's **data center domain** (`.eu`, `.com`, …) — a common gotcha.
4. Verify: `hermes mcp list`, then ask *"How many open deals are in my pipeline?"*

## Then make it a job
Blueprint: *"Every Monday 9am, summarize my pipeline, list leads with no touch in 7 days, and draft a follow-up for each — draft-only, I send."* Dry-run, then schedule.

## Rules
- Read scopes first. **No writes to customer records** without explicit approval.
- Watch the data-center domain — wrong region = auth errors.
- Credentials in `.env`. If it won't come together in the room, park it and add it at home with Claude.
