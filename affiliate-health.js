const state = {
  reports: [],
  sanitizedReports: [],
  reportIndex: 0,
  periodIndex: 0,
  dashboardId: "affiliate-health",
  anonymized: false,
  theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
  secureMode: document.documentElement.dataset.secureMode === "true",
  unlocking: false
};

const reportDataUrl = document.documentElement.dataset.reportDataUrl || "/api/affiliate-health";
const unlockDataUrl = document.documentElement.dataset.unlockDataUrl || "/api/affiliate-health";

const elements = {
  refresh: document.querySelector("#refreshHealth"),
  privacyToggle: document.querySelector("#privacyToggle"),
  privacyBadge: document.querySelector("#privacyBadge"),
  themeToggle: document.querySelector("#themeToggle"),
  themeToggleIcon: document.querySelector("#themeToggleIcon"),
  dashboardSelect: document.querySelector("#dashboardSelect"),
  shopSelect: document.querySelector("#shopSelect"),
  periodSelect: document.querySelector("#periodSelect"),
  reportStatus: document.querySelector("#reportStatus"),
  kpiStrip: document.querySelector("#kpiStrip"),
  healthTabs: document.querySelector(".health-tabs"),
  healthScroll: document.querySelector(".health-scroll"),
  affiliateHealthView: document.querySelector("#affiliateHealthView"),
  useCaseView: document.querySelector("#useCaseView"),
  healthLabel: document.querySelector("#healthLabel"),
  scoreRing: document.querySelector("#scoreRing"),
  overallScore: document.querySelector("#overallScore"),
  scoreDelta: document.querySelector("#scoreDelta"),
  scoreNarrative: document.querySelector("#scoreNarrative"),
  scoreTrend: document.querySelector("#scoreTrend"),
  pillarChart: document.querySelector("#pillarChart"),
  operatorVerdict: document.querySelector("#operatorVerdict"),
  operatorBreak: document.querySelector("#operatorBreak"),
  operatorProblems: document.querySelector("#operatorProblems"),
  operatorWins: document.querySelector("#operatorWins"),
  operatorActions: document.querySelector("#operatorActions"),
  operatorActionCount: document.querySelector("#operatorActionCount"),
  operatingChain: document.querySelector("#operatingChain"),
  opportunityChart: document.querySelector("#opportunityChart"),
  metricDiagnostics: document.querySelector("#metricDiagnostics"),
  efficiencyScore: document.querySelector("#efficiencyScore"),
  efficiencyChart: document.querySelector("#efficiencyChart"),
  concentrationScore: document.querySelector("#concentrationScore"),
  concentrationChart: document.querySelector("#concentrationChart"),
  recommendationRows: document.querySelector("#recommendationRows"),
  creatorRows: document.querySelector("#creatorRows"),
  productRows: document.querySelector("#productRows"),
  qualityText: document.querySelector("#qualityText"),
  methodologyText: document.querySelector("#methodologyText"),
  unlockDialog: document.querySelector("#unlockDialog"),
  unlockForm: document.querySelector("#unlockForm"),
  unlockPassword: document.querySelector("#unlockPassword"),
  unlockError: document.querySelector("#unlockError"),
  unlockSubmit: document.querySelector("#unlockSubmit"),
  tooltip: document.querySelector("#chartTooltip")
};

const DASHBOARDS = {
  "affiliate-health": {
    label: "Affiliate Program Health",
    description: "See where the program is weak, what is working, and what to do next.",
    sources: "/metrics/summary · /creators/performance · /products/list"
  },
  "creator-growth": {
    label: "Creator Growth",
    description: "See how many creators are active, post for the first time, and make sales.",
    sources: "/metrics/summary · /metrics/timeseries · /funnel · /creators/levels"
  },
  "outreach-performance": {
    label: "Messages and Replies",
    description: "See how many creators you reach, message, get replies from, and invite to work with you.",
    sources: "/metrics/summary · /metrics/timeseries · /automations/list"
  },
  "sample-efficiency": {
    label: "Samples and Sales",
    description: "See how many samples were requested and shipped, and how much they sold.",
    sources: "/metrics/summary · /metrics/timeseries · /samples/by-product"
  },
  "content-yield": {
    label: "Videos and Sales",
    description: "See how many videos were posted, how many made sales, and which products need more videos.",
    sources: "/metrics/summary · /metrics/timeseries · /videos/creative"
  },
  "creator-portfolio": {
    label: "Creator Results",
    description: "See which creators make sales and whether the program depends too much on a few people.",
    sources: "/creators/performance · /creators/levels · /metrics/timeseries"
  },
  "product-portfolio": {
    label: "Product Results",
    description: "See which products make sales, get refunds, and have enough creators and videos.",
    sources: "/products/list · /metrics/summary · /metrics/timeseries"
  }
};

const pillarOrder = ["acquisition", "activation", "efficiency", "retention", "concentration"];
const pillarDescriptions = {
  acquisition: "Finding creators",
  activation: "Sending samples",
  efficiency: "Sales from videos",
  retention: "Creators posting again",
  concentration: "How spread out sales are"
};

const operatorMetricLabels = {
  active_creators: "Active creators",
  new_creators_posting: "Creators posting for the first time",
  samples_approved: "Samples shipped",
  sample_requests: "Sample requests",
  gmv_per_video: "Affiliate sales per video",
  sale_rate: "Videos that made sales",
  gmv_per_sample: "Affiliate sales per shipped sample",
  content_velocity: "Videos per creator",
  top_sku_share: "Sales from the top product",
  top10_creator_share: "Sales from the top 10 creators"
};

const operatorActionCopy = {
  content_velocity: {
    title: "Ask for a second video",
    body: "Give a small group of creators who made sales the same product again. Ask each person for one more video."
  },
  new_creators_posting: {
    title: "Make the first brief simpler",
    body: "Give the next group one product and one clear video idea. See if more of them post."
  },
  samples_approved: {
    title: "Review sample requests faster",
    body: "Check requests every day for two weeks. When possible, decide within 48 hours. See if more samples are shipped."
  },
  sample_requests: {
    title: "Lead with the best-selling product",
    body: "Use the product with the most affiliate sales in the next message test. See if more creators request it."
  },
  gmv_per_video: {
    title: "Copy ideas from videos that sell",
    body: "Use common ideas from the videos with the most affiliate sales in a small test. See if sales per video rise."
  },
  sale_rate: {
    title: "Test fewer video styles",
    body: "Group videos by style and check which styles made sales. Test the best style with a small group before making a bigger change."
  },
  gmv_per_sample: {
    title: "Send samples to creators with a sales record",
    body: "Give one test group priority if they have sold a similar product before. See if sales per shipped sample rise."
  },
  top_sku_share: {
    title: "Give two more products a chance",
    body: "Move some briefs and samples from the top product to the next two best products. Check whether total sales hold."
  },
  top10_creator_share: {
    title: "Add more creators who already show promise",
    body: "Recruit a small group like the creators outside the top 10 who already make sales. See how many of their videos sell."
  },
  active_creators: {
    title: "Stop adding creators until posting catches up",
    body: "Do not reach out to more creators until first posts and repeat posts rise with the creator count."
  }
};

const iconByStage = {
  active_creators: "health-users",
  new_creators_posting: "health-users",
  videos_posted: "health-video",
  gmv_driving_videos: "health-chart",
  gmv: "health-dollar"
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(Number(value) || 0);
}

function formatCompact(value, digits = 1) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: digits
  }).format(Number(value) || 0);
}

function formatMoney(value, currency = "USD", compact = true) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : 0
  }).format(Number(value) || 0);
}

function formatPercent(value, digits = 1) {
  return `${formatNumber(value, digits)}%`;
}

function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateRange(start, end) {
  return `${formatDate(start, { day: "numeric", month: "short" })} – ${formatDate(end, { day: "numeric", month: "short", year: "numeric" })}`;
}

function percentChange(current, previous) {
  const currentNumber = Number(current) || 0;
  const previousNumber = Number(previous) || 0;
  if (!previousNumber) return null;
  return ((currentNumber - previousNumber) / Math.abs(previousNumber)) * 100;
}

function safeDivide(numerator, denominator, multiplier = 1) {
  const top = Number(numerator) || 0;
  const bottom = Number(denominator) || 0;
  return bottom > 0 ? (top / bottom) * multiplier : null;
}

function sumBy(rows, key) {
  return (rows || []).reduce((total, row) => total + (Number(row?.[key]) || 0), 0);
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function quantile(values, probability = 0.5) {
  const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * clamp(probability, 0, 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function datasetRows(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : [];
}

function displayEntityName(value, kind, index = 0) {
  if (!state.anonymized && value) return String(value);
  return `${kind} ${String(index + 1).padStart(2, "0")}`;
}

function weeklySeries(report, metric, endDate = null, limit = 18) {
  const rows = report.intelligence?.weekly_timeseries?.data?.[metric] || [];
  return rows
    .map((row) => ({ date: row.date, value: Number(row.value) || 0 }))
    .filter((row) => !endDate || row.date <= endDate)
    .slice(-limit);
}

function weeklyRatioSeries(report, numeratorMetric, denominatorMetric, endDate = null, multiplier = 100, limit = 18) {
  const numerator = weeklySeries(report, numeratorMetric, endDate, 999);
  const denominator = new Map(weeklySeries(report, denominatorMetric, endDate, 999).map((row) => [row.date, row.value]));
  return numerator
    .map((row) => ({ date: row.date, value: safeDivide(row.value, denominator.get(row.date), multiplier) }))
    .filter((row) => Number.isFinite(row.value))
    .slice(-limit);
}

function windowSeries(report, accessor, endDate = null, limit = 7) {
  return [...(report.windows || [])]
    .reverse()
    .map((window) => ({ date: window.end_date, value: Number(accessor(window)) || 0 }))
    .filter((row) => !endDate || row.date <= endDate)
    .slice(-limit);
}

function seriesValues(series) {
  return (series || []).map((row) => Number(row?.value ?? row) || 0);
}

function scoreClass(score) {
  if (Number(score) >= 70) return "is-good";
  if (Number(score) >= 40) return "is-watch";
  return "is-risk";
}

function scoreColor(score) {
  if (Number(score) >= 70) return "var(--health-good)";
  if (Number(score) >= 40) return "var(--health-watch)";
  return "var(--health-risk)";
}

function simpleScoreLabel(score) {
  if (Number(score) >= 70) return "GOOD";
  if (Number(score) >= 40) return "NEEDS WORK";
  return "NEEDS ATTENTION";
}

function deltaMarkup(change, suffix = "from previous 30 days") {
  if (change === null || !Number.isFinite(change)) {
    return `<span class="metric-delta is-flat">No earlier period to compare</span>`;
  }
  const direction = change > 0.05 ? "is-up" : change < -0.05 ? "is-down" : "is-flat";
  const arrow = change > 0.05 ? "↑" : change < -0.05 ? "↓" : "→";
  return `<span class="metric-delta ${direction}">${arrow} ${formatPercent(Math.abs(change), 1)} ${escapeHtml(suffix)}</span>`;
}

function pointDeltaMarkup(change, suffix = "points from previous 30 days") {
  if (change === null || !Number.isFinite(change)) {
    return `<span class="metric-delta is-flat">No earlier period to compare</span>`;
  }
  const direction = change > 0.05 ? "is-up" : change < -0.05 ? "is-down" : "is-flat";
  const arrow = change > 0.05 ? "↑" : change < -0.05 ? "↓" : "→";
  return `<span class="metric-delta ${direction}">${arrow} ${formatNumber(Math.abs(change), 1)} ${escapeHtml(suffix)}</span>`;
}

function ratioLabel(value, digits = 1) {
  return value === null || !Number.isFinite(value) ? "—" : formatPercent(value, digits);
}

function moneyPer(value, currency = "USD") {
  return value === null || !Number.isFinite(value) ? "—" : formatMoney(value, currency, false);
}

function formatMetric(metricKey, value, currency = "USD") {
  if (["gmv_per_video", "gmv_per_sample"].includes(metricKey)) return formatMoney(value, currency, false);
  if (["sale_rate", "top_sku_share", "top10_creator_share"].includes(metricKey)) return formatPercent(value, 1);
  if (metricKey === "content_velocity") return `${formatNumber(value, 2)} videos per creator`;
  return formatCompact(value, 1);
}

function selectedContext() {
  const report = state.reports[state.reportIndex];
  if (!report) return null;
  const snapshot = report.snapshots[state.periodIndex];
  const window = report.windows[state.periodIndex];
  return {
    report,
    snapshot,
    window,
    previousSnapshot: report.snapshots[state.periodIndex + 1] || null,
    previousWindow: report.windows[state.periodIndex + 1] || null
  };
}

function updateShopOptions() {
  const selectedValue = String(state.reportIndex);
  elements.shopSelect.innerHTML = state.reports
    .map((report, index) => {
      const label = state.anonymized ? `Shop ${String(index + 1).padStart(2, "0")}` : report.shop.shop_name;
      return `<option value="${index}">${escapeHtml(label)}</option>`;
    })
    .join("");
  elements.shopSelect.value = selectedValue;
}

function updatePeriodOptions() {
  const report = state.reports[state.reportIndex];
  if (!report) return;
  elements.periodSelect.innerHTML = report.snapshots
    .map((snapshot, index) => {
      const prefix = index === 0 ? "Latest · " : "";
      return `<option value="${index}">${prefix}${escapeHtml(formatDateRange(snapshot.start_date, snapshot.end_date))}</option>`;
    })
    .join("");
  elements.periodSelect.value = String(state.periodIndex);
}

function renderHealthKpis(context) {
  const { report, snapshot, window, previousWindow, previousSnapshot } = context;
  const summary = window.summary;
  const prior = previousWindow?.summary || {};
  const convertingRate = summary.videos_posted ? (summary.gmv_driving_videos / summary.videos_posted) * 100 : 0;
  const priorConvertingRate = prior.videos_posted ? (prior.gmv_driving_videos / prior.videos_posted) * 100 : 0;
  const cards = [
    {
      label: "Health score",
      value: `${round(snapshot.overall_score)}/100`,
      note: pointDeltaMarkup(previousSnapshot ? snapshot.overall_score - previousSnapshot.overall_score : null)
    },
    {
      label: "Affiliate sales",
      value: formatMoney(summary.gmv, report.currency),
      note: deltaMarkup(percentChange(summary.gmv, prior.gmv))
    },
    {
      label: "Creators posting for the first time",
      value: formatCompact(summary.new_creators_posting),
      note: deltaMarkup(percentChange(summary.new_creators_posting, prior.new_creators_posting))
    },
    {
      label: "Samples shipped",
      value: formatCompact(summary.samples_approved),
      note: deltaMarkup(percentChange(summary.samples_approved, prior.samples_approved))
    },
    {
      label: "Videos posted",
      value: formatCompact(summary.videos_posted),
      note: deltaMarkup(percentChange(summary.videos_posted, prior.videos_posted))
    },
    {
      label: "Videos that made sales",
      value: formatCompact(summary.gmv_driving_videos),
      note: `${formatPercent(convertingRate, 1)} of videos · ${deltaMarkup(percentChange(convertingRate, priorConvertingRate))}`
    }
  ];

  renderKpiCards(cards);
}

function renderKpiCards(cards) {
  elements.kpiStrip.innerHTML = cards
    .map((card) => `
      <div class="mo-stat">
        <div class="mo-stat__label">${escapeHtml(card.label)}</div>
        <div class="kpi-value-row">
          <div class="mo-stat__value">${escapeHtml(card.value)}</div>
          ${renderKpiSparkline(card.series, card.tone)}
        </div>
        <div class="mo-stat__note">${card.note}</div>
      </div>
    `)
    .join("");
}

function renderKpiSparkline(series, tone = "blue") {
  const values = seriesValues(series);
  if (values.length < 3) return "";
  const width = 70;
  const height = 24;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || Math.max(1, Math.abs(maximum));
  const points = values.map((value, index) => ({
    x: 2 + (index * (width - 4)) / Math.max(1, values.length - 1),
    y: 3 + ((maximum - value) / range) * (height - 7)
  }));
  const path = points.map((point, index) => `${index ? "L" : "M"}${round(point.x, 2)},${round(point.y, 2)}`).join(" ");
  const last = points.at(-1);
  return `<svg class="kpi-sparkline tone-${escapeAttr(tone)}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><path d="${path}"></path><circle cx="${last.x}" cy="${last.y}" r="2.4"></circle></svg>`;
}

function renderScore(context) {
  const { report, snapshot, previousSnapshot } = context;
  const score = snapshot.overall_score;
  const delta = previousSnapshot ? score - previousSnapshot.overall_score : null;
  const weakest = Object.entries(snapshot.pillars)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2);

  elements.overallScore.textContent = String(round(score));
  elements.scoreRing.style.setProperty("--score", clamp(score));
  elements.scoreRing.style.setProperty("--score-color", scoreColor(score));
  elements.healthLabel.textContent = simpleScoreLabel(score);
  elements.healthLabel.className = `mo-badge ${scoreClass(score) === "is-good" ? "mo-badge--green" : scoreClass(score) === "is-watch" ? "mo-badge--amber" : "mo-badge--pink"}`;

  if (delta === null) {
    elements.scoreDelta.textContent = "First 30-day period shown";
    elements.scoreDelta.style.color = "var(--mo-muted)";
  } else {
    const direction = delta >= 0 ? "up" : "down";
    elements.scoreDelta.textContent = `${delta >= 0 ? "↑" : "↓"} ${formatNumber(Math.abs(delta), 1)} points ${direction}`;
    elements.scoreDelta.style.color = delta >= 0 ? "var(--health-good)" : "var(--health-risk)";
  }

  const weakText = weakest.map(([pillar, value]) => `${pillarDescriptions[pillar]} (${round(value)})`).join(" and ");
  elements.scoreNarrative.textContent = `The lowest scores are ${weakText}. If any area is below 40, the whole program needs attention.`;

  renderScoreTrend(report, state.periodIndex);
}

function renderScoreTrend(report, selectedIndex) {
  const width = 640;
  const height = 150;
  const left = 34;
  const right = 18;
  const top = 16;
  const bottom = 30;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const snapshots = report.snapshots
    .map((snapshot, originalIndex) => ({ ...snapshot, originalIndex }))
    .reverse();
  const points = snapshots.map((snapshot, index) => ({
    x: left + (index * plotWidth) / Math.max(1, snapshots.length - 1),
    y: top + ((100 - clamp(snapshot.overall_score)) / 100) * plotHeight,
    snapshot
  }));
  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const area = `M${points[0].x},${top + plotHeight} ${points.map((point) => `L${point.x},${point.y}`).join(" ")} L${points.at(-1).x},${top + plotHeight} Z`;
  const gridValues = [0, 40, 70, 100];

  elements.scoreTrend.innerHTML = `
    ${gridValues.map((value) => {
      const y = top + ((100 - value) / 100) * plotHeight;
      return `<line class="${value === 70 ? "trend-benchmark" : "trend-grid-line"}" x1="${left}" x2="${width - right}" y1="${y}" y2="${y}"></line><text class="trend-label" x="4" y="${y + 3}">${value}</text>`;
    }).join("")}
    <path class="trend-area" d="${area}"></path>
    <path class="trend-path" d="${path}"></path>
    ${points.map((point) => {
      const selected = point.snapshot.originalIndex === selectedIndex;
      const label = formatDate(point.snapshot.end_date, { month: "short" });
      const tooltip = `${formatDateRange(point.snapshot.start_date, point.snapshot.end_date)} · ${round(point.snapshot.overall_score, 1)}/100`;
      return `<g data-tooltip="${escapeAttr(tooltip)}"><circle class="trend-dot ${selected ? "is-selected" : ""}" cx="${point.x}" cy="${point.y}" r="${selected ? 6 : 4}"></circle><text class="trend-value" x="${point.x}" y="${Math.max(11, point.y - 10)}" text-anchor="middle">${round(point.snapshot.overall_score)}</text><text class="trend-label" x="${point.x}" y="${height - 7}" text-anchor="middle">${label}</text></g>`;
    }).join("")}
  `;
}

function renderPillars(context) {
  const { snapshot, previousSnapshot } = context;
  elements.pillarChart.innerHTML = pillarOrder.map((pillar) => {
    const score = snapshot.pillars[pillar];
    const previous = previousSnapshot?.pillars?.[pillar];
    const delta = Number.isFinite(previous) ? score - previous : null;
    const trendClass = delta === null ? "" : delta > 0.5 ? "is-up" : delta < -0.5 ? "is-down" : "";
    const trend = delta === null ? "—" : delta > 0.5 ? "↑" : delta < -0.5 ? "↓" : "→";
    const tooltip = `${pillarDescriptions[pillar]} · ${round(score, 1)}/100${delta === null ? "" : ` · ${delta >= 0 ? "+" : ""}${round(delta, 1)} points from the previous 30 days`}`;
    return `
      <div class="pillar-row ${scoreClass(score)}" data-tooltip="${escapeAttr(tooltip)}">
        <span class="pillar-name">${escapeHtml(pillarDescriptions[pillar])}</span>
        <div class="pillar-track"><span class="pillar-fill" style="width:${clamp(score)}%"></span></div>
        <span class="pillar-score">${round(score)}</span>
        <span class="pillar-trend ${trendClass}">${trend}</span>
      </div>
    `;
  }).join("");
}

function hasCreatorCoverageDiscontinuity(snapshot) {
  const active = snapshot.metrics.active_creators;
  const velocity = snapshot.metrics.content_velocity;
  return active?.ratio > 2 && velocity?.ratio < 0.4;
}

function operatorEvidence(key, metric, currency) {
  const current = formatMetric(key, metric.value, currency);
  const baseline = formatMetric(key, metric.baseline, currency);
  const relative = percentChange(metric.value, metric.baseline);
  const gap = relative === null ? "" : ` (${formatPercent(Math.abs(relative), 0)} ${relative >= 0 ? "above" : "below"} the usual level)`;
  switch (key) {
    case "active_creators":
      return `There are ${current} active creators. The usual level is ${baseline}${gap}.`;
    case "new_creators_posting":
      return `${current} creators posted for the first time. The usual level is ${baseline}${gap}.`;
    case "samples_approved":
      return `Reacher shows ${current} shipped samples. The usual level is ${baseline}${gap}.`;
    case "sample_requests":
      return `${current} sample requests came in. The usual level is ${baseline}${gap}.`;
    case "gmv_per_video":
      return `Each posted video made ${current} in affiliate sales on average. The usual level is ${baseline}${gap}.`;
    case "sale_rate":
      return `${current} of videos made sales. The usual level is ${baseline}${gap}.`;
    case "gmv_per_sample":
      return `Each shipped sample made ${current} in affiliate sales on average. The usual level is ${baseline}${gap}.`;
    case "content_velocity":
      return `Creators posted ${current}. The usual level is ${baseline}${gap}.`;
    case "top_sku_share":
      return `The top product made ${current} of all affiliate sales. The usual level is ${baseline}. Lower is better.`;
    case "top10_creator_share":
      return `The top 10 creators made ${current} of all affiliate sales. The usual level is ${baseline}. Lower is better.`;
    default:
      return `${current}. The usual level is ${baseline}${gap}.`;
  }
}

function takeDistinctPillars(entries, limit) {
  const selected = [];
  const seen = new Set();
  for (const entry of entries) {
    const pillar = entry[1]?.pillar;
    if (seen.has(pillar)) continue;
    selected.push(entry);
    seen.add(pillar);
    if (selected.length === limit) return selected;
  }
  for (const entry of entries) {
    if (selected.includes(entry)) continue;
    selected.push(entry);
    if (selected.length === limit) break;
  }
  return selected;
}

function operatorVerdict(context, dataWarning) {
  const { snapshot, previousSnapshot } = context;
  const score = round(snapshot.overall_score);
  const delta = previousSnapshot ? snapshot.overall_score - previousSnapshot.overall_score : null;
  const movement = delta === null
    ? "This is the first 30-day period shown."
    : `It is ${formatNumber(Math.abs(delta), 1)} points ${delta >= 0 ? "up" : "down"} from the previous 30 days.`;
  const weakest = Object.entries(snapshot.pillars).sort(([, a], [, b]) => a - b)[0]?.[0];
  let diagnosis = "No single part of the program is clearly broken.";
  if (dataWarning) {
    diagnosis = "The creator count is high, but too few creators are posting again or making sales.";
  } else if (snapshot.pillars.retention < 40 && snapshot.pillars.efficiency < 40) {
    diagnosis = "The program has creators, but they are not posting enough and their videos are not making enough sales.";
  } else if (weakest === "acquisition") {
    diagnosis = "Too few creators are reaching a first post.";
  } else if (weakest === "activation") {
    diagnosis = "Creator interest is not turning into shipped samples quickly enough.";
  } else if (weakest === "efficiency") {
    diagnosis = "Videos are being posted, but too few of them make sales.";
  } else if (weakest === "retention") {
    diagnosis = "Creators post once, but too few come back to post again.";
  } else if (weakest === "concentration") {
    diagnosis = "A small group of products or creators makes too much of the affiliate sales.";
  }
  return `Health is ${score}/100. ${movement} ${diagnosis}`;
}

function operatorBreakingPoint(context, dataWarning) {
  const { snapshot, report, previousSnapshot, previousWindow } = context;
  const metrics = snapshot.metrics;
  if (dataWarning) {
    const comparisonWindow = previousSnapshot ? previousWindow : null;
    const posterChange = percentChange(metrics.new_creators_posting.value, comparisonWindow?.summary?.new_creators_posting);
    const posterMovement = posterChange === null ? "" : ` (${formatPercent(Math.abs(posterChange), 1)} ${posterChange >= 0 ? "up" : "down"} from the previous 30 days)`;
    return `The program breaks after creators join. Reacher counts ${formatMetric("active_creators", metrics.active_creators.value, report.currency)} active creators, but only ${formatMetric("new_creators_posting", metrics.new_creators_posting.value, report.currency)} posted for the first time${posterMovement}. Creators posted ${formatMetric("content_velocity", metrics.content_velocity.value, report.currency)}; the usual level is ${formatMetric("content_velocity", metrics.content_velocity.baseline, report.currency)}. Check that the active creator count is right before making changes. It is ${formatNumber(metrics.active_creators.ratio, 1)} times the usual level.`;
  }

  const [weakestPillar, weakestScore] = Object.entries(snapshot.pillars).sort(([, a], [, b]) => a - b)[0];
  if (weakestScore >= 70) return `No part of the program is clearly broken. The lowest area is ${pillarDescriptions[weakestPillar].toLowerCase()}, but its score is still good.`;
  const pillarMetrics = Object.entries(metrics).filter(([, metric]) => metric.pillar === weakestPillar).sort(([, a], [, b]) => a.score - b.score);
  const [key, metric] = pillarMetrics[0];
  const evidence = operatorEvidence(key, metric, report.currency);
  const lead = {
    acquisition: "The break is getting creators to post for the first time.",
    activation: "The break is getting samples shipped and turning them into posts.",
    efficiency: "The break is between posting videos and making sales.",
    retention: "The break is after the first post: too few creators post again.",
    concentration: "The break is that too much sales comes from too few products or creators."
  }[weakestPillar];
  return `${lead} ${evidence}`;
}

function operatorMetricListItem(entry, currency) {
  const [key, metric] = entry;
  return `<li><strong>${escapeHtml(operatorMetricLabels[key] || metric.label || key)}</strong><span>${escapeHtml(operatorEvidence(key, metric, currency))}</span></li>`;
}

function movementText(change) {
  if (change === null || !Number.isFinite(change)) return "has no earlier period to compare";
  if (Math.abs(change) < 0.05) return "did not change";
  return `${change > 0 ? "rose" : "fell"} ${formatPercent(Math.abs(change), 1)}`;
}

function operatorProblemFindings(context) {
  const { report, snapshot, window, previousSnapshot, previousWindow } = context;
  const comparisonWindow = previousSnapshot ? previousWindow : null;
  const summary = window.summary;
  const prior = comparisonWindow?.summary || {};
  const findings = [];
  const replyNow = Number.isFinite(Number(summary.reply_rate)) ? Number(summary.reply_rate) : safeDivide(summary.dm_responses, summary.creators_messaged, 100);
  const replyPrior = Number.isFinite(Number(prior.reply_rate)) ? Number(prior.reply_rate) : safeDivide(prior.dm_responses, prior.creators_messaged, 100);
  const messageChange = percentChange(summary.creators_messaged, prior.creators_messaged);
  const responseChange = percentChange(summary.dm_responses, prior.dm_responses);
  const zeroRecordedResponses = Number(summary.creators_messaged) > 0 && Number(summary.dm_responses) === 0;
  if (zeroRecordedResponses) {
    findings.push({
      title: "Replies",
      detail: `Reacher recorded no replies from ${formatCompact(summary.creators_messaged)} messaged creators. First check that replies are being recorded correctly.`
    });
  } else if (comparisonWindow && ((responseChange !== null && responseChange <= -20) || (replyNow !== null && replyPrior !== null && replyNow < replyPrior))) {
    findings.push({
      title: "Replies",
      detail: `Messages ${movementText(messageChange)} to ${formatCompact(summary.creators_messaged)}, but replies ${movementText(responseChange)} to ${formatCompact(summary.dm_responses)}. The reply rate changed from ${ratioLabel(replyPrior)} to ${ratioLabel(replyNow)}.`
    });
  }

  const contentScores = [snapshot.metrics.content_velocity, snapshot.metrics.gmv_per_video, snapshot.metrics.sale_rate].map((metric) => metric?.score ?? 100);
  const contentFailures = ["content_velocity", "gmv_per_video", "sale_rate"].filter((key) => snapshot.metrics[key]?.score < 40);
  if (Math.min(...contentScores) < 40 || (comparisonWindow && percentChange(summary.gmv_driving_videos, prior.gmv_driving_videos) <= -20)) {
    const postedChange = percentChange(summary.videos_posted, prior.videos_posted);
    const sellingChange = percentChange(summary.gmv_driving_videos, prior.gmv_driving_videos);
    const sellingNow = safeDivide(summary.gmv_driving_videos, summary.videos_posted, 100);
    const sellingPrior = safeDivide(prior.gmv_driving_videos, prior.videos_posted, 100);
    const failureEvidence = contentFailures.slice(0, 2).map((key) => operatorEvidence(key, snapshot.metrics[key], report.currency)).join(" ");
    const trendEvidence = comparisonWindow ? `Compared with the previous 30 days, posted videos ${movementText(postedChange)} and videos that made sales ${movementText(sellingChange)}. The percent of videos that made sales changed from ${ratioLabel(sellingPrior)} to ${ratioLabel(sellingNow)}.` : "";
    findings.push({ title: "Videos and sales", detail: [failureEvidence, trendEvidence].filter(Boolean).join(" ") });
  }

  const flowScores = [snapshot.metrics.new_creators_posting, snapshot.metrics.samples_approved, snapshot.metrics.sample_requests].map((metric) => metric?.score ?? 100);
  const flowFailures = ["new_creators_posting", "samples_approved", "sample_requests"].filter((key) => snapshot.metrics[key]?.score < 40);
  if (Math.min(...flowScores) < 40 || (comparisonWindow && ["new_creators_posting", "samples_approved", "sample_requests"].some((key) => percentChange(summary[key], prior[key]) <= -20))) {
    const requestChange = percentChange(summary.sample_requests, prior.sample_requests);
    const shippedChange = percentChange(summary.samples_approved, prior.samples_approved);
    const posterChange = percentChange(summary.new_creators_posting, prior.new_creators_posting);
    const failureEvidence = flowFailures.slice(0, 2).map((key) => operatorEvidence(key, snapshot.metrics[key], report.currency)).join(" ");
    const trendEvidence = comparisonWindow ? `Compared with the previous 30 days, sample requests ${movementText(requestChange)}, shipped samples ${movementText(shippedChange)}, and first posts ${movementText(posterChange)}.` : "";
    findings.push({ title: "Samples and first posts", detail: [failureEvidence, trendEvidence].filter(Boolean).join(" ") });
  }

  if (findings.length < 3 && snapshot.pillars.concentration < 40) {
    const weakest = ["top_sku_share", "top10_creator_share"].sort((a, b) => snapshot.metrics[a].score - snapshot.metrics[b].score)[0];
    findings.push({ title: operatorMetricLabels[weakest], detail: operatorEvidence(weakest, snapshot.metrics[weakest], report.currency) });
  }

  if (!findings.length) {
    const fallback = takeDistinctPillars(Object.entries(snapshot.metrics).sort(([, a], [, b]) => a.score - b.score).filter(([, metric]) => metric.score < 55), 3);
    return fallback.map(([key, metric]) => ({ title: operatorMetricLabels[key] || metric.label, detail: operatorEvidence(key, metric, report.currency) }));
  }
  return findings.slice(0, 3);
}

function operatorWinFindings(context, dataWarning) {
  const { report, snapshot, window, previousSnapshot, previousWindow } = context;
  const comparisonWindow = previousSnapshot ? previousWindow : null;
  const summary = window.summary;
  const prior = comparisonWindow?.summary || {};
  const findings = [];
  const sampleMetric = snapshot.metrics.gmv_per_sample;
  const sampleChange = percentChange(summary.gmv_per_sample, prior.gmv_per_sample);
  if ((sampleMetric.score >= 70 || (sampleChange !== null && sampleChange >= 10 && sampleMetric.ratio >= 0.85))) {
    const detail = comparisonWindow
      ? `Affiliate sales per shipped sample ${movementText(sampleChange)} to ${formatMoney(summary.gmv_per_sample, report.currency, false)}. That is ${formatPercent(sampleMetric.ratio * 100, 1)} of the usual level.`
      : `Affiliate sales per shipped sample are ${formatMoney(summary.gmv_per_sample, report.currency, false)}. That is ${formatPercent(sampleMetric.ratio * 100, 1)} of the usual level.`;
    findings.push({
      key: "gmv_per_sample",
      title: "Sales per shipped sample",
      detail
    });
  }

  if (comparisonWindow) {
    const concentrationKeys = ["top10_creator_share", "top_sku_share"];
    const improved = concentrationKeys
      .map((key) => ({ key, metric: snapshot.metrics[key], previous: comparisonWindow.metrics?.[key] }))
      .filter((item) => item.metric.score >= 70 && Number.isFinite(Number(item.previous)) && item.metric.value < Number(item.previous))
      .sort((a, b) => a.metric.value - Number(a.previous) - (b.metric.value - Number(b.previous)))[0];
    if (improved) {
      findings.push({
        key: improved.key,
        title: operatorMetricLabels[improved.key],
        detail: `${operatorMetricLabels[improved.key]} fell from ${formatPercent(improved.previous, 1)} to ${formatPercent(improved.metric.value, 1)}. Lower is better. The usual level is ${formatPercent(improved.metric.baseline, 1)}.`
      });
    }

    const reachedChange = percentChange(summary.creators_reached, prior.creators_reached);
    const messagedChange = percentChange(summary.creators_messaged, prior.creators_messaged);
    if ((reachedChange !== null && reachedChange >= 5) || (messagedChange !== null && messagedChange >= 5)) {
      findings.push({
        key: "outreach_reach",
        title: "Creators reached",
        detail: `Creators reached ${movementText(reachedChange)} and creators messaged ${movementText(messagedChange)}. More people were contacted, but replies have not improved yet.`
      });
    }
  }

  const usedPillars = new Set(findings.map((finding) => snapshot.metrics[finding.key]?.pillar).filter(Boolean));
  const healthyFallback = Object.entries(snapshot.metrics)
    .filter(([key, metric]) => metric.score >= 70 && !(dataWarning && key === "active_creators") && !findings.some((finding) => finding.key === key) && !usedPillars.has(metric.pillar))
    .sort(([, a], [, b]) => b.score - a.score);
  for (const [key, metric] of healthyFallback) {
    if (findings.length >= 3) break;
    findings.push({ key, title: operatorMetricLabels[key] || metric.label, detail: operatorEvidence(key, metric, report.currency) });
    usedPillars.add(metric.pillar);
  }
  return findings.slice(0, 3);
}

function operatorFindingListItem(finding) {
  return `<li><strong>${escapeHtml(finding.title)}</strong><span>${escapeHtml(finding.detail)}</span></li>`;
}

function operatorAction(metricKey, context) {
  const metric = context.snapshot.metrics[metricKey];
  const copy = operatorActionCopy[metricKey] || {
    title: "Fix the weakest number",
    body: "Move this number back toward its usual level."
  };
  return {
    metric: metricKey,
    title: copy.title,
    body: copy.body,
    watch: metric ? `Watch ${(operatorMetricLabels[metricKey] || metric.label).toLowerCase()}: ${formatMetric(metricKey, metric.value, context.report.currency)} now; usual level ${formatMetric(metricKey, metric.baseline, context.report.currency)}.` : "Watch this number against its usual level."
  };
}

function renderOperatorReadout(context) {
  const { report, snapshot } = context;
  const dataWarning = hasCreatorCoverageDiscontinuity(snapshot);
  const problems = operatorProblemFindings(context);
  const wins = operatorWinFindings(context, dataWarning);

  elements.operatorVerdict.textContent = operatorVerdict(context, dataWarning);
  elements.operatorBreak.textContent = operatorBreakingPoint(context, dataWarning);
  elements.operatorProblems.innerHTML = problems.length
    ? problems.map(operatorFindingListItem).join("")
    : `<li><strong>No clear problem</strong><span>Every score is at least 40 for this period.</span></li>`;
  elements.operatorWins.innerHTML = wins.length
    ? wins.map(operatorFindingListItem).join("")
    : `<li><strong>No clear win yet</strong><span>No score is clearly above its usual level in this period.</span></li>`;

  const actions = [];
  if (dataWarning) {
    actions.push({
      metric: "creator_count_check",
      title: "Check the active creator count first",
      body: "Check whether Reacher changed how it counts active creators or if some data is missing. Do not change the program until this count is confirmed.",
      watch: `Watch both numbers together: ${formatMetric("active_creators", snapshot.metrics.active_creators.value, report.currency)} active creators and ${formatMetric("content_velocity", snapshot.metrics.content_velocity.value, report.currency)} now.`
    });
  }
  const recommendations = [...snapshot.recommendations].sort((a, b) => b.impact_points - a.impact_points);
  for (const recommendation of recommendations) {
    if (actions.length >= 3) break;
    if (actions.some((action) => action.metric === recommendation.metric)) continue;
    const action = operatorAction(recommendation.metric, context);
    if (dataWarning && recommendation.metric === "content_velocity") {
      action.title = "If the count is right, ask for a second video";
      action.body = "After the creator count is confirmed, ask a small group of creators who made sales to post one more video. See if repeat posts rise.";
    }
    actions.push(action);
  }
  if (!actions.length) {
    actions.push({
      metric: "no_ranked_action",
      title: "No action is ready for this period",
      body: "The report could not pick a useful next step. Check the numbers below before changing the program.",
      watch: "Compare each number with its usual level."
    });
  }
  elements.operatorActionCount.textContent = `${actions.length} ${actions.length === 1 ? "step" : "steps"}, in order`;
  elements.operatorActions.innerHTML = actions.map((action, index) => `
    <li>
      <span class="operator-actions__number">${index + 1}</span>
      <span class="operator-actions__copy"><strong>${escapeHtml(action.title)}</strong><span>${escapeHtml(action.body)}</span><small>${escapeHtml(action.watch)}</small></span>
    </li>
  `).join("");
}

function renderOperatingChain(context) {
  const { report, window, previousWindow } = context;
  const summary = window.summary;
  const prior = previousWindow?.summary || {};
  const stages = [
    ["active_creators", "Active creators", summary.active_creators, prior.active_creators, "count"],
    ["new_creators_posting", "Creators posting for the first time", summary.new_creators_posting, prior.new_creators_posting, "count"],
    ["videos_posted", "Videos posted", summary.videos_posted, prior.videos_posted, "count"],
    ["gmv_driving_videos", "Videos that made sales", summary.gmv_driving_videos, prior.gmv_driving_videos, "count"],
    ["gmv", "Affiliate sales", summary.gmv, prior.gmv, "money"]
  ];
  elements.operatingChain.innerHTML = stages.map(([key, label, value, previous, type], index) => {
    const change = percentChange(value, previous);
    const formatted = type === "money" ? formatMoney(value, report.currency) : formatCompact(value);
    const note = change === null ? "No earlier period" : `${change >= 0 ? "↑" : "↓"} ${formatPercent(Math.abs(change), 1)} from previous`;
    const noteClass = change === null ? "" : change >= 0 ? "is-up" : "is-down";
    const stage = `
      <div class="chain-stage" data-tooltip="${escapeAttr(`${label} · ${formatNumber(value, type === "money" ? 0 : 0)}${type === "money" ? ` ${report.currency}` : ""}`)}">
        <div class="chain-stage__label"><svg class="mo-icon"><use href="#${iconByStage[key]}"></use></svg>${escapeHtml(label)}</div>
        <div class="chain-stage__value">${escapeHtml(formatted)}</div>
        <div class="chain-stage__note metric-delta ${noteClass}">${escapeHtml(note)}</div>
      </div>
    `;
    const arrow = index < stages.length - 1 ? `<div class="chain-arrow"><svg class="mo-icon"><use href="#health-arrow"></use></svg></div>` : "";
    return stage + arrow;
  }).join("");
}

function renderOpportunities(context) {
  const recommendations = [...context.snapshot.recommendations].sort((a, b) => b.impact_points - a.impact_points).slice(0, 6);
  const maxImpact = Math.max(...recommendations.map((item) => item.impact_points), 1);
  elements.opportunityChart.innerHTML = recommendations.map((item, index) => {
    const copy = operatorActionCopy[item.metric] || { title: "Fix this number", body: "Move this number back toward its usual level." };
    return `
    <div class="opportunity-row" data-tooltip="${escapeAttr(copy.body)}">
      <span class="opportunity-rank">${index + 1}</span>
      <span class="opportunity-label"><strong>${escapeHtml(copy.title)}</strong><span>${escapeHtml(pillarDescriptions[item.pillar] || item.pillar)} · ${escapeHtml(operatorMetricLabels[item.metric] || item.metric)}</span></span>
      <span class="impact-track"><span class="impact-fill" style="width:${clamp((item.impact_points / maxImpact) * 100)}%"></span></span>
      <span class="opportunity-impact">+${round(item.impact_points, 1)}</span>
    </div>
  `;
  }).join("");
}

function renderMetricDiagnostics(context) {
  const { report, snapshot } = context;
  elements.metricDiagnostics.innerHTML = Object.entries(snapshot.metrics).map(([key, metric]) => {
    const score = metric.score;
    const ratio = metric.ratio * 100;
    const label = operatorMetricLabels[key] || metric.label;
    const tooltip = `${label} · ${formatMetric(key, metric.value, report.currency)} now · ${formatMetric(key, metric.baseline, report.currency)} average from the previous 3 months`;
    return `
      <div class="metric-row" data-tooltip="${escapeAttr(tooltip)}">
        <div class="metric-row__head"><span>${escapeHtml(label)}</span><span class="metric-score-pill ${scoreClass(score)}">${round(score)}</span></div>
        <div class="metric-mini-track"><span style="width:${clamp(score)}%"></span></div>
        <div class="metric-row__values"><span>${escapeHtml(formatMetric(key, metric.value, report.currency))}</span><span>3-month average ${escapeHtml(formatMetric(key, metric.baseline, report.currency))}</span></div>
      </div>
    `;
  }).join("");
}

function renderEfficiency(context) {
  const { report, snapshot } = context;
  const score = snapshot.pillars.efficiency;
  elements.efficiencyScore.textContent = `${round(score)}/100`;
  elements.efficiencyScore.className = `score-chip ${scoreClass(score)}`;
  const keys = ["gmv_per_video", "sale_rate", "gmv_per_sample"];
  elements.efficiencyChart.innerHTML = keys.map((key) => {
    const metric = snapshot.metrics[key];
    const max = Math.max(metric.value, metric.baseline) * 1.15 || 1;
    const width = clamp((metric.value / max) * 100);
    const marker = clamp((metric.baseline / max) * 100);
    return `
      <div class="benchmark-row" data-tooltip="${escapeAttr(`${operatorMetricLabels[key]} · ${formatMetric(key, metric.value, report.currency)} now · ${formatMetric(key, metric.baseline, report.currency)} average from the previous 3 months`)}">
        <span class="benchmark-label">${escapeHtml(operatorMetricLabels[key])}</span>
        <span class="benchmark-track"><span class="benchmark-fill" style="width:${width}%"></span><span class="benchmark-marker" style="left:${marker}%"></span></span>
        <span class="benchmark-values">${escapeHtml(formatMetric(key, metric.value, report.currency))}<span>3-month average ${escapeHtml(formatMetric(key, metric.baseline, report.currency))}</span></span>
      </div>
    `;
  }).join("");
}

function renderConcentration(context) {
  const { snapshot } = context;
  const score = snapshot.pillars.concentration;
  elements.concentrationScore.textContent = `${round(score)}/100`;
  elements.concentrationScore.className = `score-chip ${scoreClass(score)}`;
  const keys = ["top_sku_share", "top10_creator_share"];
  elements.concentrationChart.innerHTML = keys.map((key) => {
    const metric = snapshot.metrics[key];
    return `
      <div class="concentration-row" data-tooltip="${escapeAttr(`${operatorMetricLabels[key]} · ${formatPercent(metric.value, 1)} now · ${formatPercent(metric.baseline, 1)} average from the previous 3 months · lower is better`)}">
        <div class="concentration-row__head"><span>${escapeHtml(operatorMetricLabels[key])}</span><span>${formatPercent(metric.value, 1)}</span></div>
        <div class="share-track"><span class="share-fill" style="width:${clamp(metric.value)}%"></span><span class="share-rest"></span><span class="share-marker" style="left:${clamp(metric.baseline)}%"></span></div>
        <div class="concentration-caption"><span>Sales from top sellers</span><span>3-month average ${formatPercent(metric.baseline, 1)}</span><span>Sales from everyone else</span></div>
      </div>
    `;
  }).join("");
}

function renderRecommendations(context) {
  const recommendations = [...context.snapshot.recommendations].sort((a, b) => b.impact_points - a.impact_points);
  const maxImpact = Math.max(...recommendations.map((item) => item.impact_points), 1);
  elements.recommendationRows.innerHTML = recommendations.map((item, index) => {
    const copy = operatorActionCopy[item.metric] || { title: "Fix this number", body: "Move this number back toward its usual level." };
    return `
    <tr>
      <td><span class="priority-number">${index + 1}</span></td>
      <td><span class="mo-cell-main">${escapeHtml(copy.title)}</span><span class="mo-cell-sub">${escapeHtml(copy.body)}</span></td>
      <td><span class="mo-badge mo-badge--gray">${escapeHtml(pillarDescriptions[item.pillar] || item.pillar)}</span></td>
      <td><span class="gain-cell"><span>+${round(item.impact_points, 1)}</span><span class="impact-track"><span class="impact-fill" style="width:${clamp((item.impact_points / maxImpact) * 100)}%"></span></span></span></td>
      <td><span class="metric-score-pill ${scoreClass(item.current_score)}">${round(item.current_score)}/100</span></td>
    </tr>
  `;
  }).join("");
}

function renderEvidence(context) {
  const { report, window } = context;
  const creators = (window.top_creators || []).slice(0, 8);
  const products = (window.top_products || []).slice(0, 8);
  const maxCreatorGmv = Math.max(...creators.map((item) => item.gmv), 1);
  const maxProductGmv = Math.max(...products.map((item) => item.gmv), 1);

  elements.creatorRows.innerHTML = creators.map((creator, index) => `
    <tr>
      <td><span class="evidence-name"><span class="evidence-avatar">${index + 1}</span><span><span class="mo-cell-main" data-sensitive>@${escapeHtml(creator.creator_handle || "Unknown creator")}</span><span class="mo-cell-sub">Number ${index + 1}</span></span></span></td>
      <td><span class="mo-cell-main">${formatMoney(creator.gmv, report.currency)}</span><span class="evidence-bar"><span style="width:${clamp((creator.gmv / maxCreatorGmv) * 100)}%"></span></span></td>
      <td>${formatCompact(creator.order_count)}</td>
      <td>${formatCompact(creator.follower_count)}</td>
    </tr>
  `).join("");

  elements.productRows.innerHTML = products.map((product, index) => `
    <tr>
      <td><span class="evidence-name"><span class="evidence-avatar">${index + 1}</span><span><span class="mo-cell-main" data-sensitive>${escapeHtml(product.product_name || "Unknown product")}</span><span class="mo-cell-sub">Number ${index + 1}</span></span></span></td>
      <td><span class="mo-cell-main">${formatMoney(product.gmv, report.currency)}</span><span class="evidence-bar"><span style="width:${clamp((product.gmv / maxProductGmv) * 100)}%"></span></span></td>
      <td>${formatCompact(product.units_sold)}</td>
      <td>${formatCompact(product.video_count)}</td>
    </tr>
  `).join("");
}

function renderQuality(context) {
  const { snapshot } = context;
  const active = snapshot.metrics.active_creators;
  const velocity = snapshot.metrics.content_velocity;
  if (hasCreatorCoverageDiscontinuity(snapshot)) {
    elements.qualityText.textContent = `The active creator count is ${round(active.ratio, 1)} times its 3-month average, but videos per creator are only ${round(velocity.ratio * 100)}% of average. Check that the creator count is right before changing the program.`;
  } else {
    elements.qualityText.textContent = "The numbers look consistent. Reacher's shipped-sample number is used because delivery data is not available here.";
  }
}

function dashboardKpiCards(context) {
  const { report, window, previousWindow } = context;
  const summary = window.summary;
  const prior = previousWindow?.summary || {};
  const currency = report.currency;
  const creatorRows = window.top_creators || [];
  const productRows = window.top_products || [];
  const sampleRows = datasetRows(window.sample_products);
  const priorSampleRows = datasetRows(previousWindow?.sample_products);
  const creatorLevels = window.creator_levels?.levels || [];
  const topCreatorGmv = sumBy(creatorRows, "gmv");
  const topCreatorCommission = sumBy(creatorRows, "est_commission");
  const topProductGmv = sumBy(productRows, "gmv");
  const topProductUnits = sumBy(productRows, "units_sold");
  const topProductRefunds = sumBy(productRows, "refund_units");
  const sampleGmv = sumBy(sampleRows, "sample_gmv");
  const priorSampleGmv = sumBy(priorSampleRows, "sample_gmv");
  const samplePosters = sumBy(sampleRows, "videos_from_samples");
  const priorSamplePosters = sumBy(priorSampleRows, "videos_from_samples");
  const producingCreators = creatorLevels.filter((row) => row.level !== "L0").reduce((sum, row) => sum + (Number(row.count) || 0), 0);
  const levelTotal = sumBy(creatorLevels, "count") || Number(window.creator_levels?.total_creators) || 0;

  const newPosterShare = safeDivide(summary.new_creators_posting, summary.active_creators, 100);
  const priorNewPosterShare = safeDivide(prior.new_creators_posting, prior.active_creators, 100);
  const sellingRate = safeDivide(summary.gmv_driving_videos, summary.videos_posted, 100);
  const priorSellingRate = safeDivide(prior.gmv_driving_videos, prior.videos_posted, 100);
  const messageCoverage = safeDivide(summary.creators_messaged, summary.creators_reached, 100);
  const priorMessageCoverage = safeDivide(prior.creators_messaged, prior.creators_reached, 100);
  const sampleThroughput = safeDivide(summary.samples_approved, summary.sample_requests, 100);
  const priorSampleThroughput = safeDivide(prior.samples_approved, prior.sample_requests, 100);
  const selectedEnd = window.end_date;
  const series = (metric) => weeklySeries(report, metric, selectedEnd, 12);
  const ratioSeries = (numerator, denominator) => weeklyRatioSeries(report, numerator, denominator, selectedEnd, 100, 12);

  switch (state.dashboardId) {
    case "creator-growth":
      return [
        { label: "Active creators", value: formatCompact(summary.active_creators), note: deltaMarkup(percentChange(summary.active_creators, prior.active_creators)), series: series("creators") },
        { label: "Creators posting for the first time", value: formatCompact(summary.new_creators_posting), note: deltaMarkup(percentChange(summary.new_creators_posting, prior.new_creators_posting)), series: series("new_creators_posting"), tone: "purple" },
        { label: "Active creators who posted for the first time", value: ratioLabel(newPosterShare), note: pointDeltaMarkup(newPosterShare !== null && priorNewPosterShare !== null ? newPosterShare - priorNewPosterShare : null), series: ratioSeries("new_creators_posting", "creators"), tone: "watch" },
        { label: "Videos posted", value: formatCompact(summary.videos_posted), note: deltaMarkup(percentChange(summary.videos_posted, prior.videos_posted)), series: series("videos_posted") },
        { label: "Videos that made sales", value: ratioLabel(sellingRate), note: pointDeltaMarkup(sellingRate !== null && priorSellingRate !== null ? sellingRate - priorSellingRate : null), series: ratioSeries("gmv_driving_videos", "videos_posted"), tone: "good" },
        { label: "Affiliate sales", value: formatMoney(summary.gmv, currency), note: deltaMarkup(percentChange(summary.gmv, prior.gmv)), series: series("gmv"), tone: "good" }
      ];
    case "outreach-performance": {
      const aggregate = window.automations?.aggregate || {};
      const tcAcceptance = Number.isFinite(Number(aggregate.tc_acceptance_rate)) ? Number(aggregate.tc_acceptance_rate) : safeDivide(summary.accepted_tc_count, summary.tc_invites_sent, 100);
      return [
        { label: "Creators reached", value: formatCompact(summary.creators_reached), note: deltaMarkup(percentChange(summary.creators_reached, prior.creators_reached)), series: series("creators_reached") },
        { label: "Creators messaged", value: formatCompact(summary.creators_messaged), note: deltaMarkup(percentChange(summary.creators_messaged, prior.creators_messaged)), series: series("creators_messaged"), tone: "purple" },
        { label: "Replies", value: formatCompact(summary.dm_responses), note: deltaMarkup(percentChange(summary.dm_responses, prior.dm_responses)), series: series("dm_responses"), tone: "good" },
        { label: "Reply rate", value: ratioLabel(summary.reply_rate), note: "Percent of messages that got a reply", series: series("reply_rate"), tone: "good" },
        { label: "Collaboration invites", value: formatCompact(summary.tc_invites_sent), note: deltaMarkup(percentChange(summary.tc_invites_sent, prior.tc_invites_sent)), series: series("tc_invites_sent"), tone: "watch" },
        { label: "Invites accepted (%)", value: ratioLabel(tcAcceptance), note: aggregate.tc_acceptance_rate != null ? "Average percent accepted each day" : "Percent of invites accepted", series: ratioSeries("accepted_tc_count", "tc_invites_sent"), tone: "watch" }
      ];
    }
    case "sample-efficiency":
      return [
        { label: "Sample requests", value: formatCompact(summary.sample_requests), note: deltaMarkup(percentChange(summary.sample_requests, prior.sample_requests)), series: series("sample_requests") },
        { label: "Samples shipped", value: formatCompact(summary.samples_approved), note: deltaMarkup(percentChange(summary.samples_approved, prior.samples_approved)), series: series("samples_approved"), tone: "purple" },
        { label: "Sample requests shipped (%)", value: ratioLabel(sampleThroughput), note: pointDeltaMarkup(sampleThroughput !== null && priorSampleThroughput !== null ? sampleThroughput - priorSampleThroughput : null), series: ratioSeries("samples_approved", "sample_requests"), tone: "watch" },
        { label: "Creators who posted after a sample", value: sampleRows.length ? formatCompact(samplePosters) : "—", note: sampleRows.length ? deltaMarkup(percentChange(samplePosters, priorSamplePosters)) : "We do not have this data for these dates", tone: "good" },
        { label: "Sales linked to samples", value: sampleRows.length ? formatMoney(sampleGmv, currency) : "—", note: sampleRows.length ? deltaMarkup(percentChange(sampleGmv, priorSampleGmv)) : "We do not have this data for these dates", tone: "good" },
        { label: "Sales per shipped sample", value: sampleRows.length ? moneyPer(safeDivide(sampleGmv, sumBy(sampleRows, "approved")), currency) : moneyPer(summary.gmv_per_sample, currency), note: "Sales, not profit", series: series("gmv_per_sample"), tone: "good" }
      ];
    case "content-yield":
      return [
        { label: "Videos posted", value: formatCompact(summary.videos_posted), note: deltaMarkup(percentChange(summary.videos_posted, prior.videos_posted)), series: series("videos_posted") },
        { label: "Videos that made sales", value: formatCompact(summary.gmv_driving_videos), note: deltaMarkup(percentChange(summary.gmv_driving_videos, prior.gmv_driving_videos)), series: series("gmv_driving_videos"), tone: "purple" },
        { label: "Videos that made sales (%)", value: ratioLabel(sellingRate), note: pointDeltaMarkup(sellingRate !== null && priorSellingRate !== null ? sellingRate - priorSellingRate : null), series: ratioSeries("gmv_driving_videos", "videos_posted"), tone: "good" },
        { label: "Video views", value: formatCompact(summary.video_views), note: deltaMarkup(percentChange(summary.video_views, prior.video_views)), series: series("video_views") },
        { label: "Sales per video", value: moneyPer(summary.gmv_per_video, currency), note: deltaMarkup(percentChange(summary.gmv_per_video, prior.gmv_per_video)), series: series("gmv_per_video"), tone: "good" },
        { label: "Sales per 1,000 views", value: moneyPer(safeDivide(summary.gmv, summary.video_views, 1000), currency), note: "Affiliate sales for every 1,000 video views", tone: "watch" }
      ];
    case "creator-portfolio": {
      const top10Share = safeDivide(topCreatorGmv, summary.gmv, 100);
      const top1Share = safeDivide(creatorRows[0]?.gmv, summary.gmv, 100);
      return [
        { label: "Affiliate sales", value: formatMoney(summary.gmv, currency), note: deltaMarkup(percentChange(summary.gmv, prior.gmv)), series: series("gmv"), tone: "good" },
        { label: "Creators who made sales", value: creatorLevels.length ? formatCompact(producingCreators) : "—", note: "Creators in a sales group", tone: "purple" },
        { label: "Active creators who made sales", value: creatorLevels.length ? ratioLabel(safeDivide(producingCreators, levelTotal, 100)) : "—", note: "Percent of grouped creators who made sales", tone: "good" },
        { label: "Sales per selling creator", value: producingCreators ? moneyPer(safeDivide(summary.gmv, producingCreators), currency) : "—", note: "Average for the program", tone: "watch" },
        { label: "Sales from the top creator", value: ratioLabel(top1Share), note: "Percent of all affiliate sales", series: windowSeries(report, (row) => safeDivide(row.top_creators?.[0]?.gmv, row.summary.gmv, 100), selectedEnd), tone: "risk" },
        { label: "Creator commission", value: ratioLabel(safeDivide(topCreatorCommission, topCreatorGmv, 100)), note: `For the ${formatCompact(creatorRows.length)} creators shown`, tone: "watch" }
      ];
    }
    case "product-portfolio": {
      const refundProxy = safeDivide(topProductRefunds, topProductUnits, 100);
      const topSkuShare = safeDivide(productRows[0]?.gmv, summary.gmv, 100);
      const top10Share = safeDivide(sumBy(productRows.slice(0, 10), "gmv"), summary.gmv, 100);
      return [
        { label: "Affiliate sales", value: formatMoney(summary.gmv, currency), note: deltaMarkup(percentChange(summary.gmv, prior.gmv)), series: series("gmv"), tone: "good" },
        { label: "Products that made sales", value: formatCompact(window.product_pagination?.total_count || productRows.length), note: `${formatCompact(productRows.length)} top products are shown below`, tone: "purple" },
        { label: "Sales from the top product", value: ratioLabel(topSkuShare), note: "Percent of all affiliate sales", series: windowSeries(report, (row) => safeDivide(row.top_products?.[0]?.gmv, row.summary.gmv, 100), selectedEnd), tone: "risk" },
        { label: "Sales from the top 10 products", value: ratioLabel(top10Share), note: "Percent of all affiliate sales", tone: "watch" },
        { label: "Items refunded", value: ratioLabel(refundProxy), note: "Percent of sold items that were refunded", tone: "risk" },
        { label: "Sales per video", value: moneyPer(summary.gmv_per_video, currency), note: deltaMarkup(percentChange(summary.gmv_per_video, prior.gmv_per_video)), series: series("gmv_per_video"), tone: "good" }
      ];
    }
    default:
      return [];
  }
}

function renderPanel({ kicker, title, aside = "", body, className = "" }) {
  return `
    <article class="health-panel usecase-panel ${escapeAttr(className)}">
      <header class="panel-heading">
        <div><div class="panel-kicker">${escapeHtml(kicker)}</div><h3>${escapeHtml(title)}</h3></div>
        ${aside ? `<span class="mo-status">${escapeHtml(aside)}</span>` : ""}
      </header>
      ${body}
    </article>
  `;
}

function renderStageBars(items, { max = null, percent = false, empty = "We do not have this data for these dates." } = {}) {
  if (!items.length) return `<div class="usecase-empty">${escapeHtml(empty)}</div>`;
  const ceiling = max ?? Math.max(...items.map((item) => Number(item.value) || 0), 1);
  return `<div class="stage-bars">${items.map((item, index) => {
    const value = Number(item.value) || 0;
    const width = clamp((value / Math.max(ceiling, 1)) * 100);
    const formatted = item.formatted ?? (percent ? formatPercent(value, 1) : formatCompact(value));
    const tooltip = item.tooltip || `${item.label} · ${formatted}`;
    return `
      <div class="stage-bar-row" data-tooltip="${escapeAttr(tooltip)}">
        <span class="stage-bar-label"><strong${item.sensitive ? " data-sensitive" : ""}>${escapeHtml(item.label)}</strong>${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}</span>
        <span class="stage-bar-track"><span class="stage-bar-fill tone-${(index % 4) + 1}" style="width:${width}%"></span></span>
        <span class="stage-bar-value">${escapeHtml(formatted)}</span>
      </div>
    `;
  }).join("")}</div>`;
}

function renderSignalCards(signals) {
  return `<div class="signal-grid">${signals.map((signal) => `
    <div class="signal-card">
      <span>${escapeHtml(signal.label)}</span>
      <strong${signal.sensitive ? " data-sensitive" : ""}>${escapeHtml(signal.value)}</strong>
      <p>${escapeHtml(signal.note)}</p>
    </div>
  `).join("")}</div>`;
}

function renderAnalyticsTable(headers, rows, { minWidth = 760 } = {}) {
  if (!rows.length) return `<div class="usecase-empty">We do not have these details for these dates.</div>`;
  return `
    <div class="usecase-table-wrap mo-table-viewport">
      <table class="mo-table usecase-table" style="min-width:${minWidth}px">
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

function dashboardFooter(context, caveat) {
  return `
    <footer class="health-footer usecase-footer">
      <span>Data from Reacher · ${escapeHtml(formatDateRange(context.snapshot.start_date, context.snapshot.end_date))}</span>
      <span>${escapeHtml(caveat)}</span>
    </footer>
  `;
}

function dashboardIntro(context) {
  const definition = DASHBOARDS[state.dashboardId];
  const weekly = context.report.intelligence?.weekly_timeseries;
  const historyCount = weekly?.data ? Math.max(...Object.values(weekly.data).map((rows) => rows?.length || 0), 0) : 0;
  return `
    <section class="health-section usecase-context">
      <div>
        <h2>${escapeHtml(definition.label)}</h2>
        <p>${escapeHtml(definition.description)}</p>
      </div>
      <div class="usecase-context__meta">
        <span class="coverage-chip">${historyCount ? `${historyCount} weeks of data` : "30-day comparisons"}</span>
        <span class="source-chip">Reacher data</span>
      </div>
    </section>
  `;
}

function renderActionRail(actions) {
  if (!actions.length) return `<div class="usecase-empty">No suggested actions for these dates.</div>`;
  return `<div class="action-rail">${actions.map((action, index) => `
    <div class="action-card is-${escapeAttr(action.tone || "inspect")}">
      <span class="action-card__rank">${index + 1}</span>
      <span class="action-card__body"><strong>${escapeHtml(action.title)}</strong><span>${escapeHtml(action.note)}</span></span>
      <span class="action-card__value">${escapeHtml(action.value || "")}</span>
    </div>
  `).join("")}</div>`;
}

function renderProgressionChart(stages) {
  if (!stages.length) return `<div class="usecase-empty">We do not have step-by-step data for these dates.</div>`;
  return `<div class="progression-chart" style="--stage-count:${stages.length}">${stages.map((stage, index) => `
    <div class="progression-stage" style="--stage-color:${stage.color || "var(--health-blue)"}" data-tooltip="${escapeAttr(stage.tooltip || `${stage.label} · ${stage.formatted}`)}">
      <span class="progression-stage__label">${escapeHtml(stage.label)}</span>
      <strong class="progression-stage__value">${escapeHtml(stage.formatted)}</strong>
      <span class="progression-stage__note">${escapeHtml(stage.note || "")}</span>
      ${index < stages.length - 1 && stage.connector ? `<span class="progression-connector" style="position:absolute;right:-27px;top:50%;width:27px;transform:translateY(-50%);z-index:2"><strong>${escapeHtml(stage.connector)}</strong></span>` : ""}
    </div>
  `).join("")}</div>`;
}

function renderMiniTrendCard({ label, series, formatter = formatCompact, tone = "", subtitle = "By week" }) {
  const rows = (series || []).filter((row) => Number.isFinite(Number(row.value)));
  if (rows.length < 3) {
    return `<div class="mini-trend-card"><div class="mini-trend-card__label">${escapeHtml(label)}</div><div class="usecase-empty">Not enough weekly data</div></div>`;
  }
  const width = 260;
  const height = 76;
  const left = 5;
  const right = 5;
  const top = 9;
  const bottom = 15;
  const values = rows.map((row) => Number(row.value) || 0);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = (maximum - minimum || Math.max(1, Math.abs(maximum))) * 0.12;
  const low = Math.max(0, minimum - padding);
  const high = maximum + padding;
  const range = high - low || 1;
  const points = rows.map((row, index) => ({
    x: left + (index * (width - left - right)) / Math.max(1, rows.length - 1),
    y: top + ((high - Number(row.value)) / range) * (height - top - bottom),
    row
  }));
  const line = points.map((point, index) => `${index ? "L" : "M"}${round(point.x, 2)},${round(point.y, 2)}`).join(" ");
  const area = `M${points[0].x},${height - bottom} ${points.map((point) => `L${round(point.x, 2)},${round(point.y, 2)}`).join(" ")} L${points.at(-1).x},${height - bottom} Z`;
  const last = points.at(-1);
  return `<div class="mini-trend-card">
    <div class="mini-trend-card__head"><span><span class="mini-trend-card__label">${escapeHtml(label)}</span><strong class="mini-trend-card__value">${escapeHtml(formatter(values.at(-1)))}</strong></span><span class="coverage-chip">${rows.length} weeks</span></div>
    <svg class="viz-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(`${label}, ${subtitle}`)}">
      <line class="viz-grid-line" x1="${left}" x2="${width - right}" y1="${height - bottom}" y2="${height - bottom}"></line>
      <path class="viz-area ${tone === "secondary" ? "is-secondary" : ""}" d="${area}"></path>
      <path class="viz-line ${tone ? `is-${escapeAttr(tone)}` : ""}" d="${line}"></path>
      ${points.map((point) => `<circle class="viz-dot" cx="${point.x}" cy="${point.y}" r="2.2" data-tooltip="${escapeAttr(`${formatDate(point.row.date, { day: "numeric", month: "short" })} · ${formatter(point.row.value)}`)}"></circle>`).join("")}
      <text class="viz-text" x="${left}" y="${height - 2}">${escapeHtml(formatDate(rows[0].date, { month: "short" }))}</text>
      <text class="viz-text" x="${width - right}" y="${height - 2}" text-anchor="end">${escapeHtml(formatDate(rows.at(-1).date, { month: "short" }))}</text>
      <text class="viz-value-label" x="${Math.min(width - 5, last.x)}" y="${Math.max(9, last.y - 6)}" text-anchor="end">${escapeHtml(formatter(last.row.value))}</text>
    </svg>
  </div>`;
}

function renderWeeklyPulse(cards) {
  return `<div class="small-multiples">${cards.map(renderMiniTrendCard).join("")}</div>`;
}

function renderParetoChart(rows, { valueKey = "gmv", labelKey, total = null, currency = "USD", kind = "Item" } = {}) {
  const loaded = (rows || []).filter((row) => (Number(row[valueKey]) || 0) > 0).sort((a, b) => (Number(b[valueKey]) || 0) - (Number(a[valueKey]) || 0));
  const plotted = loaded.slice(0, 30);
  if (plotted.length < 3) return `<div class="usecase-empty">We need at least 3 items to show this chart.</div>`;
  const width = 720;
  const height = 285;
  const left = 38;
  const right = 42;
  const top = 18;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(...plotted.map((row) => Number(row[valueKey]) || 0), 1);
  const denominator = Math.max(Number(total) || 0, sumBy(loaded, valueKey), 1);
  let running = 0;
  const points = plotted.map((row, index) => {
    running += Number(row[valueKey]) || 0;
    return {
      row,
      x: left + ((index + 0.5) * plotWidth) / plotted.length,
      cumulative: (running / denominator) * 100,
      index
    };
  });
  const barWidth = Math.max(3, (plotWidth / plotted.length) * 0.66);
  const curve = points.map((point, index) => `${index ? "L" : "M"}${round(point.x, 2)},${round(top + ((100 - clamp(point.cumulative)) / 100) * plotHeight, 2)}`).join(" ");
  const endShare = points.at(-1).cumulative;
  return `<div class="pareto-chart">
    <div class="viz-frame__caption"><span>Bars show affiliate sales from the top ${plotted.length}. The line shows their percent of all sales.</span><span class="coverage-chip">Top ${plotted.length}: ${formatPercent(endShare, 1)}</span></div>
    <svg class="viz-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(`Affiliate sales from the top ${kind.toLowerCase()}s`)}">
      ${[0, 50, 80, 100].map((value) => { const y = top + ((100 - value) / 100) * plotHeight; return `<line class="viz-grid-line ${value === 80 ? "is-dashed" : ""}" x1="${left}" x2="${width - right}" y1="${y}" y2="${y}"></line><text class="viz-text" x="${width - right + 6}" y="${y + 3}">${value}%</text>`; }).join("")}
      ${points.map((point) => {
        const value = Number(point.row[valueKey]) || 0;
        const barHeight = (value / maxValue) * plotHeight;
        const rawLabel = typeof labelKey === "function" ? labelKey(point.row, point.index) : point.row[labelKey];
        const label = displayEntityName(rawLabel, kind, point.index);
        return `<rect class="viz-bar" x="${point.x - barWidth / 2}" y="${top + plotHeight - barHeight}" width="${barWidth}" height="${barHeight}" rx="2" data-tooltip="${escapeAttr(`${label} · ${formatMoney(value, currency)} · ${formatPercent(point.cumulative, 1)} total so far`)}"></rect>`;
      }).join("")}
      <path class="viz-line is-secondary" d="${curve}"></path>
      ${points.filter((_, index) => index === 0 || index === 2 || index === 9 || index === points.length - 1).map((point) => { const y = top + ((100 - clamp(point.cumulative)) / 100) * plotHeight; return `<circle class="viz-dot" cx="${point.x}" cy="${y}" r="3"></circle><text class="viz-value-label" x="${point.x}" y="${Math.max(10, y - 7)}" text-anchor="middle">${formatPercent(point.cumulative, 0)}</text>`; }).join("")}
      <line class="viz-axis-line" x1="${left}" x2="${width - right}" y1="${top + plotHeight}" y2="${top + plotHeight}"></line>
      <text class="viz-text" x="${left}" y="${height - 8}">Number 1</text><text class="viz-text" x="${width - right}" y="${height - 8}" text-anchor="end">Number ${plotted.length}</text>
    </svg>
  </div>`;
}

function renderQuadrantChart(rows, options) {
  const {
    xAccessor,
    yAccessor,
    sizeAccessor = () => 1,
    labelAccessor,
    xLabel,
    yLabel,
    xFormatter = formatCompact,
    yFormatter = formatCompact,
    kind = "Item",
    logX = false,
    toneAccessor = () => "blue",
    captions = ["Low x · high y", "High x · high y", "Low x · low y", "High x · low y"]
  } = options;
  const points = (rows || []).map((row, index) => ({ row, index, x: Number(xAccessor(row)) || 0, y: Number(yAccessor(row)) || 0, size: Number(sizeAccessor(row)) || 0 })).filter((point) => point.x >= 0 && point.y >= 0).slice(0, 50);
  if (points.length < 8) return `<div class="usecase-empty">We need at least 8 items to show this chart.</div>`;
  const width = 720;
  const height = 300;
  const left = 54;
  const right = 18;
  const top = 20;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const xTransform = (value) => logX ? Math.log10(Math.max(1, value) + 1) : value;
  const xValues = points.map((point) => xTransform(point.x));
  const yValues = points.map((point) => point.y);
  const sizeValues = points.map((point) => point.size);
  const xMax = Math.max(...xValues, 1);
  const yMax = Math.max(...yValues, 1);
  const sizeMax = Math.max(...sizeValues, 1);
  const xMedianRaw = median(points.map((point) => point.x));
  const yMedian = median(yValues);
  const xMedian = xTransform(xMedianRaw);
  const positioned = points.map((point) => ({
    ...point,
    px: left + (xTransform(point.x) / xMax) * plotWidth,
    py: top + ((yMax - point.y) / yMax) * plotHeight,
    radius: 3.5 + Math.sqrt(point.size / sizeMax) * 8
  }));
  const labels = [...positioned].sort((a, b) => b.size - a.size).slice(0, 5);
  const toneColor = { good: "var(--health-good)", watch: "var(--health-watch)", risk: "var(--health-risk)", purple: "var(--health-purple)", blue: "var(--health-blue)" };
  return `<div class="quadrant-chart">
    <span class="quadrant-chart__label quadrant-chart__label--tl">${escapeHtml(captions[0])}</span><span class="quadrant-chart__label quadrant-chart__label--tr">${escapeHtml(captions[1])}</span><span class="quadrant-chart__label quadrant-chart__label--bl">${escapeHtml(captions[2])}</span><span class="quadrant-chart__label quadrant-chart__label--br">${escapeHtml(captions[3])}</span>
    <svg class="viz-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(`${kind} ${xLabel} versus ${yLabel}`)}">
      <line class="viz-grid-line is-dashed" x1="${left + (xMedian / xMax) * plotWidth}" x2="${left + (xMedian / xMax) * plotWidth}" y1="${top}" y2="${top + plotHeight}"></line>
      <line class="viz-grid-line is-dashed" x1="${left}" x2="${left + plotWidth}" y1="${top + ((yMax - yMedian) / yMax) * plotHeight}" y2="${top + ((yMax - yMedian) / yMax) * plotHeight}"></line>
      <line class="viz-axis-line" x1="${left}" x2="${left}" y1="${top}" y2="${top + plotHeight}"></line><line class="viz-axis-line" x1="${left}" x2="${left + plotWidth}" y1="${top + plotHeight}" y2="${top + plotHeight}"></line>
      ${positioned.map((point) => {
        const rawLabel = labelAccessor(point.row, point.index);
        const label = displayEntityName(rawLabel, kind, point.index);
        const tone = toneAccessor(point.row, point) || "blue";
        return `<circle cx="${point.px}" cy="${point.py}" r="${point.radius}" style="fill:${toneColor[tone] || toneColor.blue};stroke:${toneColor[tone] || toneColor.blue};fill-opacity:.28;stroke-width:1.5" data-tooltip="${escapeAttr(`${label} · ${xLabel} ${xFormatter(point.x)} · ${yLabel} ${yFormatter(point.y)}`)}"></circle>`;
      }).join("")}
      ${labels.map((point) => { const label = displayEntityName(labelAccessor(point.row, point.index), kind, point.index); return `<text class="viz-value-label" x="${Math.min(width - right - 5, point.px + point.radius + 4)}" y="${Math.max(top + 9, point.py - point.radius - 2)}">${escapeHtml(label.slice(0, 18))}</text>`; }).join("")}
      <text class="viz-axis-label" x="${left + plotWidth / 2}" y="${height - 6}" text-anchor="middle">${escapeHtml(xLabel)}</text>
      <text class="viz-axis-label" transform="translate(12 ${top + plotHeight / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(yLabel)}</text>
      <text class="viz-text" x="${left}" y="${top + plotHeight + 15}">0</text><text class="viz-text" x="${left + plotWidth}" y="${top + plotHeight + 15}" text-anchor="end">${escapeHtml(xFormatter(Math.max(...points.map((point) => point.x))))}</text>
      <text class="viz-text" x="${left - 6}" y="${top + 4}" text-anchor="end">${escapeHtml(yFormatter(yMax))}</text>
    </svg>
  </div>`;
}

function renderTierDistributionRich(currentPayload, priorPayload = null) {
  const rows = [...(currentPayload?.levels || [])].sort((a, b) => Number(a.level?.slice(1)) - Number(b.level?.slice(1)));
  if (!rows.length) return `<div class="usecase-empty">We do not have creator sales groups for these dates.</div>`;
  const priorMap = new Map((priorPayload?.levels || []).map((row) => [row.level, Number(row.count) || 0]));
  const total = sumBy(rows, "count") || 1;
  const priorTotal = sumBy(priorPayload?.levels || [], "count") || 1;
  const colors = ["var(--health-risk)", "var(--health-watch)", "var(--health-blue)", "var(--health-purple)", "var(--health-good)", "var(--health-good)", "var(--health-good)", "var(--health-good)"];
  return `<div class="tier-distribution">
    <div class="tier-distribution__bar">${rows.map((row, index) => `<span class="tier-distribution__segment" style="width:${clamp(safeDivide(row.count, total, 100))}%;--group-color:${colors[index]}" data-tooltip="${escapeAttr(`${index === 0 ? "No sales" : `Sales group ${index}`} · ${formatCompact(row.count)} creators · ${ratioLabel(safeDivide(row.count, total, 100))}`)}"></span>`).join("")}</div>
    <div class="tier-distribution__rows">${rows.map((row, index) => {
      const share = safeDivide(row.count, total, 100) || 0;
      const priorShare = safeDivide(priorMap.get(row.level), priorTotal, 100);
      const delta = priorShare === null ? "" : ` · ${share - priorShare >= 0 ? "+" : ""}${formatNumber(share - priorShare, 1)} pts`;
      return `<span class="tier-distribution__row" style="--group-color:${colors[index]}"><i></i><span>${escapeHtml(index === 0 ? "No sales" : `Sales group ${index}`)}</span><strong>${formatPercent(share, 1)}${escapeHtml(delta)}</strong></span>`;
    }).join("")}</div>
  </div>`;
}

function renderCreatorGrowth(context) {
  const { report, window, previousWindow } = context;
  const summary = window.summary;
  const prior = previousWindow?.summary || {};
  const newPosterShare = safeDivide(summary.new_creators_posting, summary.active_creators, 100);
  const priorNewPosterShare = safeDivide(prior.new_creators_posting, prior.active_creators, 100);
  const sellingRate = safeDivide(summary.gmv_driving_videos, summary.videos_posted, 100);
  const priorSellingRate = safeDivide(prior.gmv_driving_videos, prior.videos_posted, 100);
  const l0 = (window.creator_levels?.levels || []).find((row) => row.level === "L0");
  const l0Share = safeDivide(l0?.count, window.creator_levels?.total_creators || sumBy(window.creator_levels?.levels || [], "count"), 100);
  const stages = [
    { label: "Active creators", formatted: formatCompact(summary.active_creators), note: "Each creator counted once", connector: ratioLabel(newPosterShare), color: "var(--health-blue)" },
    { label: "Creators posting for the first time", formatted: formatCompact(summary.new_creators_posting), note: "Percent of active creators", connector: `${formatNumber(safeDivide(summary.videos_posted, summary.active_creators) || 0, 2)} each`, color: "var(--health-purple)" },
    { label: "Videos posted", formatted: formatCompact(summary.videos_posted), note: "All affiliate videos", connector: ratioLabel(sellingRate), color: "var(--health-watch)" },
    { label: "Videos that made sales", formatted: formatCompact(summary.gmv_driving_videos), note: "Videos with affiliate sales", connector: moneyPer(summary.gmv_per_video, report.currency), color: "var(--health-good)" },
    { label: "Affiliate sales", formatted: formatMoney(summary.gmv, report.currency), note: "Total for these dates", color: "var(--health-good)" }
  ];
  const actions = [
    {
      tone: newPosterShare !== null && priorNewPosterShare !== null && newPosterShare < priorNewPosterShare ? "review" : "scale",
      title: newPosterShare !== null && priorNewPosterShare !== null && newPosterShare < priorNewPosterShare ? "Get more creators to post" : "Keep helping new creators post",
      note: "Make the first brief shorter and ask creators to post within seven days.",
      value: ratioLabel(newPosterShare)
    },
    {
      tone: sellingRate !== null && priorSellingRate !== null && sellingRate < priorSellingRate ? "inspect" : "scale",
      title: sellingRate !== null && priorSellingRate !== null && sellingRate < priorSellingRate ? "Help more videos make sales" : "Reuse video styles that made sales",
      note: "Compare videos that made sales with videos that did not.",
      value: ratioLabel(sellingRate)
    },
    {
      tone: l0Share !== null && l0Share > 50 ? "review" : "inspect",
      title: l0Share !== null && l0Share > 50 ? "Help creators with no sales post again" : "Help more creators make sales",
      note: "Ask active creators with no sales to try a second post or a better-matched product.",
      value: l0Share === null ? "—" : ratioLabel(l0Share)
    }
  ];
  const funnelStages = (report.intelligence?.funnel_90d?.stages || []).filter((stage) => /sample|approved|content-posted|gmv-generated/i.test(stage.stage_id || "") && !/unfulfilled|pending/i.test(stage.stage_id || "")).slice(0, 4);
  const funnelProgression = renderProgressionChart(funnelStages.map((stage) => ({
    label: /request/i.test(stage.stage_id || "") ? "Requested a sample" : /approved/i.test(stage.stage_id || "") ? "Sample approved" : /content-posted/i.test(stage.stage_id || "") ? "Posted after a sample" : /gmv-generated/i.test(stage.stage_id || "") ? "Made a sale" : "Next step",
    formatted: formatCompact(stage.insights?.total_creators ?? stage.creator_count),
    note: `${formatNumber(stage.insights?.median_time_in_status_days || 0, 1)} typical days`,
    connector: stage.insights?.advanced_to_next_percentage != null ? formatPercent(stage.insights.advanced_to_next_percentage, 0) : "",
    color: "var(--health-purple)"
  })));
  return `${dashboardIntro(context)}
    <section class="health-section usecase-hero-grid">
      ${renderPanel({ kicker: "How creators lead to sales", title: "From active creators to affiliate sales", aside: "These 30 days", body: renderProgressionChart(stages) })}
      ${renderPanel({ kicker: "Next steps", title: "What to do now", aside: "Based on this data", body: renderActionRail(actions) })}
    </section>
    <section class="health-section">
      ${renderPanel({ kicker: "Change over time", title: "Creator growth by week", aside: "Weekly and monthly views", body: renderWeeklyPulse([
        { label: "Active creators", series: weeklySeries(report, "creators", window.end_date), formatter: formatCompact },
        { label: "Creators posting for the first time", series: weeklySeries(report, "new_creators_posting", window.end_date), formatter: formatCompact, tone: "secondary" },
        { label: "Videos that made sales", series: weeklyRatioSeries(report, "gmv_driving_videos", "videos_posted", window.end_date), formatter: (value) => formatPercent(value, 1), tone: "good" },
        { label: "Affiliate sales", series: weeklySeries(report, "gmv", window.end_date), formatter: (value) => formatMoney(value, report.currency), tone: "good" }
      ]) })}
    </section>
    <section class="health-section usecase-secondary-grid">
      ${renderPanel({ kicker: "Creator sales groups", title: "Creators grouped by TikTok Shop sales", aside: "These 30 days", body: renderTierDistributionRich(window.creator_levels, previousWindow?.creator_levels) })}
      ${renderPanel({ kicker: "Creator progress", title: "Where creators are now", aside: "Last 90 days", body: funnelProgression })}
    </section>
    ${dashboardFooter(context, "These steps may include different creators. Creator sales groups include each creator’s TikTok Shop sales, not only this shop.")}`;
}

function renderOutreachPerformance(context) {
  const { report, window, previousWindow } = context;
  const summary = window.summary;
  const prior = previousWindow?.summary || {};
  const aggregate = window.automations?.aggregate || {};
  const automationRows = datasetRows(window.automations);
  const coverage = safeDivide(summary.creators_messaged, summary.creators_reached, 100);
  const responseRate = Number(summary.reply_rate) || safeDivide(summary.dm_responses, summary.creators_messaged, 100);
  const inviteIntensity = safeDivide(summary.tc_invites_sent, summary.creators_messaged, 100);
  const acceptance = Number.isFinite(Number(aggregate.tc_acceptance_rate)) ? Number(aggregate.tc_acceptance_rate) : safeDivide(summary.accepted_tc_count, summary.tc_invites_sent, 100);
  const skipRate = safeDivide(sumBy(automationRows, "skipped"), sumBy(automationRows, "total_creators"), 100);
  const stages = [
    { label: "Creators reached", formatted: formatCompact(summary.creators_reached), note: "All creators found", connector: ratioLabel(coverage), color: "var(--health-blue)" },
    { label: "Creators messaged", formatted: formatCompact(summary.creators_messaged), note: "Percent reached who got a message", connector: ratioLabel(responseRate), color: "var(--health-purple)" },
    { label: "Replies", formatted: formatCompact(summary.dm_responses), note: "Percent messaged who replied", connector: ratioLabel(inviteIntensity), color: "var(--health-good)" },
    { label: "Collaboration invites", formatted: formatCompact(summary.tc_invites_sent), note: "Invites sent", connector: ratioLabel(acceptance), color: "var(--health-watch)" },
    { label: "Invites accepted", formatted: formatCompact(summary.accepted_tc_count), note: "Accepted invites in these dates", color: "var(--health-good)" }
  ];
  const actions = [
    { tone: coverage != null && coverage < 70 ? "review" : "scale", title: coverage != null && coverage < 70 ? "Message more creators you reach" : "Keep messaging most creators you reach", note: "A creator cannot reply if they never get a message.", value: ratioLabel(coverage) },
    { tone: responseRate != null && responseRate < 3 ? "review" : "scale", title: responseRate != null && responseRate < 3 ? "Make the message clearer" : "Use the message that gets the most replies", note: "Compare campaigns only when reply data is available.", value: ratioLabel(responseRate) },
    { tone: skipRate != null && skipRate > 15 ? "inspect" : "scale", title: skipRate != null && skipRate > 15 ? "Fix who gets a message" : "Few creators were skipped", note: "Many skipped creators can mean bad handles, filters, or message limits.", value: skipRate == null ? "—" : ratioLabel(skipRate) }
  ];
  const comparableAutomations = automationRows.filter((row) => (Number(row.creators_reached) || 0) > 0 && Number.isFinite(Number(row.reply_rate)));
  const matrix = renderQuadrantChart(comparableAutomations, {
    xAccessor: (row) => row.creators_reached,
    yAccessor: (row) => row.reply_rate,
    sizeAccessor: (row) => row.gmv,
    labelAccessor: (row) => row.automation_name || row.automation_type,
    xLabel: "Creators reached",
    yLabel: "Reply rate",
    yFormatter: (value) => formatPercent(value, 1),
    kind: "Campaign",
    logX: true,
    toneAccessor: (row) => Number(row.reply_rate) >= median(comparableAutomations.map((item) => Number(item.reply_rate) || 0)) ? "good" : "watch",
    captions: ["Small reach, good replies", "Large reach, good replies", "Small reach, few replies", "Large reach, few replies"]
  });
  const automationTable = renderAnalyticsTable(["Campaign", "Status", "Creators reached", "Reply rate", "Samples", "Videos", "Affiliate sales"], automationRows.slice(0, 12).map((row, index) => `
    <tr><td><span class="mo-cell-main" data-sensitive>${escapeHtml(displayEntityName(row.automation_name || row.automation_type, "Campaign", index))}</span><span class="mo-cell-sub">Campaign</span></td><td><span class="mo-badge mo-badge--gray">${escapeHtml(row.status || "—")}</span></td><td>${formatCompact(row.creators_reached)}</td><td>${ratioLabel(row.reply_rate)}</td><td>${formatCompact(row.sample_requests)}</td><td>${formatCompact(row.videos_posted)}</td><td>${formatMoney(row.gmv, report.currency)}</td></tr>
  `), { minWidth: 980 });
  return `${dashboardIntro(context)}
    <section class="health-section usecase-hero-grid">
      ${renderPanel({ kicker: "How messages lead to partners", title: "From creators reached to invites accepted", aside: "Each step counted separately", body: renderProgressionChart(stages) })}
      ${renderPanel({ kicker: "Next steps", title: "What to do now", aside: "Messages and replies", body: renderActionRail(actions) })}
    </section>
    <section class="health-section">
      ${renderPanel({ kicker: "Change over time", title: "Messages and replies by week", aside: "Weekly history", body: renderWeeklyPulse([
        { label: "Creators reached", series: weeklySeries(report, "creators_reached", window.end_date), formatter: formatCompact },
        { label: "Creators messaged", series: weeklySeries(report, "creators_messaged", window.end_date), formatter: formatCompact, tone: "secondary" },
        { label: "Replies", series: weeklySeries(report, "dm_responses", window.end_date), formatter: formatCompact, tone: "good" },
        { label: "Collaboration invites", series: weeklySeries(report, "tc_invites_sent", window.end_date), formatter: formatCompact, tone: "watch" }
      ]) })}
    </section>
    <section class="health-section usecase-secondary-grid">
      ${renderPanel({ kicker: "Campaign comparison", title: "Creators reached and reply rate", aside: automationRows.length ? "Larger dots show more affiliate sales" : "Only the latest dates have details", body: matrix })}
      ${renderPanel({ kicker: "Campaign details", title: "Campaign results", aside: automationRows.length ? `${automationRows.length} campaigns shown` : "We do not have details for these dates", body: automationTable })}
    </section>
    ${dashboardFooter(context, "These steps may include different creators. Campaign details only cover campaigns created during these dates.")}`;
}

function renderSampleEfficiency(context) {
  const { report, window, previousWindow } = context;
  const summary = window.summary;
  const prior = previousWindow?.summary || {};
  const rows = datasetRows(window.sample_products);
  const requests = Number(summary.sample_requests) || sumBy(rows, "total_requests");
  const shipped = Number(summary.samples_approved) || sumBy(rows, "approved");
  const posters = sumBy(rows, "videos_from_samples");
  const sampleGmv = sumBy(rows, "sample_gmv");
  const throughput = safeDivide(shipped, requests, 100);
  const postingRate = safeDivide(posters, sumBy(rows, "approved"), 100);
  const gmvPerShipped = safeDivide(sampleGmv, sumBy(rows, "approved"));
  const enriched = rows.filter((row) => (Number(row.approved) || 0) > 0).map((row) => ({ ...row, yield: safeDivide(row.sample_gmv, row.approved) || 0, posting_rate: safeDivide(row.videos_from_samples, row.approved, 100) || 0 }));
  const comparableSamples = enriched.filter((row) => (Number(row.approved) || 0) >= 5);
  const yieldValues = comparableSamples.map((row) => row.yield);
  const approvedValues = comparableSamples.map((row) => Number(row.approved) || 0);
  const yieldHigh = quantile(yieldValues, 0.75);
  const yieldLow = quantile(yieldValues, 0.25);
  const approvedMedian = median(approvedValues);
  const approvedHigh = quantile(approvedValues, 0.75);
  const scaleCandidate = comparableSamples.filter((row) => row.yield >= yieldHigh && row.approved <= approvedMedian).sort((a, b) => b.yield - a.yield)[0];
  const inspectCandidate = comparableSamples.filter((row) => row.approved >= approvedHigh && row.yield <= yieldLow).sort((a, b) => b.approved - a.approved)[0];
  const gapCandidate = [...rows].sort((a, b) => ((b.total_requests || 0) - (b.approved || 0)) - ((a.total_requests || 0) - (a.approved || 0)))[0];
  const stages = [
    { label: "Sample requests", formatted: formatCompact(requests), note: "Requests received", connector: ratioLabel(throughput), color: "var(--health-blue)" },
    { label: "Samples shipped", formatted: formatCompact(shipped), note: "Approved samples used here", connector: ratioLabel(postingRate), color: "var(--health-purple)" },
    { label: "Creators who posted", formatted: rows.length ? formatCompact(posters) : "—", note: "Creators who got a sample", connector: moneyPer(gmvPerShipped, report.currency), color: "var(--health-watch)" },
    { label: "Sales linked to samples", formatted: rows.length ? formatMoney(sampleGmv, report.currency) : "—", note: "For the products shown", color: "var(--health-good)" }
  ];
  const actions = [
    scaleCandidate ? { tone: "scale", title: "Send more samples", note: displayEntityName(scaleCandidate.product_name, "Product", enriched.indexOf(scaleCandidate)), value: moneyPer(scaleCandidate.yield, report.currency) } : { tone: "inspect", title: "Find a strong product getting too few samples", note: "No product clearly meets this rule yet.", value: "—" },
    inspectCandidate ? { tone: "review", title: "Send fewer samples for a weak product", note: displayEntityName(inspectCandidate.product_name, "Product", enriched.indexOf(inspectCandidate)), value: `${formatCompact(inspectCandidate.approved)} shipped` } : { tone: "scale", title: "No product is getting too many samples", note: "Products with many samples are not among the weakest for sales per sample.", value: "Looks good" },
    gapCandidate ? { tone: "inspect", title: "Review the product with the most unsent requests", note: displayEntityName(gapCandidate.product_name, "Product", rows.indexOf(gapCandidate)), value: formatCompact(Math.max(0, (gapCandidate.total_requests || 0) - (gapCandidate.approved || 0))) } : { tone: "inspect", title: "Sample request details are missing", note: "Use the requests-shipped card until product details return.", value: "—" }
  ];
  const matrix = renderQuadrantChart(comparableSamples, {
    xAccessor: (row) => row.approved,
    yAccessor: (row) => row.yield,
    sizeAccessor: (row) => row.sample_gmv,
    labelAccessor: (row) => row.product_name,
    xLabel: "Samples shipped",
    yLabel: "Sales per shipped sample",
    yFormatter: (value) => moneyPer(value, report.currency),
    kind: "Product",
    toneAccessor: (row) => row.yield >= yieldHigh && row.approved <= approvedMedian ? "good" : row.approved >= approvedHigh && row.yield <= yieldLow ? "risk" : "watch",
    captions: ["Few samples, high sales", "Many samples, high sales", "Few samples, low sales", "Many samples, low sales"]
  });
  const decisionRows = [...enriched].sort((a, b) => b.sample_gmv - a.sample_gmv).slice(0, 16).map((row, index) => {
    const decision = row.yield >= yieldHigh && row.approved <= approvedMedian ? ["Send more", "scale"] : row.approved >= approvedHigh && row.yield <= yieldLow ? ["Send fewer", "review"] : row.posting_rate < 25 ? ["Follow up", "inspect"] : ["Keep same", "scale"];
    return `<tr><td><span class="mo-cell-main" data-sensitive>${escapeHtml(displayEntityName(row.product_name, "Product", index))}</span><span class="mo-cell-sub">${formatCompact(row.total_requests)} requests</span></td><td>${formatCompact(row.approved)}</td><td>${formatCompact(row.videos_from_samples)}</td><td>${ratioLabel(row.posting_rate)}</td><td>${formatMoney(row.sample_gmv, report.currency)}</td><td>${moneyPer(row.yield, report.currency)}</td><td><span class="decision-pill is-${decision[1]}">${decision[0]}</span></td></tr>`;
  });
  return `${dashboardIntro(context)}
    <section class="health-section usecase-hero-grid">
      ${renderPanel({ kicker: "Sample results", title: "From sample requests to affiliate sales", aside: rows.length ? `${rows.length} products shown` : "Using totals only", body: renderProgressionChart(stages) })}
      ${renderPanel({ kicker: "Next steps", title: "Where to send more or fewer samples", aside: "More · fewer · review", body: renderActionRail(actions) })}
    </section>
    <section class="health-section">
      ${renderPanel({ kicker: "Change over time", title: "Sample requests, shipments, and sales", aside: "By week", body: renderWeeklyPulse([
        { label: "Sample requests", series: weeklySeries(report, "sample_requests", window.end_date), formatter: formatCompact },
        { label: "Samples shipped", series: weeklySeries(report, "samples_approved", window.end_date), formatter: formatCompact, tone: "secondary" },
        { label: "Sample requests shipped (%)", series: weeklyRatioSeries(report, "samples_approved", "sample_requests", window.end_date), formatter: (value) => formatPercent(value, 1), tone: "watch" },
        { label: "Sales per shipped sample", series: weeklySeries(report, "gmv_per_sample", window.end_date), formatter: (value) => moneyPer(value, report.currency), tone: "good" }
      ]) })}
    </section>
    <section class="health-section usecase-secondary-grid">
      ${renderPanel({ kicker: "Product comparison", title: "Samples sent and sales per sample", aside: "Larger dots show more sales linked to samples", body: matrix })}
      ${renderPanel({ kicker: "Products to act on", title: "Send more, send fewer, or follow up", aside: "Product details", body: renderAnalyticsTable(["Product", "Shipped", "Posted", "Percent who posted", "Sales linked to samples", "Sales per shipped sample", "Action"], decisionRows, { minWidth: 1050 }) })}
    </section>
    ${dashboardFooter(context, "Approved samples are used as samples sent. Sales per sample is not profit. Product details may be up to 3 days old.")}`;
}

function renderContentYield(context) {
  const { report, window, previousWindow } = context;
  const summary = window.summary;
  const prior = previousWindow?.summary || {};
  const videos = datasetRows(window.top_videos);
  const fallbackProducts = (window.top_products || []).filter((row) => (Number(row.video_count) || 0) > 0 && (Number(row.gmv) || 0) > 0);
  const sellingRate = safeDivide(summary.gmv_driving_videos, summary.videos_posted, 100);
  const priorSellingRate = safeDivide(prior.gmv_driving_videos, prior.videos_posted, 100);
  const viewsPerVideo = safeDivide(summary.video_views, summary.videos_posted);
  const gmvPerThousand = safeDivide(summary.gmv, summary.video_views, 1000);
  const videoRows = videos.map((row) => {
    const yieldMetric = safeDivide(row.video_gmv, row.views, 1000) || 0;
    return { ...row, gmv_per_1k_views: yieldMetric, evidence_label: row.creator_handle || row.title, evidence_reach: Number(row.views) || 0, evidence_gmv: Number(row.video_gmv) || 0, evidence_volume: Number(row.order_count) || 0, evidence_yield: yieldMetric };
  });
  const productCoverageRows = fallbackProducts.map((row) => {
    const yieldMetric = safeDivide(row.gmv, row.video_count) || 0;
    return { ...row, evidence_label: row.product_name, evidence_reach: Number(row.video_count) || 0, evidence_gmv: Number(row.gmv) || 0, evidence_volume: Number(row.units_sold) || 0, evidence_yield: yieldMetric };
  });
  const usingProductFallback = !videoRows.length && productCoverageRows.length > 0;
  const evidenceRows = videoRows.length ? videoRows : productCoverageRows;
  const viewValues = evidenceRows.map((row) => row.evidence_reach);
  const yieldValues = evidenceRows.map((row) => row.evidence_yield);
  const viewMedian = median(viewValues);
  const viewLow = quantile(viewValues, 0.25);
  const viewHigh = quantile(viewValues, 0.75);
  const yieldHigh = quantile(yieldValues, 0.75);
  const yieldLow = quantile(yieldValues, 0.25);
  const minimumReach = usingProductFallback ? Math.max(3, viewLow) : Math.max(1000, viewLow);
  const amplify = evidenceRows.filter((row) => row.evidence_reach >= minimumReach && row.evidence_yield >= yieldHigh && row.evidence_reach <= viewMedian).sort((a, b) => b.evidence_yield - a.evidence_yield)[0];
  const rework = evidenceRows.filter((row) => row.evidence_reach >= viewHigh && row.evidence_yield <= yieldLow).sort((a, b) => b.evidence_reach - a.evidence_reach)[0];
  const coverage = window.top_videos?.coverage || report.intelligence?.creative_videos?.coverage || {};
  const creativeCoverage = safeDivide(coverage.with_creative_analysis, coverage.videos_returned, 100);
  const stages = [
    { label: "Videos posted", formatted: formatCompact(summary.videos_posted), note: "All affiliate videos", connector: ratioLabel(sellingRate), color: "var(--health-blue)" },
    { label: "Videos that made sales", formatted: formatCompact(summary.gmv_driving_videos), note: "Percent of all videos", connector: formatCompact(viewsPerVideo || 0), color: "var(--health-purple)" },
    { label: "Video views", formatted: formatCompact(summary.video_views), note: "Views on posted videos", connector: moneyPer(gmvPerThousand, report.currency), color: "var(--health-watch)" },
    { label: "Affiliate sales", formatted: formatMoney(summary.gmv, report.currency), note: "Total for these dates", color: "var(--health-good)" }
  ];
  const actions = [
    { tone: sellingRate !== null && priorSellingRate !== null && sellingRate < priorSellingRate ? "review" : "scale", title: sellingRate !== null && priorSellingRate !== null && sellingRate < priorSellingRate ? "Stop repeating videos that do not sell" : "Keep using video styles that make sales", note: "Watch the percent of videos that make sales.", value: ratioLabel(sellingRate) },
    amplify ? { tone: "scale", title: usingProductFallback ? "Make more videos for a strong product" : "Reuse a strong video idea", note: usingProductFallback ? `${displayEntityName(amplify.product_name, "Product", evidenceRows.indexOf(amplify))} · high sales per video` : `${displayEntityName(amplify.creator_handle, "Creator", evidenceRows.indexOf(amplify))} · high sales per 1,000 views`, value: moneyPer(amplify.evidence_yield, report.currency) } : { tone: "inspect", title: "No clear winner found", note: "No item has enough views or videos and strong enough sales.", value: "—" },
    rework ? { tone: "review", title: usingProductFallback ? "Make fewer videos for a weak product" : "Fix a popular video that did not sell", note: usingProductFallback ? `${displayEntityName(rework.product_name, "Product", evidenceRows.indexOf(rework))} · many videos, weak sales` : `${displayEntityName(rework.creator_handle, "Creator", evidenceRows.indexOf(rework))} · many views, weak sales`, value: formatCompact(rework.evidence_reach) } : { tone: "scale", title: "No highly viewed weak seller found", note: "No item has many views or videos and very weak sales.", value: "Looks good" },
    { tone: creativeCoverage != null && creativeCoverage < 60 ? "inspect" : "scale", title: creativeCoverage != null && creativeCoverage < 60 ? "Review more top videos" : "Reuse ideas from top videos", note: "These ideas only come from top-selling videos that Reacher reviewed.", value: creativeCoverage == null ? "—" : ratioLabel(creativeCoverage) }
  ];
  const matrix = renderQuadrantChart(evidenceRows, {
    xAccessor: (row) => row.evidence_reach,
    yAccessor: (row) => row.evidence_gmv,
    sizeAccessor: (row) => row.evidence_volume,
    labelAccessor: (row) => row.evidence_label,
    xLabel: usingProductFallback ? "Product videos" : "Video views",
    yLabel: usingProductFallback ? "Product affiliate sales" : "Video affiliate sales",
    yFormatter: (value) => formatMoney(value, report.currency),
    kind: usingProductFallback ? "Product" : "Video",
    logX: true,
    toneAccessor: (row) => row.evidence_yield >= yieldHigh ? "good" : row.evidence_yield <= yieldLow ? "risk" : "blue",
    captions: usingProductFallback ? ["Few videos, strong sales", "Many videos, strong sales", "Few videos, low sales", "Many videos, low sales"] : ["Fewer views, strong sales", "Many views, strong sales", "Few views, low sales", "Many views, low sales"]
  });
  const hookGroups = new Map();
  videoRows.filter((row) => row.creative?.analyzed && row.creative?.hook?.classification).forEach((row) => {
    const key = row.creative.hook.classification;
    if (!hookGroups.has(key)) hookGroups.set(key, []);
    hookGroups.get(key).push(row.gmv_per_1k_views);
  });
  const hookBars = [...hookGroups.entries()].map(([label, values]) => ({ label, value: median(values), n: values.length })).filter((row) => row.n >= 3).sort((a, b) => b.value - a.value).slice(0, 8);
  const fallbackBars = [...productCoverageRows].sort((a, b) => b.evidence_yield - a.evidence_yield).slice(0, 8);
  const hookChart = usingProductFallback
    ? renderStageBars(fallbackBars.map((row, index) => ({ label: displayEntityName(row.product_name, "Product", index), value: row.evidence_yield, formatted: moneyPer(row.evidence_yield, report.currency), note: `${formatCompact(row.video_count)} videos`, tooltip: `${displayEntityName(row.product_name, "Product", index)} · ${moneyPer(row.evidence_yield, report.currency)} sales per video` })))
    : hookBars.length ? renderStageBars(hookBars.map((row) => ({ label: row.label, value: row.value, formatted: moneyPer(row.value, report.currency), note: `${row.n} top videos reviewed`, tooltip: `${row.label} · typical ${moneyPer(row.value, report.currency)} sales per 1,000 views · ${row.n} videos` }))) : `<div class="usecase-empty">We need at least 3 reviewed videos with the same opening style.</div>`;
  const opportunityRows = evidenceRows.slice(0, 18).map((row, index) => {
    const decision = row.evidence_reach >= minimumReach && row.evidence_yield >= yieldHigh && row.evidence_reach <= viewMedian ? ["Make more", "scale"] : row.evidence_reach >= viewHigh && row.evidence_yield <= yieldLow ? ["Change", "review"] : row.evidence_yield <= yieldLow ? ["Check", "inspect"] : ["Keep same", "scale"];
    if (usingProductFallback) return `<tr><td><span class="mo-cell-main" data-sensitive>${escapeHtml(displayEntityName(row.product_name, "Product", index))}</span><span class="mo-cell-sub">These 30 days</span></td><td>${formatCompact(row.video_count)}</td><td>${formatMoney(row.gmv, report.currency)}</td><td>${moneyPer(row.evidence_yield, report.currency)}</td><td>${formatCompact(row.units_sold)}</td><td><span class="decision-pill is-${decision[1]}">${decision[0]}</span></td></tr>`;
    return `<tr><td><span class="mo-cell-main" data-sensitive>${escapeHtml(displayEntityName(row.title || row.creator_handle, "Video", index))}</span><span class="mo-cell-sub" data-sensitive>${escapeHtml(displayEntityName(row.creator_handle, "Creator", index))}</span></td><td>${formatCompact(row.views)}</td><td>${formatMoney(row.video_gmv, report.currency)}</td><td>${moneyPer(row.gmv_per_1k_views, report.currency)}</td><td>${formatCompact(row.order_count)}</td><td><span class="decision-pill is-${decision[1]}">${decision[0]}</span></td></tr>`;
  });
  return `${dashboardIntro(context)}
    <section class="health-section usecase-hero-grid">
      ${renderPanel({ kicker: "How videos make sales", title: "From videos posted to affiliate sales", aside: "These 30 days", body: renderProgressionChart(stages) })}
      ${renderPanel({ kicker: "Next steps", title: "What to repeat or change", aside: "All videos and top videos", body: renderActionRail(actions) })}
    </section>
    <section class="health-section">
      ${renderPanel({ kicker: "Change over time", title: "Videos, views, and sales by week", aside: "Weekly history", body: renderWeeklyPulse([
        { label: "Videos posted", series: weeklySeries(report, "videos_posted", window.end_date), formatter: formatCompact },
        { label: "Videos that made sales", series: weeklyRatioSeries(report, "gmv_driving_videos", "videos_posted", window.end_date), formatter: (value) => formatPercent(value, 1), tone: "good" },
        { label: "Video views", series: weeklySeries(report, "video_views", window.end_date), formatter: formatCompact, tone: "secondary" },
        { label: "Sales per video", series: weeklySeries(report, "gmv_per_video", window.end_date), formatter: (value) => moneyPer(value, report.currency), tone: "watch" }
      ]) })}
    </section>
    <section class="health-section usecase-secondary-grid">
      ${renderPanel({ kicker: usingProductFallback ? "Product comparison" : "Video comparison", title: usingProductFallback ? "Number of videos and affiliate sales" : "Views and affiliate sales", aside: usingProductFallback ? "Larger dots show items sold" : "Larger dots show orders", body: matrix })}
      ${renderPanel({ kicker: usingProductFallback ? "Product video results" : "Video style results", title: usingProductFallback ? "Sales per video by product" : "Sales by opening style in top videos", aside: usingProductFallback ? `${productCoverageRows.length} products for these dates` : creativeCoverage == null ? "We do not have review data" : `${ratioLabel(creativeCoverage)} reviewed`, body: hookChart })}
    </section>
    <section class="health-section">${renderPanel({ kicker: usingProductFallback ? "Products to act on" : "Videos to act on", title: "Make more, keep, or change", aside: usingProductFallback ? "Using product totals for these dates" : "Top-selling videos shown", body: renderAnalyticsTable(usingProductFallback ? ["Product", "Videos", "Affiliate sales", "Sales per video", "Items sold", "Action"] : ["Video", "Views", "Affiliate sales", "Sales per 1,000 views", "Orders", "Action"], opportunityRows, { minWidth: 920 }) })}</section>
    ${dashboardFooter(context, usingProductFallback ? "Video details are missing for these dates, so this view uses product sales and video counts from the same period." : "This view only includes top-selling reviewed videos, not all videos. It shows what happened, not what caused it.")}`;
}

function renderCreatorPortfolio(context) {
  const { report, window, previousWindow } = context;
  const creators = (window.top_creators || []).filter((row) => (Number(row.gmv) || 0) > 0);
  const totalGmv = Number(window.summary.gmv) || 0;
  const top1Share = safeDivide(creators[0]?.gmv, totalGmv, 100) || 0;
  const top3Share = safeDivide(sumBy(creators.slice(0, 3), "gmv"), totalGmv, 100) || 0;
  const top10Share = safeDivide(sumBy(creators.slice(0, 10), "gmv"), totalGmv, 100) || 0;
  const gmvValues = creators.map((row) => Number(row.gmv) || 0);
  const orderValues = creators.map((row) => Number(row.order_count) || 0);
  const followerValues = creators.map((row) => Number(row.follower_count) || 0);
  const commissionRates = creators.map((row) => safeDivide(row.est_commission, row.gmv, 100) || 0);
  const gmvHigh = quantile(gmvValues, 0.75);
  const orderHigh = quantile(orderValues, 0.75);
  const followerMedian = median(followerValues);
  const commissionHigh = quantile(commissionRates, 0.75);
  const gmvMedian = median(gmvValues);
  const enriched = creators.map((row) => ({
    ...row,
    gmv_per_1k_followers: safeDivide(row.gmv, row.follower_count, 1000) || 0,
    commission_rate: safeDivide(row.est_commission, row.gmv, 100) || 0
  }));
  const emergingHigh = quantile(enriched.map((row) => row.gmv_per_1k_followers), 0.75);
  const protect = enriched.find((row) => row.gmv >= gmvHigh && row.order_count >= orderHigh) || enriched[0];
  const emerging = enriched.filter((row) => row.order_count >= 5 && row.gmv_per_1k_followers >= emergingHigh && row.follower_count <= followerMedian).sort((a, b) => b.gmv_per_1k_followers - a.gmv_per_1k_followers)[0];
  const costReview = enriched.filter((row) => row.commission_rate >= commissionHigh && row.gmv <= gmvMedian).sort((a, b) => b.commission_rate - a.commission_rate)[0];
  const priorTop1 = safeDivide(previousWindow?.top_creators?.[0]?.gmv, previousWindow?.summary?.gmv, 100);
  const actions = [
    protect ? { tone: "scale", title: "Keep a top creator engaged", note: displayEntityName(protect.creator_handle, "Creator", enriched.indexOf(protect)), value: formatMoney(protect.gmv, report.currency) } : { tone: "inspect", title: "No top creator found", note: "We do not have creator details for these dates.", value: "—" },
    emerging ? { tone: "scale", title: "Do more with a rising creator", note: displayEntityName(emerging.creator_handle, "Creator", enriched.indexOf(emerging)), value: `${moneyPer(emerging.gmv_per_1k_followers, report.currency)} per 1,000 followers` } : { tone: "inspect", title: "Find a rising creator with strong sales", note: "No creator meets this rule yet.", value: "—" },
    costReview ? { tone: "review", title: "Review commission for a low-sales creator", note: displayEntityName(costReview.creator_handle, "Creator", enriched.indexOf(costReview)), value: ratioLabel(costReview.commission_rate) } : { tone: "scale", title: "No unusual commission rate", note: "Commission rates look in line with affiliate sales.", value: "Looks good" },
    { tone: priorTop1 !== null && top1Share > priorTop1 + 3 ? "review" : "inspect", title: priorTop1 !== null && top1Share > priorTop1 + 3 ? "Spread sales across more creators" : "Make sure one creator does not drive too many sales", note: `The top 3 make ${ratioLabel(top3Share)}; the top 10 make ${ratioLabel(top10Share)}.`, value: ratioLabel(top1Share) }
  ];
  const pareto = renderParetoChart(creators, { valueKey: "gmv", labelKey: (row) => row.creator_handle, total: totalGmv, currency: report.currency, kind: "Creator" });
  const matrix = renderQuadrantChart(enriched, {
    xAccessor: (row) => row.follower_count,
    yAccessor: (row) => row.gmv,
    sizeAccessor: (row) => row.order_count,
    labelAccessor: (row) => row.creator_handle,
    xLabel: "Follower count",
    yLabel: "Affiliate sales",
    yFormatter: (value) => formatMoney(value, report.currency),
    kind: "Creator",
    logX: true,
    toneAccessor: (row) => row.gmv_per_1k_followers >= emergingHigh ? "good" : row.commission_rate >= commissionHigh && row.gmv <= gmvMedian ? "risk" : "blue",
    captions: ["Small audience, strong sales", "Large audience, strong sales", "Small audience, low sales", "Large audience, low sales"]
  });
  const roster = enriched.slice(0, 24).map((row, index) => {
    const decision = row.gmv >= gmvHigh && row.order_count >= orderHigh ? ["Keep close", "scale"] : row.order_count >= 5 && row.gmv_per_1k_followers >= emergingHigh && row.follower_count <= followerMedian ? ["Do more", "scale"] : row.commission_rate >= commissionHigh && row.gmv <= gmvMedian ? ["Review commission", "review"] : ["Keep same", "inspect"];
    return `<tr><td><span class="mo-cell-main" data-sensitive>@${escapeHtml(displayEntityName(row.creator_handle, "Creator", index))}</span><span class="mo-cell-sub">Number ${index + 1} by sales</span></td><td>${formatMoney(row.gmv, report.currency)}</td><td>${formatCompact(row.order_count)}</td><td>${formatCompact(row.follower_count)}</td><td>${moneyPer(row.gmv_per_1k_followers, report.currency)}</td><td>${ratioLabel(row.commission_rate)}</td><td><span class="decision-pill is-${decision[1]}">${decision[0]}</span></td></tr>`;
  });
  return `${dashboardIntro(context)}
    <section class="health-section usecase-hero-grid">
      ${renderPanel({ kicker: "Sales by creator", title: "Who makes affiliate sales", aside: `${creators.length} creators shown · everyone else included in total`, body: pareto })}
      ${renderPanel({ kicker: "Next steps", title: "What to do with each creator", aside: "Based on this data", body: renderActionRail(actions) })}
    </section>
    <section class="health-section">
      ${renderPanel({ kicker: "Change over time", title: "Creator sales over time", aside: "Weekly and monthly views", body: renderWeeklyPulse([
        { label: "Affiliate sales", series: weeklySeries(report, "gmv", window.end_date), formatter: (value) => formatMoney(value, report.currency), tone: "good" },
        { label: "Active creators", series: weeklySeries(report, "creators", window.end_date), formatter: formatCompact },
        { label: "Sales from top creator", series: windowSeries(report, (row) => safeDivide(row.top_creators?.[0]?.gmv, row.summary.gmv, 100), window.end_date), formatter: (value) => formatPercent(value, 1), tone: "watch" },
        { label: "Creators posting for the first time", series: weeklySeries(report, "new_creators_posting", window.end_date), formatter: formatCompact, tone: "secondary" }
      ]) })}
    </section>
    <section class="health-section usecase-secondary-grid">
      ${renderPanel({ kicker: "Creator comparison", title: "Followers and affiliate sales", aside: "Larger dots show more orders", body: matrix })}
      ${renderPanel({ kicker: "Creator sales groups", title: "Creators grouped by TikTok Shop sales", aside: "The first group has no sales", body: renderTierDistributionRich(window.creator_levels, previousWindow?.creator_levels) })}
    </section>
    <section class="health-section">${renderPanel({ kicker: "Creators to act on", title: "Keep close, do more, or review commission", aside: `Top ${Math.min(24, creators.length)} creators shown`, body: renderAnalyticsTable(["Creator", "Affiliate sales", "Orders", "Followers", "Sales per 1,000 followers", "Commission as % of sales", "Action"], roster, { minWidth: 1100 }) })}</section>
    ${dashboardFooter(context, "The charts use the creators shown and total affiliate sales. TikTok Shop sales groups include sales outside this shop.")}`;
}

function renderProductPortfolio(context) {
  const { report, window, previousWindow } = context;
  const products = (window.top_products || []).filter((row) => (Number(row.gmv) || 0) > 0);
  const totalGmv = Number(window.summary.gmv) || 0;
  const top1Share = safeDivide(products[0]?.gmv, totalGmv, 100) || 0;
  const top3Share = safeDivide(sumBy(products.slice(0, 3), "gmv"), totalGmv, 100) || 0;
  const top10Share = safeDivide(sumBy(products.slice(0, 10), "gmv"), totalGmv, 100) || 0;
  const enriched = products.map((row) => ({
    ...row,
    gmv_per_video: safeDivide(row.gmv, row.video_count) || 0,
    gmv_per_sample: safeDivide(row.gmv, row.sample_count) || 0,
    refund_rate: safeDivide(row.refund_units, row.units_sold, 100) || 0,
    video_share: safeDivide(row.video_count, sumBy(products, "video_count"), 100) || 0,
    gmv_share: safeDivide(row.gmv, totalGmv, 100) || 0
  }));
  const videoMedian = median(enriched.map((row) => Number(row.video_count) || 0));
  const videoHigh = quantile(enriched.map((row) => Number(row.video_count) || 0), 0.75);
  const yieldHigh = quantile(enriched.map((row) => row.gmv_per_video), 0.75);
  const yieldLow = quantile(enriched.map((row) => row.gmv_per_video), 0.25);
  const refundHigh = quantile(enriched.map((row) => row.refund_rate), 0.75);
  const scale = enriched.filter((row) => row.video_count >= 5 && row.gmv_per_video >= yieldHigh && row.video_count <= videoMedian && row.refund_rate < refundHigh).sort((a, b) => b.gmv_per_video - a.gmv_per_video)[0];
  const saturated = enriched.filter((row) => row.video_count >= videoHigh && row.gmv_per_video <= yieldLow).sort((a, b) => b.video_count - a.video_count)[0];
  const quality = enriched.filter((row) => row.refund_rate >= refundHigh && row.units_sold >= median(enriched.map((item) => Number(item.units_sold) || 0))).sort((a, b) => b.refund_rate - a.refund_rate)[0];
  const priorTop1 = safeDivide(previousWindow?.top_products?.[0]?.gmv, previousWindow?.summary?.gmv, 100);
  const actions = [
    scale ? { tone: "scale", title: "Ask more creators to make videos for this product", note: displayEntityName(scale.product_name, "Product", enriched.indexOf(scale)), value: moneyPer(scale.gmv_per_video, report.currency) } : { tone: "inspect", title: "Find a strong product with too few videos", note: "No product clearly meets this rule yet.", value: "—" },
    saturated ? { tone: "review", title: "Make fewer videos for a weak product", note: displayEntityName(saturated.product_name, "Product", enriched.indexOf(saturated)), value: `${formatCompact(saturated.video_count)} videos` } : { tone: "scale", title: "No product has too many weak videos", note: "Products with many videos are not among the weakest for sales per video.", value: "Looks good" },
    quality ? { tone: "review", title: "Check product quality and listing", note: displayEntityName(quality.product_name, "Product", enriched.indexOf(quality)), value: ratioLabel(quality.refund_rate) } : { tone: "scale", title: "No unusual refund rate", note: "Products with many sales stay within the current refund range.", value: "Looks good" },
    { tone: priorTop1 !== null && top1Share > priorTop1 + 3 ? "review" : "inspect", title: priorTop1 !== null && top1Share > priorTop1 + 3 ? "Spread sales across more products" : "Make sure one product does not drive too many sales", note: `The top 3 make ${ratioLabel(top3Share)}; the top 10 make ${ratioLabel(top10Share)}.`, value: ratioLabel(top1Share) }
  ];
  const pareto = renderParetoChart(products, { valueKey: "gmv", labelKey: (row) => row.product_name, total: totalGmv, currency: report.currency, kind: "Product" });
  const matrix = renderQuadrantChart(enriched, {
    xAccessor: (row) => row.video_count,
    yAccessor: (row) => row.gmv_per_video,
    sizeAccessor: (row) => row.units_sold,
    labelAccessor: (row) => row.product_name,
    xLabel: "Number of videos",
    yLabel: "Sales per video",
    yFormatter: (value) => moneyPer(value, report.currency),
    kind: "Product",
    logX: true,
    toneAccessor: (row) => row.refund_rate >= refundHigh ? "risk" : row.gmv_per_video >= yieldHigh && row.video_count <= videoMedian ? "good" : row.video_count >= videoHigh && row.gmv_per_video <= yieldLow ? "watch" : "blue",
    captions: ["Few videos, high sales", "Many videos, high sales", "Few videos, low sales", "Many videos, low sales"]
  });
  const priorMap = new Map((previousWindow?.top_products || []).map((row) => [String(row.product_id), row]));
  const roster = enriched.slice(0, 24).map((row, index) => {
    const prior = priorMap.get(String(row.product_id));
    const change = prior ? percentChange(row.gmv, prior.gmv) : null;
    const decision = row.refund_rate >= refundHigh ? ["Check quality", "review"] : row.video_count >= 5 && row.gmv_per_video >= yieldHigh && row.video_count <= videoMedian ? ["Make more videos", "scale"] : row.video_count >= videoHigh && row.gmv_per_video <= yieldLow ? ["Make fewer videos", "review"] : ["Keep same", "inspect"];
    return `<tr><td><span class="mo-cell-main" data-sensitive>${escapeHtml(displayEntityName(row.product_name, "Product", index))}</span><span class="mo-cell-sub">Number ${index + 1} by sales</span></td><td>${formatMoney(row.gmv, report.currency)}${change === null ? "" : `<span class="mo-cell-sub">${change >= 0 ? "+" : ""}${formatPercent(change, 1)} from previous 30 days</span>`}</td><td>${formatCompact(row.video_count)}</td><td>${moneyPer(row.gmv_per_video, report.currency)}</td><td>${formatCompact(row.units_sold)}</td><td>${ratioLabel(row.refund_rate)}</td><td><span class="decision-pill is-${decision[1]}">${decision[0]}</span></td></tr>`;
  });
  return `${dashboardIntro(context)}
    <section class="health-section usecase-hero-grid">
      ${renderPanel({ kicker: "Sales by product", title: "Which products make affiliate sales", aside: `${products.length} products shown · everyone else included in total`, body: pareto })}
      ${renderPanel({ kicker: "Next steps", title: "What to do with each product", aside: "Sales, videos, and refunds", body: renderActionRail(actions) })}
    </section>
    <section class="health-section">
      ${renderPanel({ kicker: "Change over time", title: "Product sales over time", aside: "Weekly and monthly views", body: renderWeeklyPulse([
        { label: "Affiliate sales", series: weeklySeries(report, "gmv", window.end_date), formatter: (value) => formatMoney(value, report.currency), tone: "good" },
        { label: "Sales per video", series: weeklySeries(report, "gmv_per_video", window.end_date), formatter: (value) => moneyPer(value, report.currency), tone: "secondary" },
        { label: "Sales from top product", series: windowSeries(report, (row) => safeDivide(row.top_products?.[0]?.gmv, row.summary.gmv, 100), window.end_date), formatter: (value) => formatPercent(value, 1), tone: "watch" },
        { label: "Videos posted", series: weeklySeries(report, "videos_posted", window.end_date), formatter: formatCompact }
      ]) })}
    </section>
    <section class="health-section usecase-secondary-grid">
      ${renderPanel({ kicker: "Product comparison", title: "Number of videos and sales per video", aside: "Larger dots show items sold · red means more refunds", body: matrix })}
      ${renderPanel({ kicker: "Sales and videos", title: "Are videos going to the right products?", aside: "Top products shown", body: renderStageBars(enriched.slice(0, 12).map((row, index) => ({ label: displayEntityName(row.product_name, "Product", index), sensitive: true, value: row.gmv_share, formatted: `${formatPercent(row.gmv_share, 1)} of sales`, note: `${formatPercent(row.video_share, 1)} of videos shown`, tooltip: `${displayEntityName(row.product_name, "Product", index)} · ${formatPercent(row.gmv_share, 1)} of sales and ${formatPercent(row.video_share, 1)} of videos` })), { max: Math.max(...enriched.slice(0, 12).map((row) => row.gmv_share), 1), percent: true }) })}
    </section>
    <section class="health-section">${renderPanel({ kicker: "Products to act on", title: "Make more videos, keep same, or check", aside: `Top ${Math.min(24, products.length)} products shown`, body: renderAnalyticsTable(["Product", "Affiliate sales", "Videos", "Sales per video", "Items sold", "Items refunded (%)", "Action"], roster, { minWidth: 1100 }) })}</section>
    ${dashboardFooter(context, "The charts use the products shown and total affiliate sales. The refund percent is based on items sold. Products may come from different order groups.")}`;
}

function renderUseCaseDashboard(context) {
  const renderer = {
    "creator-growth": renderCreatorGrowth,
    "outreach-performance": renderOutreachPerformance,
    "sample-efficiency": renderSampleEfficiency,
    "content-yield": renderContentYield,
    "creator-portfolio": renderCreatorPortfolio,
    "product-portfolio": renderProductPortfolio
  }[state.dashboardId];
  elements.useCaseView.innerHTML = renderer ? renderer(context) : "";
}

function applyPrivacyMode() {
  document.body.classList.toggle("is-anonymized", state.anonymized);
  elements.privacyToggle.setAttribute("aria-checked", String(state.anonymized));
  elements.privacyBadge.hidden = !state.anonymized;
  updateShopOptions();

  document.querySelectorAll("[data-sensitive]").forEach((node) => {
    if (state.anonymized) node.setAttribute("aria-hidden", "true");
    else node.removeAttribute("aria-hidden");
  });

  if (!state.secureMode) {
    try {
      localStorage.setItem("affiliateHealthMarketingMode", state.anonymized ? "on" : "off");
    } catch {
      // Local persistence is helpful but not required.
    }
  }
}

function applyTheme(theme, { persist = true } = {}) {
  state.theme = theme === "light" ? "light" : "dark";
  const isLight = state.theme === "light";
  document.documentElement.dataset.theme = state.theme;
  elements.themeToggle.setAttribute("aria-pressed", String(isLight));
  elements.themeToggle.setAttribute("aria-label", isLight ? "Use dark mode" : "Use light mode");
  elements.themeToggle.setAttribute("title", isLight ? "Use dark mode" : "Use light mode");
  elements.themeToggleIcon.setAttribute("href", isLight ? "#health-moon" : "#health-sun");
  if (persist) {
    try {
      localStorage.setItem("affiliateHealthTheme", state.theme);
    } catch {
      // Saving the theme is helpful but not required.
    }
  }
}

function cloneReports(reports) {
  if (typeof structuredClone === "function") return structuredClone(reports);
  return JSON.parse(JSON.stringify(reports));
}

function showUnlockDialog() {
  elements.unlockError.hidden = true;
  elements.unlockError.textContent = "";
  elements.unlockPassword.value = "";
  elements.unlockDialog.hidden = false;
  requestAnimationFrame(() => elements.unlockPassword.focus());
}

function hideUnlockDialog() {
  elements.unlockDialog.hidden = true;
  elements.unlockPassword.value = "";
  elements.unlockError.hidden = true;
  elements.unlockError.textContent = "";
}

function relockCustomerData() {
  state.reports = cloneReports(state.sanitizedReports);
  state.anonymized = true;
  state.reportIndex = Math.min(state.reportIndex, state.reports.length - 1);
  state.periodIndex = Math.min(state.periodIndex, state.reports[state.reportIndex].snapshots.length - 1);
  updatePeriodOptions();
  render();
}

async function unlockCustomerData(password) {
  if (state.unlocking) return;
  state.unlocking = true;
  elements.unlockSubmit.disabled = true;
  elements.unlockSubmit.textContent = "Checking password…";
  elements.unlockError.hidden = true;

  try {
    const response = await fetch(unlockDataUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ password })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "That password is not correct.");
    if (!Array.isArray(payload.reports) || !payload.reports.length) throw new Error("We could not load the private report.");

    state.reports = payload.reports;
    state.anonymized = false;
    state.reportIndex = Math.min(state.reportIndex, state.reports.length - 1);
    state.periodIndex = Math.min(state.periodIndex, state.reports[state.reportIndex].snapshots.length - 1);
    hideUnlockDialog();
    updatePeriodOptions();
    render();
  } catch (error) {
    elements.unlockError.textContent = error.message;
    elements.unlockError.hidden = false;
    elements.unlockPassword.select();
  } finally {
    state.unlocking = false;
    elements.unlockSubmit.disabled = false;
    elements.unlockSubmit.textContent = "Show names";
  }
}

let tooltipsBound = false;
let activeTooltipNode = null;

function bindTooltips() {
  if (tooltipsBound) return;
  tooltipsBound = true;

  document.addEventListener("pointerover", (event) => {
    const node = event.target.closest?.("[data-tooltip]");
    if (!node) return;
    activeTooltipNode = node;
    elements.tooltip.textContent = node.dataset.tooltip;
    elements.tooltip.hidden = false;
    moveTooltip(event);
  });

  document.addEventListener("pointermove", (event) => {
    if (activeTooltipNode) moveTooltip(event);
  });

  document.addEventListener("pointerout", (event) => {
    if (!activeTooltipNode) return;
    const next = event.relatedTarget;
    if (next && activeTooltipNode.contains(next)) return;
    activeTooltipNode = null;
    hideTooltip();
  });
}

function moveTooltip(event) {
  const offset = 14;
  const maxX = window.innerWidth - 280;
  const maxY = window.innerHeight - 80;
  elements.tooltip.style.left = `${Math.max(8, Math.min(maxX, event.clientX + offset))}px`;
  elements.tooltip.style.top = `${Math.max(8, Math.min(maxY, event.clientY + offset))}px`;
}

function hideTooltip() {
  elements.tooltip.hidden = true;
}

function render() {
  const context = selectedContext();
  if (!context) return;
  const { report, snapshot } = context;
  const isHealthDashboard = state.dashboardId === "affiliate-health";
  const definition = DASHBOARDS[state.dashboardId] || DASHBOARDS["affiliate-health"];

  document.body.dataset.dashboard = state.dashboardId;
  elements.dashboardSelect.value = state.dashboardId;
  elements.affiliateHealthView.hidden = !isHealthDashboard;
  elements.useCaseView.hidden = isHealthDashboard;
  elements.healthTabs.hidden = !isHealthDashboard;
  elements.reportStatus.textContent = `Data from Reacher · ${formatDateRange(snapshot.start_date, snapshot.end_date)} · updated ${formatDate(report.generated_at.slice(0, 10))}`;
  document.title = `${definition.label} · Reacher`;

  if (isHealthDashboard) {
    elements.methodologyText.textContent = "Each period is 30 days. We compare it with the previous 3 periods.";
    renderHealthKpis(context);
    renderOperatorReadout(context);
    renderScore(context);
    renderPillars(context);
    renderOperatingChain(context);
    renderOpportunities(context);
    renderMetricDiagnostics(context);
    renderEfficiency(context);
    renderConcentration(context);
    renderRecommendations(context);
    renderEvidence(context);
    renderQuality(context);
  } else {
    renderKpiCards(dashboardKpiCards(context));
    renderUseCaseDashboard(context);
  }

  applyPrivacyMode();
  bindTooltips();
}

async function loadReports({ preserveSelection = true } = {}) {
  const previousShopId = preserveSelection ? state.reports[state.reportIndex]?.shop?.shop_id : null;
  elements.refresh.disabled = true;
  elements.reportStatus.textContent = "Loading report…";
  try {
    const response = await fetch(reportDataUrl, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || `Could not load the report (${response.status})`);
    state.reports = payload.reports || [];
    if (!state.reports.length) throw new Error("No reports are available.");
    state.secureMode = state.secureMode || payload.requires_password === true;
    if (state.secureMode) {
      state.sanitizedReports = cloneReports(state.reports);
      state.anonymized = true;
    }
    const preservedIndex = state.reports.findIndex((report) => report.shop.shop_id === previousShopId);
    state.reportIndex = preservedIndex >= 0 ? preservedIndex : 0;
    state.periodIndex = Math.min(state.periodIndex, state.reports[state.reportIndex].snapshots.length - 1);
    updateShopOptions();
    updatePeriodOptions();
    elements.reportStatus.style.removeProperty("color");
    render();
  } catch (error) {
    elements.reportStatus.textContent = error.message;
    elements.reportStatus.style.color = "var(--health-risk)";
    elements.kpiStrip.innerHTML = `<div class="mo-stat"><div class="mo-stat__label">Couldn’t load the report</div><div class="mo-stat__note">${escapeHtml(error.message)}</div></div>`;
  } finally {
    elements.refresh.disabled = false;
  }
}

elements.dashboardSelect.addEventListener("change", () => {
  const nextDashboard = elements.dashboardSelect.value;
  state.dashboardId = DASHBOARDS[nextDashboard] ? nextDashboard : "affiliate-health";
  elements.healthScroll.scrollTop = 0;
  try {
    localStorage.setItem("reacherIntelligenceDashboard", state.dashboardId);
  } catch {
    // Dashboard preference is optional.
  }
  render();
});

elements.shopSelect.addEventListener("change", () => {
  state.reportIndex = Number.parseInt(elements.shopSelect.value, 10) || 0;
  state.periodIndex = 0;
  updatePeriodOptions();
  render();
});

elements.periodSelect.addEventListener("change", () => {
  state.periodIndex = Number.parseInt(elements.periodSelect.value, 10) || 0;
  render();
});

elements.refresh.addEventListener("click", () => refreshSelfServeReport());

elements.themeToggle.addEventListener("click", () => {
  applyTheme(state.theme === "light" ? "dark" : "light");
});

elements.privacyToggle.addEventListener("click", () => {
  if (state.secureMode) {
    if (state.anonymized) showUnlockDialog();
    else relockCustomerData();
    return;
  }
  state.anonymized = !state.anonymized;
  applyPrivacyMode();
});

elements.unlockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  unlockCustomerData(elements.unlockPassword.value);
});

document.querySelectorAll("[data-close-unlock]").forEach((button) => {
  button.addEventListener("click", hideUnlockDialog);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.unlockDialog.hidden) hideUnlockDialog();
});

document.querySelectorAll(".health-tabs .mo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".health-tabs .mo-tab").forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
  });
});

try {
  state.anonymized = false;
  const savedDashboard = localStorage.getItem("reacherIntelligenceDashboard");
  if (savedDashboard && DASHBOARDS[savedDashboard]) state.dashboardId = savedDashboard;
} catch {
  state.anonymized = false;
}

applyTheme(state.theme, { persist: false });



const SELF_SERVE_METRICS = {
  active_creators: {
    pillar: "acquisition",
    label: "Active creators",
    direction: "higher",
    title: "Open the creator funnel",
    recommendation: "Bring in more creators who match the products that already sell."
  },
  new_creators_posting: {
    pillar: "acquisition",
    label: "First-time posters",
    direction: "higher",
    title: "Help new creators post",
    recommendation: "Give new creators one clear product, one simple brief, and a seven-day posting target."
  },
  samples_approved: {
    pillar: "activation",
    label: "Samples shipped",
    direction: "higher",
    title: "Clear the sample queue",
    recommendation: "Review sample requests within 48 hours and ship approved samples in batches."
  },
  sample_requests: {
    pillar: "activation",
    label: "Sample requests",
    direction: "higher",
    title: "Create more sample demand",
    recommendation: "Lead with the strongest product and follow up with good creators who stopped replying."
  },
  gmv_per_video: {
    pillar: "efficiency",
    label: "Sales per video",
    direction: "higher",
    title: "Copy what sells",
    recommendation: "Use the hooks and formats from the videos that made the most sales."
  },
  sale_rate: {
    pillar: "efficiency",
    label: "Videos that made sales",
    direction: "higher",
    title: "Stop repeating videos that do not sell",
    recommendation: "Keep the video ideas that made sales and remove formats that repeatedly made none."
  },
  gmv_per_sample: {
    pillar: "efficiency",
    label: "Sales per shipped sample",
    direction: "higher",
    title: "Send samples to proven creators",
    recommendation: "Give sample priority to creators who have sold a similar product before."
  },
  content_velocity: {
    pillar: "retention",
    label: "Videos per creator",
    direction: "higher",
    title: "Get the second video",
    recommendation: "Ask creators who posted once to make a second video with the same proven product."
  },
  top_sku_share: {
    pillar: "concentration",
    label: "Sales from the top product",
    direction: "lower",
    title: "Give two more products a chance",
    recommendation: "Move some briefs and samples from the top product to the next two best products."
  },
  top10_creator_share: {
    pillar: "concentration",
    label: "Sales from the top 10 creators",
    direction: "lower",
    title: "Grow the group of creators who sell",
    recommendation: "Find more creators like the best sellers and help mid-level creators post again."
  }
};

const SELF_SERVE_PILLARS = ["acquisition", "activation", "efficiency", "retention", "concentration"];
const SELF_SERVE_WEIGHTS = {
  acquisition: 0.2,
  activation: 0.25,
  efficiency: 0.2,
  retention: 0.2,
  concentration: 0.15
};

const selfServeRuntime = {
  apiKey: "",
  shops: [],
  shop: null,
  lastRequestStarted: 0,
  completedCalls: 0,
  plannedCalls: 41,
  building: false,
  requestIntervalMs: (() => {
    const configured = Number(document.documentElement.dataset.requestInterval);
    return Number.isFinite(configured) && configured >= 0 ? configured : 1050;
  })()
};

const selfServeElements = {
  changeAccount: document.querySelector("#changeAccount"),
  dialog: document.querySelector("#setupDialog"),
  close: document.querySelector("#setupClose"),
  keyForm: document.querySelector("#apiKeyForm"),
  apiKey: document.querySelector("#apiKeyInput"),
  connect: document.querySelector("#connectApiKey"),
  shopForm: document.querySelector("#shopForm"),
  shopSelect: document.querySelector("#setupShopSelect"),
  back: document.querySelector("#setupBack"),
  build: document.querySelector("#buildDashboard"),
  keyStep: document.querySelector("#setupKeyStep"),
  shopStep: document.querySelector("#setupShopStep"),
  progressStep: document.querySelector("#setupProgressStep"),
  progressText: document.querySelector("#setupProgressText"),
  progressCount: document.querySelector("#setupProgressCount"),
  progressBar: document.querySelector("#setupProgressBar"),
  error: document.querySelector("#setupError")
};

function selfServeWait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function selfServeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function selfServeDivide(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function selfServeMean(values) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function selfServeClamp(value, lower = 0, upper = 100) {
  return Math.max(lower, Math.min(upper, value));
}

function selfServeDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function selfServeIsoDate(value) {
  return value.toISOString().slice(0, 10);
}

function selfServeAddDays(value, days) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function selfServeWindow(endDate, index, days = 30) {
  const end = selfServeAddDays(endDate, -days * index);
  const start = selfServeAddDays(end, -(days - 1));
  return { start_date: selfServeIsoDate(start), end_date: selfServeIsoDate(end) };
}

function selfServeRows(payload) {
  return Array.isArray(payload?.data) ? payload.data : [];
}

function selfServeErrorMessage(status, payload) {
  if (status === 401) return "That API key was not accepted. Check it and try again.";
  if (status === 403) return "This API key cannot open that shop.";
  if (status === 429) return "Reacher is handling too many requests. Wait a moment and try again.";
  const message = payload?.error || payload?.detail || "Could not load data from Reacher.";
  return String(message).replace(/rk_live_[A-Za-z0-9_-]+/g, "[hidden key]");
}

async function selfServeProxyCall(method, path, shopId = null, body = null, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const waitFor = selfServeRuntime.requestIntervalMs - (Date.now() - selfServeRuntime.lastRequestStarted);
    if (waitFor > 0) await selfServeWait(waitFor);
    selfServeRuntime.lastRequestStarted = Date.now();

    const response = await fetch("/api/reacher", {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        apiKey: selfServeRuntime.apiKey,
        shopId,
        method,
        path,
        body
      })
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
    if (response.ok) return payload;
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === attempts - 1) {
      throw new Error(selfServeErrorMessage(response.status, payload));
    }
    await selfServeWait(Math.min(8000, 1000 * (2 ** attempt)));
  }
  throw new Error("Could not load data from Reacher.");
}

function selfServeUpdateProgress(message) {
  selfServeRuntime.completedCalls += 1;
  const percent = Math.min(100, Math.round((selfServeRuntime.completedCalls / selfServeRuntime.plannedCalls) * 100));
  selfServeElements.progressText.textContent = message;
  selfServeElements.progressCount.textContent = `${percent}%`;
  selfServeElements.progressBar.style.width = `${percent}%`;
}

async function selfServeCall(method, path, shopId, body, message) {
  const payload = await selfServeProxyCall(method, path, shopId, body);
  selfServeUpdateProgress(message);
  return payload;
}

async function selfServeOptionalCall(method, path, shopId, body, message) {
  try {
    return await selfServeCall(method, path, shopId, body, message);
  } catch (error) {
    selfServeUpdateProgress(message);
    return { error: error.message };
  }
}

function selfServeShowError(message) {
  selfServeElements.error.textContent = message;
  selfServeElements.error.hidden = false;
}

function selfServeClearError() {
  selfServeElements.error.textContent = "";
  selfServeElements.error.hidden = true;
}

function selfServeShowStep(step) {
  selfServeElements.keyStep.hidden = step !== "key";
  selfServeElements.shopStep.hidden = step !== "shop";
  selfServeElements.progressStep.hidden = step !== "progress";
}

function selfServeOpenDialog({ reset = false } = {}) {
  if (reset) {
    selfServeElements.apiKey.value = "";
    selfServeElements.shopSelect.innerHTML = "";
    selfServeShowStep("key");
  }
  selfServeClearError();
  selfServeElements.close.hidden = !state.reports.length;
  selfServeElements.dialog.hidden = false;
  if (!state.reports.length) document.body.classList.add("is-setup-required");
  window.setTimeout(() => {
    const target = selfServeElements.keyStep.hidden ? selfServeElements.shopSelect : selfServeElements.apiKey;
    target?.focus();
  }, 0);
}

function selfServeCloseDialog() {
  if (!state.reports.length || selfServeRuntime.building) return;
  selfServeElements.dialog.hidden = true;
  document.body.classList.remove("is-setup-required");
}

function selfServeSetBusy(isBusy) {
  selfServeRuntime.building = isBusy;
  selfServeElements.connect.disabled = isBusy;
  selfServeElements.build.disabled = isBusy;
  elements.refresh.disabled = isBusy || !selfServeRuntime.shop;
  selfServeElements.close.hidden = isBusy || !state.reports.length;
}

async function selfServeReadShops(apiKey) {
  const oldKey = selfServeRuntime.apiKey;
  selfServeRuntime.apiKey = apiKey;
  try {
    const payload = await selfServeProxyCall("GET", "/shops");
    const shops = selfServeRows(payload);
    if (!shops.length) throw new Error("This API key has no shops to show.");
    return shops;
  } catch (error) {
    selfServeRuntime.apiKey = oldKey;
    throw error;
  }
}

function selfServeFillShopOptions(shops) {
  selfServeElements.shopSelect.innerHTML = shops.map((shop, index) => {
    const name = escapeHtml(shop.shop_name || `Shop ${index + 1}`);
    const region = shop.region ? ` · ${escapeHtml(shop.region)}` : "";
    return `<option value="${index}">${name}${region}</option>`;
  }).join("");
}

async function selfServeConnect(event) {
  event.preventDefault();
  selfServeClearError();
  const apiKey = selfServeElements.apiKey.value.trim();
  if (!/^rk_live_[A-Za-z0-9_-]{12,}$/.test(apiKey)) {
    selfServeShowError("Paste a valid Reacher API key. It should start with rk_live_.");
    return;
  }

  selfServeElements.connect.disabled = true;
  selfServeElements.connect.textContent = "Checking…";
  try {
    const shops = await selfServeReadShops(apiKey);
    selfServeRuntime.apiKey = apiKey;
    selfServeRuntime.shops = shops;
    selfServeFillShopOptions(shops);
    selfServeShowStep("shop");
    if (shops.length === 1) await selfServeBuildSelectedShop();
  } catch (error) {
    selfServeShowError(error.message);
  } finally {
    selfServeElements.connect.disabled = false;
    selfServeElements.connect.textContent = "Continue";
  }
}

async function selfServeCollectWindow(shopId, startDate, endDate, windowNumber) {
  const dateBody = { start_date: startDate, end_date: endDate };
  const summary = await selfServeCall(
    "POST",
    "/metrics/summary",
    shopId,
    dateBody,
    `Reading report period ${windowNumber} of 7…`
  );
  const creators = await selfServeCall(
    "POST",
    "/creators/performance",
    shopId,
    { ...dateBody, page: 1, page_size: 100, sort_by: "gmv", sort_dir: "desc" },
    `Reading creators for period ${windowNumber} of 7…`
  );
  const products = await selfServeCall(
    "POST",
    "/products/list",
    shopId,
    { ...dateBody, page: 1, page_size: 100, sort_by: "gmv", sort_dir: "desc" },
    `Reading products for period ${windowNumber} of 7…`
  );

  const affiliateSales = selfServeNumber(summary.gmv);
  const videosPosted = selfServeNumber(summary.videos_posted);
  const activeCreators = selfServeNumber(summary.active_creators);
  const creatorRows = selfServeRows(creators);
  const productRows = selfServeRows(products);
  const top10CreatorSales = creatorRows.slice(0, 10).reduce((total, row) => total + selfServeNumber(row.gmv), 0);
  const topProductSales = productRows.length ? selfServeNumber(productRows[0].gmv) : 0;

  return {
    start_date: startDate,
    end_date: endDate,
    summary,
    metrics: {
      active_creators: activeCreators,
      new_creators_posting: selfServeNumber(summary.new_creators_posting),
      samples_approved: selfServeNumber(summary.samples_approved),
      sample_requests: selfServeNumber(summary.sample_requests),
      gmv_per_video: selfServeNumber(summary.gmv_per_video),
      sale_rate: 100 * selfServeDivide(selfServeNumber(summary.gmv_driving_videos), videosPosted),
      gmv_per_sample: selfServeNumber(summary.gmv_per_sample),
      content_velocity: selfServeDivide(videosPosted, activeCreators),
      top_sku_share: 100 * selfServeDivide(topProductSales, affiliateSales),
      top10_creator_share: 100 * selfServeDivide(top10CreatorSales, affiliateSales)
    },
    top_creators: creatorRows,
    top_products: productRows,
    creator_pagination: creators.pagination || null,
    product_pagination: products.pagination || null,
    concentration_evidence: {
      top10_creator_gmv: top10CreatorSales,
      top_sku_gmv: topProductSales,
      affiliate_gmv_denominator: affiliateSales
    }
  };
}

async function selfServeEnrichWindow(shopId, window, number) {
  const dateBody = { start_date: window.start_date, end_date: window.end_date };
  window.creator_levels = await selfServeOptionalCall(
    "GET",
    `/creators/levels?start_date=${window.start_date}&end_date=${window.end_date}`,
    shopId,
    null,
    `Adding creator detail for report period ${number} of 4…`
  );
  window.sample_products = await selfServeOptionalCall(
    "POST",
    "/samples/by-product",
    shopId,
    { ...dateBody, page: 1, page_size: 100, sort_by: "sample_gmv", sort_dir: "desc" },
    `Adding sample detail for report period ${number} of 4…`
  );
  window.automations = await selfServeOptionalCall(
    "POST",
    "/automations/list",
    shopId,
    { ...dateBody, page: 1, page_size: 100, sort_by: "gmv", sort_dir: "desc" },
    `Adding message detail for report period ${number} of 4…`
  );
  window.top_videos = await selfServeOptionalCall(
    "POST",
    "/videos/creative",
    shopId,
    { ...dateBody, limit: 25, sort_by: "video_gmv", sort_dir: "desc" },
    `Adding video detail for report period ${number} of 4…`
  );
}

function selfServeCompactFunnel(payload) {
  if (payload?.error) return payload;
  return {
    shop_id: payload.shop_id,
    total_creators: payload.total_creators,
    stages: (payload.stages || []).map((stage) => ({
      stage_id: stage.stage_id,
      title: stage.title,
      description: stage.description,
      creator_count: stage.creator_count,
      percentage_of_funnel: stage.percentage_of_funnel,
      insights: {
        total_creators: stage.insights?.total_creators,
        total_in_stage: stage.insights?.total_in_stage,
        advanced_to_next_percentage: stage.insights?.advanced_to_next_percentage,
        median_time_in_status_days: stage.insights?.median_time_in_status_days
      }
    })),
    timestamp: payload.timestamp,
    window: "fixed_last_90_days"
  };
}

async function selfServeCollectIntelligence(shopId, windows) {
  for (let index = 0; index < 4; index += 1) {
    await selfServeEnrichWindow(shopId, windows[index], index + 1);
  }

  const weeklyTimeseries = await selfServeOptionalCall(
    "POST",
    "/metrics/timeseries",
    shopId,
    {
      metrics: [
        "gmv",
        "total_gmv",
        "creators",
        "videos_posted",
        "video_views",
        "gmv_per_video",
        "gmv_per_sample",
        "creators_reached",
        "creators_messaged",
        "tc_invites_sent",
        "samples_approved",
        "sample_requests",
        "gmv_driving_videos",
        "new_creators_posting",
        "open_collabs",
        "accepted_tc_count",
        "emails_sent",
        "dm_responses",
        "reply_rate"
      ],
      start_date: windows[windows.length - 1].start_date,
      end_date: windows[0].end_date,
      granularity: "week"
    },
    "Adding the weekly trend…"
  );
  const funnel = await selfServeOptionalCall("GET", "/funnel", shopId, null, "Adding the creator journey…");

  return {
    weekly_timeseries: weeklyTimeseries,
    funnel_90d: selfServeCompactFunnel(funnel),
    creative_videos: windows[0].top_videos,
    coverage: {
      weekly_start_date: windows[windows.length - 1].start_date,
      weekly_end_date: windows[0].end_date,
      enriched_window_count: 4,
      creator_rows_per_window_limit: 100,
      product_rows_per_window_limit: 100,
      sample_product_rows_per_window_limit: 100,
      video_rows_per_enriched_window_limit: 25,
      automation_rows_per_enriched_window_limit: 100
    }
  };
}

function selfServeScoreRatio(current, baseline, direction) {
  let ratio = 0;
  if (direction === "lower") {
    if (current <= 0 && baseline <= 0) ratio = 1;
    else if (current <= 0) ratio = 2;
    else if (baseline <= 0) ratio = 0;
    else ratio = baseline / current;
  } else if (current <= 0 && baseline <= 0) {
    ratio = 0;
  } else if (baseline <= 0) {
    ratio = 2;
  } else {
    ratio = current / baseline;
  }
  return { score: selfServeClamp((ratio - 0.5) * 140), ratio };
}

function selfServeHealthLabel(overall, pillars) {
  if (Math.min(...Object.values(pillars)) < 40) return "AT RISK";
  if (overall >= 70) return "HEALTHY";
  if (overall >= 55) return "WATCH";
  return "AT RISK";
}

function selfServeScoreWindow(windows, index) {
  const current = windows[index];
  const baselineWindows = windows.slice(index + 1, index + 4);
  if (baselineWindows.length < 3) throw new Error("Not enough past data to score this report period.");

  const metrics = {};
  Object.entries(SELF_SERVE_METRICS).forEach(([key, definition]) => {
    const value = selfServeNumber(current.metrics[key]);
    const baseline = selfServeMean(baselineWindows.map((window) => selfServeNumber(window.metrics[key])));
    const scored = selfServeScoreRatio(value, baseline, definition.direction);
    metrics[key] = {
      value,
      baseline,
      ratio: scored.ratio,
      score: scored.score,
      pillar: definition.pillar,
      label: definition.label,
      direction: definition.direction
    };
  });

  const pillars = {};
  SELF_SERVE_PILLARS.forEach((pillar) => {
    pillars[pillar] = selfServeMean(
      Object.values(metrics).filter((metric) => metric.pillar === pillar).map((metric) => metric.score)
    );
  });
  const overall = SELF_SERVE_PILLARS.reduce(
    (total, pillar) => total + pillars[pillar] * SELF_SERVE_WEIGHTS[pillar],
    0
  );
  const recommendations = Object.entries(metrics).map(([key, metric]) => {
    const definition = SELF_SERVE_METRICS[key];
    const count = Object.values(SELF_SERVE_METRICS).filter((item) => item.pillar === definition.pillar).length;
    return {
      metric: key,
      pillar: definition.pillar,
      title: definition.title,
      recommendation: definition.recommendation,
      impact_points: (100 - metric.score) * SELF_SERVE_WEIGHTS[definition.pillar] / count,
      current_score: metric.score
    };
  }).sort((left, right) => right.impact_points - left.impact_points);

  return {
    start_date: current.start_date,
    end_date: current.end_date,
    metrics,
    pillars,
    overall_score: overall,
    health_label: selfServeHealthLabel(overall, pillars),
    recommendations
  };
}

function selfServeBuildModel(shop, windows, intelligence) {
  const snapshots = [0, 1, 2, 3].map((index) => selfServeScoreWindow(windows, index));
  const current = snapshots[0];
  const previous = snapshots[1];
  const summary = windows[0].summary;
  const priorSummary = windows[1].summary;
  const headline = {
    affiliate_gmv: selfServeNumber(summary.gmv),
    total_gmv: selfServeNumber(summary.total_gmv),
    samples_approved: selfServeNumber(summary.samples_approved),
    first_time_posters: selfServeNumber(summary.new_creators_posting),
    videos_posted: selfServeNumber(summary.videos_posted),
    active_creators: selfServeNumber(summary.active_creators),
    video_views: selfServeNumber(summary.video_views),
    gmv_driving_videos: selfServeNumber(summary.gmv_driving_videos)
  };
  const trend = (now, prior) => {
    const previousValue = selfServeNumber(prior);
    return 100 * selfServeDivide(selfServeNumber(now) - previousValue, previousValue);
  };

  return {
    generated_at: new Date().toISOString(),
    methodology_version: "reacher-affiliate-health-v1",
    shop,
    currency: summary.currency || shop.currency || "USD",
    current,
    score_trend_percent: 100 * selfServeDivide(
      current.overall_score - previous.overall_score,
      previous.overall_score
    ),
    snapshots,
    headline,
    headline_trends: {
      affiliate_gmv: trend(summary.gmv, priorSummary.gmv),
      samples_approved: trend(summary.samples_approved, priorSummary.samples_approved),
      first_time_posters: trend(summary.new_creators_posting, priorSummary.new_creators_posting),
      videos_posted: trend(summary.videos_posted, priorSummary.videos_posted)
    },
    top_creators: windows[0].top_creators,
    top_products: windows[0].top_products,
    windows,
    intelligence,
    scoring: {
      pillar_weights: SELF_SERVE_WEIGHTS,
      curve: "clamp((performance_ratio - 0.50) * 140, 0, 100)",
      positive_ratio: "current / average(previous three 30-day windows)",
      concentration_ratio: "average(previous three 30-day shares) / current share",
      overall: "weighted sum of pillar scores",
      floor_rule: "Any pillar below 40 forces the overall label to AT RISK",
      optimization_impact: "(100 - metric score) * pillar weight / metrics in pillar"
    },
    limitations: [
      "This is a transparent Reacher reconstruction, not another company's private scoring model.",
      "Approved samples are used as the closest available measure for shipped samples.",
      "Creator and sales numbers use the definitions in the Reacher Data API.",
      "Product and creator share use affiliate sales as the total."
    ]
  };
}

async function selfServeGenerateReport(shop) {
  selfServeRuntime.completedCalls = 0;
  selfServeRuntime.lastRequestStarted = 0;
  selfServeElements.progressBar.style.width = "0%";
  selfServeElements.progressCount.textContent = "0%";
  selfServeElements.progressText.textContent = "Finding the latest complete date…";

  const shopId = String(shop.shop_id);
  const discovery = await selfServeCall(
    "POST",
    "/metrics/summary",
    shopId,
    {},
    "Found the latest complete date."
  );
  if (!discovery.end_date || !/^\d{4}-\d{2}-\d{2}$/.test(discovery.end_date)) {
    throw new Error("Reacher did not return a complete report date for this shop.");
  }

  const settledEnd = selfServeDate(discovery.end_date);
  const windows = [];
  for (let index = 0; index < 7; index += 1) {
    const dates = selfServeWindow(settledEnd, index);
    windows.push(await selfServeCollectWindow(shopId, dates.start_date, dates.end_date, index + 1));
  }
  const intelligence = await selfServeCollectIntelligence(shopId, windows);
  selfServeUpdateProgress("Building your dashboard…");
  return selfServeBuildModel(shop, windows, intelligence);
}

async function selfServeBuildSelectedShop(event) {
  event?.preventDefault();
  if (selfServeRuntime.building) return;
  selfServeClearError();
  const shopIndex = Number.parseInt(selfServeElements.shopSelect.value, 10) || 0;
  const shop = selfServeRuntime.shops[shopIndex];
  if (!shop) {
    selfServeShowError("Choose a shop first.");
    return;
  }

  selfServeRuntime.shop = shop;
  selfServeShowStep("progress");
  selfServeSetBusy(true);
  document.body.classList.add("is-setup-required");
  try {
    const report = await selfServeGenerateReport(shop);
    state.reports = [report];
    state.sanitizedReports = [];
    state.reportIndex = 0;
    state.periodIndex = 0;
    state.secureMode = false;
    state.anonymized = false;
    updateShopOptions();
    updatePeriodOptions();
    render();
    selfServeElements.apiKey.value = "";
    selfServeElements.progressBar.style.width = "100%";
    selfServeElements.progressCount.textContent = "100%";
    selfServeElements.progressText.textContent = "Your dashboard is ready.";
    await selfServeWait(250);
    selfServeElements.dialog.hidden = true;
    document.body.classList.remove("is-setup-required");
    selfServeElements.changeAccount.hidden = false;
  } catch (error) {
    selfServeShowError(error.message);
    selfServeShowStep("shop");
  } finally {
    selfServeSetBusy(false);
  }
}

async function refreshSelfServeReport() {
  if (!selfServeRuntime.apiKey || !selfServeRuntime.shop) {
    selfServeOpenDialog({ reset: true });
    return;
  }
  selfServeOpenDialog();
  selfServeShowStep("progress");
  await selfServeBuildSelectedShop();
}

function initSelfServeDashboard() {
  state.anonymized = false;
  state.secureMode = false;
  elements.refresh.disabled = true;
  elements.reportStatus.textContent = "Connect your Reacher account to build this dashboard.";
  elements.kpiStrip.innerHTML = "";
  document.body.classList.add("is-setup-required");
  selfServeOpenDialog({ reset: true });
}

selfServeElements.keyForm.addEventListener("submit", selfServeConnect);
selfServeElements.shopForm.addEventListener("submit", selfServeBuildSelectedShop);
selfServeElements.back.addEventListener("click", () => {
  selfServeShowStep("key");
  selfServeClearError();
  selfServeElements.apiKey.focus();
});
selfServeElements.changeAccount.addEventListener("click", () => selfServeOpenDialog({ reset: true }));
selfServeElements.close.addEventListener("click", selfServeCloseDialog);
selfServeElements.dialog.querySelector(".setup-backdrop").addEventListener("click", selfServeCloseDialog);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !selfServeElements.dialog.hidden) selfServeCloseDialog();
});

window.addEventListener("beforeunload", () => {
  selfServeRuntime.apiKey = "";
  selfServeElements.apiKey.value = "";
});

initSelfServeDashboard();
