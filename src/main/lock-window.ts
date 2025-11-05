import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { Logger } from './logger';
import { getAppAssetPath } from './resources';

const logger = new Logger('lock-window');

export class LockWindow {
  private windows: BrowserWindow[] = [];
  private displayBounds: Map<BrowserWindow, { x: number; y: number; width: number; height: number }> = new Map();

  create(lockDurationMs: number, showSkipButton: boolean): BrowserWindow {
    logger.info(`Creating lock windows with duration: ${lockDurationMs}ms, showSkipButton: ${showSkipButton}`);

    // Get all displays
    const displays = screen.getAllDisplays();
    logger.info(`Found ${displays.length} display(s)`);

    const iconPath = getAppAssetPath(__dirname, 'Wave.png');

    // Create a lock window for each display
    displays.forEach((display, index) => {
      // Use full display bounds (not workAreaSize) to cover taskbar
      const { x, y, width, height } = display.bounds;
      const isPrimary = display.id === screen.getPrimaryDisplay().id;

      logger.info(
        `Display ${index}: x=${x}, y=${y}, width=${width}, height=${height}, isPrimary=${isPrimary}, displayId=${display.id}`
      );

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
        kiosk: false, // Ensure kiosk mode is disabled
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
        icon: iconPath,
        title: 'WAVE - Break Time',
      });

      // Prevent the window from being closed
      window.on('close', (event) => {
        event.preventDefault();
      });

      // Load the lock screen HTML - use query parameter to differentiate
      // Pass isPrimary flag instead of just index
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?mode=lock&display=${index}&isPrimary=${isPrimary}`);
      } else {
        window.loadURL(
          `file://${join(__dirname, '../renderer/index.html')}?mode=lock&display=${index}&isPrimary=${isPrimary}`
        );
      }

      // Send initial data after the page loads
      window.webContents.on('did-finish-load', () => {
        window.webContents.send('lock:init', {
          lockDurationMs,
          showSkipButton,
          startTime: Date.now(),
        });

        // Position and show the window after content is loaded
        logger.info(`Positioning window ${index} at x=${x}, y=${y}, width=${width}, height=${height}`);

        // First, set window properties before showing
        window.setAlwaysOnTop(true, 'screen-saver', 1);
        window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        window.setFullScreenable(false);
        window.setSkipTaskbar(index !== 0);

        // Set position and size BEFORE showing the window
        window.setPosition(x, y, false); // Don't animate
        window.setSize(width, height, false); // Don't animate

        // Show the window AFTER positioning
        window.show();

        // Re-apply position after showing (Windows sometimes resets it)
        window.setBounds({ x, y, width, height }, false);
        window.setPosition(x, y, false);

        // Move to top
        window.moveTop();

        // Focus primary window
        if (isPrimary) {
          window.focus();
        }

        // Verify and log final position
        setTimeout(() => {
          const finalBounds = window.getBounds();
          logger.info(
            `Final window ${index} bounds: x=${finalBounds.x}, y=${finalBounds.y}, width=${finalBounds.width}, height=${finalBounds.height}`
          );

          // If position is wrong, force it again
          if (finalBounds.x !== x || finalBounds.y !== y) {
            logger.warn(
              `Window ${index} position mismatch! Expected (${x},${y}) but got (${finalBounds.x},${finalBounds.y}). Forcing position...`
            );
            window.setBounds({ x, y, width, height }, false);
          }
        }, 100);
      });

      window.on('closed', () => {
        const idx = this.windows.indexOf(window);
        if (idx > -1) {
          this.windows.splice(idx, 1);
        }
        this.displayBounds.delete(window);
      });

      // Store the intended bounds for this window
      this.displayBounds.set(window, { x, y, width, height });

      this.windows.push(window);

      // Set up a periodic check to ensure windows stay on their monitors
      const positionChecker = setInterval(() => {
        if (window.isDestroyed()) {
          clearInterval(positionChecker);
          return;
        }
        const currentBounds = window.getBounds();
        const intendedBounds = this.displayBounds.get(window);
        if (intendedBounds && (currentBounds.x !== intendedBounds.x || currentBounds.y !== intendedBounds.y)) {
          logger.warn(
            `Window ${index} drifted! Repositioning from (${currentBounds.x},${currentBounds.y}) to (${intendedBounds.x},${intendedBounds.y})`
          );
          window.setBounds(intendedBounds, false);
        }
      }, 500);

      // Clean up interval when window closes
      window.once('closed', () => clearInterval(positionChecker));
    });

    return this.windows[0];
  }

  close(): void {
    logger.info(`Closing ${this.windows.length} lock window(s)`);
    const windowsToClose = [...this.windows]; // Create a copy
    this.windows = []; // Clear the array first
    this.displayBounds.clear(); // Clear the bounds map

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
