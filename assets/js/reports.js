/* =========================================================
   REPORT LIBRARY — the only file you need to edit to publish a report.

   To publish a new report:
     1. Drop the PDF into /reports  (e.g. reports/2026-11-ticker.pdf)
     2. Copy the template below to the TOP of the list and fill it in.
     3. Commit & push. The homepage, archive and report
        page all update automatically.

   Field reference
     id           unique, URL-safe slug — used in report.html?id=...
     title        headline of the report
     company      company name
     ticker       e.g. "NYSE: XYZ"
     sector       "marine" | "energy" | "sustainability"
     date         publication date, "YYYY-MM-DD"
     rating       "Buy" | "Accumulate" | "Hold" | "Sell" | "Not Rated"
                  (thresholds are on the Methodology page)
     price        reference share price the rating is based on (number, optional)
     priceDate    date of that reference price, "YYYY-MM-DD" (optional)
     target       12-month price target (number, optional)
     bear, bull   bear- and bull-case price targets (numbers, optional);
                  with price and target they draw the scenario range chart
     currency     "USD", "EUR", "NOK", ... (optional, default USD)
     summary      2–3 sentence abstract shown on cards
     thesis       array of key thesis points (optional)
     risks        array of key risks (optional)
     pdf          path to the PDF, or "" if not uploaded yet
     author       optional, e.g. "Ethan Jin"
     format       optional; "pitch" marks a slide-deck pitch rather than a
                  written report (adds a "Pitch deck" tag and button labels)
     note         optional author's note shown above the summary

   Template:
   {
     id: "2026-11-ticker",
     title: "",
     company: "",
     ticker: "",
     sector: "marine",
     date: "2026-11-01",
     rating: "Buy",
     price: 0,
     priceDate: "2026-11-01",
     target: 0,
     bear: 0,
     bull: 0,
     currency: "USD",
     summary: "",
     thesis: [],
     risks: [],
     pdf: "reports/2026-11-ticker.pdf",
   },
   ========================================================= */

window.PELAGIC_REPORTS = [
  // Newest report goes here, at the top.
  {
    id: "2026-11-fslr-pitch",
    title: "First Solar: Policy Tailwinds Behind America's Largest Solar Maker",
    company: "First Solar",
    ticker: "NASDAQ: FSLR",
    sector: "energy",
    date: "2026-11-07",
    rating: "Accumulate",
    price: 201.14,
    priceDate: "2026-11-06",
    target: 234.72,
    bear: 156.00,
    bull: 280.21,
    currency: "USD",
    format: "pitch",
    note:
      "This is a stock pitch, not a full report. A pitch only takes a side, Long or Short, so the deck's call is Long. On Pelagic's rating scale, 16.7% upside to the $234.72 target is Accumulate, which is the rating shown here. The full written report on First Solar is coming.",
    summary:
      "First Solar is the only U.S.-headquartered company among the world's largest solar manufacturers, and its thin-film modules use no Chinese polysilicon. Federal 45X manufacturing credits, FEOC rules and the Section 232 import floor all favor its U.S. production. Holding today's 5.94x NTM EV/EBITDA on our 2028E EBITDA gives a 12-month target of $234.72, about 17% above the $201.14 close on November 6, 2026.",
    thesis: [
      "45X manufacturing credits are worth up to $0.17/W on a fully U.S.-made module, against a production cost of about $0.267/W. They made up about $1.5B, or roughly 82%, of gross profit in the first nine months of 2026, and run at full value through 2029.",
      "First Solar's cadmium telluride modules use no Chinese polysilicon, so FEOC rules that threaten rivals' credits barely touch it. U.S. silicon assemblers are also short of cells, with about 65 GW of module capacity on only 3.2 GW of cell capacity.",
      "From December 4, 2026, Section 232 sets a minimum import price of $0.38/W for modules plus a 15% tariff, putting imports at about $0.42–$0.44/W. That gives First Solar room to lift prices from about $0.36/W toward $0.40–$0.42/W without higher costs.",
      "Q3 2026 EPS of $5.30 rose 25% year over year. Sales guidance was cut, but gross profit guidance held at $2.4–$2.6B because the lost volume was mostly international, where no credits are earned.",
      "At 5.94x NTM EV/EBITDA, First Solar trades at about half its peer median of 11.5x. Our DCF of $159.55–$178.80 is a longer-term floor, since it assumes the credits phase out on schedule and growth fades.",
    ],
    risks: [
      "Post-credit pricing (high): once 45X phases out, profit depends on price per watt alone. Backlog sits at about $0.31/W; if prices stay there, value stays near the DCF.",
      "Developer tax credits (medium-high): projects that missed the July 4, 2026, construction start no longer qualify for 48E and 45Y credits, so demand after about 2029 is uncertain.",
      "Multiple compression (medium): investors may pay less per dollar of EBITDA as the 2030 phase-down nears. One turn of multiple moves the stock about $34.",
      "Credit policy and trade (low): changes to 45X or a weaker Section 232 floor would cut cash flow or let cheaper imports back in.",
    ],
    pdf: "reports/2026-11-fslr-pitch.pdf",
    author: "Ethan Jin",
  },
  {
    id: "2026-10-ceg",
    title: "Constellation Energy: Upside Without Beating the Street",
    company: "Constellation Energy",
    ticker: "NASDAQ: CEG",
    sector: "energy",
    date: "2026-10-16",
    rating: "Accumulate",
    price: 275.00,
    priceDate: "2026-10-15",
    target: 329.63,
    bear: 239.58,
    bull: 408.00,
    currency: "USD",
    summary:
      "Constellation is the largest nuclear operator in the U.S., with contracted base earnings set to grow about 23% a year through 2029. Our 2027 and 2028 EPS estimates sit about 8% and 14% below consensus, but our upside doesn't depend on beating the Street: at 18.8x our 2028E EPS, the stock trades below its roughly 23x median forward P/E since 2022, and a return to 22.5x implies about 20% upside.",
    thesis: [
      "Long-term PPAs with Microsoft, Meta, Google and Amazon are turning nuclear output into contracted revenue, with an average contract length of 18.5 years.",
      "Management guides base EPS from about $7.65 in 2027 to $11.40–$11.90 in 2029, roughly 23% growth a year, as new contracts and uprates come online.",
      "New York's Zero Emission Credit program now runs through 2049 and federal nuclear production tax credits run until 2032, giving earnings a policy-backed floor.",
      "Our estimates are conservative. We assume new contracts mostly start in 2029–2031 and enhanced margins stay near average, which puts our 2027 and 2028 EPS about 8% and 14% below consensus. Even our bull case sits below the Street.",
      "At $275.00, CEG trades at 18.8x our 2028E adjusted EPS of $14.65, below its five-year median of about 23x. Applying 22.5x gives a 12-month target of $329.63, so the upside comes from the multiple, not from beating estimates.",
      "We rate CEG Accumulate rather than Buy for two reasons: our estimates trail consensus, and the recent dip came without a real change in fundamentals. A stock that can fall that far on sentiment alone is volatile, which makes the path to our target less certain.",
    ],
    risks: [
      "Power prices: each $1/MWh change moves EPS by about $0.45, or roughly $10 per share at a 22.5x multiple.",
      "Policy: Illinois ZEC and CMC programs expire in 2027, and the federal §45U credit ends in 2032 and shrinks when power prices are high.",
      "Leverage: net debt rose to $24.0B after the Calpine acquisition, making the stock more sensitive to interest rates and cash-flow misses.",
      "Execution: delays to uprates and restarts would push earnings out of key years like 2028 and 2029.",
    ],
    pdf: "reports/2026-10-ceg.pdf",
    author: "Ethan Jin",
  },
];
