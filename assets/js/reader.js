/* =========================================================
   reader.html: shows a report (or its pitch deck) as paper pages on the
   desk, the same look as the one-page tear sheets.

   The PDF is looked up from assets/js/reports.js by id, so the page only
   ever opens the site's own reports. Pages are drawn with PDF.js (already
   in assets/vendor/pdfjs) because many phones have no built-in PDF viewer.
   ========================================================= */

const PDFJS_DIR = "assets/vendor/pdfjs/";
const PAGE_CSS_WIDTH = 816; // 8.5in, the same width as the tear sheets

function loadPdfjsLib() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PDFJS_DIR}pdf.min.js`;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_DIR}pdf.worker.min.js`;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("PDF.js did not load"));
    document.head.append(script);
  });
}

// Which report and which document (?id=…&doc=pitch), or null when the link is wrong.
function findDocument() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const reports = window.PELAGIC_REPORTS || [];
  const r = reports.find((x) => x.id === id || (x.aliases || []).includes(id));
  if (!r) return null;
  const kind = params.get("doc");
  const docs = {
    pitch: { pdf: r.pitch && r.pitch.pdf, title: `${r.company} pitch deck` },
    tearsheet: { pdf: r.tearsheet ? `reports/${r.id}-tearsheet.pdf` : "", title: `${r.company} tear sheet` },
  };
  const chosen = docs[kind] || { pdf: r.pdf, title: r.title };
  if (!chosen.pdf) return null;
  return { pdf: chosen.pdf, back: `report-${encodeURIComponent(r.id)}.html`, title: chosen.title };
}

function showError(status, doc) {
  status.textContent = "";
  const msg = document.createElement("span");
  msg.textContent = doc
    ? "The report couldn't be shown here, but the PDF itself is fine. "
    : "This report couldn't be found. ";
  const link = document.createElement("a");
  link.href = doc ? doc.pdf : "research.html";
  link.textContent = doc ? "Open the PDF" : "See all reports";
  status.append(msg, link);
}

async function renderReport() {
  const pagesEl = document.querySelector("[data-reader-pages]");
  const status = document.querySelector("[data-reader-status]");
  const doc = findDocument();
  if (!doc) { showError(status, null); return; }

  document.title = `${doc.title} | Pelagic Research`;
  document.querySelector("[data-reader-title]").textContent = doc.title;
  document.querySelector("[data-reader-back]").href = doc.back;
  document.querySelector("[data-reader-download]").href = doc.pdf;

  try {
    const lib = await loadPdfjsLib();
    // isEvalSupported: false closes CVE-2024-4367 (script execution via a crafted font) in this PDF.js version.
    const pdf = await lib.getDocument({ url: doc.pdf, isEvalSupported: false }).promise;
    // Every page keeps its full layout and is scaled to fit the screen, like a PDF app. On a phone that is
    // small, so pages are drawn at 1.5x their 8.5in size whatever the screen: pinch-zooming stays sharp.
    const pixelWidth = Math.max(Math.min(pagesEl.clientWidth, PAGE_CSS_WIDTH) * Math.min(window.devicePixelRatio || 1, 2), PAGE_CSS_WIDTH * 1.5);
    const canvas = document.createElement("canvas");
    for (let n = 1; n <= pdf.numPages; n += 1) {
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: pixelWidth / page.getViewport({ scale: 1 }).width });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      // Each page becomes a compressed image, so an 11-page report doesn't hold 11 full-size canvases in memory.
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      const img = new Image(viewport.width, viewport.height);
      img.className = "reader-page";
      img.alt = `Page ${n} of ${pdf.numPages}`;
      img.src = URL.createObjectURL(blob);
      pagesEl.append(img);
      if (n === 1) status.remove();
    }
  } catch (err) {
    console.error("Report preview failed:", err);
    showError(status, doc);
  }
}

document.addEventListener("DOMContentLoaded", renderReport);
