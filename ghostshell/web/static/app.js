/**
 * GhostShell Terminal Emulator Frontend
 * Theme: Warp / Ghostty / iTerm2 Inspired (WCAG AA • ANSI Semantics)
 */

document.addEventListener("DOMContentLoaded", () => {
  initTypewriter();
  initTabs();
  initClock();
  initThemeEngine();
  initScanlineToggle();
  initCommandPalette();
  initShortcutsModal();
  initGhostMode();
  initPossessionAlert();
  initHauntedLogs();
  initOracleChat();
  initLedger();
  fetchSystemStatus();
  initGlobalKeyboard();
});

/* ==========================================================================
   1. Typewriter Effect (Hero line, skippable, under 1.2s)
   ========================================================================== */
function initTypewriter() {
  const container = document.getElementById("heroBootLine");
  const textEl = document.getElementById("typewriterText");
  if (!textEl) return;

  const fullText = textEl.textContent.trim();
  textEl.textContent = "";

  let idx = 0;
  let isSkipped = false;

  function typeChar() {
    if (isSkipped) return;
    if (idx < fullText.length) {
      textEl.textContent += fullText.charAt(idx);
      idx++;
      setTimeout(typeChar, 18);
    }
  }

  function skipTypewriter() {
    if (!isSkipped) {
      isSkipped = true;
      textEl.textContent = fullText;
    }
  }

  if (container) {
    container.addEventListener("click", skipTypewriter);
  }

  typeChar();
}

/* ==========================================================================
   2. Tab Navigation & Breadcrumbs
   ========================================================================== */
function initTabs() {
  const tabs = document.querySelectorAll(".terminal-tab");
  const panes = document.querySelectorAll(".tab-pane");
  const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
  const statusSection = document.getElementById("statusCurrentSection");
  const chromeTitle = document.getElementById("chromeTitleLabel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.tab;
      const path = tab.dataset.path || "~/ghostshell";

      tabs.forEach((t) => t.classList.remove("active"));
      panes.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");

      // Update path labels
      const pathSuffix = path.split("/").pop();
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = pathSuffix;
      if (statusSection) statusSection.textContent = path;
      if (chromeTitle) chromeTitle.textContent = `ghost@crypt: ${path}`;

      if (targetId === "tabLedger") {
        loadLedgerRecords();
      }
    });
  });
}

function switchTabByIndex(index) {
  const tabs = document.querySelectorAll(".terminal-tab");
  if (tabs[index]) {
    tabs[index].click();
  }
}

/* ==========================================================================
   3. Status Bar Clock
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById("statusClock");
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
  }
  updateTime();
  setInterval(updateTime, 1000);
}

/* ==========================================================================
   4. Theme Palette Engine (Dracula, Nord, Gruvbox, Tokyo Night, Catppuccin)
   ========================================================================== */
const THEMES = ["dark", "light", "dracula", "nord", "gruvbox", "tokyo-night", "catppuccin"];

function initThemeEngine() {
  const savedTheme = localStorage.getItem("ghostshell_theme") || "dark";
  applyTheme(savedTheme);

  const cycleBtn = document.getElementById("btnCycleTheme");
  if (cycleBtn) {
    cycleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const nextIdx = (THEMES.indexOf(current) + 1) % THEMES.length;
      applyTheme(THEMES[nextIdx]);
    });
  }
}

function applyTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("ghostshell_theme", themeName);

  const cycleBtn = document.getElementById("btnCycleTheme");
  if (cycleBtn) {
    cycleBtn.textContent = `[theme: ${themeName}]`;
  }
}

/* ==========================================================================
   5. Scanline Overlay Toggle
   ========================================================================== */
function initScanlineToggle() {
  const scanline = document.getElementById("scanlineOverlay");
  const toggleBtn = document.getElementById("btnToggleScanlines");
  const savedState = localStorage.getItem("ghostshell_scanlines");

  if (savedState === "disabled" && scanline) {
    scanline.classList.add("disabled");
    if (toggleBtn) toggleBtn.textContent = "[scanlines: off]";
  }

  if (toggleBtn && scanline) {
    toggleBtn.addEventListener("click", () => {
      scanline.classList.toggle("disabled");
      const isOff = scanline.classList.contains("disabled");
      toggleBtn.textContent = isOff ? "[scanlines: off]" : "[scanlines: on]";
      localStorage.setItem("ghostshell_scanlines", isOff ? "disabled" : "enabled");
    });
  }
}

/* ==========================================================================
   6. Command Palette (Ctrl+K)
   ========================================================================== */
const PALETTE_COMMANDS = [
  { label: "jump: ghost-mode", action: () => switchTabByIndex(0), hint: "Tab 0" },
  { label: "jump: possession-alerts", action: () => switchTabByIndex(1), hint: "Tab 1" },
  { label: "jump: haunted-logs", action: () => switchTabByIndex(2), hint: "Tab 2" },
  { label: "jump: oracle (ask)", action: () => switchTabByIndex(3), hint: "Tab 3" },
  { label: "jump: crypt-ledger", action: () => switchTabByIndex(4), hint: "Tab 4" },
  { label: "theme: Ghostty Dark", action: () => applyTheme("dark"), hint: "Default" },
  { label: "theme: Terminal Light", action: () => applyTheme("light"), hint: "WCAG Light" },
  { label: "theme: Dracula", action: () => applyTheme("dracula"), hint: "Purple/Pink" },
  { label: "theme: Nord", action: () => applyTheme("nord"), hint: "Arctic Blue" },
  { label: "theme: Gruvbox", action: () => applyTheme("gruvbox"), hint: "Retro Groove" },
  { label: "theme: Tokyo Night", action: () => applyTheme("tokyo-night"), hint: "Neon Dusk" },
  { label: "theme: Catppuccin Mocha", action: () => applyTheme("catppuccin"), hint: "Pastel" },
  { label: "toggle: scanlines", action: () => document.getElementById("btnToggleScanlines")?.click(), hint: "CRT Overlay" },
  { label: "run: audit rm -rf /", action: () => { switchTabByIndex(1); document.getElementById("alertInput").value = "rm -rf / --no-preserve-root"; document.getElementById("btnScanPossession")?.click(); }, hint: "Lethal Test" },
  { label: "run: explain tar", action: () => { switchTabByIndex(0); document.getElementById("ghostInput").value = "tar -czvf backup.tar.gz /var/log"; document.getElementById("btnSummonGhost")?.click(); }, hint: "Ghost Mode" },
  { label: "help: keyboard shortcuts", action: () => openShortcutsModal(), hint: "Key cheat sheet" },
];

function initCommandPalette() {
  const modal = document.getElementById("paletteModal");
  const input = document.getElementById("paletteSearchInput");
  const list = document.getElementById("paletteResultsList");
  const openBtn = document.getElementById("btnOpenPalette");

  if (!modal || !input || !list) return;

  let selectedIdx = 0;
  let filteredCommands = [...PALETTE_COMMANDS];

  function renderList() {
    list.innerHTML = "";
    if (filteredCommands.length === 0) {
      list.innerHTML = `<li class="palette-item" style="color: var(--fg-muted);">No matching commands found.</li>`;
      return;
    }

    filteredCommands.forEach((cmd, idx) => {
      const li = document.createElement("li");
      li.className = `palette-item ${idx === selectedIdx ? "selected" : ""}`;
      li.innerHTML = `
        <span><span style="color: var(--ansi-green); margin-right: 6px;">❯</span>${escapeHtml(cmd.label)}</span>
        <span class="palette-hint">${escapeHtml(cmd.hint || "")}</span>
      `;
      li.addEventListener("click", () => {
        cmd.action();
        closePalette();
      });
      list.appendChild(li);
    });
  }

  function openPalette() {
    modal.classList.remove("hidden");
    input.value = "";
    filteredCommands = [...PALETTE_COMMANDS];
    selectedIdx = 0;
    renderList();
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    modal.classList.add("hidden");
  }

  if (openBtn) openBtn.addEventListener("click", openPalette);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePalette();
  });

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    filteredCommands = PALETTE_COMMANDS.filter((cmd) => cmd.label.toLowerCase().includes(q) || cmd.hint.toLowerCase().includes(q));
    selectedIdx = 0;
    renderList();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % filteredCommands.length;
      renderList();
    } else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")) {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + filteredCommands.length) % filteredCommands.length;
      renderList();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIdx]) {
        filteredCommands[selectedIdx].action();
        closePalette();
      }
    } else if (e.key === "Escape") {
      closePalette();
    }
  });

  window.openPalette = openPalette;
  window.closePalette = closePalette;
}

/* ==========================================================================
   7. Keyboard Shortcuts Modal (?)
   ========================================================================== */
function initShortcutsModal() {
  const modal = document.getElementById("shortcutsModal");
  const openBtn = document.getElementById("btnOpenShortcuts");
  const closeBtn = document.getElementById("btnCloseShortcuts");

  if (!modal) return;

  function openShortcuts() { modal.classList.remove("hidden"); }
  function closeShortcuts() { modal.classList.add("hidden"); }

  if (openBtn) openBtn.addEventListener("click", openShortcuts);
  if (closeBtn) closeBtn.addEventListener("click", closeShortcuts);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeShortcuts();
  });

  window.openShortcutsModal = openShortcuts;
  window.closeShortcutsModal = closeShortcuts;
}

/* ==========================================================================
   8. Global Keyboard Shortcuts Handler
   ========================================================================== */
function initGlobalKeyboard() {
  document.addEventListener("keydown", (e) => {
    const isInput = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      window.openPalette ? window.openPalette() : null;
      return;
    }

    if (e.key === "Escape") {
      const palette = document.getElementById("paletteModal");
      const shortcuts = document.getElementById("shortcutsModal");
      if (palette && !palette.classList.contains("hidden")) palette.classList.add("hidden");
      if (shortcuts && !shortcuts.classList.contains("hidden")) shortcuts.classList.add("hidden");
      return;
    }

    if (!isInput) {
      if (e.key === "?") {
        e.preventDefault();
        window.openShortcutsModal ? window.openShortcutsModal() : null;
      } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
        switchTabByIndex(parseInt(e.key, 10) - 1);
      } else if (e.key.toLowerCase() === "t") {
        document.getElementById("btnCycleTheme")?.click();
      } else if (e.key.toLowerCase() === "s") {
        document.getElementById("btnToggleScanlines")?.click();
      }
    }
  });
}

/* ==========================================================================
   9. Ghost Mode (Tab 0)
   ========================================================================== */
function initGhostMode() {
  const form = document.getElementById("ghostForm");
  const input = document.getElementById("ghostInput");
  const resultArea = document.getElementById("ghostResultArea");
  const resultContent = document.getElementById("ghostResultContent");
  const btnSubmit = document.getElementById("btnSummonGhost");
  const btnCopy = document.getElementById("btnCopyGhost");

  // Presets click
  document.querySelectorAll("[data-target='ghostInput']").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.cmd;
      input.focus();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const command = input.value.trim();
    if (!command) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = "[ RUNNING... ]";
    resultArea.style.display = "block";
    resultContent.textContent = "Summoning local Gemma 2 (2B) via Ollama...";

    try {
      const resp = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const data = await resp.json();
      resultContent.textContent = data.explanation || "No output returned.";
    } catch (err) {
      resultContent.textContent = `[FAIL] Error communicating with Specter: ${err.message}`;
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "[ EXPLAIN ]";
    }
  });

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(resultContent.textContent);
      btnCopy.textContent = "[ COPIED! ]";
      setTimeout(() => { btnCopy.textContent = "[ COPY_OUTPUT ]"; }, 1500);
    });
  }
}

/* ==========================================================================
   10. Possession Alerts (Tab 1)
   ========================================================================== */
function initPossessionAlert() {
  const form = document.getElementById("alertForm");
  const input = document.getElementById("alertInput");
  const resultArea = document.getElementById("alertResultArea");
  const container = document.getElementById("alertCardContainer");
  const btnSubmit = document.getElementById("btnScanPossession");
  const statusMode = document.getElementById("statusModeLabel");

  document.querySelectorAll("[data-target='alertInput']").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.cmd;
      input.focus();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const command = input.value.trim();
    if (!command) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = "[ AUDITING... ]";
    resultArea.style.display = "block";
    container.innerHTML = `<div class="term-alert alert-warn"><span class="alert-tag">[WAIT]</span>Auditing command AST against lethal heuristics...</div>`;

    try {
      const resp = await fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const data = await resp.json();
      container.innerHTML = "";

      if (data.is_dangerous) {
        if (statusMode) {
          statusMode.className = "status-mode mode-danger";
          statusMode.textContent = "POSSESSED";
        }

        const hazardsList = (data.hazards || [])
          .map((h) => `<li>${escapeHtml(h)}</li>`)
          .join("");

        container.innerHTML = `
          <div class="term-alert alert-fail">
            <span class="alert-tag">[FAIL]</span>
            <strong>POSSESSION DETECTED // SEVERITY: ${escapeHtml(data.severity)}</strong>
          </div>

          <div class="progress-bar-term">
            THREAT_INDEX: [██████████] 100% FATAL
          </div>

          <div class="pane-card" style="margin-top: 10px;">
            <span class="pane-label label-danger">┌─ [ IDENTIFIED_HAZARDS ] ─┐</span>
            <ul style="padding-left: 20px; font-size: 13px; color: var(--ansi-red); line-height: 1.6;">
              ${hazardsList}
            </ul>
          </div>

          <div class="pane-card" style="margin-top: 10px;">
            <span class="pane-label">┌─ [ SPECTRAL_WARNING ] ─┐</span>
            <div class="term-console" style="color: var(--fg-default);">${escapeHtml(data.warning)}</div>
          </div>

          ${
            data.safe_alternative
              ? `
            <div class="pane-card" style="margin-top: 10px;">
              <span class="pane-label label-success">┌─ [ EXORCISED_ALTERNATIVE ] ─┐</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <code style="color: var(--ansi-green); font-size: 13px;">${escapeHtml(data.safe_alternative)}</code>
                <button class="btn-cmd btn-accent" onclick="navigator.clipboard.writeText('${escapeHtml(data.safe_alternative)}'); this.textContent='[ COPIED ]';">[ COPY ]</button>
              </div>
            </div>
            `
              : ""
          }
        `;
      } else {
        if (statusMode) {
          statusMode.className = "status-mode";
          statusMode.textContent = "NORMAL";
        }

        container.innerHTML = `
          <div class="term-alert alert-ok">
            <span class="alert-tag">[ OK ]</span>
            <strong>CLEAN INCANTATION // NO DESTRUCTIVE SIGNATURE DETECTED</strong>
          </div>
          <div class="progress-bar-term" style="color: var(--ansi-green);">
            THREAT_INDEX: [░░░░░░░░░░] 0% SAFE
          </div>
          <p style="font-size: 13px; color: var(--fg-muted); margin-top: 6px;">
            Input command <code>${escapeHtml(data.command)}</code> passed Guardian Layer 1 regex checks and AST tokenization without triggering safety halts.
          </p>
        `;
      }
    } catch (err) {
      container.innerHTML = `<div class="term-alert alert-fail"><span class="alert-tag">[FAIL]</span>Audit error: ${escapeHtml(err.message)}</div>`;
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "[ AUDIT ]";
    }
  });
}

/* ==========================================================================
   11. Haunted Logs (Tab 2)
   ========================================================================== */
function initHauntedLogs() {
  const btnFetch = document.getElementById("btnFetchLogs");
  const resultArea = document.getElementById("logsResultArea");
  const tableBody = document.getElementById("evidenceTableBody");
  const narrativeContent = document.getElementById("logsNarrativeContent");
  let selectedLines = 15;

  // Depth selection
  document.querySelectorAll("[data-lines]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-lines]").forEach((b) => b.classList.remove("active-depth"));
      btn.classList.add("active-depth");
      selectedLines = parseInt(btn.dataset.lines, 10);
    });
  });

  btnFetch.addEventListener("click", async () => {
    btnFetch.disabled = true;
    btnFetch.textContent = "[ SCANNING... ]";
    resultArea.style.display = "block";
    narrativeContent.textContent = "Harvesting journalctl and redacting IP/secret patterns...";

    try {
      const resp = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: selectedLines }),
      });

      const data = await resp.json();
      tableBody.innerHTML = "";

      if (data.extracted_events && data.extracted_events.length > 0) {
        data.extracted_events.forEach((ev) => {
          const row = document.createElement("tr");
          const isErr = ev.priority === "ERR";
          row.innerHTML = `
            <td style="color: var(--fg-muted);">${escapeHtml(ev.timestamp || "")}</td>
            <td style="color: var(--ansi-magenta);">${escapeHtml(ev.unit || "sys")}</td>
            <td style="color: ${isErr ? "var(--ansi-red)" : "var(--ansi-green);"} font-weight: bold;">[${escapeHtml(ev.priority)}]</td>
            <td>${escapeHtml(ev.message || "")}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML = `<tr><td colspan="4" style="color: var(--fg-muted);">No anomalous journal events in recent range.</td></tr>`;
      }

      narrativeContent.textContent = data.narrative || "No narrative returned.";
    } catch (err) {
      narrativeContent.textContent = `[FAIL] Ingestion failed: ${err.message}`;
    } finally {
      btnFetch.disabled = false;
      btnFetch.textContent = "[ COLLECT_AND_NARRATE ]";
    }
  });
}

/* ==========================================================================
   12. Oracle Chat (Tab 3)
   ========================================================================== */
function initOracleChat() {
  const form = document.getElementById("askForm");
  const input = document.getElementById("askInput");
  const chkLogs = document.getElementById("chkIncludeLogs");
  const container = document.getElementById("chatHistoryContainer");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    // User message
    const userRow = document.createElement("div");
    userRow.style.margin = "8px 0";
    userRow.innerHTML = `
      <span style="color: var(--ansi-green); font-weight: 600;">❯ user:</span>
      <span style="color: var(--fg-bright); margin-left: 6px;">${escapeHtml(q)}</span>
    `;
    container.appendChild(userRow);
    input.value = "";

    // Pending Specter reply
    const pendingMsg = document.createElement("div");
    pendingMsg.className = "term-alert alert-warn";
    pendingMsg.innerHTML = `<span class="alert-tag">[WAIT]</span><span>Specter is consulting the Linux kernel crypt...</span>`;
    container.appendChild(pendingMsg);
    container.scrollTop = container.scrollHeight;

    try {
      const resp = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, with_logs: chkLogs.checked }),
      });

      const data = await resp.json();
      pendingMsg.className = "pane-card";
      pendingMsg.style.padding = "12px 16px";
      pendingMsg.innerHTML = `
        <span class="pane-label">┌─ [ SPECTER_REPLY ] ─┐</span>
        <div style="white-space: pre-wrap; font-size: 13px; line-height: 1.6;">${escapeHtml(data.answer)}</div>
      `;
    } catch (err) {
      pendingMsg.className = "term-alert alert-fail";
      pendingMsg.innerHTML = `<span class="alert-tag">[FAIL]</span>${escapeHtml(err.message)}`;
    } finally {
      container.scrollTop = container.scrollHeight;
    }
  });
}

/* ==========================================================================
   13. Crypt Ledger (Tab 4)
   ========================================================================== */
function initLedger() {
  const btnRefresh = document.getElementById("btnRefreshLedger");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", loadLedgerRecords);
  }
}

async function loadLedgerRecords() {
  const tbody = document.getElementById("ledgerTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" style="color: var(--fg-muted);">Querying SQLite history.db...</td></tr>`;

  try {
    const resp = await fetch("/api/history?limit=30");
    const data = await resp.json();

    tbody.innerHTML = "";
    if (data.history && data.history.length > 0) {
      data.history.forEach((r) => {
        const row = document.createElement("tr");
        const isDang = r.is_dangerous === 1;
        row.innerHTML = `
          <td style="color: var(--fg-muted);">#${r.id}</td>
          <td><code>${escapeHtml(r.command)}</code></td>
          <td style="color: var(--ansi-cyan);">[${escapeHtml(r.mode)}]</td>
          <td style="color: ${isDang ? "var(--ansi-red)" : "var(--ansi-green);"} font-weight: 600;">
            ${isDang ? `[FAIL: ${escapeHtml(r.severity)}]` : "[ OK: CLEAN ]"}
          </td>
          <td style="color: var(--fg-muted); font-size: 11px;">${escapeHtml(r.created_at)}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="color: var(--fg-muted);">No audit records found in database.</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color: var(--ansi-red);">Error reading history: ${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ==========================================================================
   14. System Status Telemetry
   ========================================================================== */
async function fetchSystemStatus() {
  const pill = document.getElementById("modelPillText");
  const statusModelTag = document.getElementById("statusModelTag");
  try {
    const resp = await fetch("/api/status");
    if (resp.ok) {
      const data = await resp.json();
      if (pill) pill.textContent = `[Ollama: ${data.default_model} (${data.status})]`;
      if (statusModelTag) statusModelTag.textContent = data.default_model;
    }
  } catch (e) {
    if (pill) pill.textContent = `[Ollama: offline]`;
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
