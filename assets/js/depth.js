/* =========================================================
   Pelagic Research — depth gauge (homepage)
   A hairline on the right edge whose readout descends through
   the ocean's zones as the page scrolls. Each section carries
   its depth in data-depth; the marker moves section by section
   and the metres are interpolated between them. Decorative and
   aria-hidden; tied 1:1 to scroll position, never timed.
   ========================================================= */

(() => {
  const all = [...document.querySelectorAll("[data-depth]")];
  if (all.length < 2) return;

  // Where each named zone of the open ocean begins, in metres.
  const ZONES = [
    [0, "Epipelagic"],
    [200, "Mesopelagic"],
    [1000, "Bathypelagic"],
    [4000, "Abyssopelagic"],
    [6000, "Hadopelagic"],
  ];
  const zoneAt = (metres) => ZONES.filter(([start]) => metres >= start).pop()[1];
  const fmt = new Intl.NumberFormat("en-US");

  const gauge = document.createElement("div");
  gauge.className = "depth-gauge";
  gauge.setAttribute("aria-hidden", "true");
  gauge.innerHTML = `<span class="depth-rail"></span>
    <span class="depth-mark"><span class="depth-zone"></span><span class="depth-value"></span></span>`;
  document.body.append(gauge);
  const zoneEl = gauge.querySelector(".depth-zone");
  const valueEl = gauge.querySelector(".depth-value");

  let marks = [];
  let tops = [];
  let frame = 0;

  // Hidden sections (e.g. "Earlier reports" before a second report exists) are skipped.
  function measure() {
    marks = all.filter((el) => el.getClientRects().length > 0);
    tops = marks.map((el) => el.getBoundingClientRect().top + scrollY);
    gauge.querySelectorAll(".depth-tick").forEach((t) => t.remove());
    marks.forEach((_, i) => {
      const tick = document.createElement("span");
      tick.className = "depth-tick";
      tick.style.setProperty("--at", (i / (marks.length - 1)).toFixed(4));
      gauge.append(tick);
    });
  }

  // Photographs and deep-water bands need a white readout; paper sections take ink.
  // The gauge ignores pointer events, so this finds the page content behind its readout.
  const DARK = ".hero-media, .bg-deep, .contact-band, .site-footer";
  function isDarkBehind() {
    const box = gauge.querySelector(".depth-mark").getBoundingClientRect();
    const under = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return !!(under && under.closest(DARK));
  }

  function update() {
    frame = 0;
    if (marks.length < 2) return;
    const y = scrollY + innerHeight * 0.5; // the depth at the middle of the screen
    let i = 0;
    while (i < marks.length - 1 && y >= tops[i + 1]) i++;
    const span = tops[i + 1] - tops[i];
    const t = i < marks.length - 1 && span > 0 ? Math.min(1, Math.max(0, (y - tops[i]) / span)) : 0;
    const from = Number(marks[i].dataset.depth);
    const to = i < marks.length - 1 ? Number(marks[i + 1].dataset.depth) : from;
    const metres = from + t * (to - from);

    gauge.style.setProperty("--p", ((i + t) / (marks.length - 1)).toFixed(4));
    gauge.classList.toggle("is-on-dark", isDarkBehind());
    valueEl.textContent = `${fmt.format(Math.round(metres / 10) * 10)} m`;
    zoneEl.textContent = zoneAt(metres);
  }

  const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
  const remeasure = () => { measure(); queue(); };

  measure();
  update();
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", remeasure);
  addEventListener("load", remeasure); // images and web fonts shift section positions
  if (document.fonts) document.fonts.ready.then(remeasure);
})();
