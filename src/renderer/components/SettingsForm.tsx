import React from 'react';
import { useSettings } from '../store/useSettings';
import { updateSettings } from '../store/useSettings';
import { useState } from 'react';
import type { Settings, StandUpPosition } from '../../types/settings.types';
import { getErrorMessage } from '../../shared/errors';
import {
  FaCog,
  FaLock,
  FaWindowMaximize,
  FaSave,
  FaFolder,
  FaMoon,
  FaSun,
  FaArrowUp,
  FaBell,
  FaSync,
  FaDownload,
} from 'react-icons/fa';
import { showSuccess, showError, showInfo } from '../lib/toast';
import { NumberInput } from './NumberInput';
import { Checkbox } from './Checkbox';

export const SettingsForm: React.FC = () => {
  const { settings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Separate state for hours and minutes
  const [workHours, setWorkHours] = useState(Math.floor(settings.workHours));
  const [workMinutes, setWorkMinutes] = useState(Math.round((settings.workHours % 1) * 60));

  // Update state
  const [appVersion, setAppVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'downloading' | 'ready' | 'error'>('idle');
  const [pendingUpdateInfo, setPendingUpdateInfo] = useState<unknown>(null);

  // Update localSettings when settings change (on load)
  React.useEffect(() => {
    setLocalSettings(settings);
    setWorkHours(Math.floor(settings.workHours));
    setWorkMinutes(Math.round((settings.workHours % 1) * 60));
  }, [settings]);

  React.useEffect(() => {
    window.waveAPI.getVersion().then(setAppVersion).catch(() => {});
  }, []);

  const handleCheckForUpdates = async () => {
    setUpdateStatus('checking');
    try {
      const info = await window.waveAPI.checkForUpdates();
      if (!info) {
        showInfo('WAVE is up to date!');
        setUpdateStatus('idle');
        return;
      }
      setUpdateStatus('downloading');
      await window.waveAPI.downloadUpdate(info);
      setPendingUpdateInfo(info);
      setUpdateStatus('ready');
      showSuccess('Update downloaded — click "Restart & Update" to install.');
    } catch (err) {
      showError(`Update check failed: ${getErrorMessage(err)}`);
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }
  };

  const handleApplyUpdate = async () => {
    try {
      await window.waveAPI.applyUpdate(pendingUpdateInfo);
    } catch (err) {
      showError(`Failed to apply update: ${getErrorMessage(err)}`);
      setUpdateStatus('idle');
    }
  };

  const handleChange = <K extends keyof Settings>(field: K, value: Settings[K]) => {
    setLocalSettings({
      ...localSettings,
      [field]: value,
    });
  };

  const handleWorkTimeChange = (hours: number, minutes: number) => {
    const totalHours = hours + minutes / 60;
    setWorkHours(hours);
    setWorkMinutes(minutes);
    setLocalSettings({
      ...localSettings,
      workHours: totalHours,
    });
  };

  const handleSave = async () => {
    try {
      const changes: Partial<Settings> = {};
      (Object.keys(localSettings) as Array<keyof Settings>).forEach((key) => {
        const localVal = localSettings[key];
        const savedVal = settings[key];

        // Deep compare arrays, shallow compare primitives
        if (Array.isArray(localVal) && Array.isArray(savedVal)) {
          if (localVal.length !== savedVal.length || localVal.some((v, i) => v !== savedVal[i])) {
            (changes as Record<string, unknown>)[key] = localVal;
          }
        } else if (typeof localVal === 'object' && localVal !== null) {
          // Skip complex objects (customization) unless they differ by reference
          if (localVal !== savedVal) {
            (changes as Record<string, unknown>)[key] = localVal;
          }
        } else if (localVal !== savedVal) {
          (changes as Record<string, unknown>)[key] = localVal;
        }
      });

      if (Object.keys(changes).length === 0) {
        showInfo('No changes to save');
        return;
      }

      await updateSettings(changes);
      showSuccess('Settings saved successfully!');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      showError(`Failed to save settings: ${errorMsg}`);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setWorkHours(Math.floor(settings.workHours));
    setWorkMinutes(Math.round((settings.workHours % 1) * 60));
    showInfo('Settings reset to saved values');
  };

  return (
    <div className="space-y-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-bright-gray-50 dark:bg-bright-gray-900 border-b border-bright-gray-200 dark:border-bright-gray-700 pb-4 -mx-6 px-6 pt-2 flex items-center justify-between gap-4">
        <div>
          <h2 className="section-title">
            <FaCog className="icon-primary" />
            Settings
          </h2>
          <p className="section-description">Manage your focus and break preferences to optimize your productivity.</p>
        </div>
        <div className="flex items-center gap-x-3 flex-shrink-0">
          <button type="button" onClick={handleReset} className="btn-secondary">
            Reset
          </button>
          <button onClick={handleSave} className="btn-primary">
            <FaSave className="-ml-0.5 h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Appearance Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              {localSettings.theme === 'dark' ? (
                <FaMoon className="icon-primary" />
              ) : (
                <FaSun className="icon-primary" />
              )}
              Appearance
            </h3>
            <p className="section-description">Customize the visual theme</p>
          </div>
          <div className="section-body">
            <div className="flex items-center justify-between">
              <div>
                <label className="form-label mb-0">Theme Mode</label>
                <p className="section-description">Choose between light and dark appearance</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('theme', 'light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    localSettings.theme === 'light'
                      ? 'border-vista-blue-600 bg-vista-blue-50 text-vista-blue-700 dark:bg-vista-blue-900 dark:text-vista-blue-300'
                      : 'border-bright-gray-300 dark:border-bright-gray-600 bg-white dark:bg-bright-gray-700 text-bright-gray-700 dark:text-bright-gray-300 hover:border-bright-gray-400 dark:hover:border-bright-gray-500'
                  }`}
                >
                  <FaSun />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('theme', 'dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    localSettings.theme === 'dark'
                      ? 'border-vista-blue-600 bg-vista-blue-50 text-vista-blue-700 dark:bg-vista-blue-900 dark:text-vista-blue-300'
                      : 'border-bright-gray-300 dark:border-bright-gray-600 bg-white dark:bg-bright-gray-700 text-bright-gray-700 dark:text-bright-gray-300 hover:border-bright-gray-400 dark:hover:border-bright-gray-500'
                  }`}
                >
                  <FaMoon />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lock Settings Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaLock className="icon-primary" />
              Lock Settings
            </h3>
            <p className="section-description">Configure work and break durations and lock behavior</p>
          </div>
          <div className="section-body space-y-6">
            {/* Work Duration */}
            <div>
              <label className="form-label">Work Duration</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <NumberInput
                    id="workHours"
                    value={workHours}
                    onChange={(hours) => handleWorkTimeChange(hours, workMinutes)}
                    min={0}
                    max={12}
                    label="hours"
                  />
                  <span className="text-sm text-primary font-medium">hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <NumberInput
                    id="workMinutes"
                    value={workMinutes}
                    onChange={(minutes) => handleWorkTimeChange(workHours, minutes)}
                    min={0}
                    max={59}
                    label="minutes"
                  />
                  <span className="text-sm text-primary font-medium">minutes</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-secondary">
                Work for{' '}
                <span className="font-semibold text-accent">
                  {workHours}h {workMinutes}m
                </span>{' '}
                before triggering a break
              </p>
              <p className="mt-1 text-xs text-bright-gray-500 dark:text-bright-gray-500">Maximum: 12 hours 0 minutes</p>
            </div>

            {/* Break Duration */}
            <div>
              <label htmlFor="lockMinutes" className="form-label">
                Break Duration
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <NumberInput
                    id="lockMinutes"
                    value={localSettings.lockMinutes}
                    onChange={(value) => handleChange('lockMinutes', value)}
                    min={1}
                    max={60}
                    label="minutes"
                  />
                  <span className="text-sm text-primary font-medium">min</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-bright-gray-600 dark:text-bright-gray-400">
                    Take a{' '}
                    <span className="font-semibold text-vista-blue-700 dark:text-vista-blue-400">
                      {localSettings.lockMinutes} minute
                    </span>{' '}
                    break to rest and recharge
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-bright-gray-500">Range: 1 to 60 minutes</p>
            </div>

            {/* Show Skip Button */}
            <div className="pt-4 border-t border-bright-gray-200 dark:border-bright-gray-700">
              <Checkbox
                id="showSkipButton"
                checked={localSettings.showSkipButton}
                onChange={(checked) => handleChange('showSkipButton', checked)}
                label="Show skip button"
                description="Display a skip button during breaks to allow ending the break early"
              />
            </div>
          </div>
        </div>

        {/* Pre-Lock Warning Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaBell className="icon-primary" />
              Pre-Lock Warning
            </h3>
            <p className="section-description">Get alerted before your screen locks</p>
          </div>
          <div className="section-body space-y-6">
            <Checkbox
              id="preLockWarningEnabled"
              checked={localSettings.preLockWarningEnabled ?? false}
              onChange={(checked) => handleChange('preLockWarningEnabled', checked)}
              label="Enable pre-lock warning"
              description="Show a notification before the lock screen activates"
            />
            {(localSettings.preLockWarningEnabled ?? false) && (
              <div className="space-y-5">
                {/* Reminders */}
                <div>
                  <label className="form-label">Reminders</label>
                  <p className="text-sm text-secondary mb-3">
                    Choose when to show reminders before the lock (up to 3)
                  </p>
                  <div className="flex items-center gap-3">
                    {[5, 3, 1].map((minutes) => {
                      const reminders = localSettings.preLockReminders ?? [5];
                      const isActive = reminders.includes(minutes);
                      return (
                        <button
                          key={minutes}
                          type="button"
                          onClick={() => {
                            const current = localSettings.preLockReminders ?? [5];
                            const updated = isActive
                              ? current.filter((m) => m !== minutes)
                              : [...current, minutes];
                            if (updated.length > 0) {
                              handleChange('preLockReminders', updated);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                            isActive
                              ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600'
                              : 'border-bright-gray-300 dark:border-bright-gray-600 bg-white dark:bg-bright-gray-700 text-bright-gray-500 dark:text-bright-gray-400 hover:border-bright-gray-400 dark:hover:border-bright-gray-500'
                          }`}
                        >
                          {minutes} min
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-bright-gray-500">
                    {(() => {
                      const reminders = [...(localSettings.preLockReminders ?? [5])].sort((a, b) => b - a);
                      return reminders.length === 1
                        ? `1 reminder: ${reminders[0]} min before lock`
                        : `${reminders.length} reminders: ${reminders.join(', ')} min before lock`;
                    })()}
                  </p>
                </div>

                {/* Skip Lock on last reminder */}
                <div className="pt-4 border-t border-bright-gray-200 dark:border-bright-gray-700">
                  <Checkbox
                    id="preLockSkipEnabled"
                    checked={localSettings.preLockSkipEnabled ?? false}
                    onChange={(checked) => handleChange('preLockSkipEnabled', checked)}
                    label="Show skip button on last reminder"
                    description="Adds a button to the final reminder that resets the work countdown"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stand Up Reminder Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaArrowUp className="icon-primary" />
              Stand Up Reminder
            </h3>
            <p className="section-description">Get reminded to stand up and stretch regularly</p>
          </div>
          <div className="section-body space-y-6">
            <Checkbox
              id="standUpEnabled"
              checked={localSettings.standUpEnabled ?? false}
              onChange={(checked) => handleChange('standUpEnabled', checked)}
              label="Enable stand up reminders"
              description="Show a reminder overlay in the app when it's time to stand up"
            />
            {(localSettings.standUpEnabled ?? false) && (
              <div className="space-y-5">
                {/* Interval */}
                <div>
                  <label htmlFor="standUpInterval" className="form-label">
                    Reminder Interval
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <NumberInput
                        id="standUpInterval"
                        value={localSettings.standUpInterval ?? 30}
                        onChange={(value) => handleChange('standUpInterval', value)}
                        min={1}
                        max={120}
                        label="minutes"
                      />
                      <span className="text-sm text-primary font-medium">min</span>
                    </div>
                    <p className="text-sm text-bright-gray-600 dark:text-bright-gray-400 flex-1">
                      Remind me every{' '}
                      <span className="font-semibold text-vista-blue-700 dark:text-vista-blue-400">
                        {localSettings.standUpInterval ?? 30} minutes
                      </span>{' '}
                      to stand up
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-bright-gray-500">Range: 1 to 120 minutes</p>
                </div>

                {/* Position picker */}
                <div>
                  <label className="form-label">Reminder Position</label>
                  <p className="text-sm text-secondary mb-3">Choose where the reminder appears on your screen</p>
                  {(() => {
                    const positions: { value: StandUpPosition; label: string }[] = [
                      { value: 'top-left', label: 'Top Left' },
                      { value: 'top-center', label: 'Top Center' },
                      { value: 'top-right', label: 'Top Right' },
                      { value: 'center-left', label: 'Center Left' },
                      { value: 'center-center', label: 'Center' },
                      { value: 'center-right', label: 'Center Right' },
                      { value: 'bottom-left', label: 'Bottom Left' },
                      { value: 'bottom-center', label: 'Bottom Center' },
                      { value: 'bottom-right', label: 'Bottom Right' },
                    ];
                    const current = (localSettings.standUpPosition ?? 'center-center') as StandUpPosition;
                    const currentLabel = positions.find((p) => p.value === current)?.label ?? 'Center';
                    return (
                      <div className="flex items-center gap-5">
                        {/* 3×3 grid */}
                        <div
                          className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-bright-gray-100 dark:bg-bright-gray-800 border border-bright-gray-200 dark:border-bright-gray-700"
                          style={{ width: 'fit-content' }}
                        >
                          {positions.map((pos) => {
                            const isSelected = current === pos.value;
                            return (
                              <button
                                key={pos.value}
                                type="button"
                                title={pos.label}
                                onClick={() => handleChange('standUpPosition', pos.value)}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-vista-blue-600 shadow-md'
                                    : 'bg-white dark:bg-bright-gray-700 hover:bg-vista-blue-100 dark:hover:bg-bright-gray-600 border border-bright-gray-200 dark:border-bright-gray-600'
                                }`}
                              >
                                <span
                                  className={`block w-2.5 h-2.5 rounded-full ${
                                    isSelected ? 'bg-white' : 'bg-bright-gray-400 dark:bg-bright-gray-500'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        {/* Selected label */}
                        <p className="text-sm text-secondary">
                          Position:{' '}
                          <span className="font-semibold text-vista-blue-700 dark:text-vista-blue-400">
                            {currentLabel}
                          </span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Integration Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaWindowMaximize className="icon-primary" />
              System Integration
            </h3>
            <p className="section-description">Configure system-level settings</p>
          </div>
          <div className="section-body space-y-4">
            {/* Start with Windows */}
            <Checkbox
              id="startWithWindows"
              checked={localSettings.startWithWindows}
              onChange={(checked) => handleChange('startWithWindows', checked)}
              label="Launch on Windows startup"
              description="Automatically start WAVE when Windows boots up"
            />

            {/* Enable Logging */}
            <Checkbox
              id="enableLogging"
              checked={localSettings.enableLogging}
              onChange={(checked) => handleChange('enableLogging', checked)}
              label="Enable diagnostic logging"
              description="Save logs for troubleshooting (7-day retention)"
            />

            {/* Open Logs Folder Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await window.waveAPI.openLogsFolder();
                    showSuccess('Logs folder opened');
                  } catch (err) {
                    const errorMsg = getErrorMessage(err);
                    showError(`Failed to open logs folder: ${errorMsg}`);
                  }
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <FaFolder className="h-4 w-4" />
                Open Logs Folder
              </button>
            </div>
          </div>
        </div>

        {/* Updates Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaDownload className="icon-primary" />
              Updates
            </h3>
            <p className="section-description">Keep WAVE up to date with the latest improvements</p>
          </div>
          <div className="section-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="form-label mb-0">Current Version</p>
                <p className="text-sm text-secondary">{appVersion || '—'}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-bright-gray-200 dark:border-bright-gray-700">
              {updateStatus === 'ready' ? (
                <button
                  type="button"
                  onClick={handleApplyUpdate}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaDownload className="h-4 w-4" />
                  Restart &amp; Update
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckForUpdates}
                  disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSync
                    className={`h-4 w-4 ${updateStatus === 'checking' || updateStatus === 'downloading' ? 'animate-spin' : ''}`}
                  />
                  {updateStatus === 'checking'
                    ? 'Checking...'
                    : updateStatus === 'downloading'
                      ? 'Downloading...'
                      : 'Check for Updates'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
