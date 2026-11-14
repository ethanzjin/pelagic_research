/* =========================================================
   About me: favorite songs.
   Each song is a record in its sleeve. Tapping one slides the
   disc out, sets it spinning and plays the song's official
   30-second Spotify preview right away; tapping again (or another
   record) stops it. Nothing ever plays on its own.
   The audio is played by the page itself during the tap, which is
   what phones require; it streams from Spotify's preview server,
   so the site never hosts song files. A "Full song on Spotify"
   link appears under the playing record.
   Loaded only on about-me.html.

   To add a song, fill in an entry below:
     title, artist   shown under the sleeve
     album           optional album name, shown after the artist
     note            optional one-line reason you love it
     cover           album art, e.g. "assets/img/songs/<album>.jpg" (480px square)
     spotify         the track's Spotify link, e.g.
                     "https://open.spotify.com/track/<id>"
     preview         the track's 30-second preview clip, found in the
                     page source of open.spotify.com/embed/track/<id>
                     (search for "p.scdn.co/mp3-preview")
   Entries without a cover show a placeholder.
   ========================================================= */

// Order matters: songs from the same album sit apart, so matching covers never touch whether the
// records show four to a row (laptop) or two to a row (phone). Same-album pairs are at
// positions 1 & 6 and 3 & 8, which are never side by side or stacked in either layout.
const SONGS = [
  { title: "Someday", artist: "The Strokes", album: "Is This It", cover: "assets/img/songs/is-this-it.jpg", spotify: "https://open.spotify.com/track/7hm4HTk9encxT0LYC0J6oI",
    preview: "https://p.scdn.co/mp3-preview/241189aa54503d502d3e06cf6996a87a27f73a81" },
  { title: "You Only Live Once", artist: "The Strokes", album: "First Impressions of Earth", cover: "assets/img/songs/first-impressions-of-earth.jpg", spotify: "https://open.spotify.com/track/4fPBB44eDH71YohayI4eKV",
    preview: "https://p.scdn.co/mp3-preview/4e65165f1a88d641bec5f181ffb8ba4d516a9c39" },
  { title: "Ode To The Mets", artist: "The Strokes", album: "The New Abnormal", cover: "assets/img/songs/the-new-abnormal.jpg", spotify: "https://open.spotify.com/track/1BLOVHYYlH4JUHQGcpt75R",
    preview: "https://p.scdn.co/mp3-preview/2d3fa8428d3dff3cfff3c2349194cfd560075a8a" },
  { title: "Fluorescent Adolescent", artist: "Arctic Monkeys", album: "Favourite Worst Nightmare", cover: "assets/img/songs/favourite-worst-nightmare.jpg", spotify: "https://open.spotify.com/track/7e8utCy2JlSB8dRHKi49xM",
    preview: "https://p.scdn.co/mp3-preview/5d554321da6089f449862bf515d63fe3f80829f9" },
  { title: "Love is a Laserquest", artist: "Arctic Monkeys", album: "Suck It and See", cover: "assets/img/songs/suck-it-and-see.jpg", spotify: "https://open.spotify.com/track/7wsEZh68qX7jY0dziXMb0H",
    preview: "https://p.scdn.co/mp3-preview/72d43d88ed129ddebe431e9cbcc8e4031670ecaf" },
  { title: "Hard To Explain", artist: "The Strokes", album: "Is This It", cover: "assets/img/songs/is-this-it.jpg", spotify: "https://open.spotify.com/track/0OM9ri37LIbPc9hffwsyb1",
    preview: "https://p.scdn.co/mp3-preview/71144fab351034d82cb1a2ef60fcd4f0f5d5979f" },
  { title: "Under Cover of Darkness", artist: "The Strokes", album: "Angles", cover: "assets/img/songs/angles.jpg", spotify: "https://open.spotify.com/track/6u0x5ad9ewHvs3z6u9Oe3c",
    preview: "https://p.scdn.co/mp3-preview/392943fec90313dec65b40afa326c3c822984b1d" },
  { title: "Selfless", artist: "The Strokes", album: "The New Abnormal", cover: "assets/img/songs/the-new-abnormal.jpg", spotify: "https://open.spotify.com/track/2t0wwvR15fc3K1ey8OiOaN",
    preview: "https://p.scdn.co/mp3-preview/4d9ef2f5c4f6aab389563bae3d4baa575e2c004f" },
];

// Each record's label and placeholder cover take one of the site's inks, in turn.
const RECORD_INKS = ["var(--pen)", "var(--sell)", "var(--accumulate)", "var(--hold)"];
const RECORD_TILTS = [-2, 1.5, -1, 2];

const escapeText = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function coverMarkup(song, n) {
  if (song.cover) {
    return `<img class="sleeve-art" src="${escapeText(song.cover)}" alt="" width="600" height="600" loading="lazy" decoding="async">`;
  }
  return `<span class="sleeve-art sleeve-placeholder"><span>Album cover</span><span class="sleeve-no">No. ${n}</span></span>`;
}

function recordMarkup(song, i) {
  const n = String(i + 1).padStart(2, "0");
  const label = `${song.title} by ${song.artist}`;
  return `
    <li class="record" style="--record-ink: ${RECORD_INKS[i % RECORD_INKS.length]}; --tilt: ${RECORD_TILTS[i % RECORD_TILTS.length]}deg" data-reveal>
      <button type="button" class="record-play" aria-pressed="false" aria-label="Play ${escapeText(label)}" data-index="${i}">
        <span class="record-disc" aria-hidden="true"><span class="record-label"></span></span>
        <span class="record-sleeve">${coverMarkup(song, n)}</span>
        <span class="record-state" aria-hidden="true">
          <svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>
          <svg class="icon-pause" viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
        </span>
      </button>
      <div class="record-text">
        <p class="record-title">${escapeText(song.title)}</p>
        <p class="record-artist">${escapeText(song.artist)}${song.album ? `<span class="record-album"> · ${escapeText(song.album)}</span>` : ""}</p>
        ${song.note ? `<p class="record-note">${escapeText(song.note)}</p>` : ""}
      </div>
      <div class="record-player" hidden></div>
    </li>`;
}

// The line that opens under a playing record: a progress bar and a link to the full song.
function playerMarkup(song) {
  const link = song.spotify
    ? `<a class="player-link" href="${escapeText(song.spotify)}" target="_blank" rel="noopener">Full song on Spotify<span aria-hidden="true"> ↗</span></a>`
    : "";
  return `<div class="player-line"><span class="player-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>` +
    `<span class="player-track" aria-hidden="true"><span class="player-fill"></span></span>${link}</div>`;
}

function setupSongs() {
  const list = document.querySelector("[data-songs]");
  if (!list) return;
  list.innerHTML = SONGS.map(recordMarkup).join("");

  // One shared audio element. Phones only let a page start sound from inside a tap, so play()
  // is called right in the click handler below, never after a wait.
  const audio = new Audio();
  audio.preload = "none";
  let current = null; // the <li> that is playing

  const stop = () => {
    if (!current) return;
    audio.pause();
    current.classList.remove("is-playing", "is-loading");
    current.querySelector(".record-play").setAttribute("aria-pressed", "false");
    const player = current.querySelector(".record-player");
    player.innerHTML = "";
    player.hidden = true;
    current = null;
  };

  audio.addEventListener("timeupdate", () => {
    const fill = current?.querySelector(".player-fill");
    if (fill && audio.duration) fill.style.transform = `scaleX(${audio.currentTime / audio.duration})`;
  });
  audio.addEventListener("playing", () => current?.classList.remove("is-loading"));
  audio.addEventListener("ended", stop);
  audio.addEventListener("error", () => {
    if (!current) return;
    // The clip didn't load: keep the record open and offer the song on Spotify instead.
    current.classList.remove("is-loading");
    current.classList.add("is-error");
  });

  list.addEventListener("click", (e) => {
    const button = e.target.closest(".record-play");
    if (!button) return;
    const li = button.closest(".record");
    const wasPlaying = li === current;
    stop(); // one record at a time
    if (wasPlaying) return;
    const song = SONGS[Number(button.dataset.index)];
    current = li;
    li.classList.remove("is-error");
    li.classList.add("is-playing", "is-loading");
    button.setAttribute("aria-pressed", "true");
    const player = li.querySelector(".record-player");
    player.innerHTML = playerMarkup(song);
    player.hidden = false;
    if (!song.preview) { li.classList.add("is-error"); li.classList.remove("is-loading"); return; }
    audio.src = song.preview;
    const started = audio.play();
    if (started) started.catch(() => { if (current === li) { li.classList.remove("is-loading"); li.classList.add("is-error"); } });
  });
}

// Runs before motion.js sets up its reveals, so the records get the same entrance as the rest of the page.
setupSongs();
