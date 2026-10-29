"""FastAPI backend server for the GhostShell Web UI."""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ghostshell import __version__
from ghostshell.core.guardian import analyze_command
from ghostshell.core.logs import collect_logs
from ghostshell.core.database import GhostDatabase
from ghostshell.core.ai import GhostAI, DEFAULT_MODEL

app = FastAPI(
    title="GhostShell Web Dashboard",
    description="A spooky, AI-powered Linux terminal companion dashboard.",
    version=__version__,
)

STATIC_DIR = Path(__file__).parent / "static"
db = GhostDatabase()

class CommandRequest(BaseModel):
    command: str
    model: Optional[str] = DEFAULT_MODEL

class AskRequest(BaseModel):
    question: str
    with_logs: Optional[bool] = False
    model: Optional[str] = DEFAULT_MODEL

class LogRequest(BaseModel):
    lines: Optional[int] = 20
    file_path: Optional[str] = None
    model: Optional[str] = DEFAULT_MODEL

@app.get("/api/status")
def get_status():
    ai = GhostAI()
    is_available = ai.is_available()
    models = ai.get_models() if is_available else []
    return {
        "status": "online" if is_available else "offline",
        "default_model": DEFAULT_MODEL,
        "available_models": models,
        "database_path": str(db.db_path),
        "version": __version__,
    }

@app.post("/api/ghost")
def api_ghost_mode(req: CommandRequest):
    cmd = req.command.strip()
    if not cmd:
        raise HTTPException(status_code=400, detail="Command cannot be empty")

    guardian_res = analyze_command(cmd)
    ai = GhostAI(model_name=req.model or DEFAULT_MODEL)

    if guardian_res.is_dangerous:
        warning = ai.explain_possession(cmd, guardian_res.hazards)
        db.record_command(cmd, "ghost_halted", True, guardian_res.severity, warning)
        return {
            "command": cmd,
            "is_dangerous": True,
            "severity": guardian_res.severity,
            "hazards": guardian_res.hazards,
            "explanation": warning or guardian_res.rule_explanation,
            "safe_alternative": guardian_res.suggested_safe_alternative,
        }

    explanation = ai.explain_command(cmd)
    db.record_command(cmd, "ghost", False, "LOW", explanation)
    return {
        "command": cmd,
        "is_dangerous": False,
        "severity": "LOW",
        "hazards": [],
        "explanation": explanation,
        "safe_alternative": None,
    }

@app.post("/api/alert")
def api_possession_alert(req: CommandRequest):
    cmd = req.command.strip()
    if not cmd:
        raise HTTPException(status_code=400, detail="Command cannot be empty")

    guardian_res = analyze_command(cmd)
    ai = GhostAI(model_name=req.model or DEFAULT_MODEL)

    if guardian_res.is_dangerous:
        warning = ai.explain_possession(cmd, guardian_res.hazards)
        db.record_command(cmd, "alert", True, guardian_res.severity, warning)
        return {
            "command": cmd,
            "is_dangerous": True,
            "severity": guardian_res.severity,
            "hazards": guardian_res.hazards,
            "warning": warning or guardian_res.rule_explanation,
            "safe_alternative": guardian_res.suggested_safe_alternative,
        }

    db.record_command(cmd, "alert", False, "LOW", "Clean command")
    return {
        "command": cmd,
        "is_dangerous": False,
        "severity": "LOW",
        "hazards": [],
        "warning": "No destructive or malicious patterns detected. The command is deemed safe.",
        "safe_alternative": None,
    }

@app.post("/api/logs")
def api_haunted_logs(req: LogRequest):
    ai = GhostAI(model_name=req.model or DEFAULT_MODEL)
    log_data = collect_logs(file_path=req.file_path, lines=req.lines or 20)
    narrative = ai.narrate_logs(log_data.sanitized_text)

    db.record_haunted_session(
        source=log_data.source,
        narrative=narrative,
        events_count=len(log_data.extracted_events),
    )

    return {
        "source": log_data.source,
        "raw_lines": log_data.raw_lines,
        "sanitized_text": log_data.sanitized_text,
        "extracted_events": log_data.extracted_events,
        "narrative": narrative,
    }

@app.post("/api/ask")
def api_ask_ghost(req: AskRequest):
    q = req.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    log_context = None
    if req.with_logs:
        log_data = collect_logs(lines=15)
        log_context = log_data.sanitized_text

    ai = GhostAI(model_name=req.model or DEFAULT_MODEL)
    answer = ai.ask_ghost(question=q, log_context=log_context)

    db.record_chat_message("web_chat", "user", q)
    db.record_chat_message("web_chat", "assistant", answer)

    return {
        "question": q,
        "answer": answer,
        "model": req.model or DEFAULT_MODEL,
    }

@app.get("/api/history")
def api_get_history(limit: int = 20):
    records = db.get_recent_history(limit=limit)
    return {"history": records}

# Serve static files and single page app
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
def serve_index():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "GhostShell Web UI static directory not yet initialized."}
