"""Local SQLite database manager for GhostShell session and audit history."""

import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any

DEFAULT_DB_DIR = Path.home() / ".ghostshell"
DEFAULT_DB_PATH = DEFAULT_DB_DIR / "history.db"

class GhostDatabase:
    """Manages local SQLite database for GhostShell history."""

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DEFAULT_DB_PATH
        self._init_db()

    def _init_db(self):
        """Initializes tables if they do not exist."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS command_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    command TEXT NOT NULL,
                    mode TEXT NOT NULL,
                    is_dangerous BOOLEAN DEFAULT 0,
                    severity TEXT DEFAULT 'LOW',
                    response TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS haunted_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source TEXT,
                    narrative TEXT,
                    events_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversation_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()

    def record_command(
        self,
        command: str,
        mode: str,
        is_dangerous: bool = False,
        severity: str = "LOW",
        response: str = "",
    ) -> int:
        """Records an audited command and its response."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO command_history (command, mode, is_dangerous, severity, response)
                VALUES (?, ?, ?, ?, ?)
                """,
                (command, mode, 1 if is_dangerous else 0, severity, response),
            )
            conn.commit()
            return cursor.lastrowid

    def record_haunted_session(self, source: str, narrative: str, events_count: int = 0) -> int:
        """Records a log narration session."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO haunted_sessions (source, narrative, events_count)
                VALUES (?, ?, ?)
                """,
                (source, narrative, events_count),
            )
            conn.commit()
            return cursor.lastrowid

    def record_chat_message(self, session_id: str, role: str, content: str):
        """Appends a message to conversational history."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO conversation_history (session_id, role, content)
                VALUES (?, ?, ?)
                """,
                (session_id, role, content),
            )
            conn.commit()

    def get_recent_history(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Retrieves recent audited commands."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, command, mode, is_dangerous, severity, created_at
                FROM command_history
                ORDER BY id DESC
                LIMIT ?
                """,
                (limit,),
            )
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_recent_chat(self, session_id: str, limit: int = 10) -> List[Dict[str, str]]:
        """Retrieves recent chat history for a session."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT role, content
                FROM conversation_history
                WHERE session_id = ?
                ORDER BY id ASC
                LIMIT ?
                """,
                (session_id, limit),
            )
            rows = cursor.fetchall()
            return [{"role": r["role"], "content": r["content"]} for r in rows]
