/* =========================================================
   Jargon tooltips on report pages.
   The first time a term appears in a report's summary, thesis, risks or
   pitch note, it gets a dotted underline. Hover or focus shows a short
   plain-English definition; tapping toggles it on touch screens.

   To add a term: add an entry to GLOSSARY. `match` is a regular expression
   for the exact wording used in reports (case-sensitive unless it has /i).
   Longer phrases should come before shorter ones they contain
   (e.g. "NTM EV/EBITDA" before "EBITDA"). Entries that share a `group`
   explain the same idea, so only the first one found is marked.
   ========================================================= */

const GLOSSARY = [
  { match: /NTM EV\/EBITDA/, group: "ev-ebitda", term: "NTM EV/EBITDA", def: "Enterprise value divided by EBITDA expected over the next twelve months. It shows how many years of operating earnings the whole business, debt included, is priced at. Lower means cheaper." },
  { match: /EV\/EBITDA/, group: "ev-ebitda", term: "EV/EBITDA", def: "Enterprise value (market value plus net debt) divided by EBITDA. It shows how many years of operating earnings the whole business is priced at. Lower means cheaper." },
  { match: /EBITDA/, term: "EBITDA", def: "Earnings before interest, taxes, depreciation and amortization: a rough measure of profit from operations, before financing and accounting charges." },
  { match: /\b45X\b/, term: "45X credit", def: "A U.S. tax credit from the Inflation Reduction Act of 2022 that pays manufacturers for each unit of clean-energy equipment made in the U.S., such as each watt of solar modules." },
  { match: /\bFEOC\b/, term: "FEOC", def: "Foreign Entity of Concern: U.S. rules that cut off tax credits when products or supply chains involve companies tied to certain countries, such as China." },
  { match: /Section 232/, term: "Section 232", def: "A U.S. trade law that lets the government restrict imports on national-security grounds. Here it sets minimum prices for imported solar modules and cells." },
  { match: /Section 301/, term: "Section 301", def: "A U.S. trade law used to put tariffs on imports from countries judged to trade unfairly, most notably China." },
  { match: /cadmium telluride/, term: "Cadmium telluride", def: "A compound used in thin-film solar panels in place of silicon. First Solar's modules are made from it." },
  { match: /polysilicon/, term: "Polysilicon", def: "Ultra-pure silicon, the main raw material in most solar panels. Much of the world's supply is made in China." },
  { match: /thin-film/, term: "Thin-film", def: "Solar panels made by coating glass with very thin layers of light-absorbing material, rather than using silicon wafers." },
  { match: /\bDCF\b/, term: "DCF", def: "Discounted cash flow: a valuation that forecasts a company's future cash flows and converts them into what they are worth today." },
  { match: /terminal value/, term: "Terminal value", def: "In a DCF, the value of all cash flows after the forecast years end. It is often a large share of the total." },
  { match: /\bbacklog\b/i, term: "Backlog", def: "Orders a company has signed but not yet delivered." },
  { match: /\b48E\b/, term: "48E and 45Y", def: "U.S. clean-electricity tax credits that developers of new power projects can claim: 48E on the investment, 45Y on the power produced." },
  { match: /net cash/, term: "Net cash", def: "Cash minus debt. A positive figure means the company holds more cash than it owes." },
  { match: /net debt/, term: "Net debt", def: "Debt minus cash. The higher it is, the more a company's results depend on interest rates and steady cash flow." },
  { match: /Long position/, term: "Long position", def: "A bet that a stock will rise: buying the shares and profiting if the price goes up." },
  { match: /\b20\d\dE\b/, term: "E (estimate)", def: "An E after a year, as in 2028E, marks a forecast rather than a reported result." },
  { match: /\bEPS\b/, term: "EPS", def: "Earnings per share: a company's profit divided by its number of shares." },
  { match: /forward P\/E/, term: "Forward P/E", def: "Share price divided by expected earnings per share over the coming year. It shows what investors pay for each dollar of future profit." },
  { match: /\bconsensus\b/, term: "Consensus", def: "The average forecast of the analysts who cover a stock." },
  { match: /the Street\b/, term: "The Street", def: "Wall Street analysts as a group. Beating the Street means results coming in above their forecasts." },
  { match: /\bPPAs?\b/, term: "PPA", def: "Power purchase agreement: a long-term contract to buy electricity from a specific producer at agreed prices." },
  { match: /\buprates?\b/, term: "Uprate", def: "An upgrade that raises how much power an existing plant can produce, without building a new one." },
  { match: /Zero Emission Credit|\bZEC\b/, term: "Zero Emission Credit (ZEC)", def: "State payments to nuclear plants for producing carbon-free power, used in New York and Illinois." },
  { match: /\bCMC\b/, term: "Carbon Mitigation Credit (CMC)", def: "An Illinois program that pays certain nuclear plants for their carbon-free output." },
  { match: /§45U/, term: "45U credit", def: "A federal production tax credit for existing nuclear plants. It shrinks when power prices are high." },
  { match: /\/MWh\b/, term: "MWh", def: "Megawatt-hour: a unit of electricity, the amount a 1-megawatt plant produces in one hour. Power prices are quoted per MWh." },
];

/* ---------- Marking terms in the report text ---------- */

const TERM_SCOPE = "#report .prose > p, #report .prose li, #report .report-note, #report .report-open > p";
const SKIP_INSIDE = "a, button, h1, h2, h3, h4, .term";

function nextTextMatch(roots, entry) {
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.parentElement.closest(SKIP_INSIDE) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const m = entry.match.exec(node.nodeValue);
      if (m) return { node, index: m.index, text: m[0] };
    }
  }
  return null;
}

let termCount = 0;

function wrapTerm({ node, index, text }, entry) {
  const id = `term-tip-${termCount += 1}`;
  const wrap = document.createElement("span");
  wrap.className = "term";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "term-btn";
  button.textContent = text;
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-describedby", id);
  const tip = document.createElement("span");
  tip.className = "term-tip";
  tip.id = id;
  tip.setAttribute("role", "tooltip");
  const name = document.createElement("strong");
  name.textContent = entry.term;
  tip.append(name, ` ${entry.def}`);
  wrap.append(button, tip);
  const after = node.splitText(index);
  after.nodeValue = after.nodeValue.slice(text.length);
  node.parentNode.insertBefore(wrap, after);
}

// Keeps an open tooltip inside the window by nudging it sideways.
function placeTip(wrap) {
  const tip = wrap.querySelector(".term-tip");
  tip.style.setProperty("--nudge", "0px");
  const box = tip.getBoundingClientRect();
  const gutter = 12;
  let nudge = 0;
  if (box.left < gutter) nudge = gutter - box.left;
  else if (box.right > window.innerWidth - gutter) nudge = window.innerWidth - gutter - box.right;
  tip.style.setProperty("--nudge", `${Math.round(nudge)}px`);
}

function closeAll(except) {
  document.querySelectorAll(".term.is-open").forEach((wrap) => {
    if (wrap === except) return;
    wrap.classList.remove("is-open");
    wrap.querySelector(".term-btn").setAttribute("aria-expanded", "false");
  });
}

function setupTerms() {
  const roots = [...document.querySelectorAll(TERM_SCOPE)];
  if (!roots.length) return;
  const marked = new Set();
  for (const entry of GLOSSARY) {
    if (entry.group && marked.has(entry.group)) continue;
    const hit = nextTextMatch(roots, entry);
    if (!hit) continue;
    wrapTerm(hit, entry);
    if (entry.group) marked.add(entry.group);
  }

  document.addEventListener("click", (e) => {
    const button = e.target.closest(".term-btn");
    if (!button) { closeAll(null); return; }
    const wrap = button.parentElement;
    const open = !wrap.classList.contains("is-open");
    closeAll(wrap);
    wrap.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    if (open) placeTip(wrap);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(null); });
  // Hover and keyboard focus show the tip through CSS; this only keeps it on screen.
  document.addEventListener("pointerover", (e) => { const wrap = e.target.closest?.(".term"); if (wrap) placeTip(wrap); });
  document.addEventListener("focusin", (e) => { const wrap = e.target.closest?.(".term"); if (wrap) placeTip(wrap); });
}

// site.js draws the report on DOMContentLoaded; this file loads after it, so the text is in place by now.
document.addEventListener("DOMContentLoaded", setupTerms);
