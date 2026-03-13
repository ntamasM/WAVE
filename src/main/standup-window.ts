import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { Logger } from './logger';
import { getAppAssetPath } from './resources';
import type { StandUpPosition } from '../types/settings.types';

const logger = new Logger('standup-window');

const WINDOW_WIDTH = 380;
const WINDOW_HEIGHT = 120;
const MARGIN = 20;
const AUTO_CLOSE_MS = 8500;

function getWindowPosition(position: StandUpPosition): { x: number; y: number } {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

  let winX: number;
  let winY: number;

  // Horizontal
  if (position.endsWith('left')) {
    winX = x + MARGIN;
  } else if (position.endsWith('right')) {
    winX = x + width - WINDOW_WIDTH - MARGIN;
  } else {
    winX = x + Math.round((width - WINDOW_WIDTH) / 2);
  }

  // Vertical
  if (position.startsWith('top')) {
    winY = y + MARGIN;
  } else if (position.startsWith('bottom')) {
    winY = y + height - WINDOW_HEIGHT - MARGIN;
  } else {
    winY = y + Math.round((height - WINDOW_HEIGHT) / 2);
  }

  return { x: winX, y: winY };
}

export class StandUpWindow {
  private win: BrowserWindow | null = null;
  private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  show(position: StandUpPosition = 'center-center'): void {
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
      title: 'WAVE - Stand Up',
    });

    this.win.setAlwaysOnTop(true, 'screen-saver', 1);

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?mode=standup`);
    } else {
      this.win.loadURL(`file://${join(__dirname, '../renderer/index.html')}?mode=standup`);
    }

    this.win.webContents.on('did-finish-load', () => {
      if (!this.win || this.win.isDestroyed()) return;

      if (position === 'center-center') {
        this.win.center();
      } else {
        const { x, y } = getWindowPosition(position);
        this.win.setPosition(x, y, false);
      }

      this.win.show();
      const bounds = this.win.getBounds();
      logger.info(`Stand up window shown at (${bounds.x}, ${bounds.y}), position: ${position}`);
    });

    this.win.on('closed', () => {
      this.win = null;
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = null;
      }
    });

    this.autoCloseTimer = setTimeout(() => {
      this.close();
    }, AUTO_CLOSE_MS);
  }

  close(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
    if (this.win && !this.win.isDestroyed()) {
      this.win.removeAllListeners('close');
      this.win.close();
      this.win = null;
      logger.info('Stand up window closed');
    }
  }

  isOpen(): boolean {
    return this.win !== null && !this.win.isDestroyed();
  }
}
