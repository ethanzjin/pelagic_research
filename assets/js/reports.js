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
     upside       optional; the upside % as published in the report (e.g. 36.9),
                  so the site shows the same figure. Otherwise it is worked
                  out from price and target and rounded to one decimal.
     currency     "USD", "EUR", "NOK", ... (optional, default USD)
     summary      2–3 sentence abstract shown on cards
     thesis       array of key thesis points (optional)
     risks        array of key risks (optional)
     pdf          path to the PDF, or "" if not uploaded yet
     author       optional, e.g. "Ethan Jin"
     format       optional; "pitch" marks a slide-deck pitch rather than a
                  written report (adds a "Pitch deck" tag and button labels)
     note         optional author's note shown above the summary
     pitch        optional earlier pitch deck that led to this report:
                  { pdf: "reports/...pdf", date: "YYYY-MM-DD", summary: "" }
                  Shown as its own section on the report page.
     aliases      optional array of old ids that should still open this
                  report (keeps shared links working when an entry is renamed)

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
    id: "2026-11-fslr",
    aliases: ["2026-11-fslr-pitch"],
    title: "First Solar: Policy Tailwinds Behind America's Largest Solar Maker",
    company: "First Solar",
    ticker: "NASDAQ: FSLR",
    sector: "energy",
    date: "2026-11-13",
    rating: "Buy",
    price: 171.39,
    priceDate: "2026-11-13",
    target: 234.72,
    bear: 156.00,
    bull: 280.21,
    upside: 36.9,
    currency: "USD",
    summary:
      "First Solar is the only U.S.-headquartered company among the world's largest solar manufacturers, and its cadmium telluride modules use no polysilicon, which shields it from Section 232, Section 301 and FEOC rules that hit its rivals. U.S. and Indian manufacturing credits support earnings through 2029, and import price floors should lift module prices while its costs stay flat. Applying 5.94x NTM EV/EBITDA to our 2028E EBITDA gives a 12-month target of $234.72, 36.9% above the $171.39 close on November 13, 2026.",
    thesis: [
      "45X manufacturing credits pay up to $0.17/W on a fully U.S.-made module, against a production cost of about $0.267/W. They were about $1.5B, or roughly 82% of gross profit, in the first nine months of 2026 and run at full value through 2029.",
      "Its thin-film modules contain no polysilicon, so First Solar has minimal exposure to Chinese trade and FEOC rules. U.S. silicon rivals sit on about 65 GW of module capacity but only 3.2 GW of cell capacity, and imported cells earn only about $0.07/W of 45X credit.",
      "From December 4, 2026, Section 232 sets a $0.38/W floor on imported modules plus a 15% tariff. New U.S. bookings since July 30 already average $0.36/W against a $0.31/W backlog, and Roth estimates post-232 pricing for U.S. assemblers near $0.40/W.",
      "We model 2026 revenue down 8% to $4.82B but net income up 19% to about $1.82B on a 51.4% EBITDA margin, then revenue up 21% in 2027 on higher-priced bookings. There is no long-term debt and $1.5B of net cash.",
      "At 5.77x NTM EV/EBITDA against a peer median of 11.1x, the stock is cheap. Our target holds its November average of 5.94x on 2028E EBITDA of $3,658M; a DCF of $156.83–$177.47 that strips the credit from terminal value is our cross-check.",
    ],
    risks: [
      "Post-credit pricing and margins (high): the 45X credit steps down from 2030 and ends in 2033. Against a $0.267/W cost, the $0.31/W backlog leaves only about $0.04/W of margin before the credit.",
      "Demand after developer credits end (medium-high): projects must be in service by year-end 2027 to qualify for 48E and 45Y credits, and last quarter's backlog fell 1.1 GW while 4.1 GW shipped.",
      "Multiple compression (medium): each 1.0x turn of EV/EBITDA moves the target about $34. At our 5.0x bear multiple, base-case EBITDA still gives about $203, 18% above today's price.",
      "Policy and trade (low): changes to 45X, the FEOC rules or the Section 232 floor would hit earnings directly, though the 2026 midterm results make such changes less likely.",
    ],
    pdf: "reports/2026-11-fslr.pdf",
    pitch: {
      pdf: "reports/2026-11-fslr-pitch.pdf",
      date: "2026-11-07",
      summary:
        "Before this report, I made the case for First Solar as a slide-deck stock pitch on November 7, 2026, taking a Long position at the November 6 close of $201.14. The full report builds on that pitch with more detail on the business, policy and valuation.",
    },
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
