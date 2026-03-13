import { BrowserWindow } from 'electron';
import { Settings } from '../types/settings.types';
import { CycleStatus, CycleState } from '../types/cycle.types';
import { LockWindow } from './lock-window';
import { Logger } from './logger';
import { AppMonitor } from './app-monitor';
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
  private mainWindow: BrowserWindow | null = null;
  private systemWasAsleep = false;
  private lockWindow: LockWindow;
  private preLockWindow: PreLockWindow;
  private preLockWarningFired = false;
  private appMonitor: AppMonitor | null = null;
  private wasAutoPaused = false; // Track if cycle was auto-paused due to app activity

  constructor(settings: Settings, mainWindow: BrowserWindow | null, appMonitor?: AppMonitor) {
    this.settings = settings;
    this.mainWindow = mainWindow;
    this.lockWindow = new LockWindow();
    this.preLockWindow = new PreLockWindow();
    this.appMonitor = appMonitor || null;
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
    this.preLockWarningFired = false;

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

    // Check if we need to auto-pause/resume based on excluded apps
    this.checkExcludedApps();

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
    const warningMinutes = this.settings.preLockWarningMinutes ?? 5;

    // Show pre-lock warning once when within the warning window
    if (warningEnabled && !this.preLockWarningFired && remainingMs > 0 && remainingMs <= warningMinutes * 60 * 1000) {
      this.preLockWarningFired = true;
      this.preLockWindow.show(warningMinutes);
      logger.info(`Pre-lock warning shown: ${warningMinutes}m before lock`);
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
      this.preLockWarningFired = false;
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
    this.preLockWarningFired = false;
    this.emit('cycle:phase-changed', 'work');

    logger.info('Work cycle restarted after skip');
  }

  closePreLockWarning(): void {
    this.preLockWindow.close();
  }

  private emit(channel: string, data?: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  reset(): void {
    this.preLockWindow.close();
    this.preLockWarningFired = false;
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

  /**
   * Check excluded apps and auto-pause/resume cycle accordingly
   */
  private checkExcludedApps(): void {
    if (!this.appMonitor || !this.settings.excludedApps || this.settings.excludedApps.length === 0) {
      return;
    }

    // Skip if we're in break phase (don't interrupt breaks)
    if (this.state.phase === 'break' || this.state.phase === 'locking') {
      return;
    }

    const shouldPause = this.appMonitor.shouldPauseCycle(this.settings.excludedApps);

    if (shouldPause && this.state.phase !== 'paused') {
      // Auto-pause the cycle
      logger.info('Auto-pausing cycle due to excluded app activity');
      this.wasAutoPaused = true;
      this.pause();
    } else if (!shouldPause && this.state.phase === 'paused' && this.wasAutoPaused) {
      // Auto-resume the cycle
      logger.info('Auto-resuming cycle as excluded app activity ended');
      this.wasAutoPaused = false;
      this.resume();
    }
  }
}
