# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — Launch the Electron app
- `npm run build` — Build Windows portable executable via electron-builder

## Architecture

Electron desktop widget — transparent frameless window with CSS flip-clock animation.

### Main process (`main.js`)
Creates a 560x420 frameless transparent always-on-top window. Registers `Ctrl+Shift+F12` global shortcut to toggle always-on-top. IPC handlers: `set-always-on-top`, `set-opacity`, `window-close`, `get-ontop`. Communication with renderer is via `contextBridge` (`preload.js` → `window.tickAPI`).

### Renderer — key modules loaded in order in `index.html`:

- **`flip.js`** — `FlipCard` class: CSS `@keyframes`-based flip animation (no CSS transitions). `setValue(val, animate)` uses a two-step sequence: top half flips down (0-300ms), then bottom half flips down (300-600ms). Relies on `void element.offsetHeight` to force layout before adding `.flipping` class. `FlipClock` class wraps 6 FlipCards and calls `setTime(hours, minutes, seconds)`.

- **`clock.js`** — Initializes `FlipClock` with 6 digit groups (hours-tens, hours-ones, minutes-tens, minutes-ones, seconds-tens, seconds-ones). Runs `updateClock()` every 1s via `setInterval`. Supports 12/24h mode from localStorage.

- **`drag.js`** — No custom drag handlers. Uses native Electron `-webkit-app-region: drag` on `#clock-container`. Toggle `.locked` class to switch between `drag`/`no-drag`. Exposes `window.tickDrag = { setLocked, isLocked }`.

- **`settings.js`** — Settings panel with overlay. All settings persist to localStorage (`tickclock_*` keys). Toggle seconds visibility hides/shows CSS elements directly. Theme system applies `theme-{name}` class to `<body>`. Subscribes to `tickAPI.onOntopChanged` for global shortcut sync.

### CSS flip animation
- `.flip-card { perspective: 120px; transform-style: preserve-3d; }`
- `.flip-top { transform-origin: bottom center; }` / `.flip-bottom { transform-origin: top center; }`
- `@keyframes flipDown { 0% { transform: rotateX(90deg); } 100% { transform: rotateX(0deg); } }`
- `backface-visibility: visible` (hidden would make elements invisible at rotateX(90deg))
- 6 themes: dark, blue, red, green, purple, wood

### Key constraints
- `-webkit-app-region: drag` on parent captures ALL mouse events on Windows — settings/buttons need explicit `no-drag`
- `setAlwaysOnTop(true, 'desktop')` is macOS-only, silently ignored on Windows
- `skipTaskbar: true` + `setAlwaysOnTop(false)` makes window unrecoverable without global shortcut rescue
- `perspective` < 200px needed for visible 3D foreshortening at such small card size
