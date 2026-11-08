/* =========================================================
   Pelagic Research — site behaviour
   Renders report data from reports.js into whichever page
   containers are present. No build step, no dependencies.
   ========================================================= */

/* ---- Site settings: edit these ---- */
const SITE = {
  // Where "Contact" links go.
  contactEmail: "ethan.jin@stern.nyu.edu",
};

const SECTORS = {
  marine: "Marine",
  energy: "Energy",
  sustainability: "Sustainability",
};

// Card and panel photography per sector; a report can override it with an `image` field.
const SECTOR_PHOTOS = {
  marine: "assets/img/photos/marine.jpg",
  energy: "assets/img/photos/energy.jpg",
  sustainability: "assets/img/photos/sustainability.jpg",
};

const reports = (window.PELAGIC_REPORTS || [])
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

/* ---------- helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function parseDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d || 1);
}

function fmtDate(iso) {
  return parseDate(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function fmtMoney(n, currency = "USD") {
  if (n === null || n === undefined || n === "" || isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${currency} ${Number(n).toFixed(2)}`;
  }
}

function upside(r) {
  if (!r.price || !r.target) return null;
  return (r.target / r.price - 1) * 100;
}

function fmtUpside(r) {
  const u = upside(r);
  if (u === null) return { text: "—", cls: "" };
  return { text: `${u >= 0 ? "+" : ""}${u.toFixed(1)}%`, cls: u >= 0 ? "up" : "down" };
}

function ratingClass(rating = "") {
  const r = rating.toLowerCase();
  if (r.startsWith("buy") || r.includes("outperform")) return "buy";
  if (r.startsWith("accumulate")) return "accumulate";
  if (r.startsWith("sell") || r.includes("underperform")) return "sell";
  if (r.startsWith("hold") || r.includes("neutral")) return "hold";
  return "nr";
}

function sectorTag(sector) {
  return `<span class="tag ${esc(sector)}">${esc(SECTORS[sector] || sector)}</span>`;
}

function sampleTag(r) {
  return r.sample ? `<span class="tag sample">Sample</span>` : "";
}

// A pitch is a slide deck, not a written report, so it gets its own tag and button labels.
const isPitch = (r) => r.format === "pitch";

function formatTag(r) {
  return isPitch(r) ? `<span class="tag pitch">Pitch deck</span>` : "";
}

// Issue number, journal style: the oldest report is No. 01. `reports` is sorted newest first.
function issueTag(r) {
  const n = reports.length - reports.indexOf(r);
  return `<span class="issue">No. ${String(n).padStart(2, "0")}</span>`;
}

// Optional author's note shown above the summary, e.g. how a pitch's Long/Short call maps to a rating.
function reportNote(r) {
  return r.note ? `<p class="report-note">${esc(r.note)}</p>` : "";
}

function reportUrl(r) {
  return `report.html?id=${encodeURIComponent(r.id)}`;
}

/* ---------- components ---------- */

function reportPhoto(r) {
  return r.image || SECTOR_PHOTOS[r.sector] || "";
}

const isNum = (v) => typeof v === "number" && isFinite(v) && v > 0;

// Where the price sits against the target and the bear/bull cases: one horizontal scale,
// the bear-to-bull band, the gap from price up to target, and a marker for each.
// compact (and any narrow screen): price and target labelled on the chart, bear and bull
// in a caption below, so labels never collide.
function scenarioRange(r, { compact = false } = {}) {
  if (!isNum(r.price) || !isNum(r.target)) return "";
  const hasCases = isNum(r.bear) && isNum(r.bull);
  const points = [r.price, r.target].concat(hasCases ? [r.bear, r.bull] : []);
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const pad = (hi - lo) * 0.04 || hi * 0.05;
  const pos = (v) => (((v - (lo - pad)) / (hi - lo + 2 * pad)) * 100).toFixed(2);
  const money = (v) => fmtMoney(v, r.currency);
  const span = (a, b) => `left:${pos(Math.min(a, b))}%;right:${(100 - pos(Math.max(a, b))).toFixed(2)}%`;
  const up = fmtUpside(r);
  const said = `Price ${money(r.price)}, 12-month target ${money(r.target)} (${up.text})` +
    (hasCases ? `, bear case ${money(r.bear)}, bull case ${money(r.bull)}` : "") + ".";
  const at = (v, cls, text) => `<span class="range-label ${cls}" style="--x:${pos(v)}">${text}</span>`;
  return `
    <figure class="range${compact ? " is-compact" : ""}" role="img" aria-label="${esc(said)}">
      <div class="range-row range-above">${at(r.price, "is-price", `Price <b>${money(r.price)}</b>`)}</div>
      <div class="range-track">
        ${hasCases ? `<span class="range-band" style="${span(r.bear, r.bull)}"></span>` : ""}
        <span class="range-gap ${up.cls}" style="${span(r.price, r.target)}"></span>
        ${hasCases ? `<span class="range-end" style="--x:${pos(r.bear)}"></span><span class="range-end" style="--x:${pos(r.bull)}"></span>` : ""}
        <span class="range-target" style="--x:${pos(r.target)}"></span>
        <span class="range-price" style="--x:${pos(r.price)}"></span>
      </div>
      <div class="range-row range-below">
        ${at(r.target, "is-target", `Target <b>${money(r.target)}</b>`)}
        ${hasCases && !compact ? at(r.bear, "is-bear", `Bear <b>${money(r.bear)}</b>`) + at(r.bull, "is-bull", `Bull <b>${money(r.bull)}</b>`) : ""}
      </div>
      ${hasCases ? `<figcaption>Bear ${money(r.bear)} · Bull ${money(r.bull)}</figcaption>` : ""}
    </figure>`;
}

// Labels are measured, not guessed: if any two overlap at this width, the bear and bull
// labels give way to the caption line under the chart.
function fitRanges() {
  document.querySelectorAll(".range:not(.is-compact)").forEach((fig) => {
    fig.classList.remove("is-tight");
    const boxes = [...fig.querySelectorAll(".range-label")].map((l) => l.getBoundingClientRect());
    const track = fig.querySelector(".range-track").getBoundingClientRect();
    const clash = boxes.some((a, i) => boxes.some((b, j) =>
      j > i && a.top < b.bottom && b.top < a.bottom && a.left < b.right + 8 && b.left < a.right + 8));
    const spills = boxes.some((b) => b.left < track.left - 4 || b.right > track.right + 4);
    fig.classList.toggle("is-tight", clash || spills);
  });
}

function reportCard(r) {
  const photo = reportPhoto(r);
  const up = fmtUpside(r);
  return `
    <a class="report-card" href="${reportUrl(r)}">
      <div class="card-media">
        ${photo ? `<img src="${esc(photo)}" alt="" loading="lazy" width="900" height="675">` : ""}
        <div class="card-media-meta">
          <span class="ticker">${esc(r.ticker)}</span>
          <span class="rating-on-photo">${esc(r.rating || "Not Rated")}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="top">
          <div>${issueTag(r)} ${sectorTag(r.sector)} ${formatTag(r)} ${sampleTag(r)}</div>
          <span class="muted">${fmtDate(r.date)}</span>
        </div>
        <h3>${esc(r.title)}</h3>
        <p class="summary">${esc(r.summary)}</p>
        ${scenarioRange(r, { compact: true })}
        <div class="bottom">
          <span>Upside <b class="upside ${up.cls}">${up.text}</b></span>
          <span class="more">${isPitch(r) ? "View pitch" : "Read report"}</span>
        </div>
      </div>
    </a>`;
}

// Opens the PDF in a sheet (motion.js); without JavaScript it links to the file itself.
function sheetButton(r) {
  return `<a class="btn btn-primary" href="${esc(r.pdf)}" data-sheet="${esc(r.pdf)}" data-sheet-title="${esc(r.title)}">${isPitch(r) ? "View the pitch deck" : "Read the full report"}</a>`;
}

// Empty states say what belongs here, why it's empty, and what to do next.
function emptyState({ title, body, action = "" }) {
  return `<div class="empty"><h3>${title}</h3><p>${body}</p>${action}</div>`;
}

/* ---------- homepage ---------- */

function renderLatest() {
  const el = $("#latest");
  if (!el) return;
  const r = reports[0];
  if (!r) {
    el.innerHTML = `<div class="feature-body"><span class="eyebrow">Latest report</span>
      <h2>No reports yet</h2>
      <p class="summary">The first report is being written and will be posted here when it's done.</p>
      <div class="hero-actions"><a class="btn btn-primary" href="#contact">Ask to be notified</a></div></div>`;
    el.style.display = "block";
    return;
  }
  const up = fmtUpside(r);
  el.innerHTML = `
    <div class="feature-body">
      <span class="eyebrow">${issueTag(r)}<span>Latest report</span></span>
      <div class="meta">${sectorTag(r.sector)} ${formatTag(r)} ${sampleTag(r)}<span>${fmtDate(r.date)}</span></div>
      <h2>${esc(r.title)}</h2>
      <p class="summary">${esc(r.summary)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${reportUrl(r)}">${isPitch(r) ? "View the pitch" : "Read the report"}</a>
        ${r.pdf ? `<a class="more" href="${esc(r.pdf)}" download>Download PDF</a>` : ""}
      </div>
    </div>
    <div class="feature-side">
      <div class="card-head">
        <div class="company"><span class="ticker">${esc(r.ticker)}</span> <span class="muted">${esc(r.company)}</span></div>
        <span class="stamp ${ratingClass(r.rating)}"><span class="visually-hidden">Rating: </span>${esc(r.rating || "Not Rated")}</span>
      </div>
      <dl class="specimen">
        <div><dt>Upside</dt><dd class="upside ${up.cls}">${up.text}</dd></div>
        <div><dt>12-mo target</dt><dd>${fmtMoney(r.target, r.currency)}</dd></div>
        <div><dt>Reference price</dt><dd>${fmtMoney(r.price, r.currency)}</dd></div>
        <div><dt>Logged</dt><dd>${fmtDate(r.date)}</dd></div>
      </dl>
      ${scenarioRange(r)}
    </div>`;
}

function renderRecent() {
  const el = $("#recent");
  if (!el) return;
  const list = reports.slice(1, 7);
  // The newest report already has the feature card, so hide this section until there is an older one.
  $("#recent-section").hidden = !list.length;
  // A ledger (on the homepage) lists entries as ruled rows; anywhere else they stay cards.
  el.innerHTML = el.classList.contains("ledger")
    ? `<div class="ledger-head" aria-hidden="true"><span>No.</span><span>Logged</span><span>Company</span><span>Rating</span><span>Upside</span></div>${list.map(ledgerRow).join("")}`
    : list.map(reportCard).join("");
}

// One ruled line of the report log: issue, date, company and title, rating, upside.
function ledgerRow(r) {
  const up = fmtUpside(r);
  return `
    <a class="ledger-row" href="${reportUrl(r)}" data-reveal>
      <span class="ledger-no">${issueTag(r)}</span>
      <span class="ledger-date">${fmtDate(r.date)}</span>
      <span class="ledger-main">
        <span class="ledger-company">${esc(r.company)} <span class="ticker">${esc(r.ticker)}</span></span>
        <span class="ledger-title">${esc(r.title)}</span>
      </span>
      <span class="ledger-rating"><span class="rating ${ratingClass(r.rating)}">${esc(r.rating || "Not Rated")}</span></span>
      <span class="ledger-upside upside ${up.cls}">${up.text}</span>
    </a>`;
}

/* ---------- masthead: volume, issue and month, like a journal's cover line ---------- */

function toRoman(n) {
  const table = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [value, numeral] of table) while (n >= value) { out += numeral; n -= value; }
  return out;
}

function renderMasthead() {
  const el = $("[data-masthead]");
  if (!el || !reports.length) return;
  const first = parseDate(reports[reports.length - 1].date).getFullYear();
  const latest = parseDate(reports[0].date);
  const volume = toRoman(latest.getFullYear() - first + 1);
  const month = latest.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  el.textContent = `Vol. ${volume} · No. ${String(reports.length).padStart(2, "0")} · ${month}`;
}

/* ---------- archive ---------- */

function renderArchive() {
  const el = $("#archive");
  if (!el) return;
  const params = new URLSearchParams(location.search);
  let sector = SECTORS[params.get("sector")] ? params.get("sector") : "all";
  let query = "";

  const chips = document.querySelectorAll("[data-sector]");
  const search = $("#search");
  const countEl = $("#archive-count");

  function draw() {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.sector === sector)));
    const q = query.trim().toLowerCase();
    const list = reports.filter((r) => {
      if (sector !== "all" && r.sector !== sector) return false;
      if (!q) return true;
      return [r.title, r.company, r.ticker, r.summary].join(" ").toLowerCase().includes(q);
    });
    if (countEl) countEl.textContent = `${list.length} report${list.length === 1 ? "" : "s"}`;
    el.innerHTML = list.length
      ? list.map(reportCard).join("")
      : reports.length
        ? emptyState({
            title: "No matching reports",
            body: "Nothing published so far matches this sector and search. Clear them to see every report.",
            action: `<button class="btn btn-primary" type="button" data-clear-filters>Clear filters</button>`,
          })
        : emptyState({
            title: "No reports yet",
            body: "The first report is being written and will appear here when it's published.",
            action: `<a class="btn btn-primary" href="index.html#contact">Ask to be notified</a>`,
          });
  }

  chips.forEach((c) =>
    c.addEventListener("click", () => {
      sector = c.dataset.sector;
      const url = new URL(location.href);
      sector === "all" ? url.searchParams.delete("sector") : url.searchParams.set("sector", sector);
      history.replaceState(null, "", url);
      draw();
    })
  );
  if (search) search.addEventListener("input", (e) => { query = e.target.value; draw(); });
  el.addEventListener("click", (e) => {
    if (!e.target.closest("[data-clear-filters]")) return;
    query = "";
    if (search) search.value = "";
    chips[0].click(); // "All": resets the sector and the URL, then redraws
    if (search) search.focus();
  });
  draw();
}

/* ---------- report detail ---------- */

function renderReport() {
  const el = $("#report");
  if (!el) return;
  const id = new URLSearchParams(location.search).get("id");
  const r = reports.find((x) => x.id === id);
  const hero = $("#report-hero");

  if (!r) {
    hero.innerHTML = `<a class="back-link" href="research.html">← All reports</a><h1>Report not found</h1>
      <p>This report may have moved. Try the full list of reports instead.</p>`;
    el.innerHTML = `<p><a class="btn btn-primary" href="research.html">See all reports</a></p>`;
    return;
  }

  document.title = `${r.title} | Pelagic Research`;
  const up = fmtUpside(r);

  hero.innerHTML = `
    <a class="back-link" href="research.html">← All reports</a>
    <div class="meta">${issueTag(r)} ${sectorTag(r.sector)} ${formatTag(r)} ${sampleTag(r)}<span>${fmtDate(r.date)}</span>${r.author ? `<span>by ${esc(r.author)}</span>` : ""}</div>
    <h1>${esc(r.title)}</h1>
    <p><span class="ticker">${esc(r.ticker)}</span> &nbsp;·&nbsp; ${esc(r.company)}</p>`;

  const list = (items, cls = "") =>
    items && items.length ? `<ol class="thesis ${cls}">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>` : "";

  el.innerHTML = `
    <div class="report-layout">
      <article class="prose">
        ${reportNote(r)}
        <h2 class="mt-0">Summary</h2>
        <p>${esc(r.summary)}</p>
        ${r.thesis && r.thesis.length ? `<h2>Investment thesis</h2>${list(r.thesis)}` : ""}
        ${r.risks && r.risks.length ? `<h2>Key risks</h2>${list(r.risks, "risks")}` : ""}
        ${r.pdf
          ? `<h2>${isPitch(r) ? "Pitch deck" : "Full report"}</h2>
             <div class="report-open">
               <p>${isPitch(r)
                 ? "The pitch is a slide deck saved as a PDF. View it here, or download it to keep."
                 : "The complete report is a PDF. Read it here, or download it to keep."}</p>
               <div class="hero-actions">
                 ${sheetButton(r)}
                 <a class="more" href="${esc(r.pdf)}" download>Download PDF</a>
               </div>
             </div>`
          : emptyState({
              title: "PDF coming soon",
              body: "The full PDF for this report hasn't been uploaded yet. The summary, thesis and risks above are complete.",
              action: `<a class="btn btn-primary" href="research.html">See all reports</a>`,
            })}
      </article>
      <aside class="report-aside">
        <div class="card">
          <div class="stat-row">
            <div class="stat"><div class="label">Rating</div><div class="value"><span class="rating ${ratingClass(r.rating)}">${esc(r.rating || "Not Rated")}</span></div></div>
            <div class="stat"><div class="label">Upside</div><div class="value ${up.cls}">${up.text}</div></div>
          </div>
          ${scenarioRange(r, { compact: true })}
          <div class="kv-list">
            <div class="kv"><span>Ticker</span><span class="ticker">${esc(r.ticker)}</span></div>
            <div class="kv"><span>Sector</span><span>${esc(SECTORS[r.sector] || r.sector)}</span></div>
            <div class="kv"><span>Reference price</span><span>${fmtMoney(r.price, r.currency)}</span></div>
            ${r.priceDate ? `<div class="kv"><span>Price as of</span><span>${fmtDate(r.priceDate)}</span></div>` : ""}
            <div class="kv"><span>12-mo target</span><span>${fmtMoney(r.target, r.currency)}</span></div>
            <div class="kv"><span>Published</span><span>${fmtDate(r.date)}</span></div>
          </div>
        </div>
        ${r.pdf ? `${sheetButton(r)}<a class="more center" href="${esc(r.pdf)}" download>Download PDF</a>` : ""}
        <p class="note">
          For information and education only. This is not investment advice. Read the
          <a href="about.html#disclaimer">full disclaimer</a>.
        </p>
      </aside>
    </div>`;
}

/* ---------- global bits ---------- */

function setupNav() {
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  if (!toggle || !nav) return;
  const set = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => set(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) { set(false); toggle.focus(); }
  });
}

// Start every newly opened page at the top. Browsers already do this, but a page shown
// inside another frame (like a preview) can inherit the outer scroll position instead.
function resetScroll() {
  const nav = performance.getEntriesByType("navigation")[0];
  if (location.hash || (nav && nav.type !== "navigate")) return;
  window.scrollTo({ top: 0, behavior: "instant" }); // not the smooth scroll used for in-page links
  document.documentElement.scrollIntoView({ block: "start", behavior: "instant" });
}

function setupContact() {
  document.querySelectorAll("[data-contact]").forEach((a) => {
    a.href = `mailto:${SITE.contactEmail}`;
    if (a.dataset.contact === "show") a.textContent = SITE.contactEmail;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  resetScroll();
  setupNav();
  setupContact();
  renderMasthead();
  renderLatest();
  renderRecent();
  renderArchive();
  renderReport();
  document.querySelectorAll("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));
  fitRanges();
  addEventListener("resize", fitRanges);
});
