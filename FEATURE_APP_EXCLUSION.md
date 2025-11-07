# App Exclusion Feature

## Overview

The App Exclusion feature allows WAVE to automatically detect and pause the work cycle when you're actively using certain communication or media applications. This prevents unwanted break interruptions during important calls or while watching videos.

## How It Works

### Monitored Applications

WAVE automatically detects and monitors the following applications when they're running:

**Communication Apps** (Pauses during calls):

- Microsoft Teams
- Zoom
- Skype
- Cisco Webex
- Discord
- Slack

**Media Players** (Pauses during fullscreen playback):

- VLC Media Player
- Kodi
- Plex

**Browsers** (Pauses during fullscreen videos):

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Opera

### Behavior

1. **Automatic Detection**: WAVE scans for running applications every 5 seconds
2. **Smart Pausing**:
   - For **communication apps**: WAVE pauses only when you're in an active call or meeting
   - For **media players and browsers**: WAVE pauses only when content is in fullscreen mode
3. **Automatic Resuming**: When the call ends or you exit fullscreen, WAVE automatically resumes the work cycle

### Configuration

1. Open WAVE Settings
2. Navigate to "Behavior Preferences" section
3. Under "Excluded Applications", you'll see a list of detected apps
4. Check the apps you want to monitor
5. Click "Save Changes"

**Note**: Only applications that are currently running will appear in the list. Start an application (like Teams or Chrome) to see it in the excluded apps list.

## Technical Details

### Detection Methods

- **Process Detection**: Uses Windows `tasklist` to detect running processes
- **Call Detection**: For communication apps, checks window titles for keywords like "Call", "Meeting", or voice/video indicators
- **Fullscreen Detection**: For media/browser apps, compares window dimensions with screen size to determine fullscreen state

### Performance Impact

- Minimal CPU usage (~1-2% during active scanning)
- Scans every 5 seconds (not real-time)
- Uses PowerShell commands for advanced Windows API access

## Troubleshooting

### App Not Appearing in List

- Make sure the application is running
- Restart WAVE after launching the app
- Check if the app process name matches the monitored list

### Pausing Not Working

- Verify the app is checked in Excluded Applications
- Ensure you're in an active call (for communication apps) or fullscreen mode (for media apps)
- Check WAVE logs if diagnostic logging is enabled

### False Positives

- Some apps may be detected as "in call" when they're just open with a window
- This is a limitation of window title detection
- You can uncheck the app if it causes unwanted pauses

## Files Modified/Created

- `src/main/app-monitor.ts` - Core app monitoring service
- `src/main/cycle-manager.ts` - Integrated with cycle management
- `src/main/index.ts` - App monitor initialization
- `src/main/ipc.ts` - IPC handlers for app data
- `src/shared/types.ts` - Settings type updates
- `src/shared/ipc.ts` - IPC interface updates
- `src/main/settings-store.ts` - Excluded apps storage
- `src/preload/index.ts` - Preload API for renderer
- `src/renderer/components/SettingsForm.tsx` - UI for app selection
- `src/renderer/store/useSettings.ts` - Settings hook update

## Future Improvements

- Add manual process name input for custom apps
- Improve call detection accuracy
- Add per-app pause thresholds
- Support for macOS and Linux
- Audio activity detection for more reliable call detection
