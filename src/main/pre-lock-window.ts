import { BrowserWindow } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { Logger } from './logger';
import { getAppAssetPath } from './resources';

const logger = new Logger('pre-lock-window');

const WINDOW_WIDTH = 380;
const WINDOW_HEIGHT = 130;

export class PreLockWindow {
  private win: BrowserWindow | null = null;

  show(warningMinutes: number): void {
    if (this.win && !this.win.isDestroyed()) {
      return; // Already showing
    }

    const iconPath = getAppAssetPath(__dirname, 'Wave--icon.png');

    this.win = new BrowserWindow({
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      focusable: true,
      hasShadow: false,
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
      icon: iconPath,
      title: 'WAVE - Lock Warning',
    });

    this.win.setAlwaysOnTop(true, 'screen-saver', 1);

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?mode=prelock&minutes=${warningMinutes}`);
    } else {
      this.win.loadURL(`file://${join(__dirname, '../renderer/index.html')}?mode=prelock&minutes=${warningMinutes}`);
    }

    this.win.webContents.on('did-finish-load', () => {
      if (!this.win || this.win.isDestroyed()) return;
      this.win.center();
      this.win.show();
      logger.info(`Pre-lock warning window shown (${warningMinutes}m before lock)`);
    });

    this.win.on('closed', () => {
      this.win = null;
    });
  }

  close(): void {
    if (this.win && !this.win.isDestroyed()) {
      this.win.removeAllListeners('close');
      this.win.close();
      this.win = null;
      logger.info('Pre-lock warning window closed');
    }
  }

  isOpen(): boolean {
    return this.win !== null && !this.win.isDestroyed();
  }
}
