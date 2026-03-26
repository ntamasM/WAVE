import React, { useState } from 'react';
import { FaPause, FaPlay, FaLock, FaRedo, FaClock, FaArrowUp, FaBell } from 'react-icons/fa';
import { showSuccess, showError, showInfo } from '../lib/toast';
import { usePhase } from '../context/CycleContext';
import { getErrorMessage } from '../../shared/errors';

export const Controls: React.FC = () => {
  const { phase, refreshStatus } = usePhase();
  const [isLoading, setIsLoading] = useState(false);

  const handlePauseResume = async () => {
    setIsLoading(true);
    try {
      if (phase === 'paused') {
        await window.waveAPI.resumeCycle();
        showSuccess('Cycle resumed');
      } else {
        await window.waveAPI.pauseCycle();
        showInfo('Cycle paused');
      }
      await refreshStatus();
    } catch (err) {
      showError(`Failed to ${phase === 'paused' ? 'resume' : 'pause'}: ${getErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockNow = async () => {
    setIsLoading(true);
    try {
      await window.waveAPI.lockNow();
      showInfo('Locking screen now...');
    } catch (err) {
      showError(`Failed to lock: ${getErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await window.waveAPI.resetCycle();
      showSuccess('Cycle reset successfully');
      await refreshStatus();
    } catch (err) {
      showError(`Failed to reset: ${getErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section-card p-6">
      <h2 className="section-subtitle mb-6">
        <FaClock className="icon-primary" />
        Controls
      </h2>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handlePauseResume}
          disabled={isLoading}
          className={`px-4 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            phase === 'paused'
              ? 'bg-vista-blue-500 hover:bg-vista-blue-600 dark:bg-vista-blue-600 dark:hover:bg-vista-blue-500 text-white'
              : 'bg-bright-gray-700 hover:bg-bright-gray-800 dark:bg-bright-gray-600 dark:hover:bg-bright-gray-500 text-white'
          }`}
        >
          {phase === 'paused' ? <FaPlay /> : <FaPause />}
          {isLoading ? 'Loading...' : phase === 'paused' ? 'Resume' : 'Pause'}
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

      {/* Test Controls */}
      <div className="mt-4 pt-4 border-t border-bright-gray-200 dark:border-bright-gray-700">
        <p className="text-xs text-secondary mb-3 font-medium uppercase tracking-wide">Test</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.waveAPI.testStandUp()}
            className="px-4 py-3 bg-vista-blue-100 hover:bg-vista-blue-200 dark:bg-vista-blue-900/30 dark:hover:bg-vista-blue-800/40 text-vista-blue-700 dark:text-vista-blue-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-vista-blue-200 dark:border-vista-blue-800"
          >
            <FaArrowUp />
            Stand Up
          </button>
          <button
            onClick={() => window.waveAPI.testPreLock()}
            className="px-4 py-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-800/40 text-amber-700 dark:text-amber-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-800"
          >
            <FaBell />
            Pre-Lock
          </button>
        </div>
      </div>
    </div>
  );
};
