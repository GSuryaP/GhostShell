"""Guardian Engine for GhostShell: Zero-latency deterministic detection of dangerous shell commands."""

import re
import shlex
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

@dataclass
class GuardianResult:
    command: str
    is_dangerous: bool = False
    severity: str = "LOW"  # CRITICAL, HIGH, MEDIUM, LOW
    hazards: List[str] = field(default_factory=list)
    suggested_safe_alternative: Optional[str] = None
    rule_explanation: str = ""

# Deterministic hazardous patterns and rule definitions
DANGEROUS_RULES = [
    # Fork bomb
    (
        r"(\:\(\)\s*\{\s*\:\s*\|\s*\:\s*\&\s*\}\s*\;\s*\:)|(\b(\w+)\s*\(\)\s*\{\s*\3\s*\|\s*\3\s*&\s*\}\s*;\s*\3)",
        "CRITICAL",
        "Fork Bomb detected: Exponential process spawning designed to instantly freeze the system and exhaust kernel PID tables.",
        "None! Do not unleash this phantom upon your realm.",
    ),
    # rm -rf root / home / wildcards
    (
        r"\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+(\/|\/\*|~\/?|\$HOME|\.\/?|\*)\b|\brm\s+-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*\s+(\/|\/\*|~\/?|\$HOME|\.\/?|\*)\b",
        "CRITICAL",
        "Catastrophic File Purge: Recursively and forcefully destroys files starting at root, home, or current working directory without confirmation.",
        "trash-put <filename>  # Or list target files first: find . -maxdepth 1 -name '<pattern>'",
    ),
    # rm without preserve root
    (
        r"\brm\s+.*--no-preserve-root",
        "CRITICAL",
        "Bypasses kernel safety lock to obliterate the entire root hierarchy.",
        "trash-put <filename> # Use a safe trash utility rather than unconstrained rm",
    ),
    # Raw disk overwrite via dd
    (
        r"\bdd\s+.*of=\/dev\/(sd[a-z]|nvme[0-9]n[0-9]|hd[a-z]|vd[a-z]|loop[0-9]|mapper\/)",
        "CRITICAL",
        "Raw Device Overwrite: Directly rewrites raw storage blocks, destroying partition tables, filesystems, and data.",
        "lsblk  # Verify device names first and write only to unmounted target partitions",
    ),
    # Formatting filesystems
    (
        r"\bmkfs(\.[a-z0-9]+)?\s+\/dev\/(sd[a-z]|nvme[0-9]|hd[a-z]|vd[a-z])",
        "CRITICAL",
        "Filesystem Formatting: Initializes a new blank filesystem over a block device, erasing all prior structures.",
        "lsblk -f  # Double check UUIDs and target partitions before formatting",
    ),
    # Blind pipeline execution (curl/wget | sh/bash/sudo)
    (
        r"\b(curl|wget)\b.*\|\s*(sudo\s+)?(bash|sh|zsh)\b",
        "HIGH",
        "Blind Pipe Execution: Streams untrusted remote code directly into an elevated shell interpreter without pre-inspection.",
        "curl -sSL https://example.com/install.sh -o install.sh && less install.sh  # Inspect before running",
    ),
    # Wiping filesystem signatures
    (
        r"\bwipefs\s+(-a|--all)",
        "CRITICAL",
        "Wipe Filesystem Signatures: Strips magic bytes and superblock signatures, rendering filesystems invisible.",
        "file -s /dev/target  # Inspect disk structures safely first",
    ),
    # Recursive chmod 777 or 000 on root/etc
    (
        r"\bchmod\s+(-[a-zA-Z]*R[a-zA-Z]*\s+)?(777|000)\s+(\/|\/etc|\/usr|\/bin|\/var)(?:\s|$|\*)",
        "CRITICAL",
        "Permission Catastrophe: Breaks POSIX security boundaries (or locks out all users, breaking sudo and ssh) on core system trees.",
        "chmod 755 <specific_dir>  # Apply targeted permissions only to your project directory",
    ),
    # Recursive chown root
    (
        r"\bchown\s+-[a-zA-Z]*R[a-zA-Z]*\s+[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+\s+(\/|\/etc|\/usr)(?:\s|$|\*)",
        "CRITICAL",
        "System Ownership Hijack: Recursively reassigns ownership of critical OS files, breaking system daemons.",
        "chown user:group ./local_folder  # Confine ownership changes to your project scope",
    ),
    # Flush iptables / disable firewall
    (
        r"\b(iptables\s+-F|ufw\s+disable)\b",
        "MEDIUM",
        "Firewall Disablement: Drops network packet filtering and exposes open listening ports to the void.",
        "ufw status verbose  # Check firewall rules before modifying security state",
    ),
    # Overwriting block devices with stdout redirection
    (
        r">\s*\/dev\/(sd[a-z]|nvme[0-9]|hd[a-z])",
        "CRITICAL",
        "Direct Device Redirection: Shell output redirected directly into raw disk device nodes.",
        "> ./output.log  # Redirect output to a designated log file instead",
    ),
    # Destructive git force push or reset
    (
        r"\bgit\s+push\s+.*(--force|-f)\s+.*(main|master)\b",
        "HIGH",
        "Destructive Git Force Push: Overwrites remote commit history on primary production branches.",
        "git push --force-with-lease  # Ensures you do not overwrite unseen commits by teammates",
    ),
    (
        r"\bgit\s+reset\s+--hard\s+HEAD~[0-9]+",
        "HIGH",
        "Permanent Git Loss: Destroys uncommitted changes and drops commits from your working branch.",
        "git stash && git branch backup-branch  # Save your state in a backup branch first",
    ),
    # Sudden power cut / reboot
    (
        r"\b(shutdown\s+(-h|-P|now|\+0)|init\s+0|poweroff\s+-f|reboot\s+-f)\b",
        "MEDIUM",
        "Forced Machine Termination: Abruptly kills running processes and halts the system.",
        "systemctl status  # Verify active services before planning a controlled reboot",
    ),
]

def analyze_command(command: str) -> GuardianResult:
    """Deterministically inspects a bash command for high-risk hazards.
    
    Returns a GuardianResult detailing severity, identified threats, and safe alternatives.
    """
    clean_cmd = command.strip()
    result = GuardianResult(command=clean_cmd)

    if not clean_cmd:
        return result

    # Check against regex rules
    for pattern, severity, hazard_desc, safe_alt in DANGEROUS_RULES:
        if re.search(pattern, clean_cmd, re.IGNORECASE):
            result.is_dangerous = True
            result.severity = severity
            result.hazards.append(f"{hazard_desc}")
            if not result.suggested_safe_alternative:
                result.suggested_safe_alternative = safe_alt
            if not result.rule_explanation:
                result.rule_explanation = hazard_desc
            break

    # Secondary heuristic: check token breakdown
    try:
        tokens = shlex.split(clean_cmd)
    except Exception:
        # If shlex fails due to unclosed quotes, evaluate as raw string
        tokens = clean_cmd.split()

    if tokens:
        base_cmd = tokens[0]
        # Check command substitution attempts
        if any(tok.startswith("$(") or tok.startswith("`") for tok in tokens):
            if "rm " in clean_cmd or "dd " in clean_cmd:
                result.is_dangerous = True
                result.severity = "HIGH"
                result.hazards.append("Nested command substitution hiding potentially destructive payloads.")

        # Check rm flags
        if base_cmd == "rm":
            has_recursive = any("r" in t.lstrip("-") or "R" in t.lstrip("-") for t in tokens if t.startswith("-"))
            targets = [t for t in tokens[1:] if not t.startswith("-")]
            if has_recursive:
                for target in targets:
                    if target in ["/", "/*", "~", "$HOME", ".", "..", "*"]:
                        result.is_dangerous = True
                        result.severity = "CRITICAL"
                        if "Catastrophic File Purge" not in "".join(result.hazards):
                            result.hazards.append(f"Recursive purge of sensitive path target: '{target}'")
                            result.suggested_safe_alternative = "trash-put <file> or specify explicit subdirectory"

    return result
