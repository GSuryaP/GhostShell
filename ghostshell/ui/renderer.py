"""Rendering helpers for GhostShell outputs (Panels, Tables, Live Streams)."""

from typing import List, Dict, Optional
from rich.panel import Panel
from rich.table import Table
from rich.syntax import Syntax
from rich.markdown import Markdown
from rich.text import Text
from ghostshell.ui.theme import (
    console,
    SPECTRAL_GREEN,
    HAUNT_CYAN,
    BLOOD_RED,
    CURSED_AMBER,
    CRYPT_PURPLE,
    GRAVE_DIM,
)
from ghostshell.ui.banners import SKULL_ASCII, TOMBSTONE_ASCII

def render_ghost_explanation(command: str, explanation: str, model_name: str = "Gemma 2 (2B)"):
    """Renders a command explanation in a spooky haunted panel."""
    cmd_syntax = Syntax(command, "bash", theme="monokai", line_numbers=False)
    
    table = Table.grid(padding=1)
    table.add_column(style="bold")
    table.add_column()
    
    table.add_row(f"[{SPECTRAL_GREEN}]Command:[/{SPECTRAL_GREEN}]", cmd_syntax)
    
    content = Text()
    content.append("\n👻 The Specter Speaks:\n\n", style=f"bold {HAUNT_CYAN}")
    
    md = Markdown(explanation)
    
    panel = Panel(
        md,
        title=f"[{SPECTRAL_GREEN}]👻 GHOST MODE EXPLANATION[/{SPECTRAL_GREEN}]",
        subtitle=f"[{GRAVE_DIM}]Summoned via local {model_name} • 100% Offline[/{GRAVE_DIM}]",
        border_style=SPECTRAL_GREEN,
        padding=(1, 2),
    )
    console.print(table)
    console.print(panel)

def render_possession_alert(
    command: str,
    severity: str,
    hazards: List[str],
    spectral_warning: str,
    safe_alternative: Optional[str] = None,
    model_name: str = "Gemma 2 (2B)",
):
    """Renders a high-visibility Possession Alert for destructive commands."""
    sev_upper = severity.upper()
    if sev_upper == "CRITICAL":
        border_col = BLOOD_RED
        badge = f"[bold white on {BLOOD_RED}] ☠️ DEMONIC POSSESSION (CRITICAL) ☠️ [/bold white on {BLOOD_RED}]"
    elif sev_upper == "HIGH":
        border_col = BLOOD_RED
        badge = f"[bold {BLOOD_RED}] 🛑 POLTERGEIST THREAT (HIGH RISK) [/bold {BLOOD_RED}]"
    elif sev_upper == "MEDIUM":
        border_col = CURSED_AMBER
        badge = f"[bold {CURSED_AMBER}] ⚠️ CURSED COMMAND (MEDIUM RISK) [/bold {CURSED_AMBER}]"
    else:
        border_col = SPECTRAL_GREEN
        badge = f"[{SPECTRAL_GREEN}] 👻 MILD HAUNTING (LOW RISK) [/{SPECTRAL_GREEN}]"

    console.print()
    console.print(f"[bold {border_col}]{SKULL_ASCII}[/bold {border_col}]", justify="center")
    console.print(badge, justify="center")
    console.print()

    # Command inspected
    cmd_syntax = Syntax(command, "bash", theme="monokai", line_numbers=False)
    console.print(Panel(cmd_syntax, title=f"[{border_col}]Possessed Input[/{border_col}]", border_style=border_col))

    # Hazards list
    if hazards:
        haz_table = Table(title=f"[{BLOOD_RED}]Identified Hazards[/{BLOOD_RED}]", border_style=GRAVE_DIM)
        haz_table.add_column("Hazard", style=f"bold {BLOOD_RED}")
        haz_table.add_column("Threat", style="white")
        for h in hazards:
            parts = h.split(":", 1)
            if len(parts) == 2:
                haz_table.add_row(parts[0].strip(), parts[1].strip())
            else:
                haz_table.add_row("Destructive Pattern", h)
        console.print(haz_table)

    # Spectral warning (from LLM or rule engine)
    md_warning = Markdown(spectral_warning)
    console.print(
        Panel(
            md_warning,
            title=f"[{CRYPT_PURPLE}]Spectral Warning from the Beyond[/{CRYPT_PURPLE}]",
            border_style=CRYPT_PURPLE,
            padding=(1, 2),
        )
    )

    # Safe alternative
    if safe_alternative:
        safe_syntax = Syntax(safe_alternative, "bash", theme="monokai", line_numbers=False)
        console.print(
            Panel(
                safe_syntax,
                title=f"[{SPECTRAL_GREEN}]✨ Exorcised / Safe Alternative ✨[/{SPECTRAL_GREEN}]",
                subtitle="[dim]Run this safely without destroying your realm[/dim]",
                border_style=SPECTRAL_GREEN,
                padding=(1, 2),
            )
        )

def render_haunted_logs(
    narrative: str,
    evidence_events: List[Dict[str, str]],
    source_name: str = "journalctl / system logs",
    model_name: str = "Gemma 2 (2B)",
):
    """Renders the haunted log storytelling analysis with evidence table."""
    console.print()
    console.print(f"[{CRYPT_PURPLE}]{TOMBSTONE_ASCII}[/{CRYPT_PURPLE}]", justify="center")
    
    # Evidence Table
    if evidence_events:
        table = Table(
            title=f"[{HAUNT_CYAN}]Extracted Paranormal Evidence ({source_name})[/{HAUNT_CYAN}]",
            border_style=GRAVE_DIM,
            header_style=f"bold {SPECTRAL_GREEN}",
        )
        table.add_column("Timestamp", style=f"{GRAVE_DIM}", width=18)
        table.add_column("Service/Daemon", style=f"{CRYPT_PURPLE}", width=16)
        table.add_column("Severity", style=f"bold {BLOOD_RED}", width=10)
        table.add_column("Raw Event Log", style="white")

        for event in evidence_events:
            table.add_row(
                event.get("timestamp", "N/A"),
                event.get("unit", "kernel"),
                event.get("priority", "ERR"),
                event.get("message", "")[:80] + ("..." if len(event.get("message", "")) > 80 else ""),
            )
        console.print(table)

    # Narrative Panel
    md_narrative = Markdown(narrative)
    console.print(
        Panel(
            md_narrative,
            title=f"[{SPECTRAL_GREEN}]📜 The Haunting Chronicles of Your Machine 📜[/{SPECTRAL_GREEN}]",
            subtitle=f"[{GRAVE_DIM}]Narrated by local {model_name} from sanitized system telemetry[/{GRAVE_DIM}]",
            border_style=HAUNT_CYAN,
            padding=(1, 2),
        )
    )

def render_ask_response(question: str, response: str, model_name: str = "Gemma 2 (2B)"):
    """Renders Q&A response from the Ghost."""
    console.print(f"\n[bold {HAUNT_CYAN}]🔮 Mortal Asks:[/] [italic white]{question}[/]\n")
    md = Markdown(response)
    console.print(
        Panel(
            md,
            title=f"[{SPECTRAL_GREEN}]👻 The Ghost Answers[/{SPECTRAL_GREEN}]",
            subtitle=f"[{GRAVE_DIM}]Offline inference via {model_name}[/{GRAVE_DIM}]",
            border_style=CRYPT_PURPLE,
            padding=(1, 2),
        )
    )
