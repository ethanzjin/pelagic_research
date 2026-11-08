/* =========================================================
   Pelagic Research — ambient motion (homepage)
   Three rare-moment details, each off the main path of reading:
   - the hero headline rises word by word on first load
   - marine snow drifts through the deep "process" band
   - a bioluminescent glow follows the pointer over the contact band
   All respect reduced motion. Uses Spring and the shared
   reducedMotion query from motion.js, loaded before this file.
   ========================================================= */

/* ---------- headline: words rise into place once, on load ---------- */

// Splits the text into word spans (still one heading to assistive tech) and lets CSS
// stagger them. Plain text only; the heading has no markup inside it.
function splitHeadline() {
  document.querySelectorAll("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words
      .map((w, i) => `<span class="word" aria-hidden="true" style="--w:${i}">${w}</span>`)
      .join(" ");
    el.classList.add("is-split");
  });
}

/* ---------- marine snow: slow particles sinking through the deep band ---------- */

function setupSnow() {
  const canvas = document.querySelector("canvas.snow");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const section = canvas.parentElement;
  const DENSITY = 1 / 9000; // particles per square pixel of band
  let flakes = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = false;
  let last = 0;

  const spawn = (anywhere) => ({
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -4,
    r: 0.5 + Math.random() * 1.4,
    speed: 6 + Math.random() * 14, // px per second: slow, like real marine snow
    sway: Math.random() * Math.PI * 2,
    alpha: 0.15 + Math.random() * 0.4,
  });

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = section.offsetWidth;
    height = section.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#cfe0ff";
    const count = Math.round(width * height * DENSITY);
    flakes = Array.from({ length: count }, () => spawn(true));
    draw(0);
  }

  function draw(dt) {
    ctx.clearRect(0, 0, width, height);
    for (const f of flakes) {
      f.y += f.speed * dt;
      f.sway += dt * 0.6;
      if (f.y > height + 4) Object.assign(f, spawn(false));
      ctx.globalAlpha = f.alpha;
      ctx.beginPath();
      ctx.arc(f.x + Math.sin(f.sway) * 6, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
    last = now;
    draw(dt);
    frame = visible ? requestAnimationFrame(loop) : 0;
  }

  const start = () => {
    if (frame || reducedMotion.matches || document.hidden) return;
    last = 0;
    frame = requestAnimationFrame(loop);
  };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; };

  resize(); // with reduced motion the snow is drawn once and stays still
  // Only runs while the band is on screen and the tab is in front.
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(section);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : visible && start()));
  addEventListener("resize", resize);
  reducedMotion.addEventListener?.("change", () => (reducedMotion.matches ? stop() : visible && start()));
}

/* ---------- bioluminescence: a soft light that trails the pointer ---------- */

function setupGlow() {
  const band = document.querySelector(".contact-band");
  const glow = band && band.querySelector(".glow");
  if (!glow || typeof Spring === "undefined") return;
  // Mouse and trackpad only: a touch "hover" would leave the light stranded where the finger lifted.
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const render = () => {
    glow.style.transform = `translate3d(${x.value}px, ${y.value}px, 0) translate(-50%, -50%)`;
  };
  const x = new Spring(0, render);
  const y = new Spring(0, render);
  // Slightly underdamped and slow to respond, so it drifts after the pointer like something alive.
  const follow = { damping: 0.8, response: 0.9, restDelta: 0.5 };
  const local = (e) => {
    const box = band.getBoundingClientRect();
    return [e.clientX - box.left, e.clientY - box.top];
  };

  band.addEventListener("pointerenter", (e) => {
    // Appear where the pointer came in, rather than sweeping across from the last spot.
    const [tx, ty] = local(e);
    x.set(tx);
    y.set(ty);
    glow.classList.add("is-lit");
  });
  band.addEventListener("pointermove", (e) => {
    const [tx, ty] = local(e);
    if (reducedMotion.matches) { x.set(tx); y.set(ty); return; }
    x.to(tx, follow);
    y.to(ty, follow);
  });
  band.addEventListener("pointerleave", () => glow.classList.remove("is-lit"));
}

document.addEventListener("DOMContentLoaded", () => {
  splitHeadline();
  setupSnow();
  setupGlow();
});
