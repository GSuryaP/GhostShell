"""Interactive GhostShell REPL using prompt_toolkit and Rich."""

import sys
from typing import Optional
from prompt_toolkit import PromptSession
from prompt_toolkit.history import InMemoryHistory
from prompt_toolkit.styles import Style
from rich.table import Table
from rich.panel import Panel

from ghostshell.ui.theme import (
    console,
    SPECTRAL_GREEN,
    HAUNT_CYAN,
    BLOOD_RED,
    CRYPT_PURPLE,
    GRAVE_DIM,
)
from ghostshell.ui.banners import print_banner, MINI_GHOST
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

PROMPT_STYLE = Style.from_dict({
    "ghost-icon": "#00ff87 bold",
    "prompt-user": "#60efff bold",
    "prompt-delim": "#a55eea bold",
})

def print_help_table():
    """Prints the spooky help menu table."""
    table = Table(
        title=f"[{SPECTRAL_GREEN}]👻 GhostShell Spellbook (Commands)[/{SPECTRAL_GREEN}]",
        border_style=CRYPT_PURPLE,
        header_style=f"bold {HAUNT_CYAN}",
    )
    table.add_column("Command / Spell", style=f"bold {SPECTRAL_GREEN}", width=22)
    table.add_column("Effect in the Mortal Realm", style="white")

    table.add_row("ghost <command>", "Summons the Specter to explain a Linux command")
    table.add_row("alert <command>", "Possession check: audits command for catastrophic risks")
    table.add_row("logs [limit]", "Inspects system logs and spins a gothic mystery tale")
    table.add_row("ask <question>", "Inquires about terminal concepts, errors, or logs")
    table.add_row("history", "View recent audited commands and possession logs")
    table.add_row("status", "Inspect Ollama connection & local model state")
    table.add_row("clear", "Clears terminal fog and re-summons the banner")
    table.add_row("exit / quit", "Releases the Ghost and returns to normal shell")
    console.print(table)

def start_interactive_session(model_name: str = DEFAULT_MODEL, db_path: Optional[str] = None):
    """Starts the interactive GhostShell session."""
    ai = GhostAI(model_name=model_name)
    db = GhostDatabase()

    print_banner(console)
    console.print(
        f"[dim white]Interactive spectral shell awakened. Local Model:[/] [bold {HAUNT_CYAN}]{model_name}[/] "
        f"[dim white](Type[/] [bold {SPECTRAL_GREEN}]help[/] [dim white]for spellbook)[/]\n"
    )

    session = PromptSession(history=InMemoryHistory())

    while True:
        try:
            prompt_fragments = [
                ("class:ghost-icon", "👻 "),
                ("class:prompt-user", "ghost@crypt"),
                ("class:prompt-delim", " ❯ "),
            ]
            raw_input = session.prompt(prompt_fragments, style=PROMPT_STYLE).strip()

            if not raw_input:
                continue

            lower_input = raw_input.lower()

            if lower_input in ["exit", "quit", "q", ":q"]:
                console.print(f"\n[italic {HAUNT_CYAN}]The Specter fades back into the kernel mists... Fare thee well, mortal.[/italic {HAUNT_CYAN}]\n")
                break

            elif lower_input == "help":
                print_help_table()

            elif lower_input == "clear":
                console.clear()
                print_banner(console)

            elif lower_input == "status":
                is_online = ai.is_available()
                models = ai.get_models() if is_online else []
                status_text = f"[bold green]ONLINE[/]" if is_online else f"[bold red]OFFLINE (Start with `ollama serve`)[/]"
                console.print(
                    Panel(
                        f"Status: {status_text}\n"
                        f"Active Model: [bold {HAUNT_CYAN}]{model_name}[/]\n"
                        f"Available Local Models: [dim]{', '.join(models) if models else 'None detected'}[/dim]\n"
                        f"Database: [dim]{db.db_path}[/dim]",
                        title=f"[{SPECTRAL_GREEN}]👻 Daemon Telemetry[/{SPECTRAL_GREEN}]",
                        border_style=HAUNT_CYAN,
                    )
                )

            elif lower_input == "history":
                history_rows = db.get_recent_history(limit=10)
                if not history_rows:
                    console.print("[dim]No previous incantations recorded yet.[/dim]")
                else:
                    table = Table(title="Recent Audited Commands", border_style=GRAVE_DIM)
                    table.add_column("ID", width=4)
                    table.add_column("Command", style="cyan")
                    table.add_column("Mode", style=SPECTRAL_GREEN)
                    table.add_column("Hazard", style=BLOOD_RED)
                    table.add_column("Timestamp", style=GRAVE_DIM)
                    for r in history_rows:
                        table.add_row(
                            str(r["id"]),
                            r["command"],
                            r["mode"],
                            r["severity"] if r["is_dangerous"] else "SAFE",
                            str(r["created_at"]),
                        )
                    console.print(table)

            elif lower_input.startswith("logs"):
                parts = raw_input.split(maxsplit=1)
                limit = 30
                if len(parts) > 1 and parts[1].isdigit():
                    limit = int(parts[1])

                with console.status(f"[{SPECTRAL_GREEN}]Communing with system spirits and scrubbing logs...[/{SPECTRAL_GREEN}]", spinner="bouncingBall"):
                    log_data = collect_logs(lines=limit)
                    narrative = ai.narrate_logs(log_data.sanitized_text)

                render_haunted_logs(
                    narrative=narrative,
                    evidence_events=log_data.extracted_events,
                    source_name=log_data.source,
                    model_name=model_name,
                )
                db.record_haunted_session(source=log_data.source, narrative=narrative, events_count=len(log_data.extracted_events))

            elif lower_input.startswith("ask "):
                question = raw_input[4:].strip()
                if not question:
                    console.print("[dim]Ask a question: e.g., 'ask what is a zombie process?'[/dim]")
                    continue

                with console.status(f"[{CRYPT_PURPLE}]Consulting the ancient scrolls...[/{CRYPT_PURPLE}]", spinner="aesthetic"):
                    answer = ai.ask_ghost(question=question)

                render_ask_response(question, answer, model_name=model_name)
                db.record_chat_message("interactive_session", "user", question)
                db.record_chat_message("interactive_session", "assistant", answer)

            elif lower_input.startswith("alert "):
                target_cmd = raw_input[6:].strip()
                guardian_res = analyze_command(target_cmd)
                if guardian_res.is_dangerous:
                    with console.status(f"[{BLOOD_RED}]Channeling the curse analysis...[/{BLOOD_RED}]", spinner="dots"):
                        spectral_warning = ai.explain_possession(target_cmd, guardian_res.hazards)
                    render_possession_alert(
                        command=target_cmd,
                        severity=guardian_res.severity,
                        hazards=guardian_res.hazards,
                        spectral_warning=spectral_warning or guardian_res.rule_explanation,
                        safe_alternative=guardian_res.suggested_safe_alternative,
                        model_name=model_name,
                    )
                else:
                    console.print(f"\n[{SPECTRAL_GREEN}]✓ No malevolent possession detected in:[/{SPECTRAL_GREEN}] [bold white]{target_cmd}[/]\n")
                db.record_command(target_cmd, "alert", guardian_res.is_dangerous, guardian_res.severity)

            elif lower_input.startswith("ghost "):
                target_cmd = raw_input[6:].strip()
                # Run guardian first to safeguard user
                guardian_res = analyze_command(target_cmd)
                if guardian_res.is_dangerous:
                    with console.status(f"[{BLOOD_RED}]HALT! Possession detected in command...[/{BLOOD_RED}]", spinner="dots"):
                        spectral_warning = ai.explain_possession(target_cmd, guardian_res.hazards)
                    render_possession_alert(
                        command=target_cmd,
                        severity=guardian_res.severity,
                        hazards=guardian_res.hazards,
                        spectral_warning=spectral_warning or guardian_res.rule_explanation,
                        safe_alternative=guardian_res.suggested_safe_alternative,
                        model_name=model_name,
                    )
                    db.record_command(target_cmd, "ghost_halted", True, guardian_res.severity)
                else:
                    with console.status(f"[{HAUNT_CYAN}]Summoning ghost to decipher command...[/{HAUNT_CYAN}]", spinner="dots"):
                        explanation = ai.explain_command(target_cmd)
                    render_ghost_explanation(target_cmd, explanation, model_name=model_name)
                    db.record_command(target_cmd, "ghost", False, "LOW", explanation)

            else:
                # Default behavior: assume user entered a command to explain or inspect
                target_cmd = raw_input
                guardian_res = analyze_command(target_cmd)
                if guardian_res.is_dangerous:
                    with console.status(f"[{BLOOD_RED}]A curse stirs! Possession detected...[/{BLOOD_RED}]", spinner="dots"):
                        spectral_warning = ai.explain_possession(target_cmd, guardian_res.hazards)
                    render_possession_alert(
                        command=target_cmd,
                        severity=guardian_res.severity,
                        hazards=guardian_res.hazards,
                        spectral_warning=spectral_warning or guardian_res.rule_explanation,
                        safe_alternative=guardian_res.suggested_safe_alternative,
                        model_name=model_name,
                    )
                    db.record_command(target_cmd, "ghost_halted", True, guardian_res.severity)
                else:
                    with console.status(f"[{SPECTRAL_GREEN}]Deciphering command invocation...[/{SPECTRAL_GREEN}]", spinner="dots"):
                        explanation = ai.explain_command(target_cmd)
                    render_ghost_explanation(target_cmd, explanation, model_name=model_name)
                    db.record_command(target_cmd, "ghost", False, "LOW", explanation)

        except KeyboardInterrupt:
            console.print("\n[dim]Incantation interrupted. Type 'exit' to quit.[/dim]")
            continue
        except EOFError:
            break
