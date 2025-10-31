import React, { useState, useEffect } from 'react';
import type { CycleStatus } from '../../shared/types';
import { FaPause, FaPlay, FaLock, FaRedo, FaClock, FaStepForward } from 'react-icons/fa';
import { showSuccess, showError, showInfo } from '../lib/toast';

export const Controls: React.FC = () => {
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.focusLockAPI.getCycleStatus().then(setStatus);

    window.focusLockAPI.onCycleUpdate((update) => {
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              ...update,
            }
          : null
      );
    });
  }, []);

  const handlePauseResume = async () => {
    setIsLoading(true);
    try {
      if (status?.phase === 'paused') {
        await window.focusLockAPI.resumeCycle();
        showSuccess('Cycle resumed');
      } else {
        await window.focusLockAPI.pauseCycle();
        showInfo('Cycle paused');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      showError(`Failed to ${status?.phase === 'paused' ? 'resume' : 'pause'}: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockNow = async () => {
    setIsLoading(true);
    try {
      await window.focusLockAPI.lockNow();
      showInfo('Locking screen now...');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      showError(`Failed to lock: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await window.focusLockAPI.resetCycle();
      showSuccess('Cycle reset successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      showError(`Failed to reset: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipBreak = async () => {
    setIsLoading(true);
    try {
      await window.focusLockAPI.skipBreak();
      showSuccess('Break skipped');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      showError(`Failed to skip break: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isPrelockPrompt = status?.phase === 'prelockPrompt';

  return (
    <div className="section-card p-6">
      <h2 className="section-subtitle mb-6">
        <FaClock className="icon-primary" />
        Controls
      </h2>

      {isPrelockPrompt && (
        <div className="mb-4 p-4 bg-vista-blue-50 dark:bg-vista-blue-900/30 border-2 border-vista-blue-400 dark:border-vista-blue-600 rounded-xl">
          <p className="text-sm font-semibold text-vista-blue-900 dark:text-vista-blue-200 mb-3 text-center">
            🔔 Break starting soon! You can skip this break once per cycle.
          </p>
          <button
            onClick={handleSkipBreak}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-vista-blue-600 hover:bg-vista-blue-700 dark:bg-vista-blue-700 dark:hover:bg-vista-blue-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
          >
            <FaStepForward />
            {isLoading ? 'Skipping...' : 'Skip This Break'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handlePauseResume}
          disabled={isLoading}
          className={`px-4 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            status?.phase === 'paused'
              ? 'bg-vista-blue-500 hover:bg-vista-blue-600 dark:bg-vista-blue-600 dark:hover:bg-vista-blue-500 text-white'
              : 'bg-bright-gray-700 hover:bg-bright-gray-800 dark:bg-bright-gray-600 dark:hover:bg-bright-gray-500 text-white'
          }`}
        >
          {status?.phase === 'paused' ? <FaPlay /> : <FaPause />}
          {isLoading ? 'Loading...' : status?.phase === 'paused' ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={handleLockNow}
          disabled={isLoading}
          className="px-4 py-4 bg-vista-blue-600 hover:bg-vista-blue-700 dark:bg-vista-blue-700 dark:hover:bg-vista-blue-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaLock />
          {isLoading ? 'Loading...' : 'Lock Now'}
        </button>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-4 py-4 bg-bright-gray-600 hover:bg-bright-gray-700 dark:bg-bright-gray-500 dark:hover:bg-bright-gray-400 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaRedo />
          {isLoading ? 'Loading...' : 'Reset'}
        </button>
      </div>
    </div>
  );
};
