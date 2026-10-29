/**
 * GhostShell Web UI - Interactive Frontend Logic
 * Hacktoberfest 2026: Ghost in the Machine
 */

document.addEventListener("DOMContentLoaded", () => {
  initSpectralCanvas();
  initTabs();
  initPresets();
  initGhostMode();
  initPossessionAlert();
  initHauntedLogs();
  initAskGhost();
  initLedger();
  fetchSystemStatus();
});

/* ==========================================================================
   1. Ambient Floating Ghost Particles Canvas
   ========================================================================== */
function initSpectralCanvas() {
  const canvas = document.getElementById("spectralCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 1,
      speedY: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? "rgba(0, 255, 135," : "rgba(96, 239, 255,",
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ff87";
      ctx.fill();
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. Tab Navigation
   ========================================================================== */
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPanel = document.getElementById(tab.dataset.tab);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }

      if (tab.dataset.tab === "tabLedger") {
        loadLedgerRecords();
      }
    });
  });
}

/* ==========================================================================
   3. Quick Presets
   ========================================================================== */
function initPresets() {
  const presetPills = document.querySelectorAll(".preset-pill");
  presetPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetInputId = pill.dataset.target;
      const cmd = pill.dataset.cmd;
      const targetInput = document.getElementById(targetInputId);
      if (targetInput) {
        targetInput.value = cmd;
        targetInput.focus();
      }
    });
  });
}

/* ==========================================================================
   4. Loading Overlay Helpers
   ========================================================================== */
const spookyPhrases = [
  "Summoning spirits through the kernel mist...",
  "Consulting the ancient scrolls of the UNIX Epoch...",
  "Dissecting the arcane flags and signals...",
  "Purging digital phantoms from system memory...",
  "Communing with daemons lurking in /var/log...",
];

function showLoading(customText = null) {
  const overlay = document.getElementById("loadingOverlay");
  const textEl = document.getElementById("loadingSpookyText");
  const randomPhrase = spookyPhrases[Math.floor(Math.random() * spookyPhrases.length)];
  textEl.textContent = customText || randomPhrase;
  overlay.classList.remove("hidden");
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("hidden");
}

/* ==========================================================================
   5. Ghost Mode Logic
   ========================================================================== */
function initGhostMode() {
  const form = document.getElementById("ghostForm");
  const input = document.getElementById("ghostInput");
  const resultArea = document.getElementById("ghostResultArea");
  const resultContent = document.getElementById("ghostResultContent");
  const btnCopy = document.getElementById("btnCopyGhost");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const command = input.value.trim();
    if (!command) return;

    showLoading("Summoning the Specter to decipher command...");

    try {
      const resp = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      if (!resp.ok) {
        throw new Error(`Server returned status: ${resp.status}`);
      }

      const data = await resp.json();
      resultContent.textContent = data.explanation;
      resultArea.classList.remove("hidden");

      // Auto-scroll to result
      resultArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      resultContent.textContent = `Error communing with the ghost: ${err.message}. Ensure Ollama is running.`;
      resultArea.classList.remove("hidden");
    } finally {
      hideLoading();
    }
  });

  btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(resultContent.textContent);
    btnCopy.textContent = "Copied! ✨";
    setTimeout(() => {
      btnCopy.textContent = "Copy Markdown";
    }, 2000);
  });
}

/* ==========================================================================
   6. Possession Alert Logic
   ========================================================================== */
function initPossessionAlert() {
  const form = document.getElementById("alertForm");
  const input = document.getElementById("alertInput");
  const resultArea = document.getElementById("alertResultArea");
  const cardContainer = document.getElementById("alertCardContainer");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const command = input.value.trim();
    if (!command) return;

    showLoading("Auditing command against destructive curses...");

    try {
      const resp = await fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      if (!resp.ok) {
        throw new Error(`Audit failed: ${resp.status}`);
      }

      const data = await resp.json();
      cardContainer.innerHTML = "";

      if (data.is_dangerous) {
        cardContainer.className = "alert-verdict-card verdict-critical";
        
        let hazardsListHtml = "";
        if (data.hazards && data.hazards.length > 0) {
          hazardsListHtml = `
            <div class="hazard-box">
              <h4>☠️ Identified Hazards:</h4>
              <ul>
                ${data.hazards.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
              </ul>
            </div>
          `;
        }

        let safeAltHtml = "";
        if (data.safe_alternative) {
          safeAltHtml = `
            <div class="safe-alternative-box">
              <h4>✨ Exorcised Safe Alternative:</h4>
              <code class="safe-cmd-code">${escapeHtml(data.safe_alternative)}</code>
            </div>
          `;
        }

        cardContainer.innerHTML = `
          <div class="verdict-badge badge-critical">
            <span>☠️ POSSESSION DETECTED (${escapeHtml(data.severity)})</span>
          </div>
          <div>
            <strong>Target Command:</strong> <code style="color: #ff2a5f;">${escapeHtml(data.command)}</code>
          </div>
          ${hazardsListHtml}
          <div class="spectral-advice-box">
            <h4>Spectral Warning:</h4>
            <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(data.warning)}</p>
          </div>
          ${safeAltHtml}
        `;
      } else {
        cardContainer.className = "alert-verdict-card verdict-safe";
        cardContainer.innerHTML = `
          <div class="verdict-badge badge-clean">
            <span>✨ CLEAN INCANTATION (SAFE)</span>
          </div>
          <div>
            <strong>Audited Command:</strong> <code style="color: #00ff87;">${escapeHtml(data.command)}</code>
          </div>
          <div class="spectral-advice-box">
            <h4>Guardian Audit Verdict:</h4>
            <p>${escapeHtml(data.warning)}</p>
          </div>
        `;
      }

      resultArea.classList.remove("hidden");
      resultArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      cardContainer.className = "alert-verdict-card verdict-critical";
      cardContainer.innerHTML = `<p>Error performing possession audit: ${escapeHtml(err.message)}</p>`;
      resultArea.classList.remove("hidden");
    } finally {
      hideLoading();
    }
  });
}

/* ==========================================================================
   7. Haunted Logs Logic
   ========================================================================== */
function initHauntedLogs() {
  const btnFetch = document.getElementById("btnFetchLogs");
  const linesSelect = document.getElementById("logLinesSelect");
  const resultArea = document.getElementById("logsResultArea");
  const tableBody = document.getElementById("evidenceTableBody");
  const narrativeContent = document.getElementById("logsNarrativeContent");

  btnFetch.addEventListener("click", async () => {
    const lines = parseInt(linesSelect.value, 10) || 20;
    showLoading("Scouring Linux system logs and redacting sensitive identities...");

    try {
      const resp = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });

      if (!resp.ok) {
        throw new Error(`Telemetry collection failed: ${resp.status}`);
      }

      const data = await resp.json();

      // Populate evidence table
      tableBody.innerHTML = "";
      if (data.extracted_events && data.extracted_events.length > 0) {
        data.extracted_events.forEach((ev) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td style="color: #8b949e;">${escapeHtml(ev.timestamp || "Recent")}</td>
            <td style="color: #b266ff;">${escapeHtml(ev.unit || "kernel")}</td>
            <td style="color: ${ev.priority === "ERR" ? "#ff2a5f" : "#60efff"}; font-weight: bold;">${escapeHtml(ev.priority || "LOG")}</td>
            <td>${escapeHtml(ev.message || "")}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #8b949e;">No anomalous events detected in recent telemetry.</td></tr>`;
      }

      // Populate narrative
      narrativeContent.textContent = data.narrative;
      resultArea.classList.remove("hidden");
      resultArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      alert(`Failed to harvest logs: ${err.message}`);
    } finally {
      hideLoading();
    }
  });
}

/* ==========================================================================
   8. Ask the Ghost Logic
   ========================================================================== */
function initAskGhost() {
  const form = document.getElementById("askForm");
  const input = document.getElementById("askInput");
  const chkLogs = document.getElementById("chkIncludeLogs");
  const historyContainer = document.getElementById("chatHistoryContainer");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    // Append user message
    const userMsg = document.createElement("div");
    userMsg.className = "chat-message user-message";
    userMsg.innerHTML = `
      <div class="chat-avatar">👤</div>
      <div class="chat-bubble"><p>${escapeHtml(question)}</p></div>
    `;
    historyContainer.appendChild(userMsg);
    input.value = "";
    historyContainer.scrollTop = historyContainer.scrollHeight;

    // Append loading ghost message
    const ghostLoadingMsg = document.createElement("div");
    ghostLoadingMsg.className = "chat-message ghost-message";
    ghostLoadingMsg.innerHTML = `
      <div class="chat-avatar">👻</div>
      <div class="chat-bubble"><p class="pulsing-green"><em>Specter is consulting the crypt...</em></p></div>
    `;
    historyContainer.appendChild(ghostLoadingMsg);
    historyContainer.scrollTop = historyContainer.scrollHeight;

    try {
      const resp = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          with_logs: chkLogs.checked,
        }),
      });

      if (!resp.ok) throw new Error(`Query failed: ${resp.status}`);
      const data = await resp.json();

      ghostLoadingMsg.querySelector(".chat-bubble").innerHTML = `<p style="white-space: pre-wrap;">${escapeHtml(data.answer)}</p>`;
    } catch (err) {
      ghostLoadingMsg.querySelector(".chat-bubble").innerHTML = `<p style="color: #ff2a5f;">The spectral connection was severed: ${escapeHtml(err.message)}</p>`;
    } finally {
      historyContainer.scrollTop = historyContainer.scrollHeight;
    }
  });
}

/* ==========================================================================
   9. Crypt Ledger (History)
   ========================================================================== */
function initLedger() {
  const btnRefresh = document.getElementById("btnRefreshLedger");
  btnRefresh.addEventListener("click", loadLedgerRecords);
}

async function loadLedgerRecords() {
  const tableBody = document.getElementById("ledgerTableBody");
  tableBody.innerHTML = `<tr><td colspan="5" class="text-center">Loading audit records...</td></tr>`;

  try {
    const resp = await fetch("/api/history?limit=25");
    if (!resp.ok) throw new Error(`History fetch failed: ${resp.status}`);
    const data = await resp.json();

    tableBody.innerHTML = "";
    if (data.history && data.history.length > 0) {
      data.history.forEach((r) => {
        const row = document.createElement("tr");
        const isDang = r.is_dangerous === 1;
        row.innerHTML = `
          <td>#${r.id}</td>
          <td><code>${escapeHtml(r.command)}</code></td>
          <td style="color: #60efff;">${escapeHtml(r.mode)}</td>
          <td class="${isDang ? "badge-risk-critical" : "badge-risk-clean"}">
            ${isDang ? `☠️ ${escapeHtml(r.severity)}` : "✨ CLEAN"}
          </td>
          <td style="color: #8b949e;">${escapeHtml(r.created_at)}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #8b949e;">The crypt is empty. No audited commands yet.</td></tr>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" style="color: #ff2a5f; text-align: center;">Error loading ledger: ${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ==========================================================================
   10. System Status Telemetry
   ========================================================================== */
async function fetchSystemStatus() {
  const badge = document.getElementById("aiStatusBadge");
  const textEl = document.getElementById("aiStatusText");

  try {
    const resp = await fetch("/api/status");
    if (resp.ok) {
      const data = await resp.json();
      if (data.status === "online") {
        textEl.textContent = `Ollama: ${data.default_model}`;
        badge.querySelector(".status-dot").className = "status-dot pulsing-green";
      } else {
        textEl.textContent = "Ollama: Offline (run `ollama serve`)";
        badge.querySelector(".status-dot").className = "status-dot";
        badge.querySelector(".status-dot").style.backgroundColor = "#ff2a5f";
      }
    }
  } catch (e) {
    textEl.textContent = "Backend Connecting...";
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
