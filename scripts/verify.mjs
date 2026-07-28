import { readFile, readdir, lstat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "index.html",
  "affiliate-health.js",
  "affiliate-health.css",
  "affiliate-health-self-serve.css",
  "monaco-system.css",
  "api/reacher.js",
  "vercel.json",
  "skills/reacher-affiliate-intelligence/SKILL.md",
  "skills/reacher-affiliate-intelligence/references/scoring.md",
  "skills/reacher-affiliate-intelligence/references/security.md"
];

async function exists(relativePath) {
  try {
    await lstat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

for (const file of requiredFiles) {
  if (!(await exists(file))) failures.push(`Missing required file: ${file}`);
}

for (const file of ["affiliate-health.js", "api/reacher.js", "scripts/verify.mjs"]) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    failures.push(`JavaScript syntax check failed for ${file}: ${result.stderr.trim()}`);
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", ".vercel", "node_modules"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".txt", ".yaml", ".yml"]);
for (const file of await walk(root)) {
  if (!textExtensions.has(path.extname(file))) continue;
  const content = await readFile(file, "utf8");
  const embeddedKeys = content.match(/rk_live_[A-Za-z0-9_-]{20,}/g) || [];
  if (embeddedKeys.length) {
    failures.push(`Possible live Reacher API key in ${path.relative(root, file)}`);
  }
}

const index = await readFile(path.join(root, "index.html"), "utf8");
if (!index.includes('id="setupDialog"')) failures.push("The API-key setup window is missing.");
if (!index.includes('href="https://portal.reacherapp.com/api"')) failures.push("The API-key help link is missing.");
if (index.includes("affiliate-health-data.json")) failures.push("A bundled customer report is referenced.");

const client = await readFile(path.join(root, "affiliate-health.js"), "utf8");
for (const unsafeStorage of [
  /localStorage\.setItem\([^)]*apiKey/i,
  /sessionStorage\.setItem\([^)]*apiKey/i,
  /document\.cookie[^;\n]*apiKey/i
]) {
  if (unsafeStorage.test(client)) failures.push("The client appears to save the Reacher API key.");
}

const proxy = await readFile(path.join(root, "api/reacher.js"), "utf8");
for (const route of [
  "GET /shops",
  "POST /metrics/summary",
  "POST /metrics/timeseries",
  "POST /creators/performance",
  "GET /creators/levels",
  "POST /products/list",
  "POST /samples/by-product",
  "POST /automations/list",
  "POST /videos/creative",
  "GET /funnel"
]) {
  if (!proxy.includes(`"${route}"`)) failures.push(`Proxy allowlist is missing ${route}`);
}
if (!proxy.includes("if (!allowedQuery)")) failures.push("Proxy route allowlist enforcement is missing.");
if (!proxy.includes('"cache-control", "no-store')) failures.push("Proxy no-store response header is missing.");

if (failures.length) {
  console.error(`Verification failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Verification passed: structure, syntax, API-key handling, and proxy allowlist look safe.");
