/* =========================================================
   About me: favorite songs.
   Each song is a record in its sleeve. Clicking one slides the
   disc out, sets it spinning and opens that song's player under
   it; clicking again (or another record) stops it. Nothing ever
   plays on its own.
   Audio comes from Spotify's official embed, so the site never
   hosts song files: signed-in Spotify listeners hear the full
   track, everyone else a 30-second preview.
   Loaded only on about-me.html.

   To add a song, fill in an entry below:
     title, artist   shown under the sleeve
     album           optional album name, shown after the artist
     note            optional one-line reason you love it
     cover           album art, e.g. "assets/img/songs/<album>.jpg" (480px square)
     spotify         the track's Spotify link, e.g.
                     "https://open.spotify.com/track/<id>"
   Entries without a cover or link show placeholders.
   ========================================================= */

// Order matters: songs from the same album sit apart, so matching covers never touch whether the
// records show four to a row (laptop) or two to a row (phone). Same-album pairs are at
// positions 1 & 6 and 3 & 8, which are never side by side or stacked in either layout.
const SONGS = [
  { title: "Someday", artist: "The Strokes", album: "Is This It", cover: "assets/img/songs/is-this-it.jpg", spotify: "https://open.spotify.com/track/7hm4HTk9encxT0LYC0J6oI" },
  { title: "You Only Live Once", artist: "The Strokes", album: "First Impressions of Earth", cover: "assets/img/songs/first-impressions-of-earth.jpg", spotify: "https://open.spotify.com/track/4fPBB44eDH71YohayI4eKV" },
  { title: "Ode To The Mets", artist: "The Strokes", album: "The New Abnormal", cover: "assets/img/songs/the-new-abnormal.jpg", spotify: "https://open.spotify.com/track/1BLOVHYYlH4JUHQGcpt75R" },
  { title: "Fluorescent Adolescent", artist: "Arctic Monkeys", album: "Favourite Worst Nightmare", cover: "assets/img/songs/favourite-worst-nightmare.jpg", spotify: "https://open.spotify.com/track/7e8utCy2JlSB8dRHKi49xM" },
  { title: "Love is a Laserquest", artist: "Arctic Monkeys", album: "Suck It and See", cover: "assets/img/songs/suck-it-and-see.jpg", spotify: "https://open.spotify.com/track/7wsEZh68qX7jY0dziXMb0H" },
  { title: "Hard To Explain", artist: "The Strokes", album: "Is This It", cover: "assets/img/songs/is-this-it.jpg", spotify: "https://open.spotify.com/track/0OM9ri37LIbPc9hffwsyb1" },
  { title: "Under Cover of Darkness", artist: "The Strokes", album: "Angles", cover: "assets/img/songs/angles.jpg", spotify: "https://open.spotify.com/track/6u0x5ad9ewHvs3z6u9Oe3c" },
  { title: "Selfless", artist: "The Strokes", album: "The New Abnormal", cover: "assets/img/songs/the-new-abnormal.jpg", spotify: "https://open.spotify.com/track/2t0wwvR15fc3K1ey8OiOaN" },
];

// Each record's label and placeholder cover take one of the site's inks, in turn.
const RECORD_INKS = ["var(--pen)", "var(--sell)", "var(--accumulate)", "var(--hold)"];
const RECORD_TILTS = [-2, 1.5, -1, 2];

const escapeText = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Accepts a Spotify track link (or a bare id) and returns the track id, or "" if it isn't one.
function spotifyTrackId(link) {
  const m = String(link || "").match(/(?:track[/:])?([A-Za-z0-9]{22})(?:\?|$)/);
  return m ? m[1] : "";
}

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

// The player that opens under a playing record: Spotify's embed, or a labelled placeholder.
function playerMarkup(song) {
  const id = spotifyTrackId(song.spotify);
  if (!id) {
    return `<div class="player-placeholder"><span class="player-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Spotify player for this song appears here</div>`;
  }
  return `<iframe title="${escapeText(song.title)} on Spotify" src="https://open.spotify.com/embed/track/${id}?utm_source=generator&amp;theme=0" width="100%" height="80" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
}

// Spotify's iFrame API lets the page start a song with one click on its record, instead of the
// listener also having to press play inside the player. It loads in the background; until it is
// ready (or if it is blocked) the plain embed is used, which plays from its own button.
let spotifyApi = null;
window.onSpotifyIframeApiReady = (api) => { spotifyApi = api; };
function loadSpotifyApi() {
  if (document.querySelector("script[data-spotify-api]")) return;
  const s = document.createElement("script");
  s.src = "https://open.spotify.com/embed/iframe-api/v1";
  s.async = true;
  s.dataset.spotifyApi = "";
  document.head.appendChild(s);
}

// Opens the player for a record and, where the API is ready, starts it straight away.
function openPlayer(player, song) {
  const id = spotifyTrackId(song.spotify);
  if (!id || !spotifyApi) {
    player.innerHTML = playerMarkup(song);
    return;
  }
  const mount = document.createElement("div");
  player.replaceChildren(mount);
  spotifyApi.createController(mount, { uri: `spotify:track:${id}`, width: "100%", height: 80 }, (controller) => {
    player.spotifyController = controller;
    controller.addListener("ready", () => controller.play());
  });
}

function setupSongs() {
  const list = document.querySelector("[data-songs]");
  if (!list) return;
  list.innerHTML = SONGS.map(recordMarkup).join("");
  if (SONGS.some((s) => spotifyTrackId(s.spotify))) loadSpotifyApi();

  const stop = (li) => {
    li.classList.remove("is-playing");
    li.querySelector(".record-play").setAttribute("aria-pressed", "false");
    const player = li.querySelector(".record-player");
    try { player.spotifyController?.destroy(); } catch (err) { /* the player is removed below either way */ }
    player.spotifyController = null;
    player.innerHTML = ""; // removing the embed stops its audio
    player.hidden = true;
  };

  list.addEventListener("click", (e) => {
    const button = e.target.closest(".record-play");
    if (!button) return;
    const li = button.closest(".record");
    const wasPlaying = li.classList.contains("is-playing");
    list.querySelectorAll(".record.is-playing").forEach(stop); // one record at a time
    if (wasPlaying) return;
    const song = SONGS[Number(button.dataset.index)];
    li.classList.add("is-playing");
    button.setAttribute("aria-pressed", "true");
    const player = li.querySelector(".record-player");
    player.hidden = false;
    openPlayer(player, song);
  });
}

// Runs before motion.js sets up its reveals, so the records get the same entrance as the rest of the page.
setupSongs();
