# Reacher Affiliate Intelligence

Turn your Reacher Data API into clear, actionable TikTok Shop affiliate reports.

[Open the live dashboard](https://reacher-affiliate-intelligence.vercel.app/) · [Get a Reacher API key](https://portal.reacherapp.com/api) · [Read the API specification](https://api.reacherapp.com/api/public-api/openapi.json)

![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)
![Vercel](https://img.shields.io/badge/deploy-Vercel-black.svg)

## What is included

The dashboard builds seven reports from one Reacher shop:

- Affiliate Program Health
- Creator Growth
- Messages and Replies
- Samples and Sales
- Videos and Sales
- Creator Results
- Product Results

Each report includes the core numbers, changes over time, visual comparisons, plain-language findings, and recommended next steps. The health report compares the latest 30 days with the previous three 30-day periods.

## Use it

Open the [hosted dashboard](https://reacher-affiliate-intelligence.vercel.app/), enter a read-only Reacher API key, choose a shop, and build the report. Your API key is held in browser memory only and is cleared when the page is closed or refreshed.

The report can take about a minute to build. Requests run one at a time to stay within Reacher's public API limit.

## Deploy your own copy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ReacherApp/reacher-affiliate-intelligence)

No environment variables are required. Visitors enter their own Reacher API key in the setup window.

To run it locally:

```bash
git clone https://github.com/ReacherApp/reacher-affiliate-intelligence.git
cd reacher-affiliate-intelligence
npm run dev
```

Open the local URL shown by Vercel, then enter your Reacher API key.

## Build on it

The project is deliberately small: plain HTML, CSS, JavaScript, and one Vercel function.

- `index.html` contains the report structure and setup window.
- `affiliate-health.js` fetches the data, calculates the health score, and renders every report.
- `affiliate-health.css` and `monaco-system.css` contain the Monaco-style interface.
- `api/reacher.js` is the read-only, same-origin API proxy.
- `skills/reacher-affiliate-intelligence/` contains reusable agent instructions.

Run the safety and structure checks before publishing changes:

```bash
npm test
```

## Use the skill with an AI agent

The portable skill lives in [`skills/reacher-affiliate-intelligence`](skills/reacher-affiliate-intelligence).

### Claude Code

Claude Code discovers the skill through:

```text
.claude/skills/reacher-affiliate-intelligence
```

Clone the repository, open it in Claude Code, and ask:

```text
Use the Reacher Affiliate Intelligence skill to customize this dashboard for my team.
```

### Codex

Codex discovers the same skill through:

```text
.agents/skills/reacher-affiliate-intelligence
```

Clone the repository, open it in Codex, and ask:

```text
Use $reacher-affiliate-intelligence to add a report for creator retention.
```

### ChatGPT

Add `SKILL.md` and the files in its `references` folder to a ChatGPT Project, or paste their contents into the project's instructions and knowledge. Then attach or connect this repository and ask ChatGPT to use those instructions when changing the dashboard.

## Security

- API keys are never included in this repository.
- The browser does not save the Reacher API key in local storage, session storage, cookies, or the URL.
- The Vercel function accepts only the read-only endpoints used by the dashboard.
- The proxy rejects unknown paths, write endpoints, external URLs, invalid shop IDs, and oversized request bodies.
- API responses are not cached.
- No customer report, creator name, product name, or shop data is bundled with the public app.

This design protects a key from accidental browser storage and limits what the public proxy can do. A visitor's key still travels through the deployed Vercel function to Reacher, so deploy your own copy if you do not want to trust the shared host.

## How the health score works

The score is an open, editable model built from five parts:

| Part | Weight | What it checks |
| --- | ---: | --- |
| Finding creators | 20% | Active creators and first-time posters |
| Getting creators to post | 25% | Sample requests and shipped samples |
| Turning activity into sales | 20% | Sales per video, videos making sales, and sales per sample |
| Getting repeat content | 20% | Videos per creator |
| Spreading sales | 15% | Dependence on the top product and top 10 creators |

Each number is compared with the shop's own previous three periods. A score below 40 in any part marks the program as needing attention. See [`scoring.md`](skills/reacher-affiliate-intelligence/references/scoring.md) for the complete formula.

The possible points shown beside a recommendation are a score calculation, not a sales forecast.

## Contributing

Issues and pull requests are welcome. Keep the language simple, protect customer data, and use only endpoints documented in Reacher's [public OpenAPI specification](https://api.reacherapp.com/api/public-api/openapi.json).

## License

[MIT](LICENSE)
