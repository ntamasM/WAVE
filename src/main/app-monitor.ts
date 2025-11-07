import { exec } from 'child_process';
import { promisify } from 'util';
import { Logger } from './logger';
import { MonitoredApp, AppState } from '../types/app-monitor.types';

const execAsync = promisify(exec);
const logger = new Logger('app-monitor');

// Define known applications to monitor
export const MONITORED_APPS: MonitoredApp[] = [
  // Communication Apps
  {
    id: 'teams',
    name: 'Microsoft Teams',
    processNames: ['ms-teams.exe', 'Teams.exe'],
    category: 'communication',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    processNames: ['Zoom.exe', 'ZoomWebinar.exe'],
    category: 'communication',
  },
  {
    id: 'skype',
    name: 'Skype',
    processNames: ['Skype.exe'],
    category: 'communication',
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    processNames: ['meet.exe', 'GoogleMeet.exe'],
    category: 'communication',
  },
  {
    id: 'webex',
    name: 'Cisco Webex',
    processNames: ['CiscoCollabHost.exe', 'ptoneclk.exe', 'WebexHost.exe'],
    category: 'communication',
  },
  {
    id: 'discord',
    name: 'Discord',
    processNames: ['Discord.exe'],
    category: 'communication',
  },
  {
    id: 'slack',
    name: 'Slack',
    processNames: ['slack.exe'],
    category: 'communication',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Desktop',
    processNames: ['WhatsApp.exe'],
    category: 'communication',
  },
  {
    id: 'telegram',
    name: 'Telegram Desktop',
    processNames: ['Telegram.exe'],
    category: 'communication',
  },
  {
    id: 'signal',
    name: 'Signal Desktop',
    processNames: ['Signal.exe'],
    category: 'communication',
  },
  {
    id: 'viber',
    name: 'Viber Desktop',
    processNames: ['Viber.exe'],
    category: 'communication',
  },
  {
    id: 'messenger',
    name: 'Facebook Messenger Desktop',
    processNames: ['Messenger.exe'],
    category: 'communication',
  },
  {
    id: 'line',
    name: 'LINE',
    processNames: ['LINE.exe'],
    category: 'communication',
  },
  {
    id: 'wechat',
    name: 'WeChat',
    processNames: ['WeChat.exe', 'WeChatApp.exe'],
    category: 'communication',
  },
  {
    id: 'zoom-workplace',
    name: 'Zoom Workplace',
    processNames: ['ZoomWorkplace.exe'],
    category: 'communication',
  },
  // Media Players
  {
    id: 'vlc',
    name: 'VLC Media Player',
    processNames: ['vlc.exe'],
    category: 'media',
  },
  {
    id: 'windows-media-player',
    name: 'Windows Media Player',
    processNames: ['wmplayer.exe'],
    category: 'media',
  },
  {
    id: 'movies-tv',
    name: 'Movies & TV',
    processNames: ['Video.UI.exe'],
    category: 'media',
  },
  {
    id: 'potplayer',
    name: 'PotPlayer',
    processNames: ['PotPlayer.exe', 'PotPlayerMini.exe', 'PotPlayer64.exe', 'PotPlayerMini64.exe'],
    category: 'media',
  },
  {
    id: 'kmplayer',
    name: 'KMPlayer',
    processNames: ['KMPlayer.exe', 'KMPlayer64.exe'],
    category: 'media',
  },
  {
    id: 'mpc-hc',
    name: 'MPC-HC',
    processNames: ['mpc-hc.exe', 'mpc-hc64.exe'],
    category: 'media',
  },
  {
    id: 'mpc-be',
    name: 'MPC-BE',
    processNames: ['mpc-be.exe', 'mpc-be64.exe'],
    category: 'media',
  },
  {
    id: 'kodi',
    name: 'Kodi',
    processNames: ['kodi.exe'],
    category: 'media',
  },
  {
    id: 'plex-player',
    name: 'Plex Media Player',
    processNames: ['PlexMediaPlayer.exe'],
    category: 'media',
  },
  {
    id: 'plex-htpc',
    name: 'Plex HTPC',
    processNames: ['PlexHTPC.exe'],
    category: 'media',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    processNames: ['Netflix.exe'],
    category: 'media',
  },
  {
    id: 'prime-video',
    name: 'Amazon Prime Video',
    processNames: ['PrimeVideo.exe', 'AmazonPrimeVideo.exe'],
    category: 'media',
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    processNames: ['DisneyPlus.exe'],
    category: 'media',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    processNames: ['YouTube.exe'],
    category: 'media',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    processNames: ['Twitch.exe'],
    category: 'media',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    processNames: ['Spotify.exe'],
    category: 'media',
  },
  {
    id: 'itunes',
    name: 'iTunes',
    processNames: ['iTunes.exe'],
    category: 'media',
  },
  {
    id: 'realplayer',
    name: 'RealPlayer',
    processNames: ['RealPlayer.exe'],
    category: 'media',
  },
  // Browsers
  {
    id: 'chrome',
    name: 'Google Chrome',
    processNames: ['chrome.exe'],
    category: 'browser',
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    processNames: ['msedge.exe'],
    category: 'browser',
  },
  {
    id: 'firefox',
    name: 'Mozilla Firefox',
    processNames: ['firefox.exe'],
    category: 'browser',
  },
  {
    id: 'opera',
    name: 'Opera',
    processNames: ['opera.exe'],
    category: 'browser',
  },
  {
    id: 'opera-gx',
    name: 'Opera GX',
    processNames: ['opera_gx.exe'],
    category: 'browser',
  },
  {
    id: 'brave',
    name: 'Brave Browser',
    processNames: ['brave.exe'],
    category: 'browser',
  },
  // Media Creation & Gaming
  {
    id: 'obs',
    name: 'OBS Studio',
    processNames: ['obs64.exe', 'obs32.exe', 'obs.exe'],
    category: 'media',
  },
  {
    id: 'steam',
    name: 'Steam',
    processNames: ['steam.exe', 'steamwebhelper.exe'],
    category: 'media',
  },
  {
    id: 'xbox',
    name: 'Xbox App',
    processNames: ['XboxApp.exe', 'GamingServices.exe'],
    category: 'media',
  },
  {
    id: 'geforce-experience',
    name: 'NVIDIA GeForce Experience',
    processNames: ['NVIDIA GeForce Experience.exe', 'NvContainer.exe'],
    category: 'media',
  },
  {
    id: 'shadowplay',
    name: 'ShadowPlay',
    processNames: ['NvContainer.exe', 'NVIDIA Share.exe'],
    category: 'media',
  },
];

export class AppMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private currentStates: Map<string, AppState> = new Map();
  private installedApps: MonitoredApp[] = [];
  private checkIntervalMs = 5000; // Check every 5 seconds for active state
  private onStateChangeCallback: ((states: AppState[]) => void) | null = null;

  constructor() {
    MONITORED_APPS.forEach((app) => {
      this.currentStates.set(app.id, {
        appId: app.id,
        isRunning: false,
        isInCall: false,
        isFullscreen: false,
      });
    });
  }

  /**
   * Start monitoring applications (only checks active states, not installation)
   */
  start(): void {
    if (this.intervalId) {
      logger.warn('App monitor already running');
      return;
    }

    logger.info('Starting app monitor for active state checking');
    this.checkAllApps(); // Initial check
    this.intervalId = setInterval(() => {
      this.checkAllApps();
    }, this.checkIntervalMs);
  }

  /**
   * Stop monitoring applications
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('App monitor stopped');
    }
  }

  /**
   * Set callback for state changes
   */
  onStateChange(callback: (states: AppState[]) => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * Get current state of all monitored apps
   */
  getStates(): AppState[] {
    return Array.from(this.currentStates.values());
  }

  /**
   * Scan for installed apps on the system
   * This is an expensive operation and should be called sparingly
   */
  async scanInstalledApps(): Promise<MonitoredApp[]> {
    logger.info('Scanning for installed applications...');
    const installed: MonitoredApp[] = [];

    for (const app of MONITORED_APPS) {
      const isInstalled = await this.isAppInstalled(app);
      if (isInstalled) {
        installed.push(app);
        logger.info(`Found installed app: ${app.name}`);
      }
    }

    this.installedApps = installed;
    logger.info(`Scan complete. Found ${installed.length} installed apps`);
    return installed;
  }

  /**
   * Get list of installed apps (cached)
   */
  getInstalledApps(): MonitoredApp[] {
    return this.installedApps;
  }

  /**
   * Check if an app is installed on the system
   */
  private async isAppInstalled(app: MonitoredApp): Promise<boolean> {
    try {
      // Multiple search strategies for better detection
      const searchTerms = [app.name.split(' ')[0], ...app.processNames.map((p) => p.replace('.exe', ''))];

      // Strategy 1: Check in HKLM registry
      for (const term of searchTerms) {
        const registryCheck = await execAsync(
          `powershell -Command "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue | Where-Object {$_.DisplayName -like '*${term}*'} | Select-Object -First 1"`,
          { windowsHide: true, timeout: 3000 }
        ).catch(() => ({ stdout: '' }));

        if (registryCheck.stdout.trim().length > 0) {
          return true;
        }
      }

      // Strategy 2: Check in 32-bit registry path
      for (const term of searchTerms) {
        const registry32Check = await execAsync(
          `powershell -Command "Get-ItemProperty HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue | Where-Object {$_.DisplayName -like '*${term}*'} | Select-Object -First 1"`,
          { windowsHide: true, timeout: 3000 }
        ).catch(() => ({ stdout: '' }));

        if (registry32Check.stdout.trim().length > 0) {
          return true;
        }
      }

      // Strategy 3: Check in HKCU (Current User) registry
      for (const term of searchTerms) {
        const userRegistryCheck = await execAsync(
          `powershell -Command "Get-ItemProperty HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue | Where-Object {$_.DisplayName -like '*${term}*'} | Select-Object -First 1"`,
          { windowsHide: true, timeout: 3000 }
        ).catch(() => ({ stdout: '' }));

        if (userRegistryCheck.stdout.trim().length > 0) {
          return true;
        }
      }

      // Strategy 4: Check if executable exists in PATH
      for (const procName of app.processNames) {
        try {
          const whereCheck = await execAsync(`where ${procName}`, {
            windowsHide: true,
            timeout: 2000,
          });
          if (whereCheck.stdout.trim().length > 0) {
            return true;
          }
        } catch {
          // Command failed, continue
        }
      }

      // Strategy 5: Check common installation directories
      const commonPaths = [
        `C:\\Program Files\\${app.name}`,
        `C:\\Program Files (x86)\\${app.name}`,
        `${process.env.LOCALAPPDATA || 'C:\\Users\\Public\\AppData\\Local'}\\${app.name}`,
        `${process.env.APPDATA || 'C:\\Users\\Public\\AppData\\Roaming'}\\${app.name}`,
      ];

      for (const dirPath of commonPaths) {
        try {
          const dirCheck = await execAsync(`powershell -Command "Test-Path '${dirPath}'"`, {
            windowsHide: true,
            timeout: 1000,
          });
          if (dirCheck.stdout.trim() === 'True') {
            return true;
          }
        } catch {
          // Continue checking
        }
      }

      return false;
    } catch (error) {
      logger.debug(`Error checking if ${app.name} is installed: ${(error as Error).message}`);
      return false;
    }
  } /**
   * Check if any excluded apps are in active state (call or fullscreen)
   */
  shouldPauseCycle(excludedAppIds: string[]): boolean {
    for (const appId of excludedAppIds) {
      const state = this.currentStates.get(appId);
      if (state && state.isRunning && (state.isInCall || state.isFullscreen)) {
        logger.info(`App ${appId} is in active state (call: ${state.isInCall}, fullscreen: ${state.isFullscreen})`);
        return true;
      }
    }
    return false;
  }

  /**
   * Check all installed apps for active state
   */
  private async checkAllApps(): Promise<void> {
    // Only check apps that are installed
    const appsToCheck = this.installedApps.length > 0 ? this.installedApps : MONITORED_APPS;
    const promises = appsToCheck.map((app) => this.checkApp(app));
    await Promise.all(promises);

    // Notify if callback is set
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.getStates());
    }
  }

  /**
   * Check a specific app's state
   */
  private async checkApp(app: MonitoredApp): Promise<void> {
    const prevState = this.currentStates.get(app.id);
    const newState: AppState = {
      appId: app.id,
      isRunning: false,
      isInCall: false,
      isFullscreen: false,
    };

    try {
      // Check if process is running
      newState.isRunning = await this.isProcessRunning(app.processNames);

      if (newState.isRunning) {
        // Check if in call or fullscreen based on app type
        if (app.category === 'communication') {
          newState.isInCall = await this.checkIfInCall(app);
        } else if (app.category === 'media' || app.category === 'browser') {
          newState.isFullscreen = await this.checkIfFullscreen(app);
        }
      }
    } catch (error) {
      logger.error(`Error checking app ${app.name}`, error as Error);
    }

    // Update state if changed
    if (
      !prevState ||
      prevState.isRunning !== newState.isRunning ||
      prevState.isInCall !== newState.isInCall ||
      prevState.isFullscreen !== newState.isFullscreen
    ) {
      this.currentStates.set(app.id, newState);
      logger.debug(
        `App state changed: ${app.name} - running: ${newState.isRunning}, inCall: ${newState.isInCall}, fullscreen: ${newState.isFullscreen}`
      );
    }
  }

  /**
   * Check if any of the process names are running
   */
  private async isProcessRunning(processNames: string[]): Promise<boolean> {
    try {
      const { stdout } = await execAsync('tasklist', { windowsHide: true });
      const processes = stdout.toLowerCase();

      return processNames.some((procName) => processes.includes(procName.toLowerCase()));
    } catch (error) {
      logger.error('Error checking running processes', error as Error);
      return false;
    }
  }

  /**
   * Check if communication app is in a call
   * Uses heuristics: checks for specific window titles or process behavior
   */
  private async checkIfInCall(app: MonitoredApp): Promise<boolean> {
    try {
      // For Teams, check if there's an active call window (must be more specific)
      if (app.id === 'teams') {
        const { stdout } = await execAsync(
          `powershell -Command "Get-Process | Where-Object {$_.ProcessName -match 'Teams' -and ($_.MainWindowTitle -match '\\| Microsoft Teams$' -or $_.MainWindowTitle -match 'Meeting in progress' -or $_.MainWindowTitle -match 'Call in progress')} | Select-Object MainWindowTitle -First 1"`,
          { windowsHide: true }
        );
        // Only return true if we found a specific call/meeting indicator
        const result =
          stdout.trim().length > 0 && (stdout.includes('Meeting in progress') || stdout.includes('Call in progress'));
        if (result) {
          logger.debug(`Teams call detected: ${stdout.trim()}`);
        }
        return result;
      }

      // For Zoom, check window titles
      if (app.id === 'zoom') {
        const { stdout } = await execAsync(
          `powershell -Command "Get-Process zoom | Where-Object {$_.MainWindowTitle -like '*Zoom Meeting*'} | Select-Object -First 1"`,
          { windowsHide: true }
        );
        return stdout.trim().length > 0;
      }

      // For Discord, check for voice/video channel window
      if (app.id === 'discord') {
        const { stdout } = await execAsync(
          `powershell -Command "Get-Process discord | Where-Object {$_.MainWindowTitle -like '* - Voice*' -or $_.MainWindowTitle -like '* - Video*'} | Select-Object -First 1"`,
          { windowsHide: true }
        );
        return stdout.trim().length > 0;
      }

      // For other communication apps, don't assume call state
      // Return false by default for communication apps unless we have specific detection
      return false;
    } catch (error) {
      logger.debug(`Cannot determine call state for ${app.name}: ${(error as Error).message}`);
      return false;
    }
  }

  private async checkIfFullscreen(app: MonitoredApp): Promise<boolean> {
    try {
      // Get actual screen dimensions and check foreground window
      // Use a temp file to avoid escaping issues with here-strings
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');

      const tempDir = os.tmpdir();
      const scriptPath = path.join(tempDir, `wave-fullscreen-check-${Date.now()}.ps1`);

      const scriptContent = `Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinAPI {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left, Top, Right, Bottom;
    }
}
"@

$hwnd = [WinAPI]::GetForegroundWindow()
$rect = New-Object WinAPI+RECT
[WinAPI]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
$screenWidth = [WinAPI]::GetSystemMetrics(0)
$screenHeight = [WinAPI]::GetSystemMetrics(1)
$processId = 0
[WinAPI]::GetWindowThreadProcessId($hwnd, [ref]$processId) | Out-Null
$processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
Write-Output "$width,$height,$screenWidth,$screenHeight,$processName"`;

      await fs.writeFile(scriptPath, scriptContent, 'utf8');

      try {
        const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, {
          windowsHide: true,
          timeout: 3000,
        });

        const parts = stdout.trim().split(',');
        if (parts.length >= 5) {
          const width = parseInt(parts[0]);
          const height = parseInt(parts[1]);
          const screenWidth = parseInt(parts[2]);
          const screenHeight = parseInt(parts[3]);
          const foregroundProcessName = parts[4].toLowerCase();

          // Check if window is fullscreen (within 10 pixels tolerance)
          const isFullscreenSize = width >= screenWidth - 10 && height >= screenHeight - 10;

          if (isFullscreenSize) {
            // Check if the foreground process matches one of the app's process names
            for (const procName of app.processNames) {
              const cleanProcName = procName.replace('.exe', '').toLowerCase();
              if (foregroundProcessName === cleanProcName) {
                logger.info(
                  `Fullscreen detected: ${app.name} (${foregroundProcessName}) - ${width}x${height} on ${screenWidth}x${screenHeight}`
                );
                return true;
              }
            }
          }
        }

        return false;
      } finally {
        // Clean up temp file
        await fs.unlink(scriptPath).catch(() => {});
      }
    } catch (error) {
      logger.debug(`Cannot determine fullscreen state for ${app.name}: ${(error as Error).message}`);
      return false;
    }
  }
}
