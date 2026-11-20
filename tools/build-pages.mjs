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
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://pelagicresearch.org";
const STATIC_PAGES = ["index.html", "research.html", "about.html", "about-me.html", "write.html", "contact.html"];
const CURRENCY = { USD: "$", EUR: "€", GBP: "£", NOK: "NOK " };
const TEARSHEET_CSS_VERSION = "20261120c"; // bump after editing assets/css/tearsheet.css

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

/* ---------- Tear sheets: tools/tearsheets.json -> tearsheet-<id>.html -> reports/<id>-tearsheet.pdf ---------- */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SECTORS = { marine: "Marine", energy: "Energy", sustainability: "Sustainability" };
const tearsheetFile = (r) => `tearsheet-${r.id}.html`;
const tearsheetPdf = (r) => `reports/${r.id}-tearsheet.pdf`;

function longDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function tearsheetPage(r, t) {
  const points = (items, head, body) => items.map((p) => `<li><strong>${text(p[head])}</strong> ${text(p[body])}</li>`).join("\n          ");
  // Rating, target and upside already fill the rating box, so the key-data list skips them.
  const inBox = (k) => /^(rating|12-month target)$|upside/i.test(k);
  const data = t.keyData.filter(([k]) => !inBox(k))
    .map(([k, v]) => `<div><dt>${text(k)}</dt><dd>${text(v)}</dd></div>`).join("\n          ");
  // Each scenario row's label sits on its own line above its three figures, so the table fits the side column.
  const rows = t.scenarios.rows.map(([label, bear, base, bull]) =>
    `<tr class="ts-row-label"><th colspan="3" scope="colgroup">${text(label)}</th></tr>
            <tr><td>${text(bear)}</td><td class="base">${text(base)}</td><td>${text(bull)}</td></tr>`).join("\n            ");
  const ratingClass = String(r.rating || "").toLowerCase().replace(/\s+/g, "-");
  const target = t.keyData.find(([k]) => /^12-month target$/i.test(k))?.[1] || "";
  const upside = t.keyData.find(([k]) => /upside/i.test(k))?.[1] || "";
  const reportUrl = `${SITE}/${reportFile(r)}`;
  return `<!doctype html>
<!-- Built by tools/build-pages.mjs from tools/tearsheets.json and assets/js/reports.js. Edit those, not this file. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${text(r.company)} tear sheet | Pelagic Research</title>
  <meta name="description" content="${attr(`One-page summary of the Pelagic Research report on ${r.company} (${r.ticker}): ${callLine(r)}.`)}">
  <link rel="canonical" href="${reportUrl}">
  <link rel="icon" type="image/png" href="assets/img/favicon.png?v=20261108">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400&display=swap">
  <link rel="stylesheet" href="assets/css/tearsheet.css?v=${TEARSHEET_CSS_VERSION}">
</head>
<body>
  <nav class="ts-toolbar" aria-label="Tear sheet">
    <a href="${reportFile(r)}">← Back to the full report</a>
    <a class="ts-download" href="${tearsheetPdf(r)}" download>Download PDF</a>
  </nav>
  <main class="sheet">
    <header class="ts-head">
      <span class="ts-brand"><img src="assets/img/mark-white.png" alt="" width="46" height="22">Pelagic Research</span>
      <span class="ts-meta">TEAR SHEET · ${text((SECTORS[r.sector] || "").toUpperCase())}<br>${text(longDate(r.date).toUpperCase())}</span>
    </header>
    <div class="ts-title">
      <h1>${text(r.company)}<span class="ts-ticker">${text(r.ticker)}</span></h1>
      <p>${text(r.title)}${r.author ? ` · by ${text(r.author)}` : ""}</p>
    </div>
    <div class="ts-grid">
      <div>
        <p class="ts-intro">${text(t.intro)}</p>
        <h2 class="ts-label">Investment summary</h2>
        <ul class="ts-points">
          ${points(t.summary, "lead", "body")}
        </ul>
        <h2 class="ts-label">Key risks</h2>
        <ul class="ts-points">
          ${points(t.risks, "title", "body")}
        </ul>
      </div>
      <aside>
        <div class="ts-rating">
          <span class="ts-small">Rating</span>
          <span class="ts-call ${attr(ratingClass)}">${text(r.rating)}</span>
          <span class="ts-small">12-month target</span>
          <span class="ts-target"><span>${text(target)}</span><span>${text(upside)}</span></span>
        </div>
        <dl class="ts-data">
          ${data}
        </dl>
        <section class="ts-scen" aria-label="${attr(t.scenarios.title)}">
          <h2 class="ts-label">${text(t.scenarios.title)}</h2>
          <table>
            <thead><tr><th scope="col">Bear</th><th scope="col" class="base">Base</th><th scope="col">Bull</th></tr></thead>
            <tbody>
            ${rows}
            </tbody>
          </table>
          <p class="ts-source">${text(t.scenarios.source)}</p>
        </section>
        <div class="ts-lens"><span class="ts-small">Pelagic Lens</span>${text(t.lens)}</div>
      </aside>
    </div>
    <footer class="ts-foot">
      <p>Excerpted from the full Pelagic Research report, which includes all sources and the author's disclosures. For information and education only; this is not investment advice, an offer, or a solicitation to buy or sell any security.</p>
      <span class="ts-link">${reportUrl.replace("https://", "")}</span>
    </footer>
  </main>
</body>
</html>
`;
}

// Saves a page as a PDF with a locally installed Edge or Chrome. Returns false if neither is installed.
function printPdf(htmlFile, pdfFile) {
  const browsers = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ];
  const browser = browsers.find((b) => existsSync(b));
  if (!browser) return false;
  const profile = join(ROOT, "tools", ".print-profile");
  const run = spawnSync(browser, [
    "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=10000",
    `--user-data-dir=${profile}`, `--print-to-pdf=${join(ROOT, pdfFile)}`,
    pathToFileURL(join(ROOT, htmlFile)).href,
  ], { encoding: "utf8", timeout: 120000 });
  if (run.status !== 0 || !existsSync(join(ROOT, pdfFile))) {
    throw new Error(`Saving ${pdfFile} failed:\n${run.stderr || run.error}`);
  }
  return true;
}

function buildTearsheets(reports) {
  const all = JSON.parse(read("tools/tearsheets.json"));
  const built = new Set();
  let printed = 0;
  for (const r of reports) {
    const t = all[r.id];
    if (!t) continue;
    write(tearsheetFile(r), tearsheetPage(r, t));
    if (printPdf(tearsheetFile(r), tearsheetPdf(r))) printed += 1;
    built.add(tearsheetFile(r));
  }
  for (const f of readdirSync(ROOT)) {
    if (/^tearsheet-[a-z0-9-]+\.html$/.test(f) && !built.has(f)) unlinkSync(join(ROOT, f));
  }
  if (printed < built.size) console.warn("Edge or Chrome was not found, so tear-sheet PDFs were not saved.");
  return built.size;
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
  const sheets = buildTearsheets(reports);
  console.log(`Built ${sheets} tear sheets.`);
  write("404.html", notFoundPage(template));
  write("sitemap.xml", sitemap(reports));
  write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log(`Built ${reports.length} report pages, 404.html, sitemap.xml and robots.txt.`);
}

main();
