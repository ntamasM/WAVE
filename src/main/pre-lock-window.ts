import { BrowserWindow } from 'electron';
import { Logger } from './logger';
import { createOverlayWindow } from './overlay-window';

const logger = new Logger('pre-lock-window');

const WINDOW_WIDTH = 420;
const WINDOW_HEIGHT = 200;

export class PreLockWindow {
  private win: BrowserWindow | null = null;

  show(warningMinutes: number, showSkip: boolean = false): void {
    if (this.win && !this.win.isDestroyed()) {
      return; // Already showing
    }

    this.win = createOverlayWindow(__dirname, {
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      title: 'WAVE - Lock Warning',
      queryParams: `mode=prelock&minutes=${warningMinutes}&showSkip=${showSkip}`,
    });

    this.win.webContents.on('did-finish-load', () => {
      if (!this.win || this.win.isDestroyed()) return;
      this.win.center();
      this.win.showInactive();
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
