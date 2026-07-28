---
name: reacher-affiliate-intelligence
description: Build, customize, audit, or deploy the open-source Reacher Affiliate Intelligence dashboard. Use when connecting a Reacher Data API key, adding or changing affiliate reports, updating the health score, securing the read-only proxy, testing the dashboard, or deploying a fork to Vercel.
---

# Reacher Affiliate Intelligence

Build useful affiliate reports from the Reacher Data API while keeping customer data and API keys out of the source.

## Protect the customer first

- Never place a real API key, API response, shop name, creator name, or product name in source control.
- Keep the API key in browser memory only. Never save it in local storage, session storage, cookies, URLs, analytics, or logs.
- Send Reacher requests through the same-origin proxy in `api/reacher.js`.
- Keep the proxy limited to the documented read-only endpoints the dashboard needs.
- Reject unknown paths, query parameters, external URLs, write endpoints, invalid shop IDs, and large bodies.
- Read [security.md](references/security.md) before changing authentication, the proxy, network requests, or deployment.

## Follow this workflow

### 1. Understand the request

Identify the report, audience, decision, date range, and numbers that must support that decision. Prefer one useful report over several weak charts.

Use plain language throughout. Write labels that a brand operator can understand without knowing analytics terms.

### 2. Check the API contract

Use Reacher's official OpenAPI specification as the source of truth:

`https://api.reacherapp.com/api/public-api/openapi.json`

Confirm the method, path, request body, response fields, and required shop header before writing code. Do not invent a field when the API does not provide it.

### 3. Change the data model

Keep requests serial and at least 1,050 milliseconds apart. The public API allows 60 requests per minute and 3,000 per hour.

For health comparisons, load seven non-overlapping 30-day windows. Use the newest period as the current view and the previous three periods as its baseline. Read [scoring.md](references/scoring.md) before changing any score, recommendation priority, or threshold.

Show missing data honestly. Use a clear “not available” state instead of zero when zero would change the meaning.

### 4. Build the report

Keep the report order:

1. Core numbers
2. Simple summary of what happened
3. Where results drop
4. What is not working
5. What worked
6. What to do next
7. Evidence tables

Use the Monaco visual language already in the project. Reuse existing cards, panels, charts, tooltips, colors, and spacing before adding new components.

Make every chart answer a question. Add the comparison period and unit directly to its title, label, or supporting text.

### 5. Test the change

Run:

```bash
npm test
```

Then run the site locally:

```bash
npm run dev
```

Test with a temporary read-only key. Confirm setup, shop selection, all report choices, date choices, refresh, light and dark mode, narrow screens, empty responses, rate-limit errors, and invalid keys. Never include the test key in screenshots, terminal output, commits, or bug reports.

### 6. Deploy safely

Deploy with Vercel only after the tests pass:

```bash
vercel --prod
```

Open the production URL and repeat a short smoke test. Confirm no customer data appears before a visitor supplies a key.

## Know the main files

- `index.html`: setup window and report structure
- `affiliate-health.js`: requests, score calculation, findings, and charts
- `affiliate-health.css`: report styling
- `affiliate-health-self-serve.css`: public setup states
- `monaco-system.css`: shared Monaco-style tokens and components
- `api/reacher.js`: read-only Reacher proxy
- `vercel.json`: deployment and browser security headers
- `scripts/verify.mjs`: repository safety checks

## Finish with evidence

Before handing off a change:

- State which report changed.
- State which Reacher fields power it.
- State how the comparison is calculated.
- Report the tests that passed.
- Call out missing data or limits.
- Link the deployed result when deployment was requested.
