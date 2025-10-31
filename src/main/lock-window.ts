import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { Logger } from './logger';

const logger = new Logger('lock-window');

export class LockWindow {
  private windows: BrowserWindow[] = [];

  create(lockDurationMs: number, canSkip: boolean): BrowserWindow {
    logger.info(`Creating lock windows with duration: ${lockDurationMs}ms, canSkip: ${canSkip}`);

    // Get all displays
    const displays = screen.getAllDisplays();
    logger.info(`Found ${displays.length} display(s)`);

    const iconPath = join(__dirname, '../../resources/FocusLock.png');

    // Create a lock window for each display
    displays.forEach((display, index) => {
      // Use full display bounds (not workAreaSize) to cover taskbar
      const { x, y, width, height } = display.bounds;
      const isPrimary = display.id === screen.getPrimaryDisplay().id;

      logger.info(`Display ${index}: x=${x}, y=${y}, width=${width}, height=${height}`);

      const window = new BrowserWindow({
        x: x,
        y: y,
        width: width,
        height: height,
        fullscreen: false, // Don't use fullscreen mode
        frame: false,
        show: false, // Don't show until positioned
        alwaysOnTop: true,
        skipTaskbar: index !== 0, // Only show primary in taskbar
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        focusable: true,
        transparent: false,
        hasShadow: false,
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
        icon: iconPath,
        title: 'FocusLock - Break Time',
      });

      // Prevent the window from being closed
      window.on('close', (event) => {
        event.preventDefault();
      });

      // Set exact bounds to cover entire display including taskbar
      window.setBounds({ x, y, width, height });

      // Keep the window always on top (highest level to cover taskbar)
      window.setAlwaysOnTop(true, 'pop-up-menu', 1);
      window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      window.setFullScreenable(false);
      window.setSkipTaskbar(index !== 0);

      // Load the lock screen HTML - use query parameter to differentiate
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?mode=lock&display=${index}`);
      } else {
        window.loadURL(`file://${join(__dirname, '../renderer/index.html')}?mode=lock&display=${index}`);
      }

      // Send initial data after the page loads
      window.webContents.on('did-finish-load', () => {
        window.webContents.send('lock:init', {
          lockDurationMs,
          canSkip,
          startTime: Date.now(),
        });

        // Ensure window is on top after content loads
        window.setAlwaysOnTop(true, 'pop-up-menu', 1);
        window.moveTop();
      });

      window.on('closed', () => {
        const idx = this.windows.indexOf(window);
        if (idx > -1) {
          this.windows.splice(idx, 1);
        }
      });

      // Show and position the window
      window.show();
      window.setBounds({ x, y, width, height });
      window.setAlwaysOnTop(true, 'pop-up-menu', 1);

      // Focus primary window
      if (isPrimary) {
        window.focus();
        window.moveTop();
      }

      this.windows.push(window);
    });

    return this.windows[0];
  }

  close(): void {
    logger.info(`Closing ${this.windows.length} lock window(s)`);
    const windowsToClose = [...this.windows]; // Create a copy
    this.windows = []; // Clear the array first

    windowsToClose.forEach((window) => {
      if (window && !window.isDestroyed()) {
        // Remove the close prevention temporarily
        window.removeAllListeners('close');
        window.destroy(); // Use destroy() instead of close() for immediate closure
      }
    });

    logger.info('All lock windows closed');
  }

  isOpen(): boolean {
    return this.windows.length > 0 && this.windows.some((w) => !w.isDestroyed());
  }

  getWindow(): BrowserWindow | null {
    return this.windows.length > 0 ? this.windows[0] : null;
  }

  updateTimer(remainingMs: number): void {
    this.windows.forEach((window) => {
      if (window && !window.isDestroyed()) {
        window.webContents.send('lock:update', { remainingMs });
      }
    });
  }
}
