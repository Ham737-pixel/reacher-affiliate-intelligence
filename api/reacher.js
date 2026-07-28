const REACHER_BASE_URL = "https://api.reacherapp.com/public/v1";

const ALLOWED_ROUTES = new Map([
  ["GET /shops", new Set()],
  ["POST /metrics/summary", new Set()],
  ["POST /metrics/timeseries", new Set()],
  ["POST /creators/performance", new Set()],
  ["GET /creators/levels", new Set(["start_date", "end_date"])],
  ["POST /products/list", new Set()],
  ["POST /samples/by-product", new Set()],
  ["POST /automations/list", new Set()],
  ["POST /videos/creative", new Set()],
  ["GET /funnel", new Set()]
]);

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function sanitizedMessage(value) {
  const readable = value && typeof value === "object"
    ? value.message || value.detail || value.error || value.code || JSON.stringify(value)
    : value;
  return String(readable || "")
    .replace(/rk_live_[A-Za-z0-9_-]+/g, "[hidden key]")
    .slice(0, 500);
}

function validateTarget(method, rawPath) {
  if (typeof rawPath !== "string" || !rawPath.startsWith("/") || rawPath.length > 300) {
    throw new Error("Invalid Reacher path.");
  }
  const requestUrl = new URL(rawPath, "https://dashboard.invalid");

  const routeKey = `${method} ${requestUrl.pathname}`;
  const allowedQuery = ALLOWED_ROUTES.get(routeKey);
  if (!allowedQuery) throw new Error("This endpoint is not available in the dashboard.");
  for (const key of requestUrl.searchParams.keys()) {
    if (!allowedQuery.has(key)) throw new Error("This endpoint query is not available in the dashboard.");
  }
  return {
    endpointPath: requestUrl.pathname,
    url: new URL(`${REACHER_BASE_URL}${requestUrl.pathname}${requestUrl.search}`)
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("cache-control", "no-store, max-age=0");
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "no-referrer");

  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return res.status(405).json({ error: "Use POST for dashboard data requests." });
  }

  const requestBody = jsonBody(req);
  const apiKey = String(requestBody.apiKey || "").trim();
  const method = String(requestBody.method || "").toUpperCase();
  const shopId = requestBody.shopId == null ? "" : String(requestBody.shopId).trim();

  if (!/^rk_live_[A-Za-z0-9_-]{12,}$/.test(apiKey) || apiKey.length > 240) {
    return res.status(400).json({ error: "Enter a valid Reacher API key." });
  }
  if (!["GET", "POST"].includes(method)) {
    return res.status(400).json({ error: "Invalid request method." });
  }

  let target;
  try {
    target = validateTarget(method, requestBody.path);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  if (target.endpointPath !== "/shops" && !/^\d+$/.test(shopId)) {
    return res.status(400).json({ error: "Choose one Reacher shop." });
  }

  const upstreamBody = requestBody.body == null ? null : requestBody.body;
  if (
    upstreamBody !== null &&
    (typeof upstreamBody !== "object" || Array.isArray(upstreamBody) || JSON.stringify(upstreamBody).length > 20000)
  ) {
    return res.status(400).json({ error: "The dashboard request is too large." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);
  try {
    const upstream = await fetch(target.url, {
      method,
      signal: controller.signal,
      headers: {
        "x-api-key": apiKey,
        ...(target.endpointPath === "/shops" ? {} : { "x-shop-id": shopId }),
        "accept": "application/json",
        "content-type": "application/json",
        "user-agent": "Reacher-Affiliate-Dashboard/1.0"
      },
      ...(method === "POST" ? { body: JSON.stringify(upstreamBody || {}) } : {})
    });

    const text = await upstream.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }

    if (!upstream.ok) {
      const detail = sanitizedMessage(payload.detail || payload.error || payload.message);
      if (upstream.headers.get("retry-after")) res.setHeader("retry-after", upstream.headers.get("retry-after"));
      return res.status(upstream.status).json({
        error: detail || `Reacher returned ${upstream.status}.`,
        upstream_status: upstream.status
      });
    }

    return res.status(200).json(payload);
  } catch (error) {
    if (error?.name === "AbortError") {
      return res.status(504).json({ error: "Reacher took too long to respond." });
    }
    return res.status(502).json({ error: "Could not reach the Reacher Data API." });
  } finally {
    clearTimeout(timeout);
  }
};
