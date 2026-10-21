/* =========================================================
   Pelagic Research — motion
   Springs and gestures after Apple's "Designing Fluid Interfaces":
   every animation starts from the value on screen, inherits the
   pointer's velocity, and can be grabbed again mid-flight.
   No dependencies.
   ========================================================= */

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

// Hide reveal targets only when this script is running, so the page never depends on it.
document.documentElement.classList.add("js-reveal");

/* ---------- physics ---------- */

// A spring described the way Apple does: damping ratio (1 = no overshoot)
// and response (roughly how many seconds it takes to get there).
class Spring {
  constructor(value, onUpdate) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.onUpdate = onUpdate;
    this.frame = 0;
  }

  // Retarget from wherever the value is now, keeping its velocity unless one is handed in.
  // restDelta: how close counts as arrived, in the value's units.
  to(target, { damping = 1, response = 0.4, velocity, onRest, restDelta = 0.1 } = {}) {
    this.target = target;
    this.restDelta = restDelta;
    this.damping = damping;
    this.response = response;
    this.onRest = onRest;
    if (velocity !== undefined) this.velocity = velocity;
    if (!this.frame) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.step);
    }
  }

  // Jump with no animation, e.g. while a finger is tracking 1:1.
  set(value) {
    this.stop();
    this.value = this.target = value;
    this.velocity = 0;
    this.onUpdate(value);
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  step = (now) => {
    const dt = Math.min((now - this.last) / 1000, 1 / 30);
    this.last = now;
    const stiffness = (2 * Math.PI / this.response) ** 2;
    const friction = (4 * Math.PI * this.damping) / this.response;
    const n = Math.max(1, Math.ceil(dt * 240));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      const force = -stiffness * (this.value - this.target) - friction * this.velocity;
      this.velocity += force * h;
      this.value += this.velocity * h;
    }
    if (Math.abs(this.velocity) < this.restDelta * 20 && Math.abs(this.value - this.target) < this.restDelta) {
      this.value = this.target;
      this.velocity = 0;
      this.frame = 0;
      this.onUpdate(this.value);
      const done = this.onRest;
      this.onRest = null;
      if (done) done();
      return;
    }
    this.onUpdate(this.value);
    this.frame = requestAnimationFrame(this.step);
  };
}

// Where a flick would come to rest (Apple's sample code, exponential decay).
function project(velocity, deceleration = 0.998) {
  return ((velocity / 1000) * deceleration) / (1 - deceleration);
}

// Progressive resistance past a boundary.
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

// Velocity from the last ~100ms of pointer history, in px/s.
function velocityTracker() {
  let points = [];
  return {
    reset() { points = []; },
    add(x, y) {
      const t = performance.now();
      points.push({ x, y, t });
      points = points.filter((p) => t - p.t < 100);
    },
    velocity() {
      const now = performance.now();
      const recent = points.filter((p) => now - p.t < 100);
      if (recent.length < 2) return { x: 0, y: 0 };
      const a = recent[0];
      const b = recent[recent.length - 1];
      const dt = (b.t - a.t) / 1000 || 1 / 60;
      return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
    },
  };
}

// A light tick on devices that support it, fired on the same frame as the visual it confirms.
function haptic() {
  if (navigator.vibrate && !reducedMotion.matches) navigator.vibrate(8);
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ---------- header: material appears only once content is underneath ---------- */

function setupHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  let queued = false;
  const update = () => {
    queued = false;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ---------- scrolling: tied 1:1 to the scroll position, never on a timer ---------- */

function setupScroll() {
  const root = document.documentElement;
  const hero = document.querySelector(".hero");
  const stepGroups = [...document.querySelectorAll(".steps")];
  const reveal = revealer();
  let queued = false;

  function update() {
    queued = false;
    const vh = innerHeight;
    reveal(vh);

    // Hero: 0 at the top of the page, 1 once it has scrolled out of view (drives the photo parallax).
    if (hero) {
      const p = clamp(window.scrollY / hero.offsetHeight, 0, 1);
      if (p !== update.heroP) { root.style.setProperty("--hero-p", p.toFixed(4)); update.heroP = p; }
    }

    // Process steps: the line fills step by step as the section moves up the screen.
    stepGroups.forEach((group) => {
      const steps = [...group.children];
      const inRow = steps.every((st) => st.offsetTop === steps[0].offsetTop);
      steps.forEach((step, i) => {
        let fill;
        if (inRow) {
          const top = group.getBoundingClientRect().top;
          const p = clamp((vh * 0.85 - top) / (vh * 0.45), 0, 1);
          fill = clamp(p * steps.length - i, 0, 1);
        } else {
          const top = step.getBoundingClientRect().top;
          fill = clamp((vh * 0.85 - top) / (vh * 0.25), 0, 1);
        }
        step.style.setProperty("--fill", fill.toFixed(3));
        step.classList.toggle("is-done", fill >= 1);
      });
    });
  }

  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  update();
}

// Each block rises into place the first time it reaches the lower part of the screen.
// Checked on every scroll frame rather than with an observer, so a jump past a section
// (an anchor link, a hard fling) still reveals it.
function revealer() {
  if (!document.documentElement.classList.contains("js-reveal")) return () => {};
  let pending = [...document.querySelectorAll("[data-reveal]")];
  pending.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
    el.style.setProperty("--i", siblings.indexOf(el));
  });
  return (vh) => {
    if (!pending.length) return;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top > vh * 0.92) return true;
      el.classList.add("is-revealed");
      // Hand the element back to its normal styles (press feedback, hover) once it has landed.
      const delay = Number(el.style.getPropertyValue("--i")) * 30;
      setTimeout(() => {
        el.removeAttribute("data-reveal");
        el.classList.remove("is-revealed");
      }, 400 + delay);
      return false;
    });
  };
}

/* ---------- segmented control: sliding, draggable thumb ---------- */

function setupSegmented() {
  const group = document.querySelector(".chips");
  if (!group) return;
  const chips = [...group.querySelectorAll(".chip")];
  const thumb = document.createElement("span");
  thumb.className = "chips-thumb";
  thumb.setAttribute("aria-hidden", "true");
  group.prepend(thumb);
  group.classList.add("has-thumb");

  const render = () => {
    thumb.style.transform = `translate3d(${pos.value}px, 0, 0)`;
    thumb.style.width = `${width.value}px`;
  };
  const pos = new Spring(0, render);
  const width = new Spring(0, render);
  const pressed = () => chips.find((c) => c.getAttribute("aria-pressed") === "true") || chips[0];
  const nearest = (left) => chips.reduce((best, c) =>
    Math.abs(c.offsetLeft - left) < Math.abs(best.offsetLeft - left) ? c : best);

  const snap = (chip, opts = {}) => {
    if (reducedMotion.matches) { pos.set(chip.offsetLeft); width.set(chip.offsetWidth); return; }
    pos.to(chip.offsetLeft, { response: 0.35, ...opts });
    width.to(chip.offsetWidth, { response: 0.35 });
  };
  pos.set(pressed().offsetLeft);
  width.set(pressed().offsetWidth);

  // Follow aria-pressed, whoever changed it.
  new MutationObserver(() => { if (!drag) snap(pressed()); })
    .observe(group, { attributes: true, subtree: true, attributeFilter: ["aria-pressed"] });
  addEventListener("resize", () => { pos.set(pressed().offsetLeft); width.set(pressed().offsetWidth); });

  // Drag the selected segment like iOS: grab the thumb, slide, release.
  const tracker = velocityTracker();
  let drag = null;
  let suppressClick = false;
  const minX = () => chips[0].offsetLeft;
  const maxX = () => chips[chips.length - 1].offsetLeft + chips[chips.length - 1].offsetWidth - width.value;

  group.addEventListener("pointerdown", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip || chip !== pressed() || e.button !== 0 || reducedMotion.matches) return;
    group.setPointerCapture(e.pointerId);
    pos.stop();
    drag = { startX: e.clientX, from: pos.value, moved: false };
    tracker.reset();
  });
  group.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) < 10) return; // hysteresis: a tap stays a tap
    drag.moved = true;
    group.classList.add("is-dragging");
    let next = drag.from + dx;
    if (next < minX()) next = minX() + rubberband(next - minX(), group.offsetWidth);
    if (next > maxX()) next = maxX() + rubberband(next - maxX(), group.offsetWidth);
    pos.set(next);
    tracker.add(next, 0);
    const under = nearest(next);
    chips.forEach((c) => c.classList.toggle("is-under", c === under));
    width.to(under.offsetWidth, { response: 0.3 });
  });
  const release = () => {
    if (!drag) return;
    const { moved } = drag;
    drag = null;
    group.classList.remove("is-dragging");
    chips.forEach((c) => c.classList.remove("is-under"));
    if (!moved) return;
    suppressClick = true;
    const v = tracker.velocity().x;
    const target = nearest(clamp(pos.value + project(v, 0.99), minX(), maxX()));
    snap(target, { velocity: v }); // carries the flick's speed, but chrome never overshoots
    if (target !== pressed()) { haptic(); target.click(); }
  };
  group.addEventListener("pointerup", release);
  group.addEventListener("pointercancel", release);
  // A drag ends in a click on the original chip; it isn't a selection.
  group.addEventListener("click", (e) => {
    if (suppressClick && e.isTrusted) { e.stopPropagation(); e.preventDefault(); }
    suppressClick = false;
  }, true);
}

/* ---------- PDF.js, loaded the first time a report is opened ---------- */

const PDFJS = "assets/vendor/pdfjs/";
let pdfjsLoading = null;
function loadPdfjs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  pdfjsLoading ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PDFJS + "pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => { pdfjsLoading = null; reject(new Error("PDF.js did not load")); };
    document.head.append(script);
  });
  return pdfjsLoading;
}

/* ---------- report sheet: slides up, pushes the page back, drag to dismiss ---------- */

// Reading a whole report is a long task, so the open sheet has its own address:
// report.html?id=…#full-report can be linked to, and Back closes it.
const SHEET_HASH = "#full-report";

function setupSheet() {
  const page = document.querySelector(".page");
  let sheet, scrim, bar, pages, titleEl, closeBtn, spring, opener;
  let isOpen = false;
  let pushed = false; // whether we added the history entry (so closing can step back over it)

  const markOpen = () => {
    if (location.hash !== SHEET_HASH) { history.pushState(null, "", SHEET_HASH); pushed = true; }
  };
  const markClosed = () => {
    if (location.hash !== SHEET_HASH) return;
    if (pushed) { pushed = false; history.back(); }
    else history.replaceState(null, "", location.pathname + location.search);
  };

  function build() {
    scrim = document.createElement("div");
    scrim.className = "sheet-scrim";
    sheet = document.createElement("div");
    sheet.className = "sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "sheet-title");
    sheet.innerHTML = `
      <div class="sheet-bar">
        <span class="sheet-grabber" aria-hidden="true"></span>
        <div class="sheet-title" id="sheet-title"></div>
        <div class="sheet-actions">
          <a class="more" download>Download PDF</a>
          <button class="sheet-close" type="button" data-tooltip data-kbd="Esc" aria-label="Close report">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
      </div>
      <div class="sheet-body is-loading">
        <div class="sheet-skeleton" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
        <p class="visually-hidden" role="status">Loading the report</p>
        <div class="sheet-pages" tabindex="0" aria-label="Report pages"></div>
        <div class="sheet-error">
          <h3>The report couldn't open here</h3>
          <p>The preview didn't load, but the PDF itself is fine. Open it in a new tab or download it to read the full report.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" data-pdf-link target="_blank" rel="noopener">Open in a new tab</a>
            <a class="more" download>Download PDF</a>
          </div>
        </div>
      </div>`;
    scrim.hidden = sheet.hidden = true;
    document.body.append(scrim, sheet);
    bar = sheet.querySelector(".sheet-bar");
    pages = sheet.querySelector(".sheet-pages");
    titleEl = sheet.querySelector(".sheet-title");
    closeBtn = sheet.querySelector(".sheet-close");
    spring = new Spring(0, render);

    closeBtn.addEventListener("click", () => close());
    scrim.addEventListener("click", () => close());
    sheet.addEventListener("keydown", trapFocus);
    setupDrag();
  }

  // The pages are drawn with PDF.js rather than the browser's PDF viewer, which is missing on
  // most Android phones and refuses to run inside sandboxed frames ("blocked by Chrome").
  async function renderPdf(src) {
    if (pages.dataset.src === src) return;
    const body = sheet.querySelector(".sheet-body");
    const status = sheet.querySelector("[role=status]");
    pages.dataset.src = src;
    pages.replaceChildren();
    body.classList.remove("has-error");
    body.classList.add("is-loading");
    status.textContent = "Loading the report";
    try {
      const lib = await loadPdfjs();
      const doc = await lib.getDocument(src).promise;
      const cssWidth = Math.min(pages.clientWidth - 32, 840);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let n = 1; n <= doc.numPages; n++) {
        if (pages.dataset.src !== src) return; // a different report was opened meanwhile
        const pdfPage = await doc.getPage(n);
        const viewport = pdfPage.getViewport({ scale: (cssWidth / pdfPage.getViewport({ scale: 1 }).width) * dpr });
        const canvas = document.createElement("canvas");
        canvas.className = "sheet-page";
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", `Page ${n} of ${doc.numPages}`);
        pages.append(canvas);
        await pdfPage.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        if (n === 1) {
          body.classList.remove("is-loading");
          status.textContent = `Report loaded, ${doc.numPages} pages`;
        }
      }
    } catch {
      pages.dataset.src = "";
      body.classList.remove("is-loading");
      body.classList.add("has-error");
      status.textContent = "The report couldn't open here. Download the PDF to read it.";
    }
  }

  const closedY = () => sheet.offsetHeight - 100 + 24; // 100px of the sheet sits below the viewport for overshoot

  // Everything follows the sheet's position, so a drag drives the scrim and the page 1:1.
  function render(y) {
    const p = clamp(1 - y / closedY(), 0, 1);
    sheet.style.transform = `translate3d(0, ${y}px, 0)`;
    scrim.style.opacity = String(p * 0.45);
    page.style.transform = p ? `scale(${1 - 0.04 * p})` : "";
  }

  function open(trigger) {
    if (!sheet) build();
    opener = trigger;
    const src = trigger.dataset.sheet;
    titleEl.textContent = trigger.dataset.sheetTitle || "Full report";
    sheet.querySelectorAll("a[download], a[data-pdf-link]").forEach((a) => { a.href = src; });
    page.style.transformOrigin = `50% ${window.scrollY + innerHeight / 2}px`;
    document.documentElement.classList.add("sheet-open");
    scrim.hidden = sheet.hidden = false;
    page.inert = true;
    isOpen = true;
    markOpen();
    renderPdf(src);

    if (reducedMotion.matches) {
      spring.set(0);
      page.style.transform = "";
      requestAnimationFrame(() => sheet.classList.add("is-shown"));
    } else {
      // If it's already partway (closing, or being reopened), carry on from there.
      if (!spring.frame && spring.value === 0) spring.set(closedY());
      spring.to(0, { damping: 1, response: 0.4 });
    }
    closeBtn.focus({ preventScroll: true });
  }

  function close({ velocity } = {}) {
    if (!isOpen) return;
    isOpen = false;
    markClosed();
    const finish = () => {
      scrim.hidden = sheet.hidden = true;
      page.inert = false;
      page.style.transform = "";
      document.documentElement.classList.remove("sheet-open");
      if (opener) opener.focus({ preventScroll: true });
    };
    if (reducedMotion.matches) {
      sheet.classList.remove("is-shown");
      setTimeout(finish, 150);
      return;
    }
    // Leave the way it came in: straight down.
    // Off-screen is close enough: hand the page back without waiting for sub-pixel settling.
    spring.to(closedY(), { velocity, response: 0.35, onRest: finish, restDelta: 4 });
  }

  function setupDrag() {
    const tracker = velocityTracker();
    let drag = null;
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a, button") || e.button !== 0 || reducedMotion.matches) return;
      bar.setPointerCapture(e.pointerId);
      spring.stop(); // grab it wherever it is, even mid-animation
      if (!isOpen) { isOpen = true; page.inert = true; markOpen(); }
      drag = { grab: e.clientY - Math.max(spring.value, 0) };
      tracker.reset();
      tracker.add(0, spring.value);
    });
    bar.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const y = e.clientY - drag.grab;
      // Pulling up past fully open resists instead of hitting a wall.
      spring.set(y < 0 ? rubberband(y, 120) : y); // stays within the 100px tucked below the fold
      tracker.add(0, spring.value);
    });
    const release = () => {
      if (!drag) return;
      drag = null;
      const v = tracker.velocity().y;
      // A real flick decides by direction; otherwise by where it would have coasted to.
      const dismiss = Math.abs(v) > 400 ? v > 0 : spring.value + project(v) > closedY() / 2;
      if (dismiss) {
        haptic();
        close({ velocity: v });
      } else {
        spring.to(0, { velocity: v, response: 0.3 });
      }
    };
    bar.addEventListener("pointerup", release);
    bar.addEventListener("pointercancel", release);
  }

  function trapFocus(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const items = [...sheet.querySelectorAll("a[download], a[data-pdf-link], .sheet-close, .sheet-pages")].filter((el) => el.offsetParent);
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-sheet]");
    if (!trigger) return;
    e.preventDefault();
    open(trigger);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) close(); });

  // Back and Forward open and close it; a shared link opens it on arrival.
  const openFromPage = () => {
    const trigger = document.querySelector("[data-sheet]");
    if (trigger) open(trigger);
  };
  addEventListener("popstate", () => {
    if (location.hash === SHEET_HASH && !isOpen) openFromPage();
    else if (location.hash !== SHEET_HASH && isOpen) { pushed = false; close(); }
  });
  if (location.hash === SHEET_HASH) openFromPage();
}

/* ---------- copy email: confirmation that grows out of the button ---------- */

function setupCopy() {
  document.querySelectorAll("[data-copy-email]").forEach((btn) => {
    let bubble, spring, timer;
    const render = (v) => {
      const p = v / 100;
      bubble.style.opacity = String(p);
      if (!reducedMotion.matches) {
        // A popover: fades in with a slight scale from the button it came from.
        bubble.style.transform = `translate(-50%, 0) scale(${0.98 + 0.02 * p})`;
      }
      if (v <= 0.5 && spring.target === 0) bubble.hidden = true;
    };
    btn.addEventListener("click", async () => {
      if (!bubble) {
        bubble = document.createElement("span");
        bubble.className = "copy-bubble";
        bubble.setAttribute("role", "status");
        btn.parentElement.append(bubble); // beside the button, so its accessible name stays "Copy email"
        spring = new Spring(0, render);
      }
      const email = typeof SITE !== "undefined" ? SITE.contactEmail : "";
      try {
        await navigator.clipboard.writeText(email);
        bubble.textContent = "Copied";
        haptic();
      } catch {
        bubble.textContent = email;
      }
      bubble.hidden = false;
      clearTimeout(timer);
      const response = reducedMotion.matches ? 0.1 : 0.3;
      spring.to(100, { response });
      timer = setTimeout(() => spring.to(0, { response }), 1600);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupHeader();
  setupScroll();
  setupSegmented();
  setupSheet();
  setupCopy();
});
