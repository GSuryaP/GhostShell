"""Log collector and privacy sanitizer for GhostShell Haunted Logs."""

import os
import re
import subprocess
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional

# Sample synthetic haunted logs for offline testing or restricted environments
SAMPLE_HAUNTED_LOGS = """
Oct 29 03:33:01 phantom-node systemd[1]: Started Daily apt download activities.
Oct 29 03:33:14 phantom-node kernel: [1337.042] [UFW BLOCK] IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC=198.51.100.42 DST=192.168.1.105 PROTO=TCP SPT=44812 DPT=22
Oct 29 03:33:15 phantom-node sshd[28491]: Failed password for invalid user specter from 198.51.100.42 port 44812 ssh2
Oct 29 03:33:17 phantom-node sshd[28491]: Connection closed by authenticating user root 198.51.100.42 port 44812 [preauth]
Oct 29 03:34:02 phantom-node kernel: [1345.910] thermal thermal_zone0: critical temperature reached (98 C), shutting down cooling device
Oct 29 03:35:40 phantom-node systemd-oomd[612]: Killed /user.slice/user-1000.slice/app.scope due to memory pressure: swap free 0%
Oct 29 03:36:11 phantom-node kernel: [1410.220] EXT4-fs error (device sda1): ext4_lookup: deleted inode 402653184 referenced: crypt_key.bin
Oct 29 03:37:00 phantom-node cron[991]: (root) CMD (test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily ))
"""

IPV4_REGEX = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
IPV6_REGEX = re.compile(r"\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b")
MAC_REGEX = re.compile(r"\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b")
SECRET_REGEX = re.compile(r"(password|token|bearer|secret|api_key|credential)\s*[:=]\s*[^\s,;]+", re.IGNORECASE)

@dataclass
class LogAnalysisData:
    raw_lines: List[str] = field(default_factory=list)
    sanitized_text: str = ""
    extracted_events: List[Dict[str, str]] = field(default_factory=list)
    source: str = "journalctl"

def sanitize_log_text(text: str) -> Tuple[str, Dict[str, str]]:
    """Sanitizes PII, IPs, MAC addresses, and credentials from log text."""
    redacted_map = {}
    ip_counter = 1

    def ip_repl(match):
        nonlocal ip_counter
        val = match.group(0)
        # Preserve loopback
        if val in ("127.0.0.1", "0.0.0.0"):
            return val
        if val not in redacted_map:
            redacted_map[val] = f"[SPECTRAL-IP-{ip_counter}]"
            ip_counter += 1
        return redacted_map[val]

    # Redact secrets first
    sanitized = SECRET_REGEX.sub(r"\1=[REDACTED-SECRET]", text)
    # Redact MAC addresses
    sanitized = MAC_REGEX.sub("[SPECTRAL-MAC]", sanitized)
    # Redact IPv4
    sanitized = IPV4_REGEX.sub(ip_repl, sanitized)
    # Redact IPv6
    sanitized = IPV6_REGEX.sub("[SPECTRAL-IPV6]", sanitized)

    return sanitized, redacted_map

def parse_log_events(log_lines: List[str]) -> List[Dict[str, str]]:
    """Parses raw log lines into structured event dictionaries."""
    events = []
    # Match standard syslog/journalctl timestamp + host + unit: message
    pattern = re.compile(r"^([A-Z][a-z]{2}\s+\d+\s+[\d:]+)\s+([^\s]+)\s+([^:\[]+)(?:\[\d+\])?:?\s*(.*)$")

    for line in log_lines:
        line = line.strip()
        if not line:
            continue
        m = pattern.match(line)
        if m:
            ts, host, unit, msg = m.groups()
            severity = "ERR" if any(w in msg.lower() for w in ["fail", "error", "kill", "crit", "block", "panic"]) else "INFO"
            events.append({
                "timestamp": ts,
                "host": host,
                "unit": unit,
                "priority": severity,
                "message": msg,
            })
        else:
            # Fallback format
            events.append({
                "timestamp": "Recently",
                "host": "local",
                "unit": "system",
                "priority": "LOG",
                "message": line,
            })

    return events

def collect_logs(file_path: Optional[str] = None, lines: int = 40) -> LogAnalysisData:
    """Collects logs from a specific file, or queries journalctl on Ubuntu."""
    raw_lines: List[str] = []
    source_name = "journalctl"

    if file_path:
        source_name = os.path.basename(file_path)
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    all_lines = f.readlines()
                    raw_lines = all_lines[-lines:]
            except Exception as e:
                raw_lines = [f"Error reading file {file_path}: {e}"]
        else:
            raw_lines = [f"Target log file not found: {file_path}"]
    else:
        # Try journalctl first
        try:
            res = subprocess.run(
                ["journalctl", "-p", "err..emerg", "-n", str(lines), "--no-pager"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if res.returncode == 0 and res.stdout.strip():
                raw_lines = res.stdout.strip().splitlines()
                source_name = "journalctl (system errors)"
        except Exception:
            pass

        # If journalctl has few lines or failed (e.g. clean system), inspect syslog
        if len(raw_lines) < 5:
            syslog_paths = ["/var/log/syslog", "/var/log/messages"]
            for path in syslog_paths:
                if os.path.exists(path) and os.access(path, os.R_OK):
                    try:
                        with open(path, "r", encoding="utf-8", errors="replace") as f:
                            raw_lines = f.readlines()[-lines:]
                            source_name = path
                            break
                    except Exception:
                        continue

        # If still empty (e.g. system permissions or completely quiet system), use sample haunted logs
        if not raw_lines:
            raw_lines = [l.strip() for l in SAMPLE_HAUNTED_LOGS.strip().splitlines() if l.strip()]
            source_name = "spectral telemetry (sample haunted logs)"

    raw_text = "\n".join(raw_lines)
    sanitized_text, _ = sanitize_log_text(raw_text)
    sanitized_lines = sanitized_text.splitlines()
    events = parse_log_events(sanitized_lines[-15:])

    return LogAnalysisData(
        raw_lines=raw_lines,
        sanitized_text=sanitized_text,
        extracted_events=events,
        source=source_name,
    )
