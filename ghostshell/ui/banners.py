"""ASCII art and banners for GhostShell."""

from rich.panel import Panel
from rich.align import Align
from rich.text import Text
from ghostshell.ui.theme import SPECTRAL_GREEN, HAUNT_CYAN, BLOOD_RED, CRYPT_PURPLE

GHOST_ASCII = r"""
        .-.
       (o.o)
        |=|
       __|__
     //.=|=.\\
    // .=|=. \\
    \\ .=|=. //
     \\(_=_)//
      (:| |:)
       || ||
       () ()
       || ||
       =='=='
"""

MINI_GHOST = r"""
   .-.   
  (o.o)  
  (|_|)  
 --m-m-- 
"""

SKULL_ASCII = r"""
      .---.
     / /"\ \
     | \_/ |
     \     /
     /`'''`\
    / / _ \ \
   |_| (_) |_|
   (_   _   _)
     | | | |
     |_|_|_|
"""

TOMBSTONE_ASCII = r"""
     .---------.
    /   R.I.P.  \
   |  KERNEL     |
   |   PANIC     |
   | 1970 - 2026 |
   |_____________|
"""

def print_banner(console):
    """Prints the main welcoming GhostShell banner with glowing borders."""
    title_text = Text()
    title_text.append("👻 G H O S T S H E L L 👻\n", style=f"bold {SPECTRAL_GREEN}")
    title_text.append("The Spooky, AI-Powered Linux Terminal Companion\n", style=f"italic {HAUNT_CYAN}")
    title_text.append("Hacktoberfest 2026: Ghost in the Machine  •  100% Offline Local AI", style="dim white")

    content = f"[bold {SPECTRAL_GREEN}]{GHOST_ASCII}[/bold {SPECTRAL_GREEN}]\n"
    
    panel = Panel(
        Align.center(title_text),
        subtitle=f"[{CRYPT_PURPLE}]Type 'ghostshell --help' or 'ghostshell interactive' to haunt[/{CRYPT_PURPLE}]",
        border_style=HAUNT_CYAN,
        padding=(1, 2),
    )
    console.print(panel)

def get_alert_banner():
    """Returns the possession alert header."""
    header = Text()
    header.append("⚠️  POSSESSION ALERT DETECTED  ⚠️\n", style=f"bold white on {BLOOD_RED}")
    header.append("A malevolent force lurks within this command!\n", style="bold red")
    return Panel(
        Align.center(header),
        border_style=BLOOD_RED,
        padding=(0, 2),
    )
