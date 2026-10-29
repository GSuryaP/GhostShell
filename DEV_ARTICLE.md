*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

## What I Built

Linux terminals can be intimidating—and sometimes dangerous. A single misplaced space in `rm -rf /` or an accidental block overwrite via `dd` can turn an ordinary development session into a digital horror story.

For the **Ghost in the Machine** challenge, I built **[GhostShell](https://github.com/GSuryaP/GhostShell)**: an offline, AI-powered Linux terminal companion that brings your shell to life with an ancient digital ghost named **Specter**.

### The Metaphor: Ghost in the Machine
Specter is an AI entity trapped in POSIX memory since the UNIX Epoch (Jan 1, 1970). Instead of a cold, impersonal assistant, Specter haunts your Ubuntu terminal to:
1. **Explain Arcane Commands (Ghost Mode):** Translates cryptic Linux commands and arcane flags into technical explanations wrapped in gothic storytelling.
2. **Intercept Lethal Commands (Possession Alerts):** Catches catastrophic commands (`rm -rf /`, fork bombs, raw drive writes, universal permissions) before execution and offers safe, exorcised alternatives.
3. **Diagnose Distress (Haunted Logs):** Inspects Linux `journalctl` error streams, sanitizes IP/auth secrets, and turns system issues into paranormal mystery tales.
4. **Consult the Kernel (Terminal Oracle):** An offline Linux REPL oracle for questions about zombie processes, kernel signals, and daemon debugging.
5. **Audit Trail (Crypt Ledger):** Tracks every command, threat rating, and mode into a secure local SQLite database.
6. **Modern Web UI Dashboard:** A terminal emulator theme inspired by Warp, Ghostty, and iTerm2 featuring CRT scanlines, dark/light theme switching, and live system telemetry.

### Safety Guarantee
GhostShell runs as a standalone utility. It will **never** replace Bash, modify shell dotfiles, or automatically execute destructive commands. You remain in complete control.

---

## Demo

You can run GhostShell locally in your terminal or launch the fullscreen terminal web dashboard:

```bash
# Clone and setup
git clone https://github.com/GSuryaP/GhostShell.git
cd GhostShell
python3 -m venv .venv && source .venv/bin/activate
pip install -e .

# Launch Web UI Dashboard
ghostshell web --port 8888

# Or run interactive terminal REPL
ghostshell interactive
```

GhostShell provides two interfaces:
1. **Interactive Terminal TUI:** Custom spectral prompts (`ghost@crypt ❯`), streaming Gemma 2 reasoning, and ANSI color-coded Guardian verdicts directly inside your shell.
2. **Fullscreen Web Terminal Dashboard:** A browser-based terminal emulator featuring command deciphering, lethal AST interception, journalctl telemetry evidence tables, and a local SQLite audit ledger.

---

## Code

{% github https://github.com/GSuryaP/GhostShell %}

* **Repository:** [https://github.com/GSuryaP/GhostShell](https://github.com/GSuryaP/GhostShell)
* **License:** MIT License
* **Tests:** 44/44 unit tests passing locally in under 0.05 seconds (`pytest -v`).

---

## How I Built It

GhostShell is built around open-source AI and offline local inference:

1. **Local Open-Weight AI (Gemma 2 via Ollama):**
   - Powered by Google's open-weight **Gemma 2 (2B)** running locally via **Ollama**.
   - Tuned with spectral persona system prompts to maintain strict technical correctness while speaking as an ancient Unix ghost.
2. **Two-Layer Guardian Engine:**
   - **Layer 1 (Deterministic AST/Regex):** Evaluated in <1 millisecond. Catches dangerous flags (`--no-preserve-root`, fork bombs, raw drive writes) without waiting for LLM tokens.
   - **Layer 2 (Gemma 2 Exorcism):** Analyzes context and crafts safe alternative invocations (e.g. `trash-put`, `--dry-run`).
3. **Air-Gapped PII & Secret Scrubber:**
   - Automatically sanitizes IPv4, IPv6, MAC addresses, bearer tokens, and passwords from `journalctl` before handing text to the model.
4. **Rich Terminal CLI:**
   - Built with **Python 3**, **Typer**, and **Rich** for streaming ANSI terminal text, custom spectral color palettes, and progress bars.
   - Standalone interactive REPL built using **prompt-toolkit**.
5. **Modern Terminal Web Emulator:**
   - Backend built with **FastAPI** and **Uvicorn**.
   - Frontend built with **Vanilla CSS & JavaScript** adhering to modern terminal emulator aesthetics (Warp / Ghostty), featuring WCAG AA contrast, custom CRT scanline toggles, and command palette navigation (`Ctrl+K`).

---

## Why Does Open Innovation Matter?

Terminal privacy is non-negotiable. Terminal invocations and system error streams frequently contain sensitive internal IP addresses, secret tokens, and proprietary project paths. 

Open innovation and open-weight models made GhostShell possible where closed APIs failed:
1. **Zero Data Leakage:** Because Gemma 2 runs 100% locally via Ollama, **not a single byte of shell telemetry or error logs ever leaves your machine**.
2. **Zero Cloud Latency & Zero Cost:** Developers can run Guardian audits and command deciphers on airplanes, trains, or air-gapped secure servers without API keys, subscriptions, or rate limits.
3. **Freedom to Customize:** Open weights allow local prompt tuning and domain adaptation without fearing vendor deprecations or sudden terms-of-service changes.

---

## The Spirit of It

Every Linux developer remembers the icy dread of typing a command and wondering: *"Did I just wipe my partition?"*

GhostShell captures that spooky, magical feeling of the early days of personal computing—when systems felt alive and full of mystery. By embodying the OS as **Specter**, GhostShell transforms scary terminal errors into an atmospheric gothic journey, while providing real developer safety to make sure your actual machine never becomes a ghost.

---

## Prize Categories

- **Ghost in the Machine (Grand Prize)**
- **Most Creative Use of Open-Source AI**
- **Best Offline / Local AI Tool**
