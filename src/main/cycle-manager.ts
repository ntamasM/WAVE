import { BrowserWindow } from 'electron';
import { Settings } from '../types/settings.types';
import { CycleStatus, CycleState } from '../types/cycle.types';
import { LockWindow } from './lock-window';
import { Logger } from './logger';
import { PreLockWindow } from './pre-lock-window';

const logger = new Logger('cycle-manager');

/**
 * CycleManager implements the state machine:
 * work → locking → break → work
 *
 * Timekeeping uses wall-clock deltas (Date.now()) to survive sleep/resume.
 */
export class CycleManager {
  private settings: Settings;
  private state: CycleState;
  private intervalId: NodeJS.Timeout | null = null;
  private getMainWindow: () => BrowserWindow | null;
  private systemWasAsleep = false;
  private lockWindow: LockWindow;
  private preLockWindow: PreLockWindow;
  private firedReminders: Set<number> = new Set();
  constructor(settings: Settings, getMainWindow: () => BrowserWindow | null) {
    this.settings = settings;
    this.getMainWindow = getMainWindow;
    this.lockWindow = new LockWindow();
    this.preLockWindow = new PreLockWindow();
    this.state = {
      phase: 'work',
      workStartedAt: null,
      breakStartedAt: null,
      pausedAt: null,
      pausedRemaining: 0,
    };
  }

  start(): void {
    logger.info('Cycle started');
    this.state.workStartedAt = Date.now();
    this.state.phase = 'work';
    this.firedReminders.clear();

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Tick every 1 second
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.info('Cycle stopped');
  }

  pause(): void {
    if (this.state.phase === 'paused') {
      logger.warn('Already paused');
      return;
    }

    const status = this.getStatus();
    this.state.pausedRemaining = status.remainingMs;
    this.state.pausedAt = Date.now();
    this.state.phase = 'paused';

    this.emit('cycle:phase-changed', 'paused');
    logger.info(`Cycle paused. Remaining: ${this.state.pausedRemaining}ms`);
  }

  resume(): void {
    if (this.state.phase !== 'paused') {
      logger.warn('Not paused');
      return;
    }

    // Restore the work phase with the remaining time
    const now = Date.now();
    const remainingMs = this.state.pausedRemaining;

    // Calculate when work should have started to have this much time remaining
    const workDurationMs = this.settings.workHours * 3600 * 1000;
    const elapsedMs = workDurationMs - remainingMs;

    this.state.phase = 'work';
    this.state.workStartedAt = now - elapsedMs;
    this.state.breakStartedAt = null;
    this.state.pausedAt = null;
    this.state.pausedRemaining = 0;

    this.emit('cycle:phase-changed', 'work');
    logger.info(`Cycle resumed with ${remainingMs}ms remaining`);
  }

  async lockNow(): Promise<void> {
    logger.info('Lock requested immediately');
    this.state.phase = 'locking';
    await this.executeLock();
  }

  updateSettings(newSettings: Settings): void {
    this.settings = newSettings;
    logger.info(
      `Settings updated: work=${newSettings.workHours}h, lock=${newSettings.lockMinutes}m, showSkipButton=${newSettings.showSkipButton}`
    );
  }

  onSystemSuspend(): void {
    logger.info('System suspended, cycle paused');
    this.systemWasAsleep = true;
    if (this.state.phase !== 'paused') {
      this.pause();
    }
  }

  onSystemResume(): void {
    logger.info('System resumed, resuming cycle');
    if (this.systemWasAsleep) {
      this.systemWasAsleep = false;
      this.resume();
    }
  }

  private tick(): void {
    const status = this.getStatus();

    // Emit update for UI
    this.emit('cycle:update', {
      phase: this.state.phase,
      remainingMs: status.remainingMs,
      totalMs: status.totalMs,
    });

    if (this.state.phase === 'paused') {
      return; // No state transitions while paused
    }

    if (this.state.phase === 'work') {
      this.handleWorkPhase(status.remainingMs);
    } else if (this.state.phase === 'break') {
      this.handleBreakPhase(status.remainingMs);
    }
  }

  private handleWorkPhase(remainingMs: number): void {
    const warningEnabled = this.settings.preLockWarningEnabled ?? false;
    const reminders = this.settings.preLockReminders ?? [5];

    // Check each reminder (sorted descending so the earliest trigger fires first)
    if (warningEnabled && remainingMs > 0) {
      const sorted = [...reminders].sort((a, b) => b - a);
      const lastMinute = Math.min(...reminders);

      for (const minutes of sorted) {
        if (!this.firedReminders.has(minutes) && remainingMs <= minutes * 60 * 1000) {
          this.firedReminders.add(minutes);
          this.preLockWindow.close(); // Close previous reminder before showing new one
          const isLast = minutes === lastMinute;
          const showSkip = isLast && (this.settings.preLockSkipEnabled ?? false);
          this.preLockWindow.show(minutes, showSkip);
          logger.info(`Pre-lock reminder shown: ${minutes}m before lock (last=${isLast}, skip=${showSkip})`);
          break; // Only fire one per tick
        }
      }
    }

    if (remainingMs <= 0) {
      // Work time elapsed, lock immediately
      logger.info('Work time elapsed, locking immediately');
      this.state.phase = 'locking';
      this.executeLock();
    }
  }

  private handleBreakPhase(remainingMs: number): void {
    // Update lock window timer if it's open
    if (this.lockWindow.isOpen()) {
      this.lockWindow.updateTimer(remainingMs);
    }

    if (remainingMs <= 0) {
      // Break time elapsed, close lock window and restart work cycle
      logger.info('Break time elapsed, restarting work cycle');
      this.lockWindow.close();
      this.state.phase = 'work';
      this.state.workStartedAt = Date.now();
      this.state.breakStartedAt = null;
      this.firedReminders.clear();
      this.emit('cycle:phase-changed', 'work');
    }
  }

  private async executeLock(): Promise<void> {
    try {
      logger.info('Showing lock window...');

      // Close pre-lock warning if it's still open
      this.preLockWindow.close();

      // Create and show lock window
      const lockDurationMs = this.settings.lockMinutes * 60 * 1000;
      this.lockWindow.create(lockDurationMs, this.settings.showSkipButton);

      // Transition to break phase
      this.state.phase = 'break';
      this.state.breakStartedAt = Date.now();
      this.state.workStartedAt = null;

      this.emit('cycle:phase-changed', 'break');
      logger.info(`Break phase started (${this.settings.lockMinutes}m)`);
    } catch (err) {
      logger.error('Failed to show lock window', err as Error);
    }
  }

  getStatus(): CycleStatus {
    const now = Date.now();
    let remainingMs = 0;
    let totalMs = 0;

    if (this.state.phase === 'work' && this.state.workStartedAt) {
      const workDurationMs = this.settings.workHours * 3600 * 1000;
      const elapsedMs = now - this.state.workStartedAt;
      remainingMs = Math.max(0, workDurationMs - elapsedMs);
      totalMs = workDurationMs;
    } else if (this.state.phase === 'break' && this.state.breakStartedAt) {
      const breakDurationMs = this.settings.lockMinutes * 60 * 1000;
      const elapsedMs = now - this.state.breakStartedAt;
      remainingMs = Math.max(0, breakDurationMs - elapsedMs);
      totalMs = breakDurationMs;
    } else if (this.state.phase === 'paused') {
      remainingMs = this.state.pausedRemaining;
      totalMs = this.settings.workHours * 3600 * 1000;
    }

    return {
      phase: this.state.phase,
      endsAt: remainingMs > 0 ? now + remainingMs : null,
      remainingMs,
      totalMs,
    };
  }

  skipLock(): void {
    if (this.state.phase !== 'break') {
      logger.warn(`Cannot skip: not in break phase (current phase: ${this.state.phase})`);
      return;
    }

    logger.info('Lock skipped by user, closing windows and restarting work cycle');

    // Close lock window first
    if (this.lockWindow.isOpen()) {
      this.lockWindow.close();
    }

    // Reset state
    this.state.phase = 'work';
    this.state.workStartedAt = Date.now();
    this.state.breakStartedAt = null;
    this.firedReminders.clear();
    this.emit('cycle:phase-changed', 'work');

    logger.info('Work cycle restarted after skip');
  }

  closePreLockWarning(): void {
    this.preLockWindow.close();
  }

  showPreLockWarning(minutes: number, showSkip: boolean = false): void {
    this.preLockWindow.show(minutes, showSkip);
  }

  private emit(channel: string, data?: unknown): void {
    const win = this.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, data);
    }
  }

  reset(): void {
    this.preLockWindow.close();
    this.firedReminders.clear();
    this.state = {
      phase: 'work',
      workStartedAt: Date.now(),
      breakStartedAt: null,
      pausedAt: null,
      pausedRemaining: 0,
    };
    this.emit('cycle:phase-changed', 'work');
    logger.info('Cycle reset');
  }

}
