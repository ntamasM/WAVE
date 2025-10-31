import { app, BrowserWindow, Menu, Tray, nativeImage, powerMonitor, protocol, net } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { Logger } from './logger';
import { SettingsStore } from './settings-store';
import { CycleManager } from './cycle-manager';
import { handleIPC } from './ipc';
import { setAutoStart, getAutoStart } from './autostart';
import fs from 'fs/promises';
import { existsSync } from 'fs';

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

  // Override CSP to allow media:// protocol for images
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders };

    // Override CSP to allow media:// custom protocol for images
    headers['Content-Security-Policy'] = [
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: media:;",
    ];

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

const initializeMediaDirectory = async (): Promise<void> => {
  try {
    const mediaDir = join(app.getPath('userData'), 'media');

    // Create media directory if it doesn't exist
    if (!existsSync(mediaDir)) {
      await fs.mkdir(mediaDir, { recursive: true });
      logger.info('Created media directory');
    }

    // Copy default logo and any bundled media if they don't exist
    const defaultMedia = ['FocusLock.png'];

    for (const fileName of defaultMedia) {
      const destPath = join(mediaDir, fileName);
      if (!existsSync(destPath)) {
        const sourcePath = join(__dirname, '../../resources/media', fileName);
        // If not in media folder, try resources root
        const fallbackPath = join(__dirname, '../../resources', fileName);

        if (existsSync(sourcePath)) {
          await fs.copyFile(sourcePath, destPath);
          logger.info(`Copied ${fileName} to media directory from media folder`);
        } else if (existsSync(fallbackPath)) {
          await fs.copyFile(fallbackPath, destPath);
          logger.info(`Copied ${fileName} to media directory from resources`);
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
]);

app.on('ready', async () => {
  logger.info('App starting...');

  // Register media protocol handler
  protocol.handle('media', async (request) => {
    try {
      // Remove protocol and clean up the URL (strip trailing slashes)
      const url = request.url.replace('media://', '').replace(/\/+$/, '');
      const mediaDir = join(app.getPath('userData'), 'media');

      // Try user media directory first
      let filePath = join(mediaDir, url);

      if (!existsSync(filePath)) {
        // Fallback to bundled resources
        filePath = join(__dirname, '../../resources/media', url);
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

  createSingleInstance();
  createWindow();
  createTray();

  // Initialize media directory
  await initializeMediaDirectory();

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
