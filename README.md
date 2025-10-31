# FocusLock

A minimalist Windows productivity utility that enforces focus breaks with fullscreen lock windows across all monitors. Runs in the background, auto-starts with Windows, and provides a modern dashboard for configuration.

## 🎯 What is FocusLock?

FocusLock is designed for professionals who struggle with taking regular breaks. Instead of soft overlays that can be dismissed, it uses **fullscreen lock windows** on all displays to enforce breaks. After configurable work periods (e.g., 2 hours), fullscreen lock windows appear on all monitors for a set break duration (e.g., 5 minutes), displaying a timer and optional skip button.

### Key Features

- **Multi-Monitor Lock Windows**: Creates fullscreen lock windows on all displays simultaneously, covering taskbar and everything else
- **Beautiful Lock Screen**: Branded gradient background matching app logo, timer countdown, progress bar, and optional skip button
- **Multi-Display Support**: Automatically detects and locks all monitors - primary shows full UI, secondary displays show branded background
- **Autostart**: Automatically launches with Windows in the background (system tray)
- **Smart Skip Prompt**: Optional 30-second pre-lock prompt allows skipping once per cycle (configurable)
- **Sleep/Resume Aware**: Adjusts timers based on wall-clock time, so sleep doesn't cheat the cycle
- **Minimalist Dashboard**: Modern, Tailwind-styled UI without menu bars for managing settings and monitoring cycles
- **System Tray Integration**: Quick-access menu for pause/resume, lock now, and quit
- **Persistent Settings**: All preferences stored securely and loaded correctly on startup
- **Diagnostic Logging**: Optional rolling logs (daily files, kept 7 days) for troubleshooting

## 🏗️ Architecture

### Tech Stack

- **Runtime**: Electron + electron-vite (TypeScript)
- **UI**: React 18 + Tailwind CSS
- **State**: Zustand-like hook pattern (custom implementation)
- **Persistence**: electron-store (validated JSON schema)
- **IPC**: Typed contextBridge API (secure, sandboxed)
- **Packaging**: electron-builder (NSIS installer for Windows)

### Process Model

1. **Main Process** (`src/main/`)
   - `index.ts`: App lifecycle, tray icon, window management (no menu bar), single-instance lock.
   - `cycle-manager.ts`: Core timer state machine (work → prelock prompt → lock → break → work).
   - `lock-window.ts`: Creates and manages fullscreen lock windows on all displays, covers taskbar.
   - `settings-store.ts`: Persistent settings with schema validation.
   - `autostart.ts`: Cross-platform app autostart configuration.
   - `ipc.ts`: IPC handler definitions (secure invoke/on patterns).
   - `logger.ts`: Rolling file logging to `userData/logs/`.

2. **Preload** (`src/preload/`)
   - `index.ts`: Exposes minimal, typed API via `contextBridge` (no direct ipcRenderer).

3. **Renderer** (`src/renderer/`)
   - `main.tsx`: Router component that renders App or LockScreen based on URL parameters.
   - `App.tsx`: Main dashboard layout with app icon (3-column on desktop, stacked on mobile).
   - `LockScreen`: Fullscreen break interface with timer, progress bar, and skip button.
   - `BlankScreen`: Simple branded gradient for secondary displays.
   - `components/`: SettingsForm (with proper settings loading), StatusCard, Controls.
   - `store/useSettings.ts`: React hook for settings state management.
   - `lib/format.ts`: Time and UI color formatting utilities.
   - `styles/index.css`: Tailwind base imports.

### State Machine (Cycle Manager)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  work ─────────────────────────► prelockPrompt     │
│   ▲                                   │             │
│   │                                   ▼             │
│   │                            (30s countdown)      │
│   │                                   │             │
│   └───── skip ◄────────────────────── lock          │
│                                       │             │
│                                       ▼             │
│                                     break ─────────┘
│                                       │
│                               (lockMinutes)
│                                       │
│                                       └──────────────►
│
└─ pause/resume pause/resume pause/resume pause/resume ─┘
```

**Transitions:**

- **work** → **prelockPrompt** (if `canSkip=true`) or **break** (if `canSkip=false`) when work time elapses.
- **prelockPrompt** → **break** (automatically, or on "Lock Now" button).
- **prelockPrompt** → **work** (on "Skip" button).
- **break** → **work** when break time elapses.
- Any state → **paused** (on pause), **paused** → previous state (on resume).

**Timekeeping:** Uses `Date.now()` deltas, not accumulated ticks, so sleep/resume is handled correctly.

## 📋 Settings

| Setting                | Type             | Default | Range   | Notes                            |
| ---------------------- | ---------------- | ------- | ------- | -------------------------------- |
| **Work Duration**      | number (hours)   | 2.0     | 0.25–12 | Time before lock triggers        |
| **Break Duration**     | number (minutes) | 5       | 1–60    | How long desktop stays locked    |
| **Show Prompt**        | boolean          | true    | —       | Pre-lock 30s confirmation dialog |
| **Start with Windows** | boolean          | true    | —       | Autostart behavior               |
| **Enable Logging**     | boolean          | true    | —       | Diagnostic logs to user data dir |

All settings are validated on input and stored via electron-store with schema enforcement.

## 🎨 Design

### Lock Screen UI

- **Primary Display**: Shows app logo, "Break Time" title, countdown timer, progress bar, and skip button
- **Secondary Displays**: Show only the branded gradient background (blank)
- **Gradient**: Matches app logo colors (#73C8A9 teal to #373B44 dark gray)
- **Always On Top**: Lock windows use 'pop-up-menu' priority to cover taskbar
- **Full Screen Coverage**: Uses display bounds (not work area) to cover entire screen including taskbar
- **Skip Protection**: Button disables after first click to prevent multiple triggers

## 🔒 Security

### Why Fullscreen Lock Windows?

Lock windows are designed to be highly resistant to bypass:

- Cover all displays simultaneously
- Always on top with highest priority level
- Positioned to cover taskbar
- Close prevention (preventDefault on close events)
- Cannot be minimized, moved, or resized

However, advanced users can still:

- Kill the process via Task Manager
- Force shutdown the computer
- Use system tools to close windows

The goal is gentle enforcement for self-motivated users, not unbreakable security.

### Electron Hardening

- **nodeIntegration**: `false`
- **contextIsolation**: `true`
- **sandbox**: `true`
- **CSP**: Enforced via webRequest headers
- **Preload**: Exposes only typed, whitelisted API methods via `contextBridge`
- **No Menu Bar**: Removes default Electron menu (File, Edit, View, etc.)

All IPC communications are typed and validated.

## 🚀 Getting Started

### Prerequisites

- Windows 10 or later
- Node.js 16+ (LTS recommended)
- npm or pnpm

### Installation (Development)

1. **Clone or initialize the repository:**

   ```powershell
   cd c:\path\to\FocusLock
   ```

2. **Install dependencies:**

   ```powershell
   pnpm install
   # or: npm install
   ```

3. **Start dev environment:**

   ```powershell
   pnpm dev
   ```

   This opens Electron in dev mode with hot-reload support.

### Development Commands

```powershell
# Dev server (hot reload)
pnpm dev

# Build TypeScript + bundle assets
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format

# Package for Windows (creates installer)
pnpm package:win
# or
pnpm dist:win
```

### First Run

1. App launches in the background (system tray).
2. Right-click the tray icon → "Dashboard" to open settings.
3. Configure work/break times and other preferences.
4. Click "Save Settings" (they auto-persist).
5. Cycle begins automatically.

## 📦 Packaging & Distribution

### Building the Installer

```powershell
pnpm package:win
```

**Output:** `dist/FocusLock Setup 1.0.0.exe`

### NSIS Installer Features

- One-click or full setup mode (user can choose install path).
- Create Start Menu shortcuts.
- Create Desktop shortcut.
- Automatic launch after install (optional).
- Standard Windows uninstaller via Control Panel.

### Configuration: `electron-builder.yml`

```yaml
appId: 'com.focuslock'
productName: 'FocusLock'
directories:
  buildResources: resources
  output: dist
files:
  - from: .
    to: .
    filter:
      - '!**/*.map'
      - '!dist/*'
      - '!node_modules'
win:
  target:
    - nsis
  icon: assets/app-media/FocusLock.png
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: FocusLock
  installerIcon: assets/app-media/FocusLock.png
  uninstallerIcon: assets/app-media/FocusLock.png
```

## 📖 Usage Guide

### Dashboard Overview

**Left Column: Settings**

- Adjust work/break durations
- Toggle skip prompt
- Enable/disable autostart
- Enable/disable logging
- Save button persists changes

**Right Column: Status & Controls**

- Real-time countdown display (large numerals)
- Current phase (Working, On Break, Paused, Break Due Soon)
- Progress bar
- **Controls**: Pause/Resume, Lock Now, Reset Cycle

### System Tray Menu

- **Dashboard**: Show main window
- **Pause Cycle / Resume Cycle**: Toggle pause state
- **Lock Now**: Trigger immediate lock (ignores current work time)
- **Quit**: Exit app completely

### Keyboard Shortcuts

- **Double-click tray icon**: Toggle dashboard visibility
- **Standard Windows shortcuts** in the app (Ctrl+C, Ctrl+V, etc.)

### Scenarios

#### Scenario 1: Working with Interruptions

1. Start work at 9:00 AM (2-hour cycle, 5-min break).
2. At 11:00 AM, the pre-lock prompt appears (30 seconds).
3. You click "Skip Once" → work continues for 2 hours again (until 1:00 PM).
4. At 1:00 PM, fullscreen lock windows appear on all monitors for 5 minutes.
5. You can click "Skip Break" if enabled, otherwise wait for timer to complete.

#### Scenario 2: System Sleep

1. Work cycle: 2 hours remaining.
2. System suspends at 10:30 AM.
3. System resumes at 2:00 PM (3.5 hours later).
4. App computes: wall-clock delta (3.5 hours) >> remaining work time (2 hours).
5. Lock windows appear immediately on all monitors (you're overdue for a break).
6. Break: 5 minutes with countdown timer displayed.
7. New work cycle starts.

#### Scenario 3: Multi-Monitor Setup

1. System detects 2 monitors (primary 3440x1440, secondary 1080x1920 vertical).
2. Lock triggers at end of work period.
3. Primary display shows full lock screen: app logo, timer, progress bar, skip button.
4. Secondary display shows branded gradient background only.
5. Both screens cover taskbar and all UI elements.
6. Clicking skip closes all lock windows simultaneously.

## 🔧 Troubleshooting

### App Doesn't Start with Windows

1. **Check autostart setting**: Dashboard → Settings → "Start FocusLock with Windows" (should be enabled).
2. **Verify path**: Check Startup folder: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`.
3. **Antivirus**: Exclude FocusLock from antivirus real-time scanning.

### Lock Windows Don't Appear

- **Symptoms**: "Break is due" but lock windows don't show.
- **Cause**: Display detection issue or windows positioned incorrectly.
- **Solution**: Check logs for display count and bounds. Restart app to re-detect monitors.

### Logs Not Appearing

1. **Enable logging**: Dashboard → Settings → "Enable diagnostic logging" → Save.
2. **Find logs**: Open `%APPDATA%\FocusLock\logs\` (or `%LOCALAPPDATA%\FocusLock\logs\`).
3. **File naming**: Logs are daily: `focuslock-2025-10-30.log`.

### Settings Not Persisting or Loading

1. **Store location**: `%APPDATA%\FocusLock\focuslock-settings.json` (on Windows).
2. **Permissions**: Ensure user can write to `%APPDATA%`.
3. **Corruption**: Delete `focuslock-settings.json` and restart app (settings reset to defaults).
4. **Form not updating**: Fixed in latest version - settings now properly load into form on startup.

### High CPU or Memory Usage

1. **Clear old logs**: Delete files older than 7 days from `logs/` folder.
2. **Check cycle manager**: Restart app.
3. **Report issue**: Include latest log file.

## 🧪 Testing Checklist

- [ ] **Timers**: Set work to 0.05 h (3 min), lock to 1 min. Verify pre-lock prompt or auto-lock.
- [ ] **Skip**: Disable prompt, re-enable, verify 30s countdown.
- [ ] **Lock windows**: Trigger "Lock Now" → fullscreen windows appear on all monitors.
- [ ] **Multi-monitor**: Verify primary shows full UI, secondary shows branded background.
- [ ] **Skip button**: Click skip → all windows close immediately, cycle restarts.
- [ ] **Taskbar coverage**: Lock windows completely cover taskbar.
- [ ] **Autostart**: Reboot → app in tray after login.
- [ ] **Tray menu**: All items functional.
- [ ] **Settings persistence**: Change settings, restart app, verify restored and displayed correctly.
- [ ] **Sleep/resume**: Sleep for 10 min → resume → timers adjusted correctly.
- [ ] **Pause/resume**: Pause work cycle, check timer stops; resume, check timer continues.
- [ ] **Logging**: Enable logging, work for 1 cycle, check logs created.
- [ ] **No menu bar**: Verify File/Edit/View menus are hidden.

## 🎨 UI/UX Notes

### Dashboard Layout

**Desktop (1000px+):**

- 3-column grid: Settings (left), Status (top-right), Controls (bottom-right).

**Mobile (< 768px):**

- Stacked single column (Settings → Status → Controls).

### Color Scheme

- **Work**: Green (#10b981)
- **Break**: Blue (#3b82f6)
- **Pre-Lock Prompt**: Yellow (#d97706)
- **Paused**: Gray (#6b7280)
- **Lock Screen Gradient**: Teal to Dark Gray (#73C8A9 → #373B44, matching app logo)

### Accessibility

- Large clickable buttons (48px minimum)
- High contrast text (AA WCAG compliance)
- Focus states with outline rings
- Keyboard navigation via Tab

## 📝 Advanced Configuration

### Changing Lock Duration

Edit `src/shared/types.ts`:

```typescript
export const PRELOCK_PROMPT_DURATION_MS = 30000; // Change 30s to desired duration
```

### Changing Log Retention

Edit `src/main/logger.ts`, `cleanOldLogs()`:

```typescript
const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // Change 7 to desired days
```

### Custom App Icon

Replace `assets/app-media/FocusLock.png` and `assets/app-media/FocusLock.svg` with your custom images.

Rebuild with:

```powershell
pnpm build
pnpm package:win
```

## 🤝 Contributing

This is a productivity application. Fork and extend as needed. Key areas for enhancement:

- [x] Multi-monitor support (implemented)
- [ ] Custom break reminders (sound notifications)
- [ ] Break activity suggestions (stretch, walk, drink water)
- [ ] Statistics dashboard (cycles completed, total break time)
- [ ] Pomodoro mode (shorter work/break intervals)
- [ ] Cross-platform (macOS, Linux)
- [ ] Cloud sync settings (OneDrive, GitHub Gists)

## 📄 License

MIT License (see LICENSE file if included).

## 🆘 Support

- **Logs**: Check `%APPDATA%\FocusLock\logs\` for diagnostics.
- **Settings file**: `%APPDATA%\FocusLock\focuslock-settings.json`
- **Task Manager**: Search "FocusLock" to verify background process.
- **Windows Event Viewer**: Check for system events related to `rundll32.exe`.

---

## 📊 File Structure

```
FocusLock/
├── package.json                    # Dependencies & scripts
├── electron-builder.yml            # Installer config
├── electron-vite.config.ts         # Build config
├── tsconfig.json                   # TypeScript config
├── tailwind.config.js              # Tailwind config
├── postcss.config.js               # PostCSS config
├── .prettierrc                      # Code formatter config
├── .eslintrc.cjs                   # Linter config
├── .editorconfig                   # Editor config
├── README.md                       # This file
│
├── src/
│   ├── main/                       # Main process
│   │   ├── index.ts                # App lifecycle & windows
│   │   ├── cycle-manager.ts        # Timer state machine
│   │   ├── lock-service.ts         # OS lock integration
│   │   ├── settings-store.ts       # Persistent storage
│   │   ├── autostart.ts            # Autostart config
│   │   ├── ipc.ts                  # IPC handlers
│   │   └── logger.ts               # Logging system
│   │
│   ├── preload/
│   │   └── index.ts                # Secure API exposure
│   │
│   ├── renderer/                   # React/UI
│   │   ├── index.html              # HTML template
│   │   ├── main.tsx                # React entry
│   │   ├── App.tsx                 # Root component
│   │   ├── components/
│   │   │   ├── SettingsForm.tsx    # Settings UI
│   │   │   ├── StatusCard.tsx      # Status display
│   │   │   └── Controls.tsx        # Control buttons
│   │   ├── store/
│   │   │   └── useSettings.ts      # Settings hook
│   │   ├── lib/
│   │   │   └── format.ts           # Utilities
│   │   └── styles/
│   │       └── index.css           # Tailwind & global styles
│   │
│   └── shared/
│       ├── types.ts                # Shared types
│       └── ipc.ts                  # IPC contract & validation
│
├── assets/
│   ├── app-media/                  # Private app assets (logo, icons)
│   │   ├── FocusLock.png          # App logo (PNG)
│   │   └── FocusLock.svg          # App logo (SVG)
│   └── media/                      # Default user media
│       └── FocusLock.png          # Default lock screen logo
│
└── dist/                           # Build output (generated)
    ├── main/                       # Compiled main process
    ├── preload/                    # Compiled preload
    └── renderer/                   # Bundled React app
```

---

## 🎬 Demo / Screenshots

### Dashboard

```
┌──────────────────────────────────────────────────┐
│  🔒 FocusLock                                    │
│  Enforce focus through automated OS-level breaks│
└──────────────────────────────────────────────────┘

┌─ Settings ─────┬─ Status ────────────────────────┐
│                │ Phase: Working                  │
│ Work: 2.0 h    │ ┌──────────────────────────────┐│
│ Break: 5 min   │ │      1:45:32                 ││
│ ☑ Show Prompt  │ │   Remaining                  ││
│ ☑ Autostart    │ └──────────────────────────────┘│
│ ☑ Logging      │ ██████████░░░░░░  87% complete│
│                │                                │
│ [Save]         │ Total: 2:00:00 | Elapsed: 0:15││
│                └─────────────────────────────────┘
│                ┌─ Controls ──────────────────────┐
│                │ [Pause] [Lock Now] [Reset]     │
│                │ 💡 Tips: ...                    │
│                └────────────────────────────────┘
└────────────────────────────────────────────────────┘
```

### Pre-Lock Prompt

```
┌─ Break is Due ─────────────────────┐
│                                    │
│  Time for a break!                │
│  Lock screen for 5 minutes?        │
│                                    │
│  ⏱️ Proceeding in: 23 seconds     │
│                                    │
│  [Lock Now]  [Skip Once]          │
│                                    │
└────────────────────────────────────┘
```

### System Tray Menu

```
📎 FocusLock (Right-click)
├─ Dashboard
├─ Pause Cycle
├─ Lock Now
├─ ────────────
└─ Quit
```

---

**Version:** 0.0.11-beta  
**Last Updated:** October 31, 2025  
**Platform:** Windows 10+  
**Status:** Beta

## 👨‍💻 Developer

**Manolis Ntamadakis**

- Portfolio: [https://ntamadakis.gr/](https://ntamadakis.gr/)
- Support Me: [https://ntamadakis.gr/support-me](https://ntamadakis.gr/support-me)
