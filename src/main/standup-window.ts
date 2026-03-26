import { BrowserWindow, screen } from 'electron';
import { Logger } from './logger';
import { createOverlayWindow } from './overlay-window';
import type { StandUpPosition } from '../types/settings.types';

const logger = new Logger('standup-window');

const WINDOW_WIDTH = 420;
const WINDOW_HEIGHT = 160;
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

    this.win = createOverlayWindow(__dirname, {
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      title: 'WAVE - Stand Up',
      queryParams: 'mode=standup',
    });

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
