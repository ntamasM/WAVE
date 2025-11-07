import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { CycleStatus } from '../../types/cycle.types';
import type { AppState } from '../../types/app-monitor.types';

interface CycleContextType {
  status: CycleStatus | null;
  displayTime: number;
  isLoading: boolean;
  appStates: AppState[];
  isAnyAppInCall: boolean;
  isAnyAppFullscreen: boolean;
  refreshStatus: () => Promise<void>;
  refreshAppStates: () => Promise<void>;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [displayTime, setDisplayTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [appStates, setAppStates] = useState<AppState[]>([]);
  const [isAnyAppInCall, setIsAnyAppInCall] = useState<boolean>(false);
  const [isAnyAppFullscreen, setIsAnyAppFullscreen] = useState<boolean>(false);

  // Derived state for quick checks and auto pause/resume
  useEffect(() => {
    const anyInCall = appStates.some((app) => app.isInCall);
    const anyFullscreen = appStates.some((app) => app.isFullscreen);

    setIsAnyAppInCall(anyInCall);
    setIsAnyAppFullscreen(anyFullscreen);

    // Auto pause/resume based on app states
    const shouldPause = anyInCall || anyFullscreen;

    if (status) {
      if (shouldPause && status.phase !== 'paused') {
        // Pause the cycle
        console.log('[CycleContext] Auto-pausing cycle due to app activity');
        window.waveAPI.pauseCycle().catch((error) => {
          console.error('[CycleContext] Failed to auto-pause:', error);
        });
      } else if (!shouldPause && status.phase === 'paused') {
        // Resume the cycle
        console.log('[CycleContext] Auto-resuming cycle - no active apps detected');
        window.waveAPI.resumeCycle().catch((error) => {
          console.error('[CycleContext] Failed to auto-resume:', error);
        });
      }
    }
  }, [appStates, status]);

  // Function to refresh status from main process
  const refreshStatus = useCallback(async () => {
    try {
      const updatedStatus = await window.waveAPI.getCycleStatus();
      setStatus(updatedStatus);
      setDisplayTime(updatedStatus.remainingMs);
      setIsLoading(false);
    } catch (error) {
      console.error('[CycleContext] Error refreshing status:', error);
    }
  }, []);

  // Function to refresh app states
  const refreshAppStates = useCallback(async () => {
    try {
      const states = await window.waveAPI.getAppStates();
      setAppStates(states);
    } catch (error) {
      console.error('[CycleContext] Error refreshing app states:', error);
    }
  }, []);

  // Initialize and set up listeners
  useEffect(() => {
    let isMounted = true;

    // Load initial status and app states
    refreshStatus();
    refreshAppStates();

    // Listen for cycle updates (every second from main process)
    window.waveAPI.onCycleUpdate((update) => {
      if (isMounted) {
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                phase: update.phase,
                remainingMs: update.remainingMs,
                totalMs: update.totalMs,
              }
            : null
        );
        setDisplayTime(update.remainingMs);
      }
    });

    // Listen for phase changes (work/break/paused transitions)
    window.waveAPI.onPhaseChanged(() => {
      if (isMounted) {
        refreshStatus();
        refreshAppStates(); // Also refresh app states on phase changes
      }
    });

    return () => {
      isMounted = false;
    };
  }, [refreshStatus, refreshAppStates]);

  // Poll app states periodically (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAppStates();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshAppStates]);

  // Client-side countdown for smooth display (only when not paused)
  useEffect(() => {
    if (!status || status.phase === 'paused') {
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [status?.phase]);

  const value: CycleContextType = {
    status,
    displayTime,
    isLoading,
    appStates,
    isAnyAppInCall,
    isAnyAppFullscreen,
    refreshStatus,
    refreshAppStates,
  };

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
};

// Custom hook to use the cycle context
export const useCycle = (): CycleContextType => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};
