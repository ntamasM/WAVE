import React, { useEffect, useState } from 'react';
import { formatCompactTime } from '../lib/format';
import type { CycleStatus } from '../../shared/types';
import { FaClock, FaPlay, FaPause, FaCoffee, FaExclamationTriangle } from 'react-icons/fa';

export const StatusCard: React.FC = () => {
  const [status, setStatus] = useState<CycleStatus | null>(null);

  useEffect(() => {
    // Load initial status
    window.focusLockAPI.getCycleStatus().then(setStatus);

    // Listen for updates
    window.focusLockAPI.onCycleUpdate((update) => {
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              ...update,
              endsAt: prev.endsAt,
            }
          : null
      );
    });
  }, []);

  if (!status) {
    return <div className="text-center py-8 text-bright-gray-500">Loading...</div>;
  }

  const phaseNames: Record<string, string> = {
    work: 'Working',
    break: 'On Break',
    paused: 'Paused',
    prelockPrompt: 'Break Due Soon',
  };

  const phaseDesc: Record<string, string> = {
    work: 'Focus time remaining before break',
    break: 'Break time remaining',
    paused: 'Cycle paused',
    prelockPrompt: 'Confirm break or continue working',
  };

  const phaseIcons: Record<string, React.ReactNode> = {
    work: <FaPlay className="inline-block" />,
    break: <FaCoffee className="inline-block" />,
    paused: <FaPause className="inline-block" />,
    prelockPrompt: <FaExclamationTriangle className="inline-block" />,
  };

  const getPhaseStyles = (phase: string) => {
    const styles = {
      work: {
        bg: 'bg-vista-blue-50 dark:bg-vista-blue-900/20 border-vista-blue-200 dark:border-vista-blue-700',
        iconColor: 'text-vista-blue-600 dark:text-vista-blue-400',
        textColor: 'text-vista-blue-700 dark:text-vista-blue-300',
        barColor: 'bg-vista-blue-500 dark:bg-vista-blue-600',
      },
      break: {
        bg: 'bg-bright-gray-100 dark:bg-bright-gray-800 border-bright-gray-300 dark:border-bright-gray-600',
        iconColor: 'text-bright-gray-600 dark:text-bright-gray-400',
        textColor: 'text-bright-gray-800 dark:text-bright-gray-200',
        barColor: 'bg-bright-gray-600 dark:bg-bright-gray-500',
      },
      prelockPrompt: {
        bg: 'bg-vista-blue-100 dark:bg-vista-blue-900/30 border-vista-blue-300 dark:border-vista-blue-600',
        iconColor: 'text-vista-blue-600 dark:text-vista-blue-400',
        textColor: 'text-vista-blue-800 dark:text-vista-blue-200',
        barColor: 'bg-vista-blue-400 dark:bg-vista-blue-500',
      },
      paused: {
        bg: 'bg-bright-gray-100 dark:bg-bright-gray-800 border-bright-gray-200 dark:border-bright-gray-600',
        iconColor: 'text-bright-gray-500 dark:text-bright-gray-400',
        textColor: 'text-bright-gray-700 dark:text-bright-gray-300',
        barColor: 'bg-bright-gray-400 dark:bg-bright-gray-500',
      },
    };
    return styles[phase as keyof typeof styles] || styles.work;
  };

  const phaseStyles = getPhaseStyles(status.phase);
  const percentage = status.totalMs > 0 ? (status.remainingMs / status.totalMs) * 100 : 0;

  return (
    <div className={`section-card p-6 border-2 ${phaseStyles.bg}`}>
      <h2 className={`section-subtitle mb-4 ${phaseStyles.textColor}`}>
        <FaClock className={phaseStyles.iconColor} />
        Status
      </h2>

      {/* Phase Display */}
      <div className="mb-6">
        <p className="text-sm text-bright-gray-600 dark:text-bright-gray-400 mb-1">{phaseDesc[status.phase]}</p>
        <p className={`text-4xl font-bold flex items-center gap-3 ${phaseStyles.textColor}`}>
          <span className={phaseStyles.iconColor}>{phaseIcons[status.phase]}</span>
          {phaseNames[status.phase]}
        </p>
      </div>

      {/* Timer Display */}
      <div className="mb-6 p-6 bg-white dark:bg-bright-gray-700 rounded-xl shadow-inner border border-bright-gray-200 dark:border-bright-gray-600 transition-colors duration-200">
        <p className={`text-center text-6xl font-mono font-bold ${phaseStyles.textColor}`}>
          {formatCompactTime(status.remainingMs)}
        </p>
        <p className="text-center text-sm text-bright-gray-500 dark:text-bright-gray-400 mt-2">Remaining</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-bright-gray-200 dark:bg-bright-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-300 ${phaseStyles.barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-bright-gray-500 dark:text-bright-gray-400 mt-2">
          {Math.round(percentage)}% complete
        </p>
      </div>

      {/* Time Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white dark:bg-bright-gray-700 p-4 rounded-xl shadow-sm border border-bright-gray-200 dark:border-bright-gray-600 transition-colors duration-200">
          <p className="text-bright-gray-600 dark:text-bright-gray-400 mb-1">Total Duration</p>
          <p className={`font-bold text-lg ${phaseStyles.textColor}`}>{formatCompactTime(status.totalMs)}</p>
        </div>
        <div className="bg-white dark:bg-bright-gray-700 p-4 rounded-xl shadow-sm border border-bright-gray-200 dark:border-bright-gray-600 transition-colors duration-200">
          <p className="text-bright-gray-600 dark:text-bright-gray-400 mb-1">Elapsed</p>
          <p className={`font-bold text-lg ${phaseStyles.textColor}`}>
            {formatCompactTime(status.totalMs - status.remainingMs)}
          </p>
        </div>
      </div>
    </div>
  );
};
