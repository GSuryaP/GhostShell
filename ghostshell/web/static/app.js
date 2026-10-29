/**
 * GhostShell Fullscreen Terminal UI Frontend
 * Home Dashboard • Dark/Light Mode Toggle • Command Palette • WCAG AA Monospace
 */

document.addEventListener("DOMContentLoaded", () => {
  initTypewriter();
  initTabs();
  initClock();
  initDarkLightToggle();
  initScanlineToggle();
  initHomeDashboard();
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
      setTimeout(typeChar, 16);
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

function switchTabById(tabId) {
  const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (tabBtn) {
    tabBtn.click();
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
   4. Dark / Light Mode Toggle
   ========================================================================== */
function initDarkLightToggle() {
  const btnHeader = document.getElementById("btnThemeToggle");
  const btnStatus = document.getElementById("btnToggleThemeStatus");
  const savedTheme = localStorage.getItem("ghostshell_theme") || "dark";

  applyTheme(savedTheme);

  function toggleDarkLight() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  if (btnHeader) btnHeader.addEventListener("click", toggleDarkLight);
  if (btnStatus) btnStatus.addEventListener("click", toggleDarkLight);

  window.toggleTheme = toggleDarkLight;
}

function applyTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("ghostshell_theme", themeName);

  const btnHeader = document.getElementById("btnThemeToggle");
  const btnStatus = document.getElementById("btnToggleThemeStatus");
  const emblemCipherLabel = document.getElementById("emblemCipherLabel");

  if (themeName === "light") {
    if (btnHeader) btnHeader.textContent = "[ ☾ DARK ]";
    if (btnStatus) btnStatus.textContent = "[mode: light]";
    if (emblemCipherLabel) emblemCipherLabel.textContent = "CIPHER: MATRIX_LIGHT";
  } else {
    if (btnHeader) btnHeader.textContent = "[ ☼ LIGHT ]";
    if (btnStatus) btnStatus.textContent = "[mode: dark]";
    if (emblemCipherLabel) emblemCipherLabel.textContent = "CIPHER: MATRIX_DARK";
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
   6. Home Page Dashboard Logic
   ========================================================================== */
function initHomeDashboard() {
  // Clickable action cards to launch tabs
  document.querySelectorAll("[data-launch]").forEach((card) => {
    card.addEventListener("click", () => {
      const targetTab = card.dataset.launch;
      switchTabById(targetTab);
    });
  });

  // Lethal / Destructive Command Detector for Auto-Routing
  function checkLethalCommand(cmd) {
    if (!cmd) return false;
    const patterns = [
      "rm -rf", "rm -fr", "rm -r -f", "rm -f -r",
      ":(){", ":(){:|:&};:",
      "dd if=", "dd ", "mkfs", "> /dev/sd", "> /dev/nvme",
      "chmod -R 777", "chmod 777", "chmod 000",
      "shutdown", "reboot", "init 0",
      "curl | bash", "wget | bash", "curl | sh", "wget | sh"
    ];
    const lower = cmd.toLowerCase();
    return patterns.some((p) => lower.includes(p));
  }
  window.checkLethalCommand = checkLethalCommand;

  // Home Quick Terminal Evaluator Form
  const quickForm = document.getElementById("homeQuickForm");
  const quickInput = document.getElementById("homeQuickInput");

  if (quickForm && quickInput) {
    quickForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const cmd = quickInput.value.trim();
      if (!cmd) return;

      const isSuspect = checkLethalCommand(cmd);

      if (isSuspect) {
        switchTabById("tabAlert");
        setTimeout(() => {
          const alertIn = document.getElementById("alertInput");
          if (alertIn) {
            alertIn.value = cmd;
            document.getElementById("btnScanPossession")?.click();
          }
        }, 60);
      } else {
        switchTabById("tabGhost");
        setTimeout(() => {
          const ghostIn = document.getElementById("ghostInput");
          if (ghostIn) {
            ghostIn.value = cmd;
            document.getElementById("btnSummonGhost")?.click();
          }
        }, 60);
      }
    });
  }

  // Live Cryptographic Entropy Stream (Encrypted Representation Flicker)
  const cipherEl = document.getElementById("cipherHexStream");
  const cycleBtn = document.getElementById("btnCycleCipher");
  const copyBtn = document.getElementById("btnCopyCipherHash");
  const entropyBadge = document.getElementById("liveEntropyBadge");

  function cycleEntropyNow() {
    if (!cipherEl) return;
    const hexChars = "0123456789ABCDEF";
    let randHex = "";
    for (let i = 0; i < 4; i++) {
      randHex += hexChars[Math.floor(Math.random() * 16)];
    }
    const percent = (99.8 + Math.random() * 0.19).toFixed(2);
    if (entropyBadge) {
      entropyBadge.textContent = `[ENTROPY:${percent}% 0x${randHex}]`;
    }
  }

  if (cycleBtn) {
    cycleBtn.addEventListener("click", () => {
      cycleEntropyNow();
      cycleBtn.textContent = "[ ⟳ CYCLED! ]";
      setTimeout(() => {
        cycleBtn.textContent = "[ ⟳ CYCLE ENTROPY ]";
      }, 1200);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const hash = "sha256:7f454c460201010047686f73745368656c6c323032362100";
      navigator.clipboard?.writeText(hash).catch(() => {});
      copyBtn.textContent = "[ ✓ COPIED! ]";
      setTimeout(() => {
        copyBtn.textContent = "[ 📋 COPY HASH ]";
      }, 1500);
    });
  }

  if (cipherEl) {
    setInterval(cycleEntropyNow, 2200);
  }
}

/* ==========================================================================
   7. Command Palette (Ctrl+K)
   ========================================================================== */
const PALETTE_COMMANDS = [
  { label: "jump: home (overview)", action: () => switchTabByIndex(0), hint: "Tab ~" },
  { label: "jump: ghost-mode", action: () => switchTabByIndex(1), hint: "Tab 1" },
  { label: "jump: possession-alerts", action: () => switchTabByIndex(2), hint: "Tab 2" },
  { label: "jump: haunted-logs", action: () => switchTabByIndex(3), hint: "Tab 3" },
  { label: "jump: oracle (ask)", action: () => switchTabByIndex(4), hint: "Tab 4" },
  { label: "jump: crypt-ledger", action: () => switchTabByIndex(5), hint: "Tab 5" },
  { label: "toggle: dark / light mode", action: () => window.toggleTheme(), hint: "Switch Mode" },
  { label: "toggle: scanlines", action: () => document.getElementById("btnToggleScanlines")?.click(), hint: "CRT Filter" },
  { label: "run: audit rm -rf /", action: () => { switchTabById("tabAlert"); document.getElementById("alertInput").value = "rm -rf / --no-preserve-root"; document.getElementById("btnScanPossession")?.click(); }, hint: "Lethal Test" },
  { label: "run: explain tar -czvf", action: () => { switchTabById("tabGhost"); document.getElementById("ghostInput").value = "tar -czvf backup.tar.gz /var/log"; document.getElementById("btnSummonGhost")?.click(); }, hint: "Ghost Mode" },
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
   8. Keyboard Shortcuts Modal (?)
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
   9. Global Keyboard Shortcuts Handler
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
      } else if (e.key === "~" || e.key === "0" || e.key === "`") {
        switchTabByIndex(0);
      } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
        switchTabByIndex(parseInt(e.key, 10));
      } else if (e.key.toLowerCase() === "t") {
        window.toggleTheme ? window.toggleTheme() : null;
      } else if (e.key.toLowerCase() === "s") {
        document.getElementById("btnToggleScanlines")?.click();
      }
    }
  });
}

/* ==========================================================================
   10. Ghost Mode (Tab 1)
   ========================================================================== */
function initGhostMode() {
  const form = document.getElementById("ghostForm");
  const input = document.getElementById("ghostInput");
  const resultArea = document.getElementById("ghostResultArea");
  const resultContent = document.getElementById("ghostResultContent");
  const btnSubmit = document.getElementById("btnSummonGhost");
  const btnCopy = document.getElementById("btnCopyGhost");

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

    // If lethal/hazardous command entered in Ghost Mode, auto-route to Possession Alert
    if (window.checkLethalCommand && window.checkLethalCommand(command)) {
      switchTabById("tabAlert");
      setTimeout(() => {
        const alertIn = document.getElementById("alertInput");
        if (alertIn) {
          alertIn.value = command;
          document.getElementById("btnScanPossession")?.click();
        }
      }, 60);
      return;
    }

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
   11. Possession Alerts (Tab 2)
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
   12. Haunted Logs (Tab 3)
   ========================================================================== */
function initHauntedLogs() {
  const btnFetch = document.getElementById("btnFetchLogs");
  const resultArea = document.getElementById("logsResultArea");
  const tableBody = document.getElementById("evidenceTableBody");
  const narrativeContent = document.getElementById("logsNarrativeContent");
  let selectedLines = 15;

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
   13. Oracle Chat (Tab 4)
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
   14. Crypt Ledger (Tab 5)
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
   15. System Status Telemetry
   ========================================================================== */
async function fetchSystemStatus() {
  const pill = document.getElementById("modelPillText");
  const statusModelTag = document.getElementById("statusModelTag");
  const homeAiStatus = document.getElementById("homeAiStatus");

  try {
    const resp = await fetch("/api/status");
    if (resp.ok) {
      const data = await resp.json();
      if (pill) pill.textContent = `[Ollama: ${data.default_model} (${data.status})]`;
      if (statusModelTag) statusModelTag.textContent = data.default_model;
      if (homeAiStatus) homeAiStatus.textContent = `${data.default_model} (Ollama)`;
    }
  } catch (e) {
    if (pill) pill.textContent = `[Ollama: offline]`;
    if (homeAiStatus) homeAiStatus.textContent = "Offline (run ollama serve)";
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
