"""Unit tests for GhostShell SQLite database manager."""

import tempfile
from pathlib import Path
from ghostshell.core.database import GhostDatabase

def test_database_lifecycle():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_history.db"
        db = GhostDatabase(db_path=db_path)

        # Record command
        row_id = db.record_command("tar -czvf test.tar.gz .", "ghost", False, "LOW", "Test explanation")
        assert row_id == 1

        # Record dangerous command
        danger_id = db.record_command("rm -rf /", "alert", True, "CRITICAL", "Demonic possession")
        assert danger_id == 2

        # Fetch history
        history = db.get_recent_history(limit=5)
        assert len(history) == 2
        assert history[0]["command"] == "rm -rf /"
        assert history[0]["is_dangerous"] == 1
        assert history[0]["severity"] == "CRITICAL"
        assert history[1]["command"] == "tar -czvf test.tar.gz ."

        # Record chat
        db.record_chat_message("sess_1", "user", "What is kernel panic?")
        db.record_chat_message("sess_1", "assistant", "A catastrophic state...")
        chat = db.get_recent_chat("sess_1")
        assert len(chat) == 2
        assert chat[0]["role"] == "user"
        assert chat[1]["role"] == "assistant"
