"""Command Line Interface (CLI) entrypoint for GhostShell using Typer."""

import sys
import time
from typing import Optional
import typer
from rich.table import Table
from rich.panel import Panel

from ghostshell import __version__
from ghostshell.ui.theme import (
    console,
    SPECTRAL_GREEN,
    HAUNT_CYAN,
    BLOOD_RED,
    CRYPT_PURPLE,
    GRAVE_DIM,
)
from ghostshell.ui.banners import print_banner
from ghostshell.ui.renderer import (
    render_ghost_explanation,
    render_possession_alert,
    render_haunted_logs,
    render_ask_response,
)
from ghostshell.core.guardian import analyze_command
from ghostshell.core.logs import collect_logs
from ghostshell.core.database import GhostDatabase
from ghostshell.core.ai import GhostAI, DEFAULT_MODEL
from ghostshell.shell import start_interactive_session

app = typer.Typer(
    name="ghostshell",
    help="👻 GhostShell: The spooky, AI-powered Linux terminal companion (100% offline).",
    add_completion=False,
)

@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    version: bool = typer.Option(False, "--version", "-v", help="Show GhostShell version"),
):
    """GhostShell - Spooky AI terminal companion."""
    if version:
        console.print(f"[bold {SPECTRAL_GREEN}]GhostShell[/] version [bold {HAUNT_CYAN}]{__version__}[/]")
        raise typer.Exit()
    if ctx.invoked_subcommand is None:
        print_banner(console)
        console.print(
            f"\n[{CRYPT_PURPLE}]Summon the Specter with a subcommand or enter interactive mode:[/{CRYPT_PURPLE}]\n"
            f"  [bold {SPECTRAL_GREEN}]ghostshell web[/]             🌐 Launch spooky Web UI dashboard in browser\n"
            f"  [bold {SPECTRAL_GREEN}]ghostshell interactive[/]     Enter interactive terminal REPL\n"
            f"  [bold {SPECTRAL_GREEN}]ghostshell ghost <cmd>[/]      Spooky command explanation\n"
            f"  [bold {SPECTRAL_GREEN}]ghostshell alert <cmd>[/]      Possession detection & safe alternative\n"
            f"  [bold {SPECTRAL_GREEN}]ghostshell logs[/]             Haunted log storytelling from system logs\n"
            f"  [bold {SPECTRAL_GREEN}]ghostshell ask <question>[/]   Consult the Specter\n"
            f"  [bold {SPECTRAL_GREEN}]ghostshell demo[/]             Run automated showcase demo\n"
        )

@app.command(name="ghost")
def ghost_mode(
    command: str = typer.Argument(..., help="The Linux bash command to explain"),
    model: str = typer.Option(DEFAULT_MODEL, "--model", "-m", help="Local Ollama model to use"),
):
    """👻 Ghost Mode: Explains a Linux command with eerie, personality-driven commentary."""
    # Guardian pre-check to protect user
    guardian_res = analyze_command(command)
    db = GhostDatabase()
    ai = GhostAI(model_name=model)

    if guardian_res.is_dangerous:
        with console.status(f"[{BLOOD_RED}]Possession detected! Evaluating threat...[/{BLOOD_RED}]", spinner="dots"):
            warning = ai.explain_possession(command, guardian_res.hazards)
        render_possession_alert(
            command=command,
            severity=guardian_res.severity,
            hazards=guardian_res.hazards,
            spectral_warning=warning or guardian_res.rule_explanation,
            safe_alternative=guardian_res.suggested_safe_alternative,
            model_name=model,
        )
        db.record_command(command, "ghost_halted", True, guardian_res.severity, warning)
        return

    with console.status(f"[{HAUNT_CYAN}]Summoning the ghost to decipher command...[/{HAUNT_CYAN}]", spinner="dots"):
        explanation = ai.explain_command(command)

    render_ghost_explanation(command, explanation, model_name=model)
    db.record_command(command, "ghost", False, "LOW", explanation)

@app.command(name="alert")
def possession_alert(
    command: str = typer.Argument(..., help="The bash command to audit for destructive hazards"),
    model: str = typer.Option(DEFAULT_MODEL, "--model", "-m", help="Local Ollama model to use"),
):
    """⚠️ Possession Alerts: Identifies dangerous commands and suggests safe alternatives."""
    guardian_res = analyze_command(command)
    db = GhostDatabase()
    ai = GhostAI(model_name=model)

    if guardian_res.is_dangerous:
        with console.status(f"[{BLOOD_RED}]Dissecting malevolent command signature...[/{BLOOD_RED}]", spinner="dots"):
            spectral_warning = ai.explain_possession(command, guardian_res.hazards)
        render_possession_alert(
            command=command,
            severity=guardian_res.severity,
            hazards=guardian_res.hazards,
            spectral_warning=spectral_warning or guardian_res.rule_explanation,
            safe_alternative=guardian_res.suggested_safe_alternative,
            model_name=model,
        )
        db.record_command(command, "alert", True, guardian_res.severity, spectral_warning)
    else:
        console.print(
            Panel(
                f"[{SPECTRAL_GREEN}]No catastrophic possession detected in command:[/{SPECTRAL_GREEN}]\n"
                f"[bold white]{command}[/]\n\n"
                f"[dim]The command passed Guardian safety checks without triggering destructive blocklist rules.[/dim]",
                title=f"[{SPECTRAL_GREEN}]✨ Clean Incantation ✨[/{SPECTRAL_GREEN}]",
                border_style=SPECTRAL_GREEN,
            )
        )
        db.record_command(command, "alert", False, "LOW", "Clean command")

@app.command(name="logs")
def haunted_logs(
    file: Optional[str] = typer.Option(None, "--file", "-f", help="Specific log file path to analyze"),
    lines: int = typer.Option(30, "--lines", "-n", help="Number of log lines to inspect"),
    model: str = typer.Option(DEFAULT_MODEL, "--model", "-m", help="Local Ollama model to use"),
):
    """📜 Haunted Logs: Analyzes Linux logs and narrates eerie system stories from factual events."""
    db = GhostDatabase()
    ai = GhostAI(model_name=model)

    with console.status(f"[{SPECTRAL_GREEN}]Scouring system logs and scrubbing sensitive identities...[/{SPECTRAL_GREEN}]", spinner="bouncingBall"):
        log_data = collect_logs(file_path=file, lines=lines)
        narrative = ai.narrate_logs(log_data.sanitized_text)

    render_haunted_logs(
        narrative=narrative,
        evidence_events=log_data.extracted_events,
        source_name=log_data.source,
        model_name=model,
    )
    db.record_haunted_session(source=log_data.source, narrative=narrative, events_count=len(log_data.extracted_events))

@app.command(name="ask")
def ask_the_ghost(
    question: str = typer.Argument(..., help="Question to ask the ghost about Linux, logs, or tools"),
    with_logs: bool = typer.Option(False, "--logs", "-l", help="Include recent system log telemetry in context"),
    model: str = typer.Option(DEFAULT_MODEL, "--model", "-m", help="Local Ollama model to use"),
):
    """🔮 Ask the Ghost: Let users ask technical questions to the local AI phantom."""
    db = GhostDatabase()
    ai = GhostAI(model_name=model)

    log_context = None
    if with_logs:
        log_data = collect_logs(lines=20)
        log_context = log_data.sanitized_text

    with console.status(f"[{CRYPT_PURPLE}]Communing with the ancient terminal spirit...[/{CRYPT_PURPLE}]", spinner="aesthetic"):
        answer = ai.ask_ghost(question=question, log_context=log_context)

    render_ask_response(question, answer, model_name=model)
    db.record_chat_message("cli_ask", "user", question)
    db.record_chat_message("cli_ask", "assistant", answer)

@app.command(name="interactive")
def interactive(
    model: str = typer.Option(DEFAULT_MODEL, "--model", "-m", help="Local Ollama model to use"),
):
    """👻 Enter interactive GhostShell REPL mode."""
    start_interactive_session(model_name=model)

@app.command(name="repl")
def repl(
    model: str = typer.Option(DEFAULT_MODEL, "--model", "-m", help="Local Ollama model to use"),
):
    """Alias for 'interactive' mode."""
    start_interactive_session(model_name=model)

@app.command(name="history")
def show_history(
    limit: int = typer.Option(15, "--limit", "-n", help="Number of recent records to display"),
):
    """📜 Display past audited commands, alerts, and sessions."""
    db = GhostDatabase()
    records = db.get_recent_history(limit=limit)
    if not records:
        console.print("[dim]The crypt is silent. No command history recorded yet.[/dim]")
        return

    table = Table(
        title=f"[{SPECTRAL_GREEN}]👻 GhostShell Command & Possession Ledger[/{SPECTRAL_GREEN}]",
        border_style=GRAVE_DIM,
        header_style=f"bold {HAUNT_CYAN}",
    )
    table.add_column("ID", width=4)
    table.add_column("Command", style="cyan")
    table.add_column("Mode", style=SPECTRAL_GREEN)
    table.add_column("Threat Level", style=BLOOD_RED)
    table.add_column("Timestamp", style=GRAVE_DIM)

    for r in records:
        sev = r["severity"] if r["is_dangerous"] else "CLEAN"
        style = BLOOD_RED if r["is_dangerous"] else SPECTRAL_GREEN
        table.add_row(
            str(r["id"]),
            r["command"],
            r["mode"],
            f"[{style}]{sev}[/{style}]",
            str(r["created_at"]),
        )
    console.print(table)

@app.command(name="demo")
def run_demo(
    model: str = typer.Option(DEFAULT_MODEL, "--model", "-m", help="Local Ollama model to use"),
):
    """🎬 Automated Live Showcase: Demonstrates all GhostShell features in action."""
    print_banner(console)
    console.print("\n[bold yellow]═══ STEP 1: GHOST MODE (Spooky Command Explanation) ═══[/bold yellow]\n")
    sample_cmd = "tar -czvf backup_etc.tar.gz /etc"
    console.print(f"[dim]Explaining benign command:[/] [bold cyan]{sample_cmd}[/]\n")
    ghost_mode(sample_cmd, model)

    time.sleep(1)
    console.print("\n[bold red]═══ STEP 2: POSSESSION ALERT (Destructive Command Prevention) ═══[/bold red]\n")
    danger_cmd = "rm -rf / --no-preserve-root"
    console.print(f"[dim]Auditing catastrophic command:[/] [bold red]{danger_cmd}[/]\n")
    possession_alert(danger_cmd, model)

    time.sleep(1)
    console.print("\n[bold magenta]═══ STEP 3: HAUNTED LOGS (Storytelling from Real Linux Telemetry) ═══[/bold magenta]\n")
    console.print("[dim]Collecting and narrating system logs...[/dim]\n")
    haunted_logs(file=None, lines=20, model=model)

    time.sleep(1)
    console.print("\n[bold green]═══ STEP 4: ASK THE GHOST (Offline Linux Q&A) ═══[/bold green]\n")
    ask_q = "What is a zombie process in Linux and how do I slay it?"
    console.print(f"[dim]Asking:[/] [bold green]{ask_q}[/]\n")
    ask_the_ghost(ask_q, with_logs=False, model=model)

    console.print(
        Panel(
            "[bold green]✨ GhostShell Demo Complete! ✨[/bold green]\n"
            "All four core features demonstrated using 100% local, offline inference.\n"
            "Ready for Hacktoberfest 2026: Ghost in the Machine!",
            border_style=SPECTRAL_GREEN,
        )
    )

@app.command(name="web")
def web_cmd(
    port: int = typer.Option(8888, "--port", "-p", help="Port to bind the GhostShell Web UI server"),
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host address to bind"),
    no_browser: bool = typer.Option(False, "--no-browser", help="Do not automatically open browser"),
):
    """🌐 Launch the GhostShell Spooky Web UI Dashboard in your browser."""
    import webbrowser
    import uvicorn
    from ghostshell.web.app import app as web_app
    
    url = f"http://{host}:{port}"
    print_banner(console)
    console.print(
        Panel(
            f"[bold {SPECTRAL_GREEN}]👻 GhostShell Web Dashboard Awakening...[/{SPECTRAL_GREEN}]\n\n"
            f"🔮 Server running at: [bold {HAUNT_CYAN}]{url}[/]\n"
            f"👻 Connected to: [bold white]Gemma 2 (2B)[/] via local Ollama\n"
            f"[dim]Press Ctrl+C to release the Specter and shut down server.[/dim]",
            title="[bold #00ff87]Spectral Web Portal[/bold #00ff87]",
            border_style=HAUNT_CYAN,
        )
    )
    if not no_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass
    
    uvicorn.run(web_app, host=host, port=port, log_level="warning")

@app.command(name="ui")
def ui_cmd(
    port: int = typer.Option(8888, "--port", "-p", help="Port to bind the GhostShell Web UI server"),
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host address to bind"),
    no_browser: bool = typer.Option(False, "--no-browser", help="Do not automatically open browser"),
):
    """Alias for 'ghostshell web'."""
    web_cmd(port=port, host=host, no_browser=no_browser)

if __name__ == "__main__":
    app()
