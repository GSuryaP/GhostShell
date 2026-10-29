"""Unit tests for log sanitization and event extraction in GhostShell."""

from ghostshell.core.logs import sanitize_log_text, parse_log_events, SAMPLE_HAUNTED_LOGS

def test_sanitize_ips_and_secrets():
    raw_sample = (
        "Failed password for user specter from 198.51.100.42 port 22\n"
        "Internal DB connect password=super_secret_shhh token: xyz123456\n"
        "MAC address: 00:1a:2b:3c:4d:5e, local loopback 127.0.0.1"
    )
    sanitized, redacted_map = sanitize_log_text(raw_sample)

    assert "198.51.100.42" not in sanitized
    assert "[SPECTRAL-IP-1]" in sanitized
    assert "super_secret_shhh" not in sanitized
    assert "[REDACTED-SECRET]" in sanitized
    assert "00:1a:2b:3c:4d:5e" not in sanitized
    assert "[SPECTRAL-MAC]" in sanitized
    # Loopback should be preserved
    assert "127.0.0.1" in sanitized

def test_parse_log_events():
    lines = SAMPLE_HAUNTED_LOGS.strip().splitlines()
    events = parse_log_events(lines)
    assert len(events) > 0
    # Check that events have structure
    first = events[0]
    assert "timestamp" in first
    assert "unit" in first
    assert "priority" in first
    assert "message" in first
