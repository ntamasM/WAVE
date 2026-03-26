import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { CycleStatus, CycleContextType, PhaseContextType } from '../../types/cycle.types';

const CycleContext = createContext<CycleContextType | undefined>(undefined);
const PhaseContext = createContext<PhaseContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [displayTime, setDisplayTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    let isMounted = true;

    refreshStatus();

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

    window.waveAPI.onPhaseChanged(() => {
      if (isMounted) {
        refreshStatus();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [refreshStatus]);

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

  const cycleValue = useMemo<CycleContextType>(
    () => ({ status, displayTime, isLoading, refreshStatus }),
    [status, displayTime, isLoading, refreshStatus]
  );

  const phaseValue = useMemo<PhaseContextType>(
    () => ({ phase: status?.phase ?? null, refreshStatus }),
    [status?.phase, refreshStatus]
  );

  return (
    <PhaseContext.Provider value={phaseValue}>
      <CycleContext.Provider value={cycleValue}>{children}</CycleContext.Provider>
    </PhaseContext.Provider>
  );
};

/** Full cycle context — re-renders every second (use for timer displays) */
export const useCycle = (): CycleContextType => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};

/** Phase-only context — re-renders only on phase transitions (use for controls) */
export const usePhase = (): PhaseContextType => {
  const context = useContext(PhaseContext);
  if (context === undefined) {
    throw new Error('usePhase must be used within a CycleProvider');
  }
  return context;
};
