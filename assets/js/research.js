/* =========================================================
   Research page: the logbook header.
   Runs straight after reports.js (before site.js and motion.js),
   so the chip counts are in place before the segmented control
   measures its chips. Writes only decorative markup:
   - the log line under the intro (count, first and latest entry)
   - one sonar blip per report, placed on its sector's ring
   - a small count on each sector chip
   ========================================================= */

(function () {
  const SWEEP_SECONDS = 7; // keep in step with .sonar-sweep in research.css
  const SECTOR_RING = { marine: 60, energy: 43, sustainability: 26 }; // radius in the 160-unit sonar
  const reports = window.PELAGIC_REPORTS || [];

  const parseDate = (iso) => new Date(`${iso}T12:00:00`);
  const fmtShort = (iso) => parseDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // A stable angle for each report from its id, so blips don't move between visits.
  function angleFor(id) {
    let h = 0;
    for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h % 360;
  }

  function writeLogLine() {
    const el = document.querySelector("[data-log-line]");
    if (!el || !reports.length) return;
    const dates = reports.map((r) => r.date).filter(Boolean).sort();
    const n = reports.length;
    el.textContent = `${n} ${n === 1 ? "entry" : "entries"} logged · First ${fmtShort(dates[0])} · Latest ${fmtShort(dates[dates.length - 1])}`;
  }

  function placeBlips() {
    const group = document.querySelector("[data-sonar-blips]");
    if (!group) return;
    const ns = "http://www.w3.org/2000/svg";
    reports.forEach((r) => {
      const angle = angleFor(r.id || r.ticker);
      const radius = SECTOR_RING[r.sector] || 50;
      const rad = (angle - 90) * (Math.PI / 180); // 0° is straight up, clockwise like the sweep
      const dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", (80 + radius * Math.cos(rad)).toFixed(1));
      dot.setAttribute("cy", (80 + radius * Math.sin(rad)).toFixed(1));
      dot.setAttribute("r", "3.2");
      dot.setAttribute("class", "sonar-blip");
      // Starts mid-cycle so each blip flares exactly as the beam crosses it.
      dot.style.animationDelay = `${((angle / 360) - 1) * SWEEP_SECONDS}s`;
      group.appendChild(dot);
    });
  }

  function countChips() {
    const counts = reports.reduce((acc, r) => ({ ...acc, [r.sector]: (acc[r.sector] || 0) + 1 }), {});
    document.querySelectorAll(".chip[data-sector]").forEach((chip) => {
      const key = chip.dataset.sector;
      const n = key === "all" ? reports.length : counts[key] || 0;
      const tag = document.createElement("span");
      tag.className = "chip-count";
      tag.textContent = String(n);
      tag.setAttribute("aria-label", `${n} ${n === 1 ? "report" : "reports"}`);
      chip.appendChild(tag);
    });
  }

  writeLogLine();
  placeBlips();
  countChips();
})();
