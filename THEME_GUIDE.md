# 🖥️ GhostShell Terminal Theme Design System

A modern, polished terminal emulator theme inspired by **Warp**, **Ghostty**, and **iTerm2**.
This design system avoids retro CRT parody gimmicks and delivers a functional, keyboard-first, accessible interface carried strictly by **structure, typography, and interaction**.

---

## 🎨 Design Tokens & CSS Variables

All color and layout tokens are defined on `:root` and scoped by `[data-theme="..."]`.

```css
:root, [data-theme="dark"] {
  /* Surface Layers */
  --bg-app: #0b0e14;          /* Deep obsidian */
  --bg-surface-1: #12161f;     /* Pane backgrounds */
  --bg-surface-2: #1a202c;     /* Input rows / tags */
  --bg-chrome: #0f131a;        /* Top window bar */
  --bg-hover: #222938;         /* Hover state */
  --bg-active: #2d3748;        /* Active state */

  /* Foregrounds */
  --fg-default: #c9d1d9;       /* High-contrast off-white */
  --fg-muted: #6e7681;         /* Muted secondary */
  --fg-dim: #484f58;           /* Placeholders & borders */
  --fg-bright: #ffffff;        /* Active tabs */

  /* ANSI Semantics */
  --ansi-green: #3fb950;       /* Success / Prompt ❯ */
  --ansi-cyan: #58a6ff;        /* Links / Info */
  --ansi-yellow: #d29922;      /* Warnings / Toasts */
  --ansi-red: #f85149;         /* Errors / Fatal Hazards */
  --ansi-magenta: #bc8cff;     /* Keywords / Specter */
  --ansi-blue: #79c0ff;        /* Section Headings */

  /* Selection & Cursor */
  --selection-bg: #264f78;
  --selection-fg: #ffffff;
  --cursor-color: #3fb950;

  /* 1px Low-contrast borders */
  --border-subtle: #21262d;
  --border-default: #30363d;
  --border-accent: #3fb950;
  --border-danger: #f85149;
}
```

---

## 🔄 How to Swap Palettes

GhostShell includes **7 built-in color palettes**:

| Palette | Attribute | Accent Feel |
| :--- | :--- | :--- |
| **Ghostty Dark** (Default) | `data-theme="dark"` | Near-black with cool blue tint |
| **Terminal Light** | `data-theme="light"` | Clean off-white WCAG-AA compliant light mode |
| **Dracula** | `data-theme="dracula"` | Gothic purple, pink, and vibrant green |
| **Nord** | `data-theme="nord"` | Arctic ice blue, slate gray, and frost |
| **Gruvbox** | `data-theme="gruvbox"` | Warm retro amber, earthy green, and espresso |
| **Tokyo Night** | `data-theme="tokyo-night"` | Electric cyberpunk neon dusk |
| **Catppuccin Mocha** | `data-theme="catppuccin"` | Soothing pastel palette |

### Method 1: HTML Attribute
Set the attribute on the root `<html>` element:
```html
<html lang="en" data-theme="dracula">
```

### Method 2: JavaScript
```javascript
document.documentElement.setAttribute('data-theme', 'nord');
localStorage.setItem('ghostshell_theme', 'nord');
```

### Method 3: In the App (Interactive)
* Click `[theme: ...]` in the bottom right of the **vim/tmux status bar**.
* Press the **`t`** key to cycle themes.
* Press **`Ctrl+K`** to open the Command Palette and type `theme: nord` or `theme: dracula`.

---

## 🧱 Creating a Custom Palette

To add a new theme (e.g., `solarized-dark`), add a new CSS block to `index.css`:

```css
[data-theme="solarized-dark"] {
  --theme-name: "Solarized Dark";
  --bg-app: #002b36;
  --bg-surface-1: #073642;
  --bg-surface-2: #0e4452;
  --bg-chrome: #00212b;
  --bg-hover: #073642;
  --fg-default: #839496;
  --fg-muted: #586e75;
  --fg-bright: #fdf6e3;
  --ansi-green: #859900;
  --ansi-cyan: #2aa198;
  --ansi-yellow: #b58900;
  --ansi-red: #dc322f;
  --ansi-magenta: #d33682;
  --ansi-blue: #268bd2;
  --border-default: #073642;
  --border-subtle: #00212b;
}
```

---

## ⌨️ Components & Interaction Patterns

1. **Window Chrome**: Top bar with 3 dots (`● ● ●`), tab strip (`~: home`, `1: ghost`, `2: alert`, etc.), and host title.
2. **Bracketed Buttons**: `[ Submit ]` with inverted color hover (e.g. solid filled text on inverted background).
3. **Prompt Inputs**: `❯ ` prefix with a blinking block cursor (`steps(1)`).
4. **Embedded Border Titles**: Cards have their label embedded directly in the top border:
   ```
   ┌─ [ COMMAND_DISPATCHER ] ────────────────┐
   ```
5. **ASCII Progress Bars**: `[██████████] 100% FATAL` or `[░░░░░░░░░░] 0% SAFE`.
6. **ANSI Toasts**: `[ OK ]`, `[WARN]`, `[FAIL]` prefixes.
7. **Tmux/Vim Status Bar**: Fixed at the bottom displaying current mode, section path, active git branch, local AI model, clock, and keyboard shortcuts.
8. **Command Palette (`Ctrl+K`)**: Fuzzy command search and direct navigation.
9. **Shortcuts Modal (`?`)**: Full keybinding cheat sheet.
