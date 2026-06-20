(function () {
  // ─── Config ───────────────────────────────────────────────────────────────
  const SUPABASE_URL = "https://VOTRE_PROJET.supabase.co";
  const SUPABASE_KEY = "VOTRE_ANON_KEY";
  const N8N_WEBHOOK  = "https://universe19.app.n8n.cloud/webhook-test/quoteflow";

  // ─── Récupère le client_id depuis la balise script ───────────────────────
  const scriptTag   = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const CLIENT_ID   = (scriptTag && scriptTag.getAttribute("data-client")) || "demo";

  // ─── Styles injectés ─────────────────────────────────────────────────────
  const css = `
    #qf-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--qf-color, #7C3AED);
      box-shadow: 0 4px 24px rgba(124,58,237,.45);
      cursor: pointer; border: none; outline: none;
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s;
    }
    #qf-bubble:hover { transform: scale(1.08); }
    #qf-bubble svg { width: 26px; height: 26px; fill: #fff; }

    #qf-panel {
      position: fixed; bottom: 90px; right: 24px; z-index: 99999;
      width: 340px; max-height: 520px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,.18);
      display: flex; flex-direction: column;
      font-family: Inter, system-ui, sans-serif;
      overflow: hidden; opacity: 0; pointer-events: none;
      transform: translateY(12px) scale(.97);
      transition: opacity .25s, transform .25s;
    }
    #qf-panel.open { opacity: 1; pointer-events: all; transform: none; }

    #qf-header {
      background: var(--qf-color, #7C3AED);
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #qf-header-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    #qf-header-info { flex: 1; }
    #qf-header-name { color: #fff; font-weight: 600; font-size: 14px; }
    #qf-header-sub  { color: rgba(255,255,255,.75); font-size: 11px; margin-top: 1px; }
    #qf-close {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,.8); font-size: 20px; line-height: 1; padding: 0;
    }

    #qf-messages {
      flex: 1; overflow-y: auto; padding: 16px 14px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .qf-msg {
      max-width: 82%; padding: 10px 13px; border-radius: 12px;
      font-size: 13.5px; line-height: 1.45; animation: qfFade .2s ease;
    }
    .qf-msg.bot {
      background: #F3F4F6; color: #111; border-bottom-left-radius: 4px; align-self: flex-start;
    }
    .qf-msg.user {
      background: var(--qf-color, #7C3AED); color: #fff;
      border-bottom-right-radius: 4px; align-self: flex-end;
    }
    .qf-msg.success {
      background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;
      max-width: 100%; text-align: center; border-radius: 10px; font-size: 13px;
    }

    .qf-chips { display: flex; flex-wrap: wrap; gap: 6px; align-self: flex-start; }
    .qf-chip {
      padding: 7px 12px; border-radius: 20px; font-size: 12.5px; cursor: pointer;
      border: 1.5px solid var(--qf-color, #7C3AED); color: var(--qf-color, #7C3AED);
      background: #fff; transition: background .15s, color .15s;
    }
    .qf-chip:hover { background: var(--qf-color, #7C3AED); color: #fff; }

    #qf-input-area {
      padding: 10px 12px; border-top: 1px solid #F3F4F6;
      display: flex; gap: 8px; align-items: center;
    }
    #qf-input {
      flex: 1; border: 1.5px solid #E5E7EB; border-radius: 22px;
      padding: 9px 14px; font-size: 13px; outline: none;
      transition: border-color .2s; font-family: inherit;
    }
    #qf-input:focus { border-color: var(--qf-color, #7C3AED); }
    #qf-send {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: var(--qf-color, #7C3AED); cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #qf-send svg { width: 16px; height: 16px; fill: #fff; }

    .qf-typing { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
    .qf-typing span {
      width: 7px; height: 7px; border-radius: 50%; background: #9CA3AF;
      animation: qfBounce 1s infinite;
    }
    .qf-typing span:nth-child(2) { animation-delay: .15s; }
    .qf-typing span:nth-child(3) { animation-delay: .3s; }

    #qf-email-form { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    #qf-email-form input {
      border: 1.5px solid #E5E7EB; border-radius: 8px;
      padding: 9px 12px; font-size: 13px; outline: none; font-family: inherit;
    }
    #qf-email-form input:focus { border-color: var(--qf-color, #7C3AED); }
    #qf-email-form button {
      background: var(--qf-color, #7C3AED); color: #fff; border: none;
      border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: inherit;
    }

    @keyframes qfFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; } }
    @keyframes qfBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
  `;

  // ─── HTML du widget ───────────────────────────────────────────────────────
  const html = `
    <button id="qf-bubble" aria-label="Obtenir un devis">
      <svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
    </button>
    <div id="qf-panel" role="dialog" aria-label="Chat devis">
      <div id="qf-header">
        <div id="qf-header-avatar">?</div>
        <div id="qf-header-info">
          <div id="qf-header-name">Devis rapide</div>
          <div id="qf-header-sub">Réponse en 2 minutes ✓</div>
        </div>
        <button id="qf-close" aria-label="Fermer">✕</button>
      </div>
      <div id="qf-messages"></div>
      <div id="qf-input-area">
        <input id="qf-input" type="text" placeholder="Votre réponse…" autocomplete="off"/>
        <button id="qf-send" aria-label="Envoyer">
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        </button>
      </div>
    </div>
  `;

  // ─── Injection ────────────────────────────────────────────────────────────
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // ─── Références DOM ───────────────────────────────────────────────────────
  const bubble   = document.getElementById("qf-bubble");
  const panel    = document.getElementById("qf-panel");
  const closeBtn = document.getElementById("qf-close");
  const messages = document.getElementById("qf-messages");
  const input    = document.getElementById("qf-input");
  const sendBtn  = document.getElementById("qf-send");
  const avatar   = document.getElementById("qf-header-avatar");
  const nameEl   = document.getElementById("qf-header-name");

  // ─── État ─────────────────────────────────────────────────────────────────
  let config     = null;
  let step       = 0;
  let answers    = {};
  let collecting = false;

  // ─── Charge la config depuis Supabase ────────────────────────────────────
  async function loadConfig() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/clients?client_id=eq.${CLIENT_ID}&select=*`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (data && data[0]) return data[0];
    } catch (_) {}

    // Config de démo si Supabase pas encore branché
    return {
      client_id: "demo",
      nom: "QuoteFlow",
      metier: "services",
      couleur: "#7C3AED",
      questions: [
        { label: "De quoi avez-vous besoin ?", type: "chips", options: ["Nettoyage", "Plomberie", "Électricité", "Autre"] },
        { label: "C'est pour quel type de lieu ?", type: "chips", options: ["Appartement", "Maison", "Bureau", "Commerce"] },
        { label: "Quelle est la surface approximative (m²) ?", type: "text" },
        { label: "C'est pour quand ?", type: "chips", options: ["Le plus tôt possible", "Cette semaine", "Ce mois-ci", "Pas urgent"] }
      ]
    };
  }

  // ─── Helpers UI ───────────────────────────────────────────────────────────
  function applyColor(color) {
    document.documentElement.style.setProperty("--qf-color", color);
  }

  function addMsg(text, type = "bot") {
    const div = document.createElement("div");
    div.className = `qf-msg ${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "qf-msg bot";
    div.innerHTML = `<div class="qf-typing"><span></span><span></span><span></span></div>`;
    div.id = "qf-typing";
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("qf-typing");
    if (t) t.remove();
  }

  function botSay(text, delay = 600) {
    return new Promise(resolve => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg(text, "bot");
        resolve();
      }, delay);
    });
  }

  function showChips(options) {
    const div = document.createElement("div");
    div.className = "qf-chips";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "qf-chip";
      btn.textContent = opt;
      btn.onclick = () => { div.remove(); handleAnswer(opt); };
      div.appendChild(btn);
    });
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showEmailForm() {
    const div = document.createElement("div");
    div.className = "qf-msg bot";
    div.style.maxWidth = "100%";
    div.innerHTML = `
      <p style="margin:0 0 10px;font-size:13.5px">Dernière étape — où on envoie votre devis ?</p>
      <div id="qf-email-form">
        <input type="text" id="qf-fname" placeholder="Votre prénom"/>
        <input type="email" id="qf-femail" placeholder="Votre email"/>
        <input type="tel" id="qf-fphone" placeholder="Votre téléphone (optionnel)"/>
        <button id="qf-fsubmit">Recevoir mon devis gratuit →</button>
      </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    document.getElementById("qf-fsubmit").onclick = submitLead;
  }

  // ─── Logique conversation ─────────────────────────────────────────────────
  async function startConversation() {
    step = 0;
    answers = {};
    messages.innerHTML = "";

    await botSay(`Bonjour 👋 Je suis l'assistant de ${config.nom}. Je vous prépare un devis en 2 minutes !`, 700);
    askStep();
  }

  async function askStep() {
    if (step >= config.questions.length) {
      input.style.display = "none";
      sendBtn.style.display = "none";
      showEmailForm();
      return;
    }

    const q = config.questions[step];
    await botSay(q.label, 500);

    if (q.type === "chips") {
      input.style.display = "none";
      sendBtn.style.display = "none";
      showChips(q.options);
    } else {
      input.style.display = "";
      sendBtn.style.display = "";
      input.focus();
    }
  }

  function handleAnswer(value) {
    addMsg(value, "user");
    answers[`q${step + 1}`] = value;
    answers[config.questions[step].label] = value;
    step++;
    input.value = "";
    setTimeout(askStep, 300);
  }

  // ─── Soumission finale ────────────────────────────────────────────────────
  async function submitLead() {
    const fname  = document.getElementById("qf-fname").value.trim();
    const femail = document.getElementById("qf-femail").value.trim();
    const fphone = document.getElementById("qf-fphone").value.trim();

    if (!fname || !femail) {
      alert("Merci de remplir votre prénom et email.");
      return;
    }

    const btn = document.getElementById("qf-fsubmit");
    btn.textContent = "Envoi en cours…";
    btn.disabled = true;

    const payload = {
      client_id: CLIENT_ID,
      client_nom: config.nom,
      client_email: config.email_reception || "",
      prospect: { prenom: fname, email: femail, telephone: fphone },
      answers,
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (_) {}

    // Message de succès
    messages.innerHTML = "";
    input.style.display = "none";
    sendBtn.style.display = "none";
    addMsg(`✅ Parfait ${fname} ! Votre devis est en cours de génération. Vous allez recevoir un email dans quelques minutes. Merci !`, "success");
  }

  // ─── Événements ───────────────────────────────────────────────────────────
  bubble.addEventListener("click", async () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open") && !config) {
      showTyping();
      config = await loadConfig();
      removeTyping();
      applyColor(config.couleur || "#7C3AED");
      avatar.textContent = (config.nom || "Q")[0].toUpperCase();
      nameEl.textContent = config.nom || "Devis rapide";
      startConversation();
    }
  });

  closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  sendBtn.addEventListener("click", () => {
    if (input.value.trim()) handleAnswer(input.value.trim());
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) handleAnswer(input.value.trim());
  });

})();
