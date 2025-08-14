window.__SEED__ = [
  {
    id: 1,
    content: "Bienvenue dans la messagerie",
    userId: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    user: { id: 2, name: "Bob Dupont", username: "bob_d" },
  },
  {
    id: 2,
    content: "Ceci est un message test",
    userId: 3,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    user: { id: 3, name: "Claire Moreau", username: "claire_m" },
  },
];

let messages = window.__SEED__ || [];

const currentUserId = 1;
const currentUser = {
  id: currentUserId,
  name: "Tolotra RAndria",
  username: "Pyrrex",
};

function getNextId(list) {
  if (!Array.isArray(list) || list.length === 0) return 1;
  let max = 0;
  for (const m of list) {
    if (typeof m.id === "number" && Number.isFinite(m.id)) {
      if (m.id > max) max = m.id;
    }
  }
  return max + 1;
}

function buildMessage({ content, userId, user }) {
  const now = new Date().toISOString();
  return {
    id: getNextId(messages),
    content: String(content).trim(),
    userId: userId,
    createdAt: now,
    updatedAt: now,
    user: { id: user.id, name: user.name, username: user.username },
  };
}

function validateContent(value) {
  if (value == null) return { ok: false, reason: "Le contenu est requis." };
  const trimmed = String(value).trim();
  if (trimmed.length === 0)
    return { ok: false, reason: "Le contenu ne peut pas être vide." };
  if (trimmed.length > 500)
    return { ok: false, reason: "Le message dépasse 500 caractères." };
  return { ok: true, value: trimmed };
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const messageList = document.getElementById("messages");
const detailsDiv = document.getElementById("details");
const form = document.getElementById("form");
const contentEl = document.getElementById("content");
const feedbackEl = document.getElementById("feedback");
const submitBtn = document.getElementById("submitBtn");

function renderMessages() {
  // Tri décroissant par createdAt puis id
  const sorted = [...messages].sort((a, b) => {
    const ta = +new Date(a.createdAt || 0);
    const tb = +new Date(b.createdAt || 0);
    if (tb !== ta) return tb - ta;
    return (b.id || 0) - (a.id || 0);
  });

  messageList.innerHTML = "";
  for (const msg of sorted) {
    const li = document.createElement("li");
    li.className = "item";
    const avatar = document.createElement("div");
    avatar.className = "avatar";

    const initials = (msg.user?.name || "?")
      .split(/\s+/)
      .map((s) => s[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join("");
    avatar.textContent = initials || "??";

    const contentBox = document.createElement("div");
    contentBox.style.flex = "1 1 auto";
    const meta = document.createElement("div");
    meta.className = "meta";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = msg.user?.name ?? "Inconnu";
    const whenSpan = document.createElement("span");
    whenSpan.textContent = "· " + formatDate(msg.createdAt);
    meta.appendChild(nameSpan);
    meta.appendChild(whenSpan);

    const textP = document.createElement("div");
    textP.className = "content";
    textP.textContent = msg.content;

    contentBox.appendChild(meta);
    contentBox.appendChild(textP);

    li.appendChild(avatar);
    li.appendChild(contentBox);

    li.addEventListener("click", () => renderDetails(msg));
    messageList.appendChild(li);
  }

  if (sorted.length === 0) {
    const empty = document.createElement("li");
    empty.className = "item";
    empty.innerHTML =
      '<div class="content">Aucun message pour le moment.</div>';
    messageList.appendChild(empty);
  }
}

function renderDetails(msg) {
  detailsDiv.classList.remove("empty");
  detailsDiv.innerHTML = `
        <div class="row"><div class="label">Auteur</div><div class="value">${escapeHtml(
          msg.user?.name
        )} <span class="pill">@${escapeHtml(
    msg.user?.username
  )}</span></div></div>
        <div class="row"><div class="label">Message</div><div class="value">${escapeHtml(
          msg.content
        )}</div></div>
        <div class="row"><div class="label">ID</div><div class="value">${
          msg.id
        }</div></div>
        <div class="row"><div class="label">Créé le</div><div class="value">${formatDate(
          msg.createdAt
        )}</div></div>
        <div class="row"><div class="label">Mis à jour le</div><div class="value">${formatDate(
          msg.updatedAt
        )}</div></div>
      `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createMessage(content) {
  const validation = validateContent(content);
  if (!validation.ok) {
    setFeedback(validation.reason, "error");
    return null;
  }

  const msg = buildMessage({
    content: validation.value,
    userId: currentUserId,
    user: currentUser,
  });

  messages = [msg, ...messages];
  setFeedback("Message créé avec succès.", "ok");
  return msg;
}

function setFeedback(text, type) {
  feedbackEl.className = type === "ok" ? "ok" : "error";
  feedbackEl.textContent = text || "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  submitBtn.disabled = true;

  const value = contentEl.value;
  const created = createMessage(value);

  if (created) {
    contentEl.value = "";
    renderMessages();
    renderDetails(created);
  }

  submitBtn.disabled = false;
  contentEl.focus();
});

contentEl.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    submitBtn.click();
  }
});

renderMessages();
