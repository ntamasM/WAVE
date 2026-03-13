import { Logger } from './logger';
import { StandUpWindow } from './standup-window';
import type { StandUpPosition } from '../types/settings.types';

const logger = new Logger('standup-timer');

export class StandUpTimer {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private standUpWindow: StandUpWindow;
  private position: StandUpPosition = 'center-center';

  constructor() {
    this.standUpWindow = new StandUpWindow();
  }

  get window(): StandUpWindow {
    return this.standUpWindow;
  }

  updateSettings(enabled: boolean, intervalMinutes: number, position: StandUpPosition = 'center-center'): void {
    this.position = position;
    this.stop();
    if (enabled && intervalMinutes > 0) {
      const ms = intervalMinutes * 60 * 1000;
      this.intervalId = setInterval(() => {
        this.standUpWindow.show(this.position);
      }, ms);
      logger.info(`Stand up timer started: every ${intervalMinutes} minutes, position: ${position}`);
    }
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Stand up timer stopped');
    }
    this.standUpWindow.close();
  }
}
