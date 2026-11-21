// Pre-publish checker. Run it before every publish, after `node tools/build-pages.mjs`:
//   node tools/check-site.mjs
// It reads the site and reports problems; it never changes a file. Exit code 1 means something must be fixed.
//
// Checks:
//   1. Report data in assets/js/reports.js is complete and consistent.
//   2. Every local link, image, script and PDF referenced by a page exists.
//   3. Built files (report pages, feed, sitemap, tear sheets) are up to date with the sources.
//   4. Every page loads the same version (?v=) of each shared script and stylesheet.
//   5. Tear sheets: text matches the report PDF word for word, the PDF is one page and current
//      (runs tools/check-tearsheets.py; needs Python with pypdf).

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const exists = (f) => existsSync(join(ROOT, f));

const problems = [];
const warnings = [];
const passed = [];
const fail = (msg) => problems.push(msg);
const warn = (msg) => warnings.push(msg);

/* ---------- 1. Report data ---------- */

const RATINGS = ["Buy", "Accumulate", "Hold", "Sell", "Not Rated"];
const SECTORS = ["marine", "energy", "sustainability"];

function loadReports() {
  const sandbox = { window: {} };
  runInNewContext(read("assets/js/reports.js"), sandbox);
  return sandbox.window.PELAGIC_REPORTS || [];
}

function checkReports(reports) {
  const before = problems.length;
  const ids = new Set();
  for (const r of reports) {
    const where = `report "${r.id || "(no id)"}"`;
    if (!/^[a-z0-9-]+$/.test(r.id || "")) fail(`${where}: id must be lowercase letters, digits and hyphens`);
    if (ids.has(r.id)) fail(`${where}: id is used twice`);
    ids.add(r.id);
    for (const field of ["title", "company", "ticker", "summary"]) {
      if (!String(r[field] || "").trim()) fail(`${where}: "${field}" is empty`);
    }
    if (!SECTORS.includes(r.sector)) fail(`${where}: sector "${r.sector}" should be one of ${SECTORS.join(", ")}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date || "") || Number.isNaN(Date.parse(r.date))) fail(`${where}: date "${r.date}" should look like 2026-11-13`);
    if (!RATINGS.includes(r.rating)) fail(`${where}: rating "${r.rating}" should be one of ${RATINGS.join(", ")}`);
    if (r.pdf && !exists(r.pdf)) fail(`${where}: PDF ${r.pdf} is missing`);
    if (!r.pdf) warn(`${where}: no PDF yet`);
    if (r.image && !exists(r.image)) fail(`${where}: photo ${r.image} is missing`);
    if (r.pitch && r.pitch.pdf && !exists(r.pitch.pdf)) fail(`${where}: pitch deck ${r.pitch.pdf} is missing`);
    if (r.rating !== "Not Rated") {
      if (!(r.price > 0) || !(r.target > 0)) fail(`${where}: needs a price and a target`);
      else {
        const computed = Math.round((r.target / r.price - 1) * 1000) / 10;
        if (typeof r.upside === "number" && Math.abs(r.upside - computed) > 0.15) {
          fail(`${where}: upside ${r.upside}% doesn't match price $${r.price} and target $${r.target} (that's ${computed.toFixed(1)}%)`);
        }
        if (r.bear > 0 && r.bull > 0 && !(r.bear <= r.target && r.target <= r.bull)) fail(`${where}: target should sit between bear and bull`);
      }
    }
  }
  if (problems.length === before) passed.push(`Report data: ${reports.length} reports complete and consistent`);
}

/* ---------- 2. Links and files ---------- */

const pages = readdirSync(ROOT).filter((f) => f.endsWith(".html"));

function localTarget(url) {
  if (!url || /^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(url)) return null;
  const path = url.replace(/[?#].*$/, "").replace(/^\//, "");
  return path ? decodeURI(path) : null;
}

function checkLinks() {
  const before = problems.length;
  let count = 0;
  for (const page of pages) {
    const html = read(page);
    for (const m of html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)) {
      const urls = m[0].includes("srcset") ? m[1].split(",").map((s) => s.trim().split(/\s+/)[0]) : [m[1]];
      for (const url of urls) {
        if (url.includes("${")) continue; // template text inside an inline script
        const target = localTarget(url);
        if (!target) continue;
        count += 1;
        if (!exists(target)) fail(`${page}: links to ${target}, which doesn't exist`);
      }
    }
  }
  if (problems.length === before) passed.push(`Links and files: all ${count} local links across ${pages.length} pages exist`);
}

/* ---------- 3. Built files are current ---------- */

function assetList(html) {
  return [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="(assets\/[^"]+)"/g)].map((m) => m[1]).sort().join("\n");
}

function checkBuilt(reports) {
  const before = problems.length;
  const template = read("report.html");
  const feed = exists("feed.xml") ? read("feed.xml") : "";
  const sitemap = exists("sitemap.xml") ? read("sitemap.xml") : "";
  if (!feed) fail("feed.xml is missing: run node tools/build-pages.mjs");
  if (!sitemap) fail("sitemap.xml is missing: run node tools/build-pages.mjs");
  const sheets = exists("tools/tearsheets.json") ? JSON.parse(read("tools/tearsheets.json")) : {};
  const rebuild = new Set();
  for (const r of reports) {
    const file = `report-${r.id}.html`;
    if (!exists(file)) { rebuild.add(`${file} doesn't exist`); continue; }
    const built = read(file);
    const escTitle = r.title.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (!built.includes(`data-report="${r.id}"`) || !built.includes(`<meta property="og:title" content="${escTitle}">`)) rebuild.add(`${file} has an old title`);
    if (assetList(built) !== assetList(template)) rebuild.add(`${file} loads different scripts or styles than report.html`);
    if (feed && !feed.includes(`/${file}</link>`)) rebuild.add(`feed.xml is missing ${r.id}`);
    if (sitemap && !sitemap.includes(`/${file}</loc>`)) rebuild.add(`sitemap.xml is missing ${r.id}`);
    if (!r.tearsheet) continue;
    const t = sheets[r.id];
    if (!t) { fail(`report "${r.id}" has tearsheet: true but no entry in tools/tearsheets.json`); continue; }
    if (!exists(`reports/${r.id}-tearsheet.pdf`)) rebuild.add(`reports/${r.id}-tearsheet.pdf doesn't exist`);
    const html = exists(`tearsheet-${r.id}.html`) ? read(`tearsheet-${r.id}.html`) : "";
    if (!html.includes(t.intro.slice(0, 60).replace(/&/g, "&amp;"))) rebuild.add(`tearsheet-${r.id}.html is out of date`);
    const data = Object.fromEntries(t.keyData);
    if (data.Rating && data.Rating !== r.rating) fail(`tear sheet ${r.id}: rating "${data.Rating}" differs from the site's "${r.rating}"`);
    const target = data["12-month target"] && Number(data["12-month target"].replace(/[^0-9.]/g, ""));
    if (target && target !== r.target) fail(`tear sheet ${r.id}: target ${data["12-month target"]} differs from the site's $${r.target}`);
  }
  for (const msg of rebuild) fail(`${msg}: run node tools/build-pages.mjs`);
  if (problems.length === before) passed.push("Built files: report pages, feed, sitemap and tear sheets are up to date");
}

/* ---------- 4. Same asset versions everywhere ---------- */

function checkVersions() {
  const versions = new Map(); // asset -> Map(version -> [pages])
  for (const page of pages) {
    for (const m of read(page).matchAll(/(assets\/[^"?]+)\?v=([0-9a-z]+)/g)) {
      const [, asset, v] = m;
      if (!versions.has(asset)) versions.set(asset, new Map());
      const byV = versions.get(asset);
      byV.set(v, [...(byV.get(v) || []), page]);
    }
  }
  let mixed = 0;
  for (const [asset, byV] of versions) {
    if (byV.size < 2) continue;
    mixed += 1;
    const newest = [...byV.keys()].sort().pop();
    const stale = [...byV].filter(([v]) => v !== newest).flatMap(([, ps]) => ps);
    warn(`${asset}: ${[...new Set(stale)].join(", ")} still load an older ?v= than ${newest}, so those pages may show a cached old copy`);
  }
  if (!mixed) passed.push(`Versions: every page loads the same version of all ${versions.size} shared files`);
}

/* ---------- 5. Tear sheets match the reports ---------- */

function checkTearsheets() {
  for (const python of ["python", "python3", "py"]) {
    const run = spawnSync(python, [join(ROOT, "tools", "check-tearsheets.py")], { encoding: "utf8", env: { ...process.env, PYTHONIOENCODING: "utf8" } });
    if (run.error) continue;
    const lines = (run.stdout || "").trim().split("\n").filter(Boolean);
    for (const line of lines) {
      if (line.startsWith("FAIL ")) fail(line.slice(5));
      else if (line.startsWith("WARN ")) warn(line.slice(5));
      else if (line.startsWith("OK ")) passed.push(line.slice(3));
    }
    if (run.status !== 0 && !lines.some((l) => l.startsWith("FAIL "))) fail(`tools/check-tearsheets.py crashed:\n${run.stderr}`);
    return;
  }
  warn("Python was not found, so tear-sheet text wasn't checked against the reports");
}

/* ---------- run ---------- */

const reports = loadReports();
checkReports(reports);
checkLinks();
checkBuilt(reports);
checkVersions();
checkTearsheets();

for (const p of passed) console.log(`  ✓ ${p}`);
for (const w of warnings) console.log(`  ! ${w}`);
for (const p of problems) console.log(`  ✗ ${p}`);
console.log(problems.length
  ? `\n${problems.length} problem${problems.length > 1 ? "s" : ""} to fix before publishing.`
  : `\nReady to publish${warnings.length ? ` (${warnings.length} note${warnings.length > 1 ? "s" : ""} above)` : ""}.`);
process.exit(problems.length ? 1 : 0);
