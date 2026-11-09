/* =========================================================
   Contact page: the postcard form.
   GitHub Pages can't send mail, so the note goes through a relay
   that emails it on:
   - Web3Forms (web3forms.com), fast, once WEB3FORMS_KEY is set.
     The access key is meant to sit in public page code; it only
     lets people send notes to the inbox it was issued for.
   - Otherwise FormSubmit (formsubmit.co) to SITE.contactEmail,
     which is slow and needs a one-time activation click.
   Loaded after site.js (SITE) and motion.js.
   ========================================================= */

// Web3Forms access key for the site's inbox. Clear it to fall back to FormSubmit.
const WEB3FORMS_KEY = "e513036f-9396-4c75-961c-401d9d218dcd";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const FORMSUBMIT_ENDPOINT = (email) => `https://formsubmit.co/ajax/${encodeURIComponent(email)}`;
const MAX_LENGTHS = { name: 120, email: 200, message: 4000 };
const SLOW_NOTICE_MS = 5000;     // only FormSubmit is slow enough for this to show
const GIVE_UP_MS = 120000;       // after this, stop waiting and point people to email

// FormSubmit holds every note until the address owner clicks its one-time activation link.
class NeedsActivationError extends Error {}
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function fillContactDetails() {
  document.querySelectorAll("[data-contact-text]").forEach((n) => (n.textContent = SITE.contactEmail));
  const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  document.querySelectorAll("[data-postmark-date]").forEach((n) => (n.textContent = date));
}

// Checks the fields and returns the first problem, or null if the note is ready to send.
function validate(data) {
  if (!data.message) return { field: "message", text: "Write a message before sending." };
  if (!data.name) return { field: "name", text: "Add your name so I know who it's from." };
  if (!EMAIL_PATTERN.test(data.email)) return { field: "email", text: "Add an email address I can reply to." };
  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    if (data[field].length > max) return { field, text: `That ${field} is too long.` };
  }
  return null;
}

function readForm(form) {
  const get = (name) => String(form.elements[name]?.value || "").trim();
  return { name: get("name"), email: get("email"), topic: get("topic"), message: get("message"), honey: get("_honey") };
}

// The request for whichever relay is in use: where it goes and what it sends.
function buildRequest(data) {
  const subject = `Pelagic Research: ${data.topic}`;
  if (WEB3FORMS_KEY) {
    return {
      url: WEB3FORMS_ENDPOINT,
      payload: {
        access_key: WEB3FORMS_KEY,
        subject,
        from_name: "Pelagic Research website",
        name: data.name,
        email: data.email,
        topic: data.topic,
        message: data.message,
        botcheck: data.honey,
      },
    };
  }
  return {
    url: FORMSUBMIT_ENDPOINT(SITE.contactEmail),
    payload: {
      name: data.name,
      email: data.email,
      topic: data.topic,
      message: data.message,
      _subject: subject,
      _replyto: data.email,
      _template: "table",
      _honey: data.honey,
    },
  };
}

async function sendNote(data) {
  const { url, payload } = buildRequest(data);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GIVE_UP_MS);
  const res = await fetch(url, {
    method: "POST",
    signal: controller.signal,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  }).finally(() => clearTimeout(timer));
  const body = await res.json().catch(() => ({}));
  if (!WEB3FORMS_KEY && /activat/i.test(body.message || "")) throw new NeedsActivationError(body.message);
  // A 2xx answer means the relay accepted the note unless it says outright that it didn't.
  if (!res.ok || String(body.success) === "false") throw new Error(body.message || `HTTP ${res.status}`);
}

function setupPostcard() {
  const form = document.getElementById("postcard");
  if (!form) return;
  const status = form.querySelector(".postcard-status");
  const button = form.querySelector(".postcard-send");

  const say = (text, tone) => {
    status.textContent = text;
    status.dataset.tone = tone || "";
  };

  form.addEventListener("input", (e) => {
    e.target.removeAttribute("aria-invalid");
    if (status.dataset.tone === "error") say("");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.classList.contains("is-sending")) return;
    const data = readForm(form);
    const problem = validate(data);
    if (problem) {
      const field = form.elements[problem.field];
      field.setAttribute("aria-invalid", "true");
      field.focus();
      say(problem.text, "error");
      return;
    }

    form.classList.add("is-sending");
    button.disabled = true;
    button.textContent = "Sending…";
    say("");
    // The relay is slow, so after a few seconds say so instead of looking stuck.
    const slowNotice = setTimeout(() => say("Still sending. This can take up to a minute, so keep this page open.", "wait"), SLOW_NOTICE_MS);
    try {
      await sendNote(data);
      form.classList.add("is-sent");
      form.querySelectorAll("input, textarea, select").forEach((el) => (el.disabled = true));
      button.textContent = "Sent";
      say(`Thanks, ${data.name.split(" ")[0]}. Your note is on its way, and I'll reply to ${data.email}.`, "ok");
    } catch (err) {
      console.error("Contact form failed to send:", err);
      button.disabled = false;
      button.textContent = "Send note";
      const why = err instanceof NeedsActivationError
        ? "The message form isn't switched on yet, so your note wasn't delivered."
        : err.name === "AbortError"
          ? "Sending took too long and was stopped, so your note may not have arrived."
          : "That didn't go through.";
      say(`${why} You can email me directly at ${SITE.contactEmail}.`, "error");
    } finally {
      clearTimeout(slowNotice);
      form.classList.remove("is-sending");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillContactDetails();
  setupPostcard();
});
