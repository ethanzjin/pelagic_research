/* =========================================================
   Research page: the sonar on the cover.
   Runs straight after reports.js and writes only decorative
   markup: one sonar blip per report, placed on its sector's ring
   at a stable angle, timed to flare as the beam passes.
   ========================================================= */

(function () {
  const SWEEP_SECONDS = 7; // keep in step with .sonar-sweep in research.css
  const SECTOR_RING = { marine: 60, energy: 43, sustainability: 26 }; // radius in the 160-unit sonar
  const reports = window.PELAGIC_REPORTS || [];

  // A stable angle for each report from its id, so blips don't move between visits.
  function angleFor(id) {
    let h = 0;
    for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h % 360;
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
      dot.setAttribute("class", `sonar-blip ${r.sector || ""}`);
      // Starts mid-cycle so each blip flares exactly as the beam crosses it.
      dot.style.animationDelay = `${((angle / 360) - 1) * SWEEP_SECONDS}s`;
      group.appendChild(dot);
    });
  }

  placeBlips();
})();
