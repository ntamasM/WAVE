import React from 'react';
import { useCycle } from '../context/CycleContext';
import { FaPhone, FaExpand, FaCheckCircle } from 'react-icons/fa';

export const AppMonitorStatus: React.FC = () => {
  const { appStates, isAnyAppInCall, isAnyAppFullscreen } = useCycle();

  // Only show active apps (running and in call or fullscreen)
  const activeApps = appStates.filter((app) => app.isRunning && (app.isInCall || app.isFullscreen));

  if (activeApps.length === 0) {
    return null;
  }

  return (
    <div className="section-card p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-700">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-3 h-3 rounded-full animate-pulse ${
            isAnyAppInCall || isAnyAppFullscreen ? 'bg-teal-500' : 'bg-gray-400'
          }`}
        />
        <h3 className="text-sm font-semibold text-teal-800 dark:text-teal-200">
          {isAnyAppInCall || isAnyAppFullscreen ? 'Active Apps Detected' : 'Monitoring Apps'}
        </h3>
      </div>

      <div className="space-y-2">
        {activeApps.map((app) => (
          <div
            key={app.appId}
            className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-xs"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
              {app.appId.replace(/-/g, ' ')}
            </span>
            <div className="flex items-center gap-2">
              {app.isInCall && (
                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                  <FaPhone className="w-3 h-3" />
                  Call
                </span>
              )}
              {app.isFullscreen && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <FaExpand className="w-3 h-3" />
                  Fullscreen
                </span>
              )}
              {app.isRunning && !app.isInCall && !app.isFullscreen && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <FaCheckCircle className="w-3 h-3" />
                  Running
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {(isAnyAppInCall || isAnyAppFullscreen) && (
        <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-700">
          <p className="text-xs text-teal-700 dark:text-teal-300">⏸️ Timer paused due to active app detection</p>
        </div>
      )}
    </div>
  );
};
