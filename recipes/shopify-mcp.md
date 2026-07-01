# Recipe — Shopify (via MCP)

Be honest with yourself: this is a **build**, not a one-click connect. Shopify reaches Hermes through an **MCP server** (a small tool bridge). Good use cases: daily sales summary, low-stock alerts, "what changed in orders overnight."

## The shape
```
Hermes  →  Shopify MCP server  →  Shopify Admin API
```

## Steps
1. In Shopify admin, create a **custom app** → grant the read scopes you need (orders, products, inventory) → get the **Admin API access token**. Read-only scopes first.
2. Get a Shopify MCP server. Options:
   - An existing community Shopify MCP server (search the MCP directory), or
   - A thin custom one wrapping the Admin API (Claude can scaffold it — this is a Day-2/3-style build).
3. Register it: `hermes mcp add` → point at the server → provide the store domain + access token (in `.env`, not in chat).
4. Verify: `hermes mcp list`, then ask *"How many orders did we get yesterday?"*

## Then make it a job
Wrap it in a blueprint: *"Every morning, summarize yesterday's Shopify orders and revenue, flag anything unusual, send to Telegram."* Dry-run, then schedule.

## Rules
- Read scopes first. No order edits / refunds without explicit approval — this touches money.
- Token in `.env`, never in chat or a slide.
- If you can't get an MCP server working in the room, park it — the morning brief and web monitor already deliver value.
