/* =========================================================
   REPORT LIBRARY — the only file you need to edit each month.

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
     rating       "Buy" | "Hold" | "Sell" | "Not Rated"
     price        share price at publication (number, optional)
     target       12-month price target (number, optional)
     currency     "USD", "EUR", "NOK", ... (optional, default USD)
     summary      2–3 sentence abstract shown on cards
     thesis       array of key thesis points (optional)
     risks        array of key risks (optional)
     pdf          path to the PDF, or "" if not uploaded yet
     author       optional

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
  // Newest report goes here, at the top.
];
