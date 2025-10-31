export interface Settings {
  workHours: number;
  lockMinutes: number;
  canSkip: boolean;
  startWithWindows: boolean;
  enableLogging: boolean;
}

export interface CycleStatus {
  phase: 'work' | 'break' | 'paused' | 'prelockPrompt' | 'locking';
  endsAt: number | null;
  remainingMs: number;
  totalMs: number;
}

export interface CycleUpdate {
  phase: 'work' | 'break' | 'paused' | 'prelockPrompt' | 'locking';
  remainingMs: number;
  totalMs: number;
}

export const DEFAULT_SETTINGS: Settings = {
  workHours: 2.0,
  lockMinutes: 5,
  canSkip: true,
  startWithWindows: true,
  enableLogging: true,
};

export const PRELOCK_PROMPT_DURATION_MS = 30000; // 30 seconds
