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
     currency     "USD", "EUR", "NOK", ... (optional, default USD)
     summary      2–3 sentence abstract shown on cards
     thesis       array of key thesis points (optional)
     risks        array of key risks (optional)
     pdf          path to the PDF, or "" if not uploaded yet
     author       optional, e.g. "Ethan Jin"

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
    currency: "USD",
    summary:
      "Constellation is the largest nuclear operator in the U.S., with contracted base earnings set to grow about 23% a year through 2029. Our 2027 and 2028 EPS estimates sit about 8% and 14% below consensus, but our upside doesn't depend on beating the Street: at 18.8x our 2028E EPS, the stock trades below its roughly 23x median forward P/E since 2022, and a return to 22.5x implies about 20% upside.",
    thesis: [
      "Long-term PPAs with Microsoft, Meta, Google and Amazon are turning nuclear output into contracted revenue, with an average contract length of 18.5 years.",
      "Management guides base EPS from about $7.65 in 2027 to $11.40–$11.90 in 2029, roughly 23% growth a year, as new contracts and uprates come online.",
      "New York's Zero Emission Credit program now runs through 2049 and federal nuclear production tax credits run until 2032, giving earnings a policy-backed floor.",
      "Our estimates are conservative. We assume new contracts mostly start in 2029–2031 and enhanced margins stay near average, which puts our 2027 and 2028 EPS about 8% and 14% below consensus. Even our bull case sits below the Street.",
      "At $275.00, CEG trades at 18.8x our 2028E adjusted EPS of $14.65, below its five-year median of about 23x. Applying 22.5x gives a 12-month target of $329.63, so the upside comes from the multiple, not from beating estimates.",
      "We rate CEG Accumulate rather than Buy because our estimates trail consensus and the recent dip in the share price doesn't appear to have come from a change in fundamentals.",
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
