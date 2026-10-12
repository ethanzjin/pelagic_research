/* =========================================================
   Pelagic Research — site behaviour
   Renders report data from reports.js into whichever page
   containers are present. No build step, no dependencies.
   ========================================================= */

/* ---- Site settings: edit these ---- */
const SITE = {
  // Where "Contact" links and the subscribe fallback go.
  contactEmail: "hello@pelagicresearch.com",
  // Optional: a newsletter form endpoint (Buttondown, Formspree, Substack…).
  // Leave empty and the subscribe form opens a pre-filled email instead.
  subscribeAction: "",
  // Name of the email field your newsletter provider expects.
  subscribeField: "email",
};

const SECTORS = {
  marine: "Marine",
  energy: "Energy",
  sustainability: "Sustainability",
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

function reportUrl(r) {
  return `report.html?id=${encodeURIComponent(r.id)}`;
}

/* ---------- components ---------- */

function reportCard(r) {
  return `
    <a class="report-card reveal" href="${reportUrl(r)}">
      <div class="top">
        <div>${sectorTag(r.sector)} ${sampleTag(r)}</div>
        <span class="rating ${ratingClass(r.rating)}">${esc(r.rating || "Not Rated")}</span>
      </div>
      <div class="company"><span class="ticker">${esc(r.ticker)}</span><span class="muted">${esc(r.company)}</span></div>
      <h3>${esc(r.title)}</h3>
      <p class="summary">${esc(r.summary)}</p>
      <div class="bottom">
        <span>${fmtDate(r.date)}</span>
        <span>Read report</span>
      </div>
    </a>`;
}

function emptyState(msg) {
  return `<div class="empty">${msg}</div>`;
}

/* ---------- homepage ---------- */

function renderLatest() {
  const el = $("#latest");
  if (!el) return;
  const r = reports[0];
  if (!r) {
    el.innerHTML = `<div class="feature-body"><span class="eyebrow">Latest report</span>
      <h2>No reports yet</h2>
      <p class="summary">The first report is being written. Subscribe below to get it by email when it comes out.</p></div>`;
    el.style.display = "block";
    return;
  }
  const up = fmtUpside(r);
  el.innerHTML = `
    <div class="feature-body">
      <span class="eyebrow">Latest report</span>
      <div class="meta">${sectorTag(r.sector)} ${sampleTag(r)}<span>${fmtDate(r.date)}</span></div>
      <h2>${esc(r.title)}</h2>
      <p class="summary">${esc(r.summary)}</p>
      <div class="hero-actions" style="margin-top:20px">
        <a class="btn btn-primary" href="${reportUrl(r)}">Read the report</a>
        ${r.pdf ? `<a class="btn btn-outline" href="${esc(r.pdf)}" download>Download PDF</a>` : ""}
      </div>
    </div>
    <div class="feature-side">
      <div class="company"><span class="ticker">${esc(r.ticker)}</span> <span class="muted">${esc(r.company)}</span></div>
      <div class="stat-row">
        <div class="stat"><div class="label">Rating</div><div class="value"><span class="rating ${ratingClass(r.rating)}">${esc(r.rating || "Not Rated")}</span></div></div>
        <div class="stat"><div class="label">Upside</div><div class="value ${up.cls}">${up.text}</div></div>
        <div class="stat"><div class="label">Price</div><div class="value">${fmtMoney(r.price, r.currency)}</div></div>
        <div class="stat"><div class="label">Target</div><div class="value">${fmtMoney(r.target, r.currency)}</div></div>
      </div>
    </div>`;
}

function renderRecent() {
  const el = $("#recent");
  if (!el) return;
  const list = reports.slice(1, 7);
  // The newest report already has the feature card, so hide this section until there is an older one.
  $("#recent-section").hidden = !list.length;
  el.innerHTML = list.map(reportCard).join("");
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
      : emptyState(reports.length ? "No reports match this filter." : "No reports have been published yet.");
    observeReveals();
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
    el.innerHTML = `<p><a class="btn btn-primary" href="research.html">All reports</a></p>`;
    return;
  }

  document.title = `${r.title} | Pelagic Research`;
  const up = fmtUpside(r);

  hero.innerHTML = `
    <a class="back-link" href="research.html">← All reports</a>
    <div class="meta" style="color:rgba(255,255,255,.8)">${sectorTag(r.sector)} ${sampleTag(r)}<span>${fmtDate(r.date)}</span>${r.author ? `<span>by ${esc(r.author)}</span>` : ""}</div>
    <h1>${esc(r.title)}</h1>
    <p><span class="ticker" style="color:#fff">${esc(r.ticker)}</span> &nbsp;·&nbsp; ${esc(r.company)}</p>`;

  const list = (items, cls = "") =>
    items && items.length ? `<ol class="thesis ${cls}">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>` : "";

  el.innerHTML = `
    <div class="report-layout">
      <article class="prose">
        <h2 class="mt-0">Summary</h2>
        <p>${esc(r.summary)}</p>
        ${r.thesis && r.thesis.length ? `<h2>Investment thesis</h2>${list(r.thesis)}` : ""}
        ${r.risks && r.risks.length ? `<h2>Key risks</h2>${list(r.risks, "risks")}` : ""}
        ${r.pdf
          ? `<h2>Full report</h2><object class="pdf-frame" data="${esc(r.pdf)}" type="application/pdf">
               <p>Your browser can't display the PDF inline. <a href="${esc(r.pdf)}">Download it here</a>.</p></object>`
          : `<div class="empty" style="margin-top:2em">The full PDF for this report hasn't been uploaded yet.</div>`}
      </article>
      <aside class="report-aside">
        <div class="card">
          <div class="stat-row">
            <div class="stat"><div class="label">Rating</div><div class="value"><span class="rating ${ratingClass(r.rating)}">${esc(r.rating || "Not Rated")}</span></div></div>
            <div class="stat"><div class="label">Upside</div><div class="value ${up.cls}">${up.text}</div></div>
          </div>
          <div style="margin-top:14px">
            <div class="kv"><span>Ticker</span><span class="ticker">${esc(r.ticker)}</span></div>
            <div class="kv"><span>Sector</span><span>${esc(SECTORS[r.sector] || r.sector)}</span></div>
            <div class="kv"><span>Price at publication</span><span>${fmtMoney(r.price, r.currency)}</span></div>
            <div class="kv"><span>12-mo target</span><span>${fmtMoney(r.target, r.currency)}</span></div>
            <div class="kv"><span>Published</span><span>${fmtDate(r.date)}</span></div>
          </div>
        </div>
        ${r.pdf ? `<a class="btn btn-primary" style="justify-content:center" href="${esc(r.pdf)}" download>Download PDF</a>` : ""}
        <p class="muted" style="font-size:.8rem;line-height:1.5;margin:0">
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
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function setupContact() {
  document.querySelectorAll("[data-contact]").forEach((a) => {
    a.href = `mailto:${SITE.contactEmail}`;
    if (a.dataset.contact === "show") a.textContent = SITE.contactEmail;
  });
}

function setupSubscribe() {
  const form = $("#subscribe");
  if (!form) return;
  const input = form.querySelector("input");
  if (SITE.subscribeAction) {
    form.action = SITE.subscribeAction;
    form.method = "post";
    input.name = SITE.subscribeField;
    return;
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("Subscribe to Pelagic Research");
    const body = encodeURIComponent(`Please add ${input.value} to the monthly report list.`);
    location.href = `mailto:${SITE.contactEmail}?subject=${subject}&body=${body}`;
  });
}

let revealObserver;
function observeReveals() {
  const items = document.querySelectorAll(".reveal:not(.in)");
  if (!("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("in"));
    return;
  }
  revealObserver ||= new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); }
    }),
    { rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((i) => revealObserver.observe(i));
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupContact();
  setupSubscribe();
  renderLatest();
  renderRecent();
  renderArchive();
  renderReport();
  document.querySelectorAll("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));
  observeReveals();
});
