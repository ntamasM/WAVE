# WAVE (Work And Vital Energy)

A minimalist Windows productivity utility that enforces focus breaks with fullscreen lock windows across all monitors. Runs in the background, auto-starts with Windows, and provides a modern dashboard for configuration.

## 🎯 What is WAVE?

WAVE (Work And Vital Energy) is designed for professionals who struggle with taking regular breaks. Instead of soft overlays that can be dismissed, it uses **fullscreen lock windows** on all displays to enforce breaks. After configurable work periods (e.g., 2 hours), fullscreen lock windows appear on all monitors for a set break duration (e.g., 5 minutes), displaying a timer and optional skip button.

## ✨ Recent Updates (v0.0.15)

- **Dark/Light Theme Support**: Complete theme system with smooth transitions
- **Multi-Page Dashboard**: Separated functionality into Home, Settings, Customization, and About pages
- **Custom Title Bar**: Frameless window with drag support, navigation tabs, and window controls
- **Enhanced Navigation**: Clean tab-based navigation in the title bar
- **Improved UI/UX**: Modern component design with better spacing and visual hierarchy
- **Theme Persistence**: Theme preference saved and restored across sessions
- **System Tray Theme Toggle**: Quick theme switching from the tray menu
- **Better Resource Management**: Optimized asset loading and path resolution

### Key Features

- **Multi-Monitor Lock Windows**: Creates fullscreen lock windows on all displays simultaneously, covering taskbar and everything else
- **Beautiful Lock Screen**: Branded gradient background matching app logo, timer countdown, progress bar, and optional skip button
- **Multi-Display Support**: Automatically detects and locks all monitors - primary shows full UI, secondary displays show branded background
- **Dark/Light Theme**: Toggle between dark and light themes with system tray integration
- **Multi-Page Dashboard**: Clean navigation with Home, Settings, Customization, and About pages
- **Custom Title Bar**: Frameless window with custom drag bar, minimize/maximize/close buttons, and navigation tabs
- **Autostart**: Automatically launches with Windows in the background (system tray)
- **Smart Skip Prompt**: Optional 30-second pre-lock prompt allows skipping once per cycle (configurable)
- **Sleep/Resume Aware**: Adjusts timers based on wall-clock time, so sleep doesn't cheat the cycle
- **System Tray Integration**: Quick-access menu for pause/resume, lock now, theme toggle, and quit
- **Persistent Settings**: All preferences stored securely and loaded correctly on startup
- **Diagnostic Logging**: Optional rolling logs (daily files, kept 7 days) for troubleshooting
- **Customization Options**: Configure colors, backgrounds, and visual preferences

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
   - `index.ts`: App lifecycle, tray icon, window management with custom title bar, single-instance lock, theme management.
   - `cycle-manager.ts`: Core timer state machine (work → prelock prompt → lock → break → work).
   - `lock-window.ts`: Creates and manages fullscreen lock windows on all displays, covers taskbar.
   - `settings-store.ts`: Persistent settings with schema validation including theme preference.
   - `autostart.ts`: Cross-platform app autostart configuration.
   - `ipc.ts`: IPC handler definitions (secure invoke/on patterns).
   - `logger.ts`: Rolling file logging to `userData/logs/`.
   - `resources.ts`: Asset path resolution for icons and media.

2. **Preload** (`src/preload/`)
   - `index.ts`: Exposes minimal, typed API via `contextBridge` (no direct ipcRenderer).

3. **Renderer** (`src/renderer/`)
   - `main.tsx`: Router component that renders App or LockScreen based on URL parameters.
   - `App.tsx`: Main dashboard with page navigation and theme support.
   - `pages/`: Home, Settings, Customization, About - separate pages for different functionality.
   - `components/`:
     - `TitleBar.tsx`: Custom frameless title bar with drag support, window controls, and navigation tabs.
     - `Layout.tsx`: Page layout wrapper with consistent styling.
     - `Navigation.tsx`: Navigation component for switching between pages.
     - `SettingsForm.tsx`: Settings configuration interface.
     - `StatusCard.tsx`: Real-time status display.
     - `Controls.tsx`: Pause/Resume, Lock Now, Reset controls.
     - `NumberInput.tsx`: Custom number input component.
     - `Separator.tsx`: Visual separator component.
   - `store/useSettings.ts`: React hook for settings state management with theme support.
   - `lib/`:
     - `format.ts`: Time and UI color formatting utilities.
     - `toast.ts`: Toast notification wrapper.
   - `styles/index.css`: Tailwind base imports with custom theme variables.

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

| Setting                | Type              | Default | Range   | Notes                            |
| ---------------------- | ----------------- | ------- | ------- | -------------------------------- |
| **Work Duration**      | number (hours)    | 2.0     | 0.25–12 | Time before lock triggers        |
| **Break Duration**     | number (minutes)  | 5       | 1–60    | How long desktop stays locked    |
| **Show Prompt**        | boolean           | true    | —       | Pre-lock 30s confirmation dialog |
| **Start with Windows** | boolean           | true    | —       | Autostart behavior               |
| **Enable Logging**     | boolean           | true    | —       | Diagnostic logs to user data dir |
| **Theme**              | 'light' \| 'dark' | 'light' | —       | Application theme preference     |

All settings are validated on input and stored via electron-store with schema enforcement.

## 🎨 Design

### Dashboard UI

- **Custom Title Bar**: Frameless window with drag support, window controls (minimize, maximize, close), and navigation tabs
- **Dark/Light Theme**: Full theme support with smooth transitions
- **Multi-Page Layout**: Clean navigation between Home, Settings, Customization, and About pages
- **Responsive Design**: Adapts to different window sizes with mobile-friendly layouts
- **Custom Color Palette**: Bright Gray color scheme with proper contrast in both themes
- **Modern Components**: Custom-styled form inputs, buttons, and interactive elements

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
   cd c:\path\to\WAVE
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

**Output:** `dist/WAVE Setup 0.0.15.exe`

The installer includes:

- Application executable
- All dependencies
- App icon and assets
- Auto-updater configuration (if enabled)
- Uninstaller

### NSIS Installer Features

- One-click or full setup mode (user can choose install path).
- Create Start Menu shortcuts.
- Create Desktop shortcut.
- Automatic launch after install (optional).
- Standard Windows uninstaller via Control Panel.

### Configuration: `electron-builder.yml`

```yaml
appId: 'com.wave'
productName: 'WAVE'
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
  icon: assets/app-media/Wave.png
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: WAVE
  installerIcon: assets/app-media/Wave.png
  uninstallerIcon: assets/app-media/Wave.png
```

## 📖 Usage Guide

### Dashboard Overview

**Navigation Tabs** (in custom title bar):

- **Home**: Main dashboard with status and controls
- **Settings**: Configure work/break times and behavior
- **Customization**: Appearance and theme settings
- **About**: App information and credits

**Home Page:**

- Real-time countdown display with large numerals
- Current phase indicator (Working, On Break, Paused, Break Due Soon)
- Progress bar showing cycle completion
- Control buttons: Pause/Resume, Lock Now, Reset Cycle
- Status summary and statistics

**Settings Page:**

- Work duration slider (0.25-12 hours)
- Break duration slider (1-60 minutes)
- Toggle skip prompt
- Enable/disable autostart
- Enable/disable logging
- Save button persists changes

**Customization Page:**

- Theme toggle (Dark/Light)
- Color scheme preferences
- Background customization options
- Visual preferences

**About Page:**

- App version and information
- Developer credits
- License information
- Support links

### System Tray Menu

- **Dashboard**: Show main window
- **Pause Cycle / Resume Cycle**: Toggle pause state
- **Lock Now**: Trigger immediate lock (ignores current work time)
- **Toggle Theme**: Switch between dark and light themes
- **Quit**: Exit app completely

### Keyboard Shortcuts

- **Double-click tray icon**: Toggle dashboard visibility
- **Standard Windows shortcuts** in the app (Ctrl+C, Ctrl+V, etc.)
- **Title bar navigation**: Click tabs to switch between pages
- **Window controls**: Drag title bar to move window, use minimize/maximize/close buttons

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

1. **Check autostart setting**: Dashboard → Settings → "Start WAVE with Windows" (should be enabled).
2. **Verify path**: Check Startup folder: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`.
3. **Antivirus**: Exclude WAVE from antivirus real-time scanning.

### Lock Windows Don't Appear

- **Symptoms**: "Break is due" but lock windows don't show.
- **Cause**: Display detection issue or windows positioned incorrectly.
- **Solution**: Check logs for display count and bounds. Restart app to re-detect monitors.

### Logs Not Appearing

1. **Enable logging**: Dashboard → Settings → "Enable diagnostic logging" → Save.
2. **Find logs**: Open `%APPDATA%\wave\logs\` (or `%LOCALAPPDATA%\wave\logs\`).
3. **File naming**: Logs are daily: `wave-2025-10-30.log`.

### Settings Not Persisting or Loading

1. **Store location**: `%APPDATA%\wave\wave-settings.json` (on Windows).
2. **Permissions**: Ensure user can write to `%APPDATA%`.
3. **Corruption**: Delete `wave-settings.json` and restart app (settings reset to defaults).
4. **Form not updating**: Fixed in latest version - settings now properly load into form on startup.

### High CPU or Memory Usage

1. **Clear old logs**: Delete files older than 7 days from `logs/` folder.
2. **Check cycle manager**: Restart app.
3. **Report issue**: Include latest log file.

### Theme Not Switching

1. **Check settings**: Dashboard → Customization → Verify theme setting.
2. **Try tray menu**: Right-click tray icon → "Toggle Theme".
3. **Restart app**: Close and reopen to reset theme state.
4. **Clear settings**: Delete `wave-settings.json` to reset (will lose all settings).

### Title Bar Not Draggable

1. **Check window state**: Maximize/restore the window.
2. **Click drag area**: Ensure clicking on the title bar area (not tabs or buttons).
3. **Restart app**: Close and reopen if issue persists.

## 🧪 Testing Checklist

- [ ] **Timers**: Set work to 0.05 h (3 min), lock to 1 min. Verify pre-lock prompt or auto-lock.
- [ ] **Skip**: Disable prompt, re-enable, verify 30s countdown.
- [ ] **Lock windows**: Trigger "Lock Now" → fullscreen windows appear on all monitors.
- [ ] **Multi-monitor**: Verify primary shows full UI, secondary shows branded background.
- [ ] **Skip button**: Click skip → all windows close immediately, cycle restarts.
- [ ] **Taskbar coverage**: Lock windows completely cover taskbar.
- [ ] **Autostart**: Reboot → app in tray after login.
- [ ] **Tray menu**: All items functional including theme toggle.
- [ ] **Settings persistence**: Change settings, restart app, verify restored and displayed correctly.
- [ ] **Theme switching**: Toggle theme in settings/tray, verify smooth transition and persistence.
- [ ] **Navigation**: Test all navigation tabs (Home, Settings, Customization, About).
- [ ] **Custom title bar**: Verify drag functionality, window controls work properly.
- [ ] **Sleep/resume**: Sleep for 10 min → resume → timers adjusted correctly.
- [ ] **Pause/resume**: Pause work cycle, check timer stops; resume, check timer continues.
- [ ] **Logging**: Enable logging, work for 1 cycle, check logs created.
- [ ] **Responsive layout**: Test dashboard at different window sizes.

## 🎨 UI/UX Notes

### Dashboard Layout

**Multi-Page Structure:**

- **Title Bar**: Always visible with navigation tabs and window controls
- **Home Page**: Full-width layout with status cards and control buttons
- **Settings Page**: Form-based layout with grouped settings
- **Customization Page**: Theme and appearance options
- **About Page**: Information and credits layout

**Responsive Design:**

- Adapts to window size changes
- Touch-friendly controls for tablet mode
- Clean, spacious layouts in both light and dark themes

### Color Scheme

**Status Colors:**

- **Work**: Green (#10b981)
- **Break**: Blue (#3b82f6)
- **Pre-Lock Prompt**: Yellow (#d97706)
- **Paused**: Gray (#6b7280)
- **Lock Screen Gradient**: Teal to Dark Gray (#73C8A9 → #373B44, matching app logo)

**Theme Colors (Bright Gray Palette):**

- **Light Theme**: Bright Gray 50-900 scale
- **Dark Theme**: Inverted Bright Gray palette
- **Accent Colors**: Primary teal (#73C8A9), secondary blue (#3b82f6)
- **Interactive Elements**: Smooth transitions and hover states

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

Replace `assets/app-media/Wave.png` and `assets/app-media/Wave.svg` with your custom images.

Rebuild with:

```powershell
pnpm build
pnpm package:win
```

## 🤝 Contributing

This is a productivity application. Fork and extend as needed. Key areas for enhancement:

- [x] Multi-monitor support (implemented)
- [x] Dark/Light theme support (implemented)
- [x] Multi-page dashboard with navigation (implemented)
- [x] Custom frameless title bar (implemented)
- [ ] Custom break reminders (sound notifications)
- [ ] Break activity suggestions (stretch, walk, drink water)
- [ ] Statistics dashboard (cycles completed, total break time)
- [ ] Pomodoro mode (shorter work/break intervals)
- [ ] Cross-platform (macOS, Linux)
- [ ] Cloud sync settings (OneDrive, GitHub Gists)
- [ ] Custom lock screen backgrounds
- [ ] Break screen animations

## 📄 License

MIT License (see LICENSE file if included).

## 🆘 Support

- **Logs**: Check `%APPDATA%\wave\logs\` for diagnostics.
- **Settings file**: `%APPDATA%\wave\wave-settings.json`
- **Task Manager**: Search "WAVE" to verify background process.
- **Windows Event Viewer**: Check for system events related to `rundll32.exe`.

---

## 📊 File Structure

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
│   │   ├── index.ts                # App lifecycle, tray, windows
│   │   ├── cycle-manager.ts        # Timer state machine
│   │   ├── lock-window.ts          # Lock screen windows
│   │   ├── lock-service.ts         # OS lock integration
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
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Main dashboard page
│   │   │   ├── Settings.tsx        # Settings configuration page
│   │   │   ├── Customization.tsx   # Theme and appearance page
│   │   │   └── About.tsx           # About and info page
│   │   ├── components/
│   │   │   ├── TitleBar.tsx        # Custom frameless title bar
│   │   │   ├── Layout.tsx          # Page layout wrapper
│   │   │   ├── Navigation.tsx      # Navigation component
│   │   │   ├── SettingsForm.tsx    # Settings form UI
│   │   │   ├── StatusCard.tsx      # Status display card
│   │   │   ├── Controls.tsx        # Control buttons
│   │   │   ├── NumberInput.tsx     # Custom number input
│   │   │   └── Separator.tsx       # Visual separator
│   │   ├── store/
│   │   │   └── useSettings.ts      # Settings state management hook
│   │   ├── lib/
│   │   │   ├── format.ts           # Time & color utilities
│   │   │   └── toast.ts            # Toast notifications
│   │   └── styles/
│   │       └── index.css           # Tailwind & custom styles
│   │
│   └── shared/
│       ├── types.ts                # Shared TypeScript types
│       └── ipc.ts                  # IPC contract & validation
│
├── assets/
│   ├── README.md                   # Assets documentation
│   ├── app-media/                  # App assets (logo, icons)
│   │   ├── README.md              # App media documentation
│   │   ├── Wave.png               # App logo (PNG)
│   │   └── Wave.svg               # App logo (SVG)
│   └── media/                      # User-facing media
│       ├── README.md              # Media documentation
│       └── Wave.png               # Default lock screen logo
│
└── dist/                           # Build output (generated)
    ├── main/                       # Compiled main process
    ├── preload/                    # Compiled preload
    └── renderer/                   # Bundled React app
```

---

## 🎬 Demo / Screenshots

### Dashboard (Home Page)

```
┌──────────────────────────────────────────────────┐
│ ⚊  WAVE  [Home] [Settings] [Customize] [About] │ ─ □ ✕
├──────────────────────────────────────────────────┤
│                                                  │
│  Status: Working                                 │
│  ┌────────────────────────────────────────────┐ │
│  │            1:45:32                         │ │
│  │         Time Remaining                     │ │
│  └────────────────────────────────────────────┘ │
│  ████████████████░░░░░░  87% complete          │
│                                                  │
│  Total: 2:00:00 | Elapsed: 0:14:28              │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │  [Pause Cycle] [Lock Now] [Reset Cycle]   ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  💡 Next break in 1 hour 45 minutes             │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Settings Page

```
┌──────────────────────────────────────────────────┐
│ ⚊  WAVE  [Home] [Settings] [Customize] [About] │ ─ □ ✕
├──────────────────────────────────────────────────┤
│                                                  │
│  Work & Break Configuration                      │
│                                                  │
│  Work Duration (hours): 2.0  [─────●───]        │
│  Break Duration (minutes): 5  [──●─────]        │
│                                                  │
│  ☑ Show skip prompt before break                │
│  ☑ Start WAVE with Windows                      │
│  ☑ Enable diagnostic logging                    │
│                                                  │
│  [Save Settings]                                 │
│                                                  │
└──────────────────────────────────────────────────┘
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
📎 WAVE (Right-click)
├─ Dashboard
├─ Pause Cycle
├─ Lock Now
├─ Toggle Theme (Dark/Light)
├─ ────────────
└─ Quit
```

---

**Version:** 0.0.15  
**Last Updated:** November 5, 2025  
**Platform:** Windows 10+  
**Status:** Beta

## 👨‍💻 Developer

**Manolis Ntamadakis**

- Portfolio: [https://ntamadakis.gr/](https://ntamadakis.gr/)
- Support Me: [https://ntamadakis.gr/support-me](https://ntamadakis.gr/support-me)
