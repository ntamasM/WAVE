import { app, BrowserWindow, Menu, Tray, nativeImage, powerMonitor, protocol } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { Logger } from './logger';
import { SettingsStore } from './settings-store';
import { CycleManager } from './cycle-manager';
import { handleIPC } from './ipc';
import { setAutoStart, getAutoStart } from './autostart';
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';

const logger = new Logger('main');
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const settingsStore = new SettingsStore();
let cycleManager: CycleManager | null = null;
let isQuitting = false;

const createWindow = (): void => {
  const iconPath = join(__dirname, '../../resources/FocusLock.png');
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true, // Keep web security enabled
    },
    icon: iconPath,
    title: 'FocusLock',
    frame: false, // Remove default window frame for custom title bar
    titleBarStyle: 'hidden',
    autoHideMenuBar: true, // Hide menu bar (File, Edit, View, etc.)
  });

  // Remove the menu completely
  mainWindow.setMenu(null);

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

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

  // Debug: Log all requests to see if focuslock-logo:// is being requested
  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    if (details.url.startsWith('focuslock-logo://')) {
      logger.info(`Request intercepted: ${details.url}`);
    }
    callback({});
  });

  // Enforce CSP - allow custom logo protocol
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders };

    // Log CSP headers for debugging
    if (headers['Content-Security-Policy']) {
      logger.info(`Original CSP: ${headers['Content-Security-Policy']}`);
    }

    // Completely override CSP for all requests
    headers['Content-Security-Policy'] = [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' focuslock-logo: data: http: https: blob:;",
    ];

    logger.info(`Modified CSP: ${headers['Content-Security-Policy']}`);

    callback({ responseHeaders: headers });
  });
};

const createTray = (): void => {
  const iconPath = join(__dirname, '../../resources/FocusLock.png');
  const icon = nativeImage.createFromPath(iconPath);
  // Resize icon for tray (16x16 is standard for Windows tray)
  const trayIcon = icon.resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.setToolTip('FocusLock');

  const contextMenu = Menu.buildFromTemplate([
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
      },
    },
    {
      label: 'Resume Cycle',
      click: () => {
        cycleManager?.resume();
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

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
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

const initializeCycleManager = (): void => {
  if (cycleManager) {
    cycleManager.stop();
  }

  const settings = settingsStore.getSettings();
  cycleManager = new CycleManager(settings, mainWindow);
  cycleManager.start();

  logger.info(`Cycle manager initialized: workHours=${settings.workHours}, lockMinutes=${settings.lockMinutes}`);
};

const initializeLogosDirectory = async (): Promise<void> => {
  try {
    const logosDir = join(app.getPath('userData'), 'logos');

    // Create logos directory if it doesn't exist
    if (!existsSync(logosDir)) {
      await fs.mkdir(logosDir, { recursive: true });
      logger.info('Created logos directory');
    }

    // Copy default logo if it doesn't exist
    const defaultLogoName = 'FocusLock.png';
    const destPath = join(logosDir, defaultLogoName);

    if (!existsSync(destPath)) {
      const sourcePath = join(__dirname, '../../resources/FocusLock.png');
      if (existsSync(sourcePath)) {
        await fs.copyFile(sourcePath, destPath);
        logger.info('Copied default logo to logos directory');
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to initialize logos directory', new Error(errorMsg));
  }
};

const registerLogoProtocol = (): void => {
  // Register a custom protocol to serve logo files using Buffer protocol for better control
  protocol.registerBufferProtocol('focuslock-logo', (request, callback) => {
    try {
      // Remove protocol and clean up any trailing slashes
      const url = request.url.replace('focuslock-logo://', '').replace(/\/$/, '');
      const logosDir = join(app.getPath('userData'), 'logos');
      const filePath = join(logosDir, url);

      logger.info(`Logo protocol request: ${request.url} -> ${filePath}`);

      let targetPath: string | null = null;

      if (existsSync(filePath)) {
        logger.info(`Serving logo from: ${filePath}`);
        targetPath = filePath;
      } else {
        // Fallback to resources directory
        const resourcePath = join(__dirname, '../../resources', url);
        if (existsSync(resourcePath)) {
          logger.info(`Serving logo from resources: ${resourcePath}`);
          targetPath = resourcePath;
        }
      }

      if (targetPath) {
        const data = readFileSync(targetPath);
        // Determine MIME type based on file extension
        const ext = targetPath.toLowerCase().split('.').pop();
        let mimeType = 'application/octet-stream';
        if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
        else if (ext === 'svg') mimeType = 'image/svg+xml';
        else if (ext === 'gif') mimeType = 'image/gif';

        logger.info(`Serving ${targetPath} as ${mimeType}`);
        callback({ data, mimeType });
      } else {
        logger.error(`Logo file not found: ${url} (tried ${filePath})`);
        callback({ error: -6 }); // FILE_NOT_FOUND
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to serve logo file', new Error(errorMsg));
      callback({ error: -2 }); // FAILED
    }
  });

  logger.info('Logo protocol registered successfully');
}; // Register custom protocol before app is ready - this must be done synchronously
if (protocol.registerSchemesAsPrivileged) {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'focuslock-logo',
      privileges: {
        secure: true,
        standard: true,
        supportFetchAPI: true,
        corsEnabled: false,
      },
    },
  ]);
}

app.on('ready', async () => {
  logger.info('App starting...');

  // Register the protocol handler
  registerLogoProtocol();

  createSingleInstance();
  createWindow();
  createTray();

  // Initialize logos directory
  await initializeLogosDirectory();

  // Initialize cycle manager FIRST
  initializeCycleManager();

  // Setup IPC handlers AFTER cycle manager is initialized
  handleIPC(settingsStore, cycleManager!);

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
  if (tray) {
    tray.destroy();
  }
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
