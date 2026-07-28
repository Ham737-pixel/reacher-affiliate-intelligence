# Security rules

Apply these rules whenever changing API access, authentication, client storage, hosting, or logs.

## API key

- Hold the key in a JavaScript variable for the current page only.
- Clear it when the visitor changes account.
- Never put it in source, build output, fixtures, screenshots, URLs, error text, analytics, or logs.
- Never store it in local storage, session storage, IndexedDB, cookies, or a service worker.
- Password inputs must disable autocomplete, capitalization, and spellcheck.

Saving harmless preferences such as light mode is allowed. Do not store customer data with those preferences.

## Browser-to-proxy request

- Send requests only to the same-origin `/api/reacher` function.
- Put the key in the POST body sent to that function.
- Do not call `api.reacherapp.com` directly from browser JavaScript.
- Use `cache: "no-store"` for customer-data requests.

## Proxy allowlist

The public proxy may forward only:

```text
GET  /shops
POST /metrics/summary
POST /metrics/timeseries
POST /creators/performance
GET  /creators/levels
POST /products/list
POST /samples/by-product
POST /automations/list
POST /videos/creative
GET  /funnel
```

Reject every other route and method. In particular, do not add create, update, delete, message, invite, approve, ship, or campaign actions to this public proxy.

Allow query parameters only where they are required and named in the proxy. Validate `shopId` as an integer. Cap the request path, API key, and JSON body sizes.

Forward the key as `x-api-key` and the validated shop as `x-shop-id`. Do not forward arbitrary browser headers.

## Responses and errors

- Set `Cache-Control: no-store`.
- Set `X-Content-Type-Options: nosniff`.
- Set `Referrer-Policy: no-referrer`.
- Remove any API key from upstream error text before returning it.
- Return a short safe error when the upstream body cannot be parsed.
- Keep a timeout on upstream requests.

## Rate limits

Reacher's public limit is 60 requests per minute and 3,000 per hour for each key. Start client requests serially, at least 1,050 milliseconds apart. Respect upstream `429` responses and `Retry-After`.

## Public repository check

Before every public push:

1. Run `npm test`.
2. Search all tracked text for `rk_live_` followed by a real token.
3. Confirm no API response, generated report, customer fixture, or `.env` file is tracked.
4. Confirm the public page starts with the API-key setup window.
5. Confirm an unknown or write endpoint is rejected by the proxy.
