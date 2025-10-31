import { BrowserWindow } from 'electron';
import { Settings, CycleStatus, PRELOCK_PROMPT_DURATION_MS } from '../shared/types';
import { LockWindow } from './lock-window';
import { Logger } from './logger';

const logger = new Logger('cycle-manager');

type CyclePhase = 'work' | 'break' | 'paused' | 'prelockPrompt' | 'locking';

interface CycleState {
  phase: CyclePhase;
  workStartedAt: number | null;
  breakStartedAt: number | null;
  prelockStartedAt: number | null;
  pausedAt: number | null;
  pausedRemaining: number; // remaining ms when paused
}

/**
 * CycleManager implements the state machine:
 * work → prelockPrompt (if canSkip) → locking → break → work
 *
 * Timekeeping uses wall-clock deltas (Date.now()) to survive sleep/resume.
 */
export class CycleManager {
  private settings: Settings;
  private state: CycleState;
  private intervalId: NodeJS.Timeout | null = null;
  private mainWindow: BrowserWindow | null = null;
  private systemWasAsleep = false;
  private lockWindow: LockWindow;

  constructor(settings: Settings, mainWindow: BrowserWindow | null) {
    this.settings = settings;
    this.mainWindow = mainWindow;
    this.lockWindow = new LockWindow();
    this.state = {
      phase: 'work',
      workStartedAt: null,
      breakStartedAt: null,
      prelockStartedAt: null,
      pausedAt: null,
      pausedRemaining: 0,
    };
  }

  start(): void {
    logger.info('Cycle started');
    this.state.workStartedAt = Date.now();
    this.state.phase = 'work';

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

    // Restore the previous phase's timer
    const now = Date.now();
    const pausedDuration = now - (this.state.pausedAt || now);
    const previousRemaining = this.state.pausedRemaining - pausedDuration;

    // Determine what phase we were in before pausing
    // For simplicity, assume we were in 'work' (could enhance to track this)
    this.state.phase = 'work';
    this.state.workStartedAt = now - (this.settings.workHours * 3600 * 1000 - previousRemaining);
    this.state.breakStartedAt = null;
    this.state.prelockStartedAt = null;
    this.state.pausedAt = null;

    this.emit('cycle:phase-changed', 'work');
    logger.info('Cycle resumed');
  }

  async lockNow(): Promise<void> {
    logger.info('Lock requested immediately');
    this.state.phase = 'locking';
    await this.executeLock();
  }

  updateSettings(newSettings: Settings): void {
    this.settings = newSettings;
    logger.info(
      `Settings updated: work=${newSettings.workHours}h, lock=${newSettings.lockMinutes}m, canSkip=${newSettings.canSkip}`
    );
  }

  skipBreak(): void {
    if (this.state.phase === 'prelockPrompt') {
      logger.info('Break skipped, resetting work cycle');
      this.state.phase = 'work';
      this.state.workStartedAt = Date.now();
      this.state.prelockStartedAt = null;
      this.emit('cycle:phase-changed', 'work');
    } else {
      logger.warn('skipBreak called but not in prelockPrompt phase');
    }
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
    } else if (this.state.phase === 'prelockPrompt') {
      this.handlePrelockPhase(status.remainingMs);
    } else if (this.state.phase === 'break') {
      this.handleBreakPhase(status.remainingMs);
    }
  }

  private handleWorkPhase(remainingMs: number): void {
    if (remainingMs <= 0) {
      // Work time elapsed
      if (this.settings.canSkip) {
        logger.info('Work time elapsed, showing pre-lock prompt');
        this.state.phase = 'prelockPrompt';
        this.state.prelockStartedAt = Date.now();
        this.showPrelockPrompt();
      } else {
        logger.info('Work time elapsed, locking immediately');
        this.state.phase = 'locking';
        this.executeLock();
      }
    }
  }

  private handlePrelockPhase(remainingMs: number): void {
    if (remainingMs <= 0) {
      // Prelock timeout, proceed to lock
      logger.info('Pre-lock prompt timeout, locking');
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
      this.state.prelockStartedAt = null;
      this.emit('cycle:phase-changed', 'work');
    }
  }

  private async executeLock(): Promise<void> {
    try {
      logger.info('Showing lock window...');

      // Create and show lock window
      const lockDurationMs = this.settings.lockMinutes * 60 * 1000;
      this.lockWindow.create(lockDurationMs, this.settings.canSkip);

      // Transition to break phase
      this.state.phase = 'break';
      this.state.breakStartedAt = Date.now();
      this.state.workStartedAt = null;
      this.state.prelockStartedAt = null;

      this.emit('cycle:phase-changed', 'break');
      logger.info(`Break phase started (${this.settings.lockMinutes}m)`);
    } catch (err) {
      logger.error('Failed to show lock window', err as Error);
    }
  }

  private showPrelockPrompt(): void {
    // Send event to renderer to show modal
    this.emit('cycle:phase-changed', 'prelockPrompt');
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
    } else if (this.state.phase === 'prelockPrompt' && this.state.prelockStartedAt) {
      const elapsedMs = now - this.state.prelockStartedAt;
      remainingMs = Math.max(0, PRELOCK_PROMPT_DURATION_MS - elapsedMs);
      totalMs = PRELOCK_PROMPT_DURATION_MS;
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

  skipPrelock(): void {
    if (this.state.phase !== 'prelockPrompt') {
      logger.warn('Not in pre-lock phase');
      return;
    }

    logger.info('Pre-lock prompt skipped, restarting work cycle');
    this.state.phase = 'work';
    this.state.workStartedAt = Date.now();
    this.state.prelockStartedAt = null;
    this.emit('cycle:phase-changed', 'work');
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
    this.emit('cycle:phase-changed', 'work');

    logger.info('Work cycle restarted after skip');
  }

  private emit(channel: string, data?: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  reset(): void {
    this.state = {
      phase: 'work',
      workStartedAt: Date.now(),
      breakStartedAt: null,
      prelockStartedAt: null,
      pausedAt: null,
      pausedRemaining: 0,
    };
    this.emit('cycle:phase-changed', 'work');
    logger.info('Cycle reset');
  }
}
