import { app, BrowserWindow, Menu, Tray, nativeImage, powerMonitor, protocol, net, globalShortcut } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { Logger } from './logger';
import { SettingsStore } from './settings-store';
import { CycleManager } from './cycle-manager';
import { AppMonitor } from './app-monitor';
import { handleIPC } from './ipc';
import { setAutoStart, getAutoStart } from './autostart';
import { getAppAssetPath, getMediaPath } from './resources';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const logger = new Logger('main');
let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const settingsStore = new SettingsStore();
let cycleManager: CycleManager | null = null;
let appMonitor: AppMonitor | null = null;
let isQuitting = false;

const createSplashWindow = (): void => {
  const iconPath = getAppAssetPath(__dirname, 'Wave--icon.png');
  splashWindow = new BrowserWindow({
    width: 600,
    height: 550,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    center: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    icon: iconPath,
  });

  splashWindow.setMenu(null);

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splashWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`);
  } else {
    splashWindow.loadFile(join(__dirname, '../renderer/splash.html'));
  }
};

const closeSplashWindow = (): void => {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
};

const createWindow = (): void => {
  const iconPath = getAppAssetPath(__dirname, 'Wave--icon.png');
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 700,
    minWidth: 700,
    minHeight: 500,
    show: false, // Don't show until ready-to-show event
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true, // Keep web security enabled
    },
    icon: iconPath,
    title: 'WAVE',
    frame: false, // Remove default window frame for custom title bar
    titleBarStyle: 'hidden',
    autoHideMenuBar: true, // Hide menu bar (File, Edit, View, etc.)
  });

  // Remove the menu completely
  mainWindow.setMenu(null);

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('minimize', () => {
    mainWindow?.hide();
  });

  // Prevent default close; minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Override CSP to allow media:// and app-media:// protocols for images
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders };

    // Override CSP to allow media:// and app-media:// custom protocols for images
    headers['Content-Security-Policy'] = [
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: media: app-media:;",
    ];

    callback({ responseHeaders: headers });
  });
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const updateTrayMenu = (): void => {
  if (!tray || !cycleManager) return;

  const status = cycleManager.getStatus();
  let timeLabel = 'Time until lock: N/A';

  if (status.phase === 'work' && status.remainingMs > 0) {
    timeLabel = `Time until lock: ${formatTime(status.remainingMs)}`;
  } else if (status.phase === 'break') {
    timeLabel = `Break time: ${formatTime(status.remainingMs)}`;
  } else if (status.phase === 'paused') {
    timeLabel = 'Cycle Paused';
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: timeLabel,
      enabled: false, // Make it non-clickable (display only)
    },
    { type: 'separator' },
    {
      label: 'Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Pause Cycle',
      click: () => {
        cycleManager?.pause();
        updateTrayMenu(); // Update immediately after pause
      },
    },
    {
      label: 'Resume Cycle',
      click: () => {
        cycleManager?.resume();
        updateTrayMenu(); // Update immediately after resume
      },
    },
    {
      label: 'Lock Now',
      click: () => {
        cycleManager?.lockNow();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
};

const createTray = (): void => {
  const iconPath = getAppAssetPath(__dirname, 'Wave--icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  // Resize icon for tray (16x16 is standard for Windows tray)
  const trayIcon = icon.resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.setToolTip('WAVE');

  updateTrayMenu();

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });

  // Update tray menu every second to keep the timer current
  setInterval(() => {
    updateTrayMenu();
  }, 1000);
};

const createSingleInstance = (): void => {
  if (!app.requestSingleInstanceLock()) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      } else {
        createWindow();
      }
    });
  }
};

const initializeCycleManager = async (): Promise<void> => {
  if (cycleManager) {
    cycleManager.stop();
  }

  // Initialize app monitor if not already initialized
  if (!appMonitor) {
    appMonitor = new AppMonitor();

    // Set callback to save installed apps when scan completes
    appMonitor.onScanComplete((apps) => {
      const appsData = apps.map((app) => ({
        id: app.id,
        name: app.name,
        category: app.category,
        processNames: app.processNames,
      }));
      settingsStore.setSetting('installedApps', appsData);
      settingsStore.setSetting('lastAppScan', Date.now());
      logger.info(`Saved ${apps.length} installed apps to settings`);
    });

    const settings = settingsStore.getSettings();
    const now = Date.now();
    const lastScan = settings.lastAppScan || 0;
    const scanInterval = settings.appScanInterval || 30; // Days
    const daysSinceLastScan = (now - lastScan) / (1000 * 60 * 60 * 24);

    // Determine if we need to scan
    const shouldScan = scanInterval === 0 ? false : lastScan === 0 || daysSinceLastScan >= scanInterval;

    if (shouldScan) {
      logger.info(`Scanning for installed applications (last scan: ${daysSinceLastScan.toFixed(1)} days ago)...`);
      await appMonitor.scanInstalledApps();
    } else if (settings.installedApps && settings.installedApps.length > 0) {
      logger.info(
        `Loading ${settings.installedApps.length} apps from cache (scanned ${daysSinceLastScan.toFixed(1)} days ago)`
      );
      appMonitor.loadInstalledApps(settings.installedApps);
    } else {
      // No cached data and scan disabled or not yet needed - do initial scan anyway
      logger.info('No cached app data found, performing initial scan...');
      await appMonitor.scanInstalledApps();
    }

    appMonitor.start();
    logger.info('App monitor initialized and started');
  }

  const settings = settingsStore.getSettings();
  cycleManager = new CycleManager(settings, mainWindow, appMonitor);
  cycleManager.start();

  logger.info(`Cycle manager initialized: workHours=${settings.workHours}, lockMinutes=${settings.lockMinutes}`);
};

const initializeMediaDirectory = async (): Promise<void> => {
  try {
    const mediaDir = join(app.getPath('userData'), 'media');

    // Create media directory if it doesn't exist
    if (!existsSync(mediaDir)) {
      await fs.mkdir(mediaDir, { recursive: true });
      logger.info('Created media directory');
    }

    // Copy default logo and any bundled media if they don't exist
    const defaultMedia = ['Wave--icon.png'];

    for (const fileName of defaultMedia) {
      const destPath = join(mediaDir, fileName);
      if (!existsSync(destPath)) {
        // Get bundled default media from assets/media
        const sourcePath = getMediaPath(__dirname);
        const bundledFile = join(sourcePath, fileName);

        if (existsSync(bundledFile)) {
          await fs.copyFile(bundledFile, destPath);
          logger.info(`Copied ${fileName} to user media directory`);
        }
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to initialize media directory', new Error(errorMsg));
  }
};

// Register custom protocol scheme before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: false,
      bypassCSP: false,
    },
  },
  {
    scheme: 'app-media',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: false,
      bypassCSP: false,
    },
  },
]);

app.on('ready', async () => {
  logger.info('App starting...');

  // Show splash screen immediately
  createSplashWindow();

  // Register media protocol handler (for user customizable media)
  protocol.handle('media', async (request) => {
    try {
      // Remove protocol and clean up the URL (strip trailing slashes)
      const url = request.url.replace('media://', '').replace(/\/+$/, '');
      const mediaDir = join(app.getPath('userData'), 'media');

      // Try user media directory first
      let filePath = join(mediaDir, url);

      if (!existsSync(filePath)) {
        // Fallback to bundled default media
        const bundledMediaPath = getMediaPath(__dirname);
        filePath = join(bundledMediaPath, url);
      }

      if (!existsSync(filePath)) {
        logger.error(`Media file not found: ${url}`);
        return new Response('File not found', { status: 404 });
      }

      logger.info(`Serving media: ${filePath}`);
      return net.fetch(`file://${filePath}`);
    } catch (error) {
      logger.error('Error serving media file', error as Error);
      return new Response('Internal error', { status: 500 });
    }
  });

  // Register app-media protocol handler (for bundled app assets like logo)
  protocol.handle('app-media', async (request) => {
    try {
      const url = request.url.replace('app-media://', '').replace(/\/+$/, '');
      const appMediaPath = getAppAssetPath(__dirname, url);

      if (!existsSync(appMediaPath)) {
        logger.error(`App media file not found: ${url}`);
        return new Response('File not found', { status: 404 });
      }

      logger.info(`Serving app media: ${appMediaPath}`);
      return net.fetch(`file://${appMediaPath}`);
    } catch (error) {
      logger.error('Error serving app media file', error as Error);
      return new Response('Internal error', { status: 500 });
    }
  });

  createSingleInstance();

  // Initialize media directory
  await initializeMediaDirectory();

  // Initialize cycle manager FIRST (now async) - this takes time to scan apps
  await initializeCycleManager();

  // Setup IPC handlers BEFORE creating window
  handleIPC(settingsStore, cycleManager!, appMonitor!);

  // Close splash window and show main window
  closeSplashWindow();

  // NOW create window and tray after IPC handlers are ready
  createWindow();
  createTray();

  // Register global shortcut to skip lock (Ctrl+Shift+U+L)
  const shortcutRegistered = globalShortcut.register('CommandOrControl+Shift+U+L', () => {
    logger.info('Global shortcut triggered: Ctrl+Shift+U+L - Skipping lock');
    if (cycleManager) {
      cycleManager.skipLock();
    }
  });

  if (shortcutRegistered) {
    logger.info('Global shortcut registered: Ctrl+Shift+U+L');
  } else {
    logger.error('Failed to register global shortcut: Ctrl+Shift+U+L');
  }

  // Restore autostart state
  const settings = settingsStore.getSettings();
  const currentAutoStart = getAutoStart();
  if (settings.startWithWindows && !currentAutoStart) {
    setAutoStart(true);
  } else if (!settings.startWithWindows && currentAutoStart) {
    setAutoStart(false);
  }

  logger.info('App ready');
});

app.on('window-all-closed', () => {
  // On macOS, keep app running; on Windows, quit
  if (process.platform !== 'darwin') {
    // Don't quit; keep running in tray
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  if (cycleManager) {
    cycleManager.stop();
  }
  if (appMonitor) {
    appMonitor.stop();
  }
  if (tray) {
    tray.destroy();
  }
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
});

// Notify renderer of sleep/resume
powerMonitor.on('suspend', () => {
  logger.info('System suspended');
  cycleManager?.onSystemSuspend();
});

powerMonitor.on('resume', () => {
  logger.info('System resumed');
  cycleManager?.onSystemResume();
});
