// Builds the pages that need to exist as real files rather than being drawn by JavaScript:
//   report-<id>.html  one page per report, so link previews (LinkedIn, iMessage, Slack) and
//                     search engines see that report's title and summary
//   sitemap.xml       every page, for search engines
//   robots.txt        points crawlers at the sitemap
//   404.html          a site-styled "not found" page
//   assets/img/cards/<id>.png  each report's link-preview image (drawn by tools/build-cards.py)
//
// Run it after adding or editing a report in assets/js/reports.js, then commit the output:
//   node tools/build-pages.mjs

import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { runInNewContext } from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://pelagicresearch.org";
const STATIC_PAGES = ["index.html", "research.html", "about.html", "about-me.html", "write.html", "contact.html"];
const CURRENCY = { USD: "$", EUR: "€", GBP: "£", NOK: "NOK " };

const read = (file) => readFileSync(join(ROOT, file), "utf8");
const write = (file, text) => writeFileSync(join(ROOT, file), text);

function loadReports() {
  const sandbox = { window: {} };
  runInNewContext(read("assets/js/reports.js"), sandbox);
  const reports = sandbox.window.PELAGIC_REPORTS;
  if (!Array.isArray(reports)) throw new Error("assets/js/reports.js did not define window.PELAGIC_REPORTS");
  for (const r of reports) {
    if (!/^[a-z0-9-]+$/.test(r.id || "")) throw new Error(`Report id "${r.id}" must be lowercase letters, digits and hyphens`);
  }
  return reports;
}

const attr = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const text = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const reportFile = (r) => `report-${r.id}.html`;
const cardFile = (r) => `assets/img/cards/${r.id}.png`;

// Draws the preview cards with Python + Pillow. If Python is missing, reports keep the generic card.
function buildCards(reports) {
  for (const python of ["python", "python3", "py"]) {
    const run = spawnSync(python, [join(ROOT, "tools", "build-cards.py")], { input: JSON.stringify(reports), encoding: "utf8" });
    if (run.error) continue; // this name is not installed; try the next
    if (run.status !== 0) throw new Error(`tools/build-cards.py failed:\n${run.stderr}`);
    process.stdout.write(run.stdout);
    return;
  }
  console.warn("Python was not found, so the report preview cards were not redrawn.");
}

function upside(r) {
  if (typeof r.upside === "number") return r.upside;
  if (r.price > 0 && r.target > 0) return Math.round((r.target / r.price - 1) * 1000) / 10;
  return null;
}

// "Buy · 12-month target $234.72 (+36.9%)", or just the rating when there is no target.
function callLine(r) {
  if (!r.rating) return "";
  if (!(r.target > 0)) return r.rating;
  const sign = CURRENCY[r.currency || "USD"] ?? `${r.currency} `;
  const up = upside(r);
  const upText = up === null ? "" : ` (${up > 0 ? "+" : ""}${up.toFixed(1)}%)`;
  return `${r.rating} · 12-month target ${sign}${r.target.toFixed(2)}${upText}`;
}

// Replaces one <meta> or <title> in the page head, and fails loudly if it is missing.
function setHead(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`report.html is missing ${pattern}`);
  return html.replace(pattern, replacement);
}

function reportPage(template, r) {
  const url = `${SITE}/${reportFile(r)}`;
  const title = `${r.title} | Pelagic Research`;
  const call = callLine(r);
  const description = [call && `${call}.`, r.summary].filter(Boolean).join(" ");
  let html = setHead(template, /<html lang="en">/, `<html lang="en" data-report="${attr(r.id)}">`);
  html = setHead(html, /<title>[^<]*<\/title>/, `<title>${text(title)}</title>`);
  html = setHead(html, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${attr(description)}">`);
  html = setHead(html, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${attr(r.title)}">`);
  html = setHead(html, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${attr(description)}">`);
  html = setHead(html, /<meta property="og:type" content="[^"]*">/,
    `<meta property="og:type" content="article">\n  <meta property="og:url" content="${url}">\n  <link rel="canonical" href="${url}">`);
  if (existsSync(join(ROOT, cardFile(r)))) {
    const image = `${SITE}/${cardFile(r)}`;
    const alt = attr(`${r.company} (${r.ticker}): ${callLine(r)}`);
    html = setHead(html, /<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`);
    html = setHead(html, /<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${alt}">`);
    html = setHead(html, /<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${image}">`);
  }
  return html.replace("<!doctype html>", "<!doctype html>\n<!-- Built by tools/build-pages.mjs from report.html and assets/js/reports.js. Edit those, not this file. -->");
}

// The 404 page can be served at any path, so every relative link and asset becomes root-absolute.
function notFoundPage(template) {
  const absolute = (html) => html.replace(/(href|src)="(?!https?:|\/|#|mailto:|data:)([^"]+)"/g, '$1="/$2"');
  const [head, rest] = template.split('<main id="main">');
  const foot = rest.split("</main>")[1];
  const main = `<main id="main">
<section class="page-hero">
  <div class="container">
    <h1>Page not found</h1>
    <p>This page doesn't exist, or it has moved. Every report is still on the research page.</p>
  </div>
</section>
<section class="tight">
  <div class="container">
    <p><a class="btn btn-primary" href="research.html">See all reports</a></p>
  </div>
</section>
</main>`;
  const redirect = `<script>
    // A report-<id>.html link with no built page falls back to the page that reads the id itself.
    (function () {
      var m = location.pathname.match(/\\/report-([a-z0-9-]+)\\.html$/);
      if (m) location.replace("/report.html?id=" + m[1]);
    })();
  </script>
`;
  let html = head
    .replace(/<title>[^<]*<\/title>/, "<title>Page not found | Pelagic Research</title>")
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="This page could not be found.">\n  <meta name="robots" content="noindex">')
    .replace("</head>", `  ${redirect}</head>`);
  // The template marks Research as the current page; nothing is current on a 404.
  html = absolute(html.replace(' aria-current="page"', "") + main + foot);
  return html.replace("<!doctype html>", "<!doctype html>\n<!-- Built by tools/build-pages.mjs. Edit that script, not this file. -->");
}

function sitemap(reports) {
  const today = new Date().toISOString().slice(0, 10);
  const entry = (path, lastmod) => `  <url><loc>${SITE}/${path === "index.html" ? "" : path}</loc><lastmod>${lastmod}</lastmod></url>`;
  const lines = [...STATIC_PAGES.map((p) => entry(p, today)), ...reports.map((r) => entry(reportFile(r), r.date))];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join("\n")}\n</urlset>\n`;
}

function main() {
  const reports = loadReports();
  const template = read("report.html");
  buildCards(reports);

  // Remove pages for reports that no longer exist, so renamed or deleted reports don't linger.
  const wanted = new Set(reports.map(reportFile));
  for (const f of readdirSync(ROOT)) {
    if (/^report-[a-z0-9-]+\.html$/.test(f) && !wanted.has(f)) unlinkSync(join(ROOT, f));
  }
  for (const r of reports) write(reportFile(r), reportPage(template, r));
  write("404.html", notFoundPage(template));
  write("sitemap.xml", sitemap(reports));
  write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log(`Built ${reports.length} report pages, 404.html, sitemap.xml and robots.txt.`);
}

main();
