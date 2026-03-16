# WAVE (Work And Vital Energy)

A minimalist Windows productivity utility that enforces focus breaks with fullscreen lock windows across all monitors. Runs in the background, auto-starts with Windows, and provides a modern dashboard for configuration.

## What is WAVE?

WAVE (Work And Vital Energy) is designed for professionals who struggle with taking regular breaks. Instead of soft overlays that can be dismissed, it uses **fullscreen lock windows** on all displays to enforce breaks. After configurable work periods (e.g., 2 hours), fullscreen lock windows appear on all monitors for a set break duration (e.g., 5 minutes), displaying a timer and optional skip button.

## Recent Updates (v0.0.16)

- **Stand Up Reminder**: Periodic reminders to stand up with configurable interval and 9-position screen placement
- **Pre-Lock Warning**: Amber overlay notification before the lock screen activates (configurable 1-30 minutes)
- **App Monitoring & Excluded Apps**: Auto-detect installed apps (communication, media, browsers) and pause the work cycle when they're in an active state (calls, fullscreen)
- **Lock Screen Customization**: Full visual customization — gradient colors, title/subtitle text, logo upload, button styling, timer and progress bar colors
- **Splash Screen**: Loading screen shown during app initialization
- **Global Keyboard Shortcut**: `Ctrl+Shift+U+L` to skip the current lock/break
- **Custom Protocol Handlers**: `media://` and `app-media://` for serving user-uploaded and bundled assets

### Key Features

- **Multi-Monitor Lock Windows**: Creates fullscreen lock windows on all displays simultaneously, covering taskbar and everything else
- **Beautiful Lock Screen**: Fully customizable gradient background, timer countdown, progress bar, logo, and optional skip button
- **Multi-Display Support**: Automatically detects and locks all monitors — primary shows full UI, secondary displays show branded background
- **Stand Up Reminders**: Periodic overlay notifications to stand up and stretch, with 9-position placement and auto-dismiss
- **Pre-Lock Warning**: Amber overlay notification before the lock screen kicks in, so you can wrap up your work
- **App Monitoring**: Detects active calls (communication apps) and fullscreen usage (media/browsers) to auto-pause the work cycle
- **Dark/Light Theme**: Toggle between dark and light themes from the Settings page
- **Multi-Page Dashboard**: Clean navigation with Home, Settings, Customization, and About pages
- **Custom Title Bar**: Frameless window with custom drag bar, minimize/maximize/close buttons, and navigation tabs
- **Autostart**: Automatically launches with Windows in the background (system tray)
- **Sleep/Resume Aware**: Adjusts timers based on wall-clock time, so sleep doesn't cheat the cycle
- **System Tray Integration**: Quick-access menu with live timer display, pause/resume, lock now, and quit
- **Persistent Settings**: All preferences stored securely via electron-store with schema validation
- **Diagnostic Logging**: Optional rolling logs (daily files, kept 7 days) for troubleshooting
- **Global Shortcut**: `Ctrl+Shift+U+L` to skip the current lock from anywhere

## Architecture

### Tech Stack

- **Runtime**: Electron 39 + electron-vite (TypeScript)
- **UI**: React 18 + Tailwind CSS v3
- **Persistence**: electron-store v8 (validated JSON schema)
- **IPC**: Typed contextBridge API (secure, sandboxed)
- **Packaging**: electron-builder (NSIS installer + portable for Windows)
- **Other**: react-icons, react-toastify

### Process Model

1. **Main Process** (`src/main/`)
   - `index.ts`: App lifecycle, tray icon, window management, custom title bar, single-instance lock, splash screen, custom protocol handlers (`media://`, `app-media://`), global shortcuts.
   - `cycle-manager.ts`: Core timer state machine (work → pre-lock warning → locking → break → work). Integrates with app monitor for auto-pause/resume.
   - `lock-window.ts`: Creates and manages fullscreen lock windows on all displays, covers taskbar.
   - `standup-timer.ts`: Interval-based stand up reminder timer.
   - `standup-window.ts`: 380x120 frameless overlay window for stand up reminders (9-position placement, 8.5s auto-close).
   - `pre-lock-window.ts`: 380x130 frameless overlay window for pre-lock warnings (centered, dismissible).
   - `app-monitor.ts`: Scans for installed apps, monitors running processes, detects calls and fullscreen states, triggers auto-pause/resume.
   - `settings-store.ts`: Persistent settings with schema validation.
   - `autostart.ts`: Windows autostart configuration.
   - `ipc.ts`: IPC handler definitions (secure invoke/on patterns).
   - `logger.ts`: Rolling file logging to `userData/logs/`.
   - `resources.ts`: Asset path resolution for icons and media.

2. **Preload** (`src/preload/`)
   - `index.ts`: Exposes minimal, typed API via `contextBridge` (no direct ipcRenderer).

3. **Renderer** (`src/renderer/`)
   - `main.tsx`: Router component — renders App, LockScreen, StandUpReminder, or PreLockReminder based on `?mode=` URL parameter.
   - `App.tsx`: Main dashboard with page navigation and theme support.
   - `pages/`: Home, Settings, Customization, About.
   - `components/`:
     - `TitleBar.tsx`: Custom frameless title bar with drag support, window controls, and navigation tabs.
     - `Layout.tsx`: Page layout wrapper.
     - `SettingsForm.tsx`: Settings configuration interface (time, behavior, excluded apps, stand up, pre-lock, system).
     - `StatusCard.tsx`: Real-time status display.
     - `Controls.tsx`: Pause/Resume, Lock Now, Reset controls.
     - `AppMonitorStatus.tsx`: Dashboard widget showing active app monitoring states.
     - `NumberInput.tsx`, `Checkbox.tsx`, `Separator.tsx`: Reusable form components.
   - `context/CycleContext`: React context for cycle state management.
   - `store/useSettings.ts`: React hook for settings state management.
   - `lib/`: `format.ts` (time/color utilities), `toast.ts` (toast wrapper).
   - `styles/index.css`: Tailwind base imports with custom theme variables.

4. **Shared** (`src/shared/`)
   - `ipc.ts`: Settings validation shared between main and renderer.

5. **Types** (`src/types/`)
   - `settings.types.ts`: Settings interface, `DEFAULT_SETTINGS`, `StandUpPosition` union type.
   - `cycle.types.ts`: Cycle phases and status types.
   - `app-monitor.types.ts`: `MonitoredApp` and `AppState` types.

### Overlay Windows

| Window              | Dimensions                         | Mode                        | Description                                                                 |
| ------------------- | ---------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| **LockScreen**      | Full display bounds (each monitor) | `?mode=lock&isPrimary=true` | Primary: full UI with timer, logo, skip button. Secondary: branded gradient |
| **StandUpReminder** | 380x120                            | `?mode=standup`             | Blue-themed notification with progress bar and auto-dismiss                 |
| **PreLockReminder** | 380x130                            | `?mode=prelock&minutes=N`   | Amber-themed warning, centered, dismissible                                 |
| **SplashScreen**    | 600x550                            | `splash.html`               | Loading screen during startup                                               |
| **MainWindow**      | 1500x700 (min 700x500)             | Default                     | Dashboard with custom title bar                                             |

All overlay windows are frameless, transparent, always-on-top, and skip the taskbar.

### State Machine (Cycle Manager)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  work ──────────────────────────► locking            │
│   ▲         (pre-lock warning       │                │
│   │          shown if enabled)      ▼                │
│   │                               break ─────────────┘
│   │                                 │
│   └─────────────────────────────────┘
│         (break timer elapses)
│
│  pause ◄──► any state (manual or auto via app monitor)
└──────────────────────────────────────────────────────┘
```

**Transitions:**

- **work** → **locking** when work time elapses. If pre-lock warning is enabled, an amber overlay appears N minutes before lock (configurable).
- **locking** → **break** immediately. Closes pre-lock warning, creates lock windows on all displays.
- **break** → **work** when break time elapses. Lock windows close.
- Any state → **paused** (manual via tray/controls, or automatic when an excluded app is in a call or fullscreen). Resumes when the condition clears.

**Timekeeping:** Uses `Date.now()` deltas, not accumulated ticks, so sleep/resume is handled correctly.

## Settings

| Setting                      | Type              | Default         | Range               | Notes                                      |
| ---------------------------- | ----------------- | --------------- | ------------------- | ------------------------------------------ |
| **Work Duration**            | number (hours)    | 2.0             | 0.25-12             | Time before lock triggers                  |
| **Break Duration**           | number (minutes)  | 5               | 1-60                | How long desktop stays locked              |
| **Show Skip Button**         | boolean           | true            | —                   | Display skip button on lock screen         |
| **Theme**                    | 'light' \| 'dark' | 'light'         | —                   | Application theme preference               |
| **Stand Up Enabled**         | boolean           | false           | —                   | Enable periodic stand up reminders         |
| **Stand Up Interval**        | number (minutes)  | 30              | 1-120               | Minutes between stand up reminders         |
| **Stand Up Position**        | StandUpPosition   | 'center-center' | 9 positions         | Where reminder appears (3x3 grid)          |
| **Pre-Lock Warning Enabled** | boolean           | false           | —                   | Show warning before lock screen            |
| **Pre-Lock Warning Minutes** | number (minutes)  | 5               | 1-30                | Minutes before lock to show warning        |
| **Excluded Apps**            | string[]          | []              | —                   | Apps that auto-pause the cycle when active |
| **App Scan Interval**        | number (days)     | 30              | 0 (disabled), 10-30 | Days between automatic app scans           |
| **Start with Windows**       | boolean           | false           | —                   | Autostart behavior                         |
| **Enable Logging**           | boolean           | false           | —                   | Diagnostic logs to user data dir           |

### Lock Screen Customization

| Setting                 | Default                                      | Description                                                |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| **Background Gradient** | #41AE98 → #346B60 → #272727                  | 3-color gradient                                           |
| **Break Title**         | "Break Time" (white)                         | Custom text and color                                      |
| **Break Subtitle**      | "Time to rest your eyes and stretch" (white) | Custom text and color                                      |
| **Logo**                | Wave icon                                    | Upload from PC or select from gallery (PNG, JPG, SVG, GIF) |
| **Skip Button**         | "Skip Break" (white on transparent)          | Custom text, text color, background color                  |
| **Timer Color**         | #FFFFFF                                      | Countdown timer color                                      |
| **Progress Bar Color**  | #60A5FA                                      | Progress bar color                                         |

All settings are validated on input and stored via electron-store with schema enforcement.

## App Monitoring

WAVE can detect and monitor installed applications to automatically pause the work cycle when you're in a call or watching content fullscreen.

### Supported App Categories

- **Communication** (15 apps): Teams, Zoom, Skype, Google Meet, Webex, Discord, Slack, WhatsApp, Telegram, Signal, Viber, Messenger, LINE, WeChat, Zoom Workplace
- **Media** (19 apps): VLC, Windows Media Player, Movies & TV, PotPlayer, KMPlayer, MPC-HC, MPC-BE, Kodi, Plex, Netflix, Prime Video, Disney+, YouTube, Twitch, Spotify, iTunes, RealPlayer, OBS Studio, Steam, Xbox, GeForce Experience, ShadowPlay
- **Browsers** (6 apps): Chrome, Edge, Firefox, Opera, Opera GX, Brave

### How It Works

1. WAVE scans the system for installed apps via Windows registry and common install paths.
2. Selected apps are monitored every 5 seconds for running status.
3. Communication apps are checked for active call state; media apps and browsers are checked for fullscreen state.
4. When an excluded app enters an active state, the work cycle auto-pauses and resumes when the state ends.

## Security

### Why Fullscreen Lock Windows?

Lock windows are designed to be highly resistant to bypass:

- Cover all displays simultaneously
- Always on top with highest priority level
- Positioned to cover taskbar
- Close prevention (preventDefault on close events)
- Cannot be minimized, moved, or resized

However, advanced users can still:

- Kill the process via Task Manager
- Use the global shortcut `Ctrl+Shift+U+L` to skip
- Force shutdown the computer

The goal is gentle enforcement for self-motivated users, not unbreakable security.

### Electron Hardening

- **nodeIntegration**: `false`
- **contextIsolation**: `true`
- **sandbox**: `true`
- **CSP**: Enforced via webRequest headers
- **Preload**: Exposes only typed, whitelisted API methods via `contextBridge`
- **No Menu Bar**: Removes default Electron menu

All IPC communications are typed and validated.

## Getting Started

### Prerequisites

- Windows 10 or later
- Node.js 16+ (LTS recommended)
- pnpm (recommended) or npm

### Installation (Development)

1. **Clone or initialize the repository:**

   ```powershell
   cd c:\path\to\WAVE
   ```

2. **Install dependencies:**

   ```powershell
   pnpm install
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

# Build both NSIS installer and portable exe
pnpm build:win

# Build portable exe only
pnpm build:win:portable

# Build NSIS installer only
pnpm build:win:installer
```

### First Run

1. App shows a splash screen while initializing.
2. App launches in the background (system tray).
3. Right-click the tray icon → "Dashboard" to open settings.
4. Configure work/break times, stand up reminders, pre-lock warning, and excluded apps.
5. Cycle begins automatically.

## Packaging & Distribution

### Building

```powershell
# Both installer + portable
pnpm build:win

# Portable exe only
pnpm build:win:portable

# NSIS installer only
pnpm build:win:installer
```

**Output** (in `dist/`):

- `WAVE-0.0.16-setup.exe` — NSIS installer
- `WAVE-0.0.16-portable.exe` — Portable executable

### NSIS Installer Features

- Full setup mode (user can choose install path)
- Create Start Menu and Desktop shortcuts
- Automatic launch after install (optional)
- Standard Windows uninstaller via Control Panel
- License agreement display
- Menu category support

## Usage Guide

### Dashboard Overview

**Navigation Tabs** (in custom title bar):

- **Home**: Main dashboard with status, app monitor status, and controls
- **Settings**: Configure work/break times, behavior, excluded apps, stand up reminders, pre-lock warning, and system integration
- **Customization**: Full lock screen appearance customization (gradient, text, logo, buttons, timer, progress bar)
- **About**: App information and credits

### Settings Page Sections

1. **Appearance** — Light/Dark theme toggle
2. **Time Configuration** — Work duration (hours + minutes), Break duration (minutes)
3. **Behavior Preferences** — Show skip button, Excluded Applications (list/grid view, select all, refresh scan, scan interval)
4. **Stand Up Reminder** — Enable toggle, interval (1-120 min), 3x3 position picker grid
5. **Pre-Lock Warning** — Enable toggle, warning time (1-30 min)
6. **System Integration** — Launch on Windows startup, Enable diagnostic logging, Open Logs Folder

### System Tray Menu

```
WAVE (Right-click)
├─ Time until lock: 1h 45m    (live timer display)
├─ ─────────────
├─ Dashboard
├─ ─────────────
├─ Pause Cycle
├─ Resume Cycle
├─ Lock Now
├─ ─────────────
└─ Quit
```

The tray menu updates every second to keep the timer display current.

### Keyboard Shortcuts

- **Ctrl+Shift+U+L**: Skip the current lock/break (global, works from anywhere)
- **Double-click tray icon**: Toggle dashboard visibility
- **Title bar navigation**: Click tabs to switch between pages

### Scenarios

#### Scenario 1: Working with Pre-Lock Warning

1. Start work at 9:00 AM (2-hour cycle, 5-min break, pre-lock warning at 5 minutes).
2. At 10:55 AM, an amber overlay appears: "Screen locking soon! Your screen will lock in 5 minute(s)."
3. You dismiss the warning and wrap up your work.
4. At 11:00 AM, fullscreen lock windows appear on all monitors for 5 minutes.
5. After the break, a new work cycle starts.

#### Scenario 2: Auto-Pause During a Call

1. You're in a Teams call during your work cycle.
2. WAVE detects the active call and auto-pauses the cycle.
3. The call ends — WAVE auto-resumes the cycle with the remaining time preserved.

#### Scenario 3: System Sleep

1. Work cycle: 2 hours remaining.
2. System suspends at 10:30 AM.
3. System resumes at 2:00 PM (3.5 hours later).
4. App computes: wall-clock delta >> remaining work time.
5. Lock windows appear immediately (you're overdue for a break).
6. Break: 5 minutes with countdown timer.
7. New work cycle starts.

#### Scenario 4: Multi-Monitor Setup

1. System detects 2 monitors.
2. Lock triggers at end of work period.
3. Primary display shows full lock screen: logo, timer, progress bar, skip button.
4. Secondary display shows branded gradient background only.
5. Both screens cover taskbar and all UI elements.

## Troubleshooting

### App Doesn't Start with Windows

1. **Check autostart setting**: Dashboard → Settings → "Launch on Windows startup" (should be enabled).
2. **Verify path**: Check Startup folder: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`.
3. **Antivirus**: Exclude WAVE from antivirus real-time scanning.

### Lock Windows Don't Appear

- **Symptoms**: "Break is due" but lock windows don't show.
- **Cause**: Display detection issue or windows positioned incorrectly.
- **Solution**: Check logs for display count and bounds. Restart app to re-detect monitors.

### Logs Not Appearing

1. **Enable logging**: Dashboard → Settings → "Enable diagnostic logging" → Save.
2. **Find logs**: Open `%APPDATA%\wave\logs\`.
3. **File naming**: Logs are daily: `wave-YYYY-MM-DD.log`.

### Settings Not Persisting

1. **Store location**: `%APPDATA%\wave\wave-settings.json`.
2. **Permissions**: Ensure user can write to `%APPDATA%`.
3. **Corruption**: Delete `wave-settings.json` and restart app (settings reset to defaults).

### Build Fails with rcedit Error

- **Symptoms**: "Fatal error: Unable to commit changes" from rcedit during build.
- **Cause**: Antivirus blocking modification of the newly created exe.
- **Solution**: Temporarily disable real-time scanning or add an exclusion for the project `dist/` folder. The build may succeed on retry.

## Testing Checklist

- [ ] **Timers**: Set work to 0.05 h (3 min), lock to 1 min. Verify lock triggers correctly.
- [ ] **Lock windows**: Trigger "Lock Now" → fullscreen windows appear on all monitors.
- [ ] **Multi-monitor**: Verify primary shows full UI, secondary shows branded background.
- [ ] **Skip button**: Click skip → all windows close immediately, cycle restarts.
- [ ] **Taskbar coverage**: Lock windows completely cover taskbar.
- [ ] **Stand up reminder**: Enable with 1-min interval. Verify overlay appears at configured position and auto-dismisses.
- [ ] **Pre-lock warning**: Enable with 1-min warning. Verify amber overlay appears before lock.
- [ ] **App monitoring**: Add an app to excluded list, trigger its active state, verify cycle pauses.
- [ ] **Lock screen customization**: Change gradient, title, logo, and verify lock screen reflects changes.
- [ ] **Global shortcut**: Press `Ctrl+Shift+U+L` during lock, verify break is skipped.
- [ ] **Autostart**: Reboot → app in tray after login.
- [ ] **Tray menu**: All items functional, timer updates in real-time.
- [ ] **Settings persistence**: Change settings, restart app, verify restored correctly.
- [ ] **Theme switching**: Toggle theme in settings, verify smooth transition and persistence.
- [ ] **Navigation**: Test all navigation tabs (Home, Settings, Customization, About).
- [ ] **Sleep/resume**: Sleep for 10 min → resume → timers adjusted correctly.
- [ ] **Pause/resume**: Pause work cycle, check timer stops; resume, check timer continues.
- [ ] **Logging**: Enable logging, work for 1 cycle, check logs created.

## Contributing

This is a productivity application. Fork and extend as needed. Key areas:

- [x] Multi-monitor support
- [x] Dark/Light theme support
- [x] Multi-page dashboard with navigation
- [x] Custom frameless title bar
- [x] Stand up reminders
- [x] Pre-lock warning
- [x] App monitoring with auto-pause
- [x] Lock screen customization (gradient, text, logo, buttons)
- [x] Global keyboard shortcut
- [ ] Sound notifications for reminders
- [ ] Break activity suggestions (stretch, walk, drink water)
- [ ] Statistics dashboard (cycles completed, total break time)
- [ ] Pomodoro mode (shorter work/break intervals)
- [ ] Cross-platform (macOS, Linux)
- [ ] Cloud sync settings

## File Structure

```
WAVE/
├── package.json                    # Dependencies & scripts
├── pnpm-lock.yaml                  # pnpm lock file
├── pnpm-workspace.yaml             # pnpm workspace config
├── electron-builder.yml            # Installer config
├── electron-vite.config.ts         # Build config
├── tsconfig.json                   # TypeScript config
├── tsconfig.node.json              # Node TypeScript config
├── tailwind.config.js              # Tailwind config
├── postcss.config.js               # PostCSS config
├── README.md                       # This file
├── LICENSE                         # MIT License
│
├── src/
│   ├── main/                       # Main process
│   │   ├── index.ts                # App lifecycle, tray, windows, splash, protocols, shortcuts
│   │   ├── cycle-manager.ts        # Timer state machine with pre-lock and app monitor integration
│   │   ├── lock-window.ts          # Lock screen windows (all displays)
│   │   ├── lock-service.ts         # OS lock integration
│   │   ├── standup-timer.ts        # Stand up reminder interval timer
│   │   ├── standup-window.ts       # Stand up reminder overlay window
│   │   ├── pre-lock-window.ts      # Pre-lock warning overlay window
│   │   ├── app-monitor.ts          # App detection, process monitoring, auto-pause
│   │   ├── settings-store.ts       # Persistent storage with schema
│   │   ├── autostart.ts            # Autostart config
│   │   ├── ipc.ts                  # IPC handlers
│   │   ├── logger.ts               # Rolling file logging
│   │   └── resources.ts            # Asset path resolution
│   │
│   ├── preload/
│   │   └── index.ts                # Secure API exposure via contextBridge
│   │
│   ├── renderer/                   # React/UI
│   │   ├── index.html              # HTML template
│   │   ├── main.tsx                # Router: App, LockScreen, StandUpReminder, PreLockReminder
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Dashboard with status + app monitor status
│   │   │   ├── Settings.tsx        # Settings configuration page
│   │   │   ├── Customization.tsx   # Lock screen appearance customization
│   │   │   └── About.tsx           # About and info page
│   │   ├── components/
│   │   │   ├── TitleBar.tsx        # Custom frameless title bar
│   │   │   ├── Layout.tsx          # Page layout wrapper
│   │   │   ├── Navigation.tsx      # Navigation component
│   │   │   ├── SettingsForm.tsx    # Settings form UI (all sections)
│   │   │   ├── StatusCard.tsx      # Status display card
│   │   │   ├── Controls.tsx        # Control buttons
│   │   │   ├── AppMonitorStatus.tsx # Active app monitoring widget
│   │   │   ├── NumberInput.tsx     # Custom number input
│   │   │   ├── Checkbox.tsx        # Custom checkbox
│   │   │   └── Separator.tsx       # Visual separator
│   │   ├── context/
│   │   │   └── CycleContext.tsx    # Cycle state React context
│   │   ├── store/
│   │   │   └── useSettings.ts      # Settings state management hook
│   │   ├── lib/
│   │   │   ├── format.ts           # Time & color utilities
│   │   │   └── toast.ts            # Toast notifications
│   │   └── styles/
│   │       └── index.css           # Tailwind & custom styles
│   │
│   ├── shared/
│   │   └── ipc.ts                  # Settings validation (main + renderer)
│   │
│   └── types/
│       ├── settings.types.ts       # Settings interface + defaults
│       ├── cycle.types.ts          # Cycle phases & status types
│       └── app-monitor.types.ts    # App monitor types
│
├── assets/
│   ├── app-media/                  # App assets (logo, icons)
│   │   ├── Wave--icon.png          # App logo (PNG)
│   │   └── Wave--icon.svg          # App logo (SVG)
│   └── media/                      # User-facing media (default lock screen assets)
│       └── Wave--icon.png          # Default lock screen logo
│
└── dist/                           # Build output (generated)
    ├── win-unpacked/               # Unpacked app
    ├── WAVE-x.x.x-setup.exe       # NSIS installer
    └── WAVE-x.x.x-portable.exe    # Portable executable
```

## License

MIT License (see LICENSE file).

---

**Version:** 0.0.16
**Last Updated:** March 16, 2026
**Platform:** Windows 10+
**Status:** Beta

## Developer

**Manolis Ntamadakis**

- Portfolio: [https://ntamadakis.gr/](https://ntamadakis.gr/)
- Support Me: [https://ntamadakis.gr/support-me](https://ntamadakis.gr/support-me)
