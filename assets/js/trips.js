/* =========================================================
   About me: trip albums.
   Each passport stamp in "Favorite trips" opens a scrapbook page
   with a collage of photos from that trip. The page borrows the
   stamp's own ink, shape and tilt, so every album matches its stamp.
   Loaded only on about-me.html, after motion.js.

   To add photos: put them in assets/img/trips/<place>/ and list them
   under the matching country below, e.g.
     Iceland: {
       note: "Ring Road, summer 2024.",
       photos: [
         { src: "assets/img/trips/iceland/glacier.webp", caption: "Sólheimajökull glacier" },
       ],
     },
   A trip with no photos yet shows labelled placeholder frames.
   ========================================================= */

const TRIP_ALBUMS = {
  Iceland: {
    note: "",
    photos: [
      { src: "assets/img/trips/iceland/canyon.jpg", w: 1400, h: 1050, kind: "water", caption: "Waterfalls pouring into a highland canyon" },
      { src: "assets/img/trips/iceland/gate.jpg", w: 1400, h: 1050, kind: "land", caption: "An old gate on the road east" },
      { src: "assets/img/trips/iceland/sunset-falls.jpg", w: 1400, h: 1050, kind: "water", caption: "Sunset from behind the falls" },
      { src: "assets/img/trips/iceland/steam.jpg", w: 1400, h: 1050, kind: "evening", caption: "Steam rising at dusk" },
      { src: "assets/img/trips/iceland/rapids.jpg", w: 1400, h: 1050, kind: "water", caption: "Rapids along the waterfall trail" },
      { src: "assets/img/trips/iceland/islands.jpg", w: 1400, h: 1050, kind: "sky", caption: "Sun breaking over the islands" },
    ],
  },
  "New Zealand": {
    note: "",
    photos: [
      { src: "assets/img/trips/new-zealand/tekapo.jpg", w: 900, h: 1200, kind: "lake", caption: "Lake Tekapo and the Church of the Good Shepherd" },
      { src: "assets/img/trips/new-zealand/forest.jpg", w: 900, h: 1200, kind: "land", caption: "Walking through the beech forest" },
      { src: "assets/img/trips/new-zealand/kaikoura.jpg", w: 900, h: 1200, kind: "coast", caption: "Limestone shelves on the Kaikōura coast" },
      { src: "assets/img/trips/new-zealand/mount-cook.jpg", w: 900, h: 1200, kind: "land", caption: "The road into Aoraki / Mount Cook" },
      { src: "assets/img/trips/new-zealand/wanaka.jpg", w: 900, h: 1200, kind: "lake", caption: "That Wānaka Tree" },
      { src: "assets/img/trips/new-zealand/hobbiton.jpg", w: 900, h: 1200, kind: "land", caption: "Bag End at Hobbiton" },
      { src: "assets/img/trips/new-zealand/blue-spring.jpg", w: 900, h: 1200, kind: "river", caption: "The Blue Spring at Te Waihou" },
      { src: "assets/img/trips/new-zealand/wai-o-tapu.jpg", w: 900, h: 1200, kind: "land", caption: "The Devil's Bath at Wai-O-Tapu" },
      { src: "assets/img/trips/new-zealand/harbour.jpg", w: 900, h: 1200, kind: "town", caption: "Sailboats in the harbour" },
    ],
  },
  Norway: {
    note: "",
    photos: [
      { src: "assets/img/trips/norway/kayak.jpg", w: 800, h: 1200, kind: "fjord", caption: "Kayaking under the fjord walls" },
      { src: "assets/img/trips/norway/cairn.jpg", w: 900, h: 1200, kind: "fog", caption: "A cairn on the trail to Ulriken" },
      { src: "assets/img/trips/norway/fjord-village.jpg", w: 900, h: 1200, kind: "fjord", caption: "A fjord village from the water" },
      { src: "assets/img/trips/norway/ferry.jpg", w: 1200, h: 900, kind: "fjord", caption: "Looking out over the fjord from Undredal" },
      { src: "assets/img/trips/norway/misty-hills.jpg", w: 900, h: 1200, kind: "fog", caption: "Mist over the hills above Bergen" },
      { src: "assets/img/trips/norway/into-the-fog.jpg", w: 900, h: 1200, kind: "fog", caption: "Climbing into the fog" },
      { src: "assets/img/trips/norway/still-river.jpg", w: 900, h: 1200, kind: "evening", caption: "Clouds on a still river at dusk" },
    ],
  },
  // No photos survive from these trips, so their stamps stay on the page but don't open an album.
  Yellowstone: { noAlbum: true, photos: [] },
  Yosemite: { noAlbum: true, photos: [] },
  Alaska: {
    note: "",
    photos: [
      { src: "assets/img/trips/alaska/aurora.jpg", w: 923, h: 1200, kind: "evening", caption: "The northern lights over the spruce" },
      { src: "assets/img/trips/alaska/sled-lake.jpg", w: 1200, h: 900, kind: "sled", caption: "Mushing across a frozen lake" },
      { src: "assets/img/trips/alaska/flight-in.jpg", w: 900, h: 1200, kind: "peaks", caption: "Snowy peaks on the flight in" },
      { src: "assets/img/trips/alaska/cabins.jpg", w: 900, h: 1200, kind: "evening", caption: "Cabins in the snow at dusk" },
      { src: "assets/img/trips/alaska/sled-dog.jpg", w: 900, h: 1200, kind: "sled", caption: "One of the sled dogs saying hello" },
      { src: "assets/img/trips/alaska/sled-forest.jpg", w: 1200, h: 900, kind: "sled", caption: "Through the spruce toward the peaks" },
    ],
  },
  "Friday Harbor": {
    note: "",
    photos: [
      { src: "assets/img/trips/friday-harbor/eagle-lighthouse.jpg", w: 900, h: 1200, kind: "landmark", caption: "A bald eagle on the lighthouse" },
      { src: "assets/img/trips/friday-harbor/kayak-low-tide.jpg", w: 900, h: 1200, kind: "shore", caption: "Beached at low tide" },
      { src: "assets/img/trips/friday-harbor/dusk-cove.jpg", w: 900, h: 1200, kind: "evening", caption: "Dusk over a quiet cove" },
      { src: "assets/img/trips/friday-harbor/fallen-cedar.jpg", w: 900, h: 1200, kind: "forest", caption: "Balancing on a fallen cedar" },
      { src: "assets/img/trips/friday-harbor/sunset-coast.jpg", w: 1200, h: 900, kind: "evening", caption: "Sunset along the rocky coast" },
      { src: "assets/img/trips/friday-harbor/labs.jpg", w: 1200, h: 900, kind: "landmark", caption: "UW Friday Harbor Labs" },
      { src: "assets/img/trips/friday-harbor/tide-flats.jpg", w: 900, h: 1200, kind: "shore", caption: "Walking out across the tide flats" },
      { src: "assets/img/trips/friday-harbor/summit-view.jpg", w: 1200, h: 900, kind: "forest", caption: "Forest and sea from the summit" },
      { src: "assets/img/trips/friday-harbor/moonrise.jpg", w: 900, h: 1200, kind: "evening", caption: "Moonrise over the strait" },
      { src: "assets/img/trips/friday-harbor/driftwood-beach.jpg", w: 1200, h: 900, kind: "evening", caption: "Driftwood beach at sunset" },
    ],
  },
  Oregon: {
    note: "",
    photos: [
      { src: "assets/img/trips/oregon/multnomah.jpg", w: 900, h: 1200, kind: "falls", caption: "Multnomah Falls" },
      { src: "assets/img/trips/oregon/cannon-beach.jpg", w: 900, h: 1200, kind: "beach", caption: "Barefoot on Cannon Beach" },
      { src: "assets/img/trips/oregon/south-falls.jpg", w: 900, h: 1200, kind: "falls", caption: "Behind South Falls at Silver Falls" },
      { src: "assets/img/trips/oregon/heron-pond.jpg", w: 900, h: 1200, kind: "people", caption: "Spotting a heron by the pond" },
      { src: "assets/img/trips/oregon/crown-point.jpg", w: 900, h: 1200, kind: "vista", caption: "The Columbia River Gorge from Crown Point" },
      { src: "assets/img/trips/oregon/gorge-trail.jpg", w: 900, h: 1200, kind: "people", caption: "On the trail through the gorge" },
      { src: "assets/img/trips/oregon/haystack-rock.jpg", w: 900, h: 1200, kind: "beach", caption: "Haystack Rock at Cannon Beach" },
      { src: "assets/img/trips/oregon/bridal-veil.jpg", w: 900, h: 1200, kind: "falls", caption: "Bridal Veil Falls" },
      { src: "assets/img/trips/oregon/late-sun.jpg", w: 900, h: 1200, kind: "vista", caption: "Late sun over the canyon" },
    ],
  },
};

const PLACEHOLDER_COUNT = 6;
// Mixed shapes so the placeholder collage looks like real photos would.
const PLACEHOLDER_RATIOS = ["4 / 3", "3 / 4", "1 / 1", "3 / 2", "4 / 5", "4 / 3"];
const PHOTO_TILTS = [-2.5, 1.8, -1.2, 2.6, -2, 1.2, -1.6, 2.2];
const TAPED_EVERY = 3; // every third photo gets a strip of tape

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function albumPhotos(album) {
  if (album.photos.length) return album.photos;
  return Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => ({
    placeholder: true,
    ratio: PLACEHOLDER_RATIOS[i % PLACEHOLDER_RATIOS.length],
    caption: `Photo ${i + 1} caption`,
  }));
}

function photoMarkup(photo, i) {
  const tilt = PHOTO_TILTS[i % PHOTO_TILTS.length];
  const taped = i % TAPED_EVERY === 0 ? " is-taped" : "";
  const picture = photo.placeholder
    ? `<div class="album-placeholder" style="aspect-ratio: ${photo.ratio}"><span>Photo ${i + 1}</span></div>`
    : `<img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || photo.caption || "")}"${photo.w ? ` width="${photo.w}" height="${photo.h}"` : ""} loading="lazy" decoding="async">`;
  const caption = photo.caption ? `<figcaption>${escapeHtml(photo.caption)}</figcaption>` : "";
  return `<li class="album-photo${taped}" style="--i: ${i}; --tilt: ${tilt}deg"><figure>${picture}${caption}</figure></li>`;
}

// Columns for the collage: three on wider screens, two on phones.
const NARROW = window.matchMedia("(max-width: 599.98px)");
const CAPTION_ALLOWANCE = 0.22; // frame and caption height, as a share of the photo's width

// How tall a photo stands in its column, relative to the column's width.
function photoHeight(photo) {
  if (photo.w && photo.h) return photo.h / photo.w + CAPTION_ALLOWANCE;
  const [rw, rh] = String(photo.ratio || "4 / 3").split("/").map(Number);
  return rh / rw + CAPTION_ALLOWANCE;
}

const SIDE_OVERLAP = 0.4;     // frames in neighbouring columns sit "side by side" if they share this much height
const SEARCH_LIMIT = 60000;   // steps before settling for the arrangement with the fewest clashes

// How many already-placed frames of the same kind a photo would touch if it went at the bottom of
// column `ci`: the frame directly above it, and frames beside it in the neighbouring columns.
function clashes(columns, ci, photo) {
  if (!photo.kind) return 0;
  const top = columns[ci].height;
  const bottom = top + photoHeight(photo);
  const above = columns[ci].items[columns[ci].items.length - 1];
  let n = above && above.photo.kind === photo.kind ? 1 : 0;
  for (const side of [columns[ci - 1], columns[ci + 1]]) {
    if (!side) continue;
    n += side.items.filter((it) => it.photo.kind === photo.kind &&
      Math.min(bottom, it.bottom) - Math.max(top, it.top) > SIDE_OVERLAP).length;
  }
  return n;
}

// Counts touching same-kind pairs in a finished layout. The CSS stretches every column to the
// tallest one, spreading a shorter column's spare height between its frames, so positions are
// adjusted the same way here before frames in neighbouring columns are compared.
function finalClashes(columns) {
  const tallest = Math.max(...columns.map((c) => c.height));
  const placed = columns.map((c) => {
    const gap = c.items.length > 1 ? (tallest - c.height) / (c.items.length - 1) : 0;
    return c.items.map((it, k) => ({ kind: it.photo.kind, top: it.top + k * gap, bottom: it.bottom + k * gap }));
  });
  let n = 0;
  placed.forEach((col, ci) => {
    col.forEach((it, k) => {
      if (!it.kind) return;
      if (k > 0 && col[k - 1].kind === it.kind) n++;
      const right = placed[ci + 1] || [];
      n += right.filter((o) => o.kind === it.kind &&
        Math.min(it.bottom, o.bottom) - Math.max(it.top, o.top) > SIDE_OVERLAP).length;
    });
  });
  return n;
}

// Arranges the photos into columns. Each step fills the shortest column, so the columns end up
// close to the same height. It searches for an arrangement where no two photos of the same kind
// touch (no two sunsets side by side, say), trying photos in album order so the result stays as
// close to that order as it can. If none exists it keeps the one with the fewest clashes.
function arrange(photos, count) {
  const items = photos.map((photo, i) => ({ photo, i }));
  const columns = Array.from({ length: count }, () => ({ height: 0, items: [] }));
  let best = null;
  let steps = 0;

  const snapshot = (total) => ({ total, cols: columns.map((c) => c.items.slice()) });
  const visit = (remaining, total) => {
    if (best && best.total === 0) return;
    if (++steps > SEARCH_LIMIT) return;
    if (!remaining.length) {
      // Score the finished layout as it will actually look, with short columns spread out.
      const score = finalClashes(columns);
      if (!best || score < best.total) best = snapshot(score);
      return;
    }
    const ci = columns.reduce((b, c, idx) => (c.height < columns[b].height - 0.01 ? idx : b), 0);
    const col = columns[ci];
    // Clash-free photos first, each group in album order.
    const order = remaining.map((it, idx) => ({ it, idx, c: clashes(columns, ci, it.photo) }))
      .sort((a, b) => a.c - b.c || a.it.i - b.it.i);
    for (const { it, idx, c } of order) {
      const top = col.height;
      col.height += photoHeight(it.photo);
      col.items.push({ ...it, top, bottom: col.height });
      visit(remaining.filter((_, j) => j !== idx), total + c);
      col.items.pop();
      col.height = top;
      if (best && best.total === 0) return;
    }
  };
  visit(items, 0);
  return best.cols;
}

function layoutColumns(photos, count) {
  return arrange(photos, count)
    .map((col) => `<ul class="album-col">${col.map(({ photo, i }) => photoMarkup(photo, i)).join("")}</ul>`)
    .join("");
}

// Reads what the album needs straight from the stamp, so the page and the stamp always agree.
function readStamp(button) {
  const li = button.closest(".trip");
  return {
    country: button.querySelector(".trip-country")?.textContent.trim() || "",
    coords: button.querySelector(".trip-coords")?.textContent.trim() || "",
    ink: li.style.getPropertyValue("--stamp-ink") || "var(--ink)",
    tilt: li.style.getPropertyValue("--tilt") || "0deg",
    stampHtml: button.innerHTML,
    shape: [...button.classList].find((c) => c.startsWith("trip--")) || "trip--round",
  };
}

function buildDialog() {
  const dialog = document.createElement("dialog");
  dialog.className = "trip-album";
  dialog.setAttribute("aria-labelledby", "album-title");
  dialog.innerHTML = `
    <div class="album-page">
      <header class="album-head">
        <div class="album-title-block">
          <p class="album-coords"></p>
          <h2 id="album-title"></h2>
          <p class="album-note"></p>
        </div>
        <span class="album-stamp-wrap" aria-hidden="true"><span class="trip-face album-stamp"></span></span>
        <button type="button" class="album-close" aria-label="Close album">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </header>
      <div class="album-grid"></div>
    </div>`;
  document.body.appendChild(dialog);
  return dialog;
}

function setupTripAlbums() {
  const stamps = document.querySelectorAll(".trips .trip-face");
  if (!stamps.length || typeof HTMLDialogElement === "undefined") return;
  const dialog = buildDialog();
  const page = dialog.querySelector(".album-page");
  const stamp = dialog.querySelector(".album-stamp");

  const close = () => dialog.close();
  dialog.querySelector(".album-close").addEventListener("click", close);
  // A click on the dimmed backdrop (the dialog itself, outside the page) closes the album.
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener("close", () => document.documentElement.classList.remove("album-open"));

  const grid = dialog.querySelector(".album-grid");
  let shownPhotos = [];
  const drawGrid = () => { grid.innerHTML = layoutColumns(shownPhotos, NARROW.matches ? 2 : 3); };
  // Rotating a phone or resizing the window re-flows an open album into the right number of columns.
  NARROW.addEventListener("change", () => { if (dialog.open) drawGrid(); });

  stamps.forEach((button) => {
    const country = button.querySelector(".trip-country")?.textContent.trim() || "";
    if (TRIP_ALBUMS[country]?.noAlbum) {
      // A plain stamp: still shown, but not a control, since there is nothing to open.
      button.disabled = true;
      button.classList.add("is-plain");
      return;
    }
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", () => {
      const trip = readStamp(button);
      const album = TRIP_ALBUMS[trip.country] || { note: "", photos: [] };
      page.style.setProperty("--stamp-ink", trip.ink);
      page.style.setProperty("--album-tilt", trip.tilt);
      dialog.querySelector(".album-coords").textContent = trip.coords;
      dialog.querySelector("#album-title").textContent = trip.country;
      const note = dialog.querySelector(".album-note");
      note.textContent = album.note || (album.photos.length ? "" : "Photos from this trip are coming soon.");
      note.hidden = !note.textContent;
      stamp.className = `trip-face album-stamp ${trip.shape}`;
      stamp.innerHTML = trip.stampHtml;
      shownPhotos = albumPhotos(album);
      drawGrid();
      document.documentElement.classList.add("album-open");
      dialog.showModal();
      // A closed dialog can't be scrolled, so start each album at its top once it's open.
      page.scrollTop = 0;
      requestAnimationFrame(() => { page.scrollTop = 0; });
    });
  });
}

document.addEventListener("DOMContentLoaded", setupTripAlbums);
