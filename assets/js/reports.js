/* =========================================================
   REPORT LIBRARY — the only file you need to edit each month.

   To publish a new report:
     1. Drop the PDF into /reports  (e.g. reports/2026-11-ticker.pdf)
     2. Copy the template below to the TOP of the list and fill it in.
     3. Commit & push. The homepage, archive, calendar and report
        page all update automatically.

   Field reference
     id           unique, URL-safe slug — used in report.html?id=...
     title        headline of the report
     company      company name
     ticker       e.g. "NYSE: XYZ"
     sector       "marine" | "energy" | "sustainability"
     date         publication date, "YYYY-MM-DD"
     rating       "Buy" | "Hold" | "Sell" | "Not Rated"
     price        share price at publication (number, optional)
     target       12-month price target (number, optional)
     currency     "USD", "EUR", "NOK", ... (optional, default USD)
     summary      2–3 sentence abstract shown on cards
     thesis       array of key thesis points (optional)
     risks        array of key risks (optional)
     pdf          path to the PDF, or "" if not uploaded yet
     author       optional
     sample       true = placeholder entry, shows a "Sample" badge.
                  Delete the sample entry once your first report is live.

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
     target: 0,
     currency: "USD",
     summary: "",
     thesis: [],
     risks: [],
     pdf: "reports/2026-11-ticker.pdf",
   },
   ========================================================= */

window.PELAGIC_REPORTS = [
  {
    id: "sample-initiation",
    title: "Sample Initiation: How a Pelagic Report Is Laid Out",
    company: "Example Shipping Co.",
    ticker: "TICKER",
    sector: "marine",
    date: "2026-10-01",
    rating: "Not Rated",
    price: null,
    target: null,
    currency: "USD",
    summary:
      "Placeholder entry so you can see how a report appears across the site. Replace it with your first real report by editing assets/js/reports.js — the homepage, archive and publication calendar update automatically.",
    thesis: [
      "Your first thesis point — the core reason the market is mispricing the business.",
      "Second point — a catalyst or structural shift (e.g. fleet renewal, IMO 2030 decarbonisation rules).",
      "Third point — valuation: what the current price implies versus your estimate.",
    ],
    risks: [
      "Key downside risk — e.g. freight-rate cyclicality or commodity-price exposure.",
      "Regulatory, execution or balance-sheet risk.",
    ],
    pdf: "",
    sample: true,
  },
];
