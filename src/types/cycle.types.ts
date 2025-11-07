export type CyclePhase = 'work' | 'break' | 'paused' | 'locking';

export interface CycleStatus {
  phase: CyclePhase;
  endsAt: number | null;
  remainingMs: number;
  totalMs: number;
}

export interface CycleUpdate {
  phase: CyclePhase;
  remainingMs: number;
  totalMs: number;
}

export interface CycleState {
  phase: CyclePhase;
  workStartedAt: number | null;
  breakStartedAt: number | null;
  pausedAt: number | null;
  pausedRemaining: number; // remaining ms when paused
}
