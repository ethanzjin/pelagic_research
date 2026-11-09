/* =========================================================
   Contact page: the postcard form.
   GitHub Pages can't send mail, so the note goes through
   FormSubmit (formsubmit.co), which forwards it to
   SITE.contactEmail. The very first message sent from the live
   site makes FormSubmit email an activation link to that address;
   until it is clicked, notes are held, not delivered.
   Loaded after site.js (SITE) and motion.js.
   ========================================================= */

const FORM_ENDPOINT = (email) => `https://formsubmit.co/ajax/${encodeURIComponent(email)}`;
const MAX_LENGTHS = { name: 120, email: 200, message: 4000 };
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

async function sendNote(data) {
  const res = await fetch(FORM_ENDPOINT(SITE.contactEmail), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      topic: data.topic,
      message: data.message,
      _subject: `Pelagic Research: ${data.topic}`,
      _replyto: data.email,
      _template: "table",
      _honey: data.honey,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || String(body.success) !== "true") throw new Error(body.message || `HTTP ${res.status}`);
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
      say(`That didn't go through. You can email me directly at ${SITE.contactEmail}.`, "error");
    } finally {
      form.classList.remove("is-sending");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillContactDetails();
  setupPostcard();
});
