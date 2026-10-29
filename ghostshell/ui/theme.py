"""Spooky theme styling, color tokens, and Rich console setup for GhostShell."""

from rich.console import Console
from rich.theme import Theme

# Spectral Color Palette
SPECTRAL_GREEN = "#00ff87"
HAUNT_CYAN = "#60efff"
BLOOD_RED = "#ff2a5f"
CURSED_AMBER = "#ff9f43"
CRYPT_PURPLE = "#a55eea"
BONE_WHITE = "#f1f2f6"
SHADOW_DARK = "#121820"
GRAVE_DIM = "#747d8c"

GHOST_THEME = Theme({
    "ghost": f"bold {HAUNT_CYAN}",
    "ghost.title": f"bold {SPECTRAL_GREEN}",
    "ghost.accent": f"bold {CRYPT_PURPLE}",
    "ghost.whisper": f"italic {GRAVE_DIM}",
    "ghost.quote": f"italic {SPECTRAL_GREEN}",
    "alert.critical": f"bold white on {BLOOD_RED}",
    "alert.high": f"bold {BLOOD_RED}",
    "alert.medium": f"bold {CURSED_AMBER}",
    "alert.low": f"bold {SPECTRAL_GREEN}",
    "safe.code": f"bold {SPECTRAL_GREEN}",
    "danger.code": f"bold {BLOOD_RED}",
    "log.timestamp": f"{GRAVE_DIM}",
    "log.error": f"bold {BLOOD_RED}",
    "log.warning": f"bold {CURSED_AMBER}",
    "log.info": f"{HAUNT_CYAN}",
})

console = Console(theme=GHOST_THEME)
err_console = Console(theme=GHOST_THEME, stderr=True)
