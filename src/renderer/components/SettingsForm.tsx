import React from 'react';
import { useSettings } from '../store/useSettings';
import { updateSettings } from '../store/useSettings';
import { useState, useEffect } from 'react';
import type { StandUpPosition } from '../../types/settings.types';
import {
  FaCog,
  FaClock,
  FaCoffee,
  FaWindowMaximize,
  FaSave,
  FaFolder,
  FaMoon,
  FaSun,
  FaBan,
  FaSync,
  FaList,
  FaTh,
  FaCheckSquare,
  FaSquare,
  FaArrowUp,
  FaBell,
} from 'react-icons/fa';
import { showSuccess, showError, showInfo } from '../lib/toast';
import { NumberInput } from './NumberInput';
import { Checkbox } from './Checkbox';

export const SettingsForm: React.FC = () => {
  const { settings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [availableApps, setAvailableApps] = useState<Array<{ id: string; name: string; category: string }>>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(settings.excludedAppsViewMode || 'list');

  // Separate state for hours and minutes
  const [workHours, setWorkHours] = useState(Math.floor(settings.workHours));
  const [workMinutes, setWorkMinutes] = useState(Math.round((settings.workHours % 1) * 60));

  // Update localSettings when settings change (on load)
  React.useEffect(() => {
    setLocalSettings(settings);
    setWorkHours(Math.floor(settings.workHours));
    setWorkMinutes(Math.round((settings.workHours % 1) * 60));
    setViewMode(settings.excludedAppsViewMode || 'list');
  }, [settings]);

  // Load available apps on mount
  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoadingApps(true);
        const apps = await window.waveAPI.getAvailableApps();
        setAvailableApps(apps);
      } catch (error) {
        showError('Failed to load available apps');
        console.error(error);
      } finally {
        setLoadingApps(false);
      }
    };

    loadApps();
  }, []);

  const handleChange = (field: keyof typeof settings, value: number | boolean | string | string[]) => {
    setLocalSettings({
      ...localSettings,
      [field]: value,
    });
  };

  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    handleChange('excludedAppsViewMode', mode);
  };

  const handleExcludedAppToggle = (appId: string) => {
    const currentExcluded = localSettings.excludedApps || [];
    const newExcluded = currentExcluded.includes(appId)
      ? currentExcluded.filter((id) => id !== appId)
      : [...currentExcluded, appId];

    handleChange('excludedApps', newExcluded);
  };

  const handleSelectAll = () => {
    const allAppIds = availableApps.map((app) => app.id);
    const currentExcluded = localSettings.excludedApps || [];
    const allSelected = allAppIds.every((id) => currentExcluded.includes(id));

    if (allSelected) {
      // Deselect all
      handleChange('excludedApps', []);
    } else {
      // Select all
      handleChange('excludedApps', allAppIds);
    }
  };

  const handleRefreshApps = async () => {
    try {
      setLoadingApps(true);
      showInfo('Scanning for installed applications...');
      const apps = await window.waveAPI.scanInstalledApps();
      setAvailableApps(apps);
      showSuccess(`Found ${apps.length} installed applications`);
    } catch (error) {
      showError('Failed to scan for apps');
      console.error(error);
    } finally {
      setLoadingApps(false);
    }
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
      const changes: Record<string, number | boolean | string | string[]> = {};
      Object.keys(localSettings).forEach((key) => {
        if (localSettings[key as keyof typeof settings] !== settings[key as keyof typeof settings]) {
          changes[key] = localSettings[key as keyof typeof settings] as number | boolean | string | string[];
        }
      });

      if (Object.keys(changes).length === 0) {
        showInfo('No changes to save');
        return;
      }

      await updateSettings(changes);
      showSuccess('Settings saved successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      showError(`Failed to save settings: ${errorMsg}`);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setWorkHours(Math.floor(settings.workHours));
    setWorkMinutes(Math.round((settings.workHours % 1) * 60));
    setViewMode(settings.excludedAppsViewMode || 'list');
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

        {/* Time Configuration Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaClock className="icon-primary" />
              Time Configuration
            </h3>
            <p className="section-description">Set your work and break durations</p>
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
          </div>
        </div>

        {/* Behavior Preferences Section */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-subtitle">
              <FaCoffee className="icon-primary" />
              Behavior Preferences
            </h3>
            <p className="section-description">Customize how breaks work</p>
          </div>
          <div className="section-body space-y-4">
            {/* Show Skip Button */}
            <Checkbox
              id="showSkipButton"
              checked={localSettings.showSkipButton}
              onChange={(checked) => handleChange('showSkipButton', checked)}
              label="Show skip button"
              description="Display a skip button during breaks to allow ending the break early"
            />

            {/* Excluded Applications */}
            <div className="pt-4 border-t border-bright-gray-200 dark:border-bright-gray-700">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="form-label flex items-center gap-2 mb-1">
                      <FaBan className="text-vista-blue-600 dark:text-vista-blue-400" />
                      Excluded Applications
                    </h4>
                    <p className="text-secondary text-sm">
                      WAVE will automatically pause when you&apos;re in a call or watching videos fullscreen in these
                      apps
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Toggle Buttons */}
                    <div className="flex bg-bright-gray-100 dark:bg-bright-gray-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleViewModeChange('list')}
                        className={`p-2 rounded transition-colors ${
                          viewMode === 'list'
                            ? 'bg-white dark:bg-bright-gray-700 text-vista-blue-600 dark:text-vista-blue-400 shadow-sm'
                            : 'text-bright-gray-600 dark:text-bright-gray-400 hover:text-vista-blue-600 dark:hover:text-vista-blue-400'
                        }`}
                        title="List view"
                      >
                        <FaList className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewModeChange('grid')}
                        className={`p-2 rounded transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-white dark:bg-bright-gray-700 text-vista-blue-600 dark:text-vista-blue-400 shadow-sm'
                            : 'text-bright-gray-600 dark:text-bright-gray-400 hover:text-vista-blue-600 dark:hover:text-vista-blue-400'
                        }`}
                        title="Grid view"
                      >
                        <FaTh className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Select All Button */}
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      disabled={loadingApps || availableApps.length === 0}
                      className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                      title={
                        availableApps.length > 0 &&
                        availableApps.every((app) => (localSettings.excludedApps || []).includes(app.id))
                          ? 'Deselect all'
                          : 'Select all'
                      }
                    >
                      {availableApps.length > 0 &&
                      availableApps.every((app) => (localSettings.excludedApps || []).includes(app.id)) ? (
                        <>
                          <FaSquare className="h-4 w-4" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <FaCheckSquare className="h-4 w-4" />
                          Select All
                        </>
                      )}
                    </button>

                    {/* Refresh Button */}
                    <button
                      type="button"
                      onClick={handleRefreshApps}
                      disabled={loadingApps}
                      className="btn-secondary flex items-center gap-2"
                      title="Scan for newly installed applications"
                    >
                      <FaSync className={`h-4 w-4 ${loadingApps ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* App Scan Interval Setting */}
              <div className="mb-4 p-4 bg-bright-gray-50 dark:bg-bright-gray-800 rounded-lg border border-bright-gray-200 dark:border-bright-gray-700">
                <label htmlFor="appScanInterval" className="form-label mb-2">
                  Automatic App Scan Interval
                </label>
                <div className="flex items-center gap-4">
                  <select
                    id="appScanInterval"
                    value={localSettings.appScanInterval ?? 30}
                    onChange={(e) => handleChange('appScanInterval', parseInt(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-bright-gray-300 dark:border-bright-gray-600 bg-white dark:bg-bright-gray-700 text-bright-gray-900 dark:text-bright-gray-100 focus:ring-2 focus:ring-vista-blue-500 focus:border-transparent"
                  >
                    <option value="0">Disabled (Manual only)</option>
                    <option value="10">Every 10 days</option>
                    <option value="15">Every 15 days</option>
                    <option value="20">Every 20 days</option>
                    <option value="25">Every 25 days</option>
                    <option value="30">Every 30 days</option>
                  </select>
                  <p className="text-sm text-secondary flex-1">
                    {localSettings.appScanInterval === 0
                      ? 'Automatic scanning is disabled. Apps will only be scanned when you click the Refresh button.'
                      : `WAVE will automatically scan for new applications every ${localSettings.appScanInterval} days.`}
                  </p>
                </div>
                {localSettings.lastAppScan && localSettings.lastAppScan > 0 && (
                  <p className="mt-2 text-xs text-bright-gray-500 dark:text-bright-gray-500">
                    Last scanned: {new Date(localSettings.lastAppScan).toLocaleDateString()} at{' '}
                    {new Date(localSettings.lastAppScan).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {loadingApps ? (
                <div className="text-center py-4">
                  <p className="text-secondary">Scanning for installed applications...</p>
                </div>
              ) : availableApps.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-secondary">
                    No monitored applications found. Click &quot;Refresh&quot; to scan for installed apps.
                  </p>
                </div>
              ) : (
                <div
                  className={`max-h-80 overflow-y-auto p-5 rounded border border-bright-gray-200 dark:border-bright-gray-700 ${
                    viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-2'
                  }`}
                >
                  {availableApps.map((app) => (
                    <div
                      key={app.id}
                      className={`p-3 rounded border border-bright-gray-200 dark:border-bright-gray-700 hover:bg-bright-gray-50 dark:hover:bg-bright-gray-700 transition-colors ${
                        viewMode === 'grid' ? '' : ''
                      }`}
                    >
                      <Checkbox
                        id={`app-${app.id}`}
                        checked={(localSettings.excludedApps || []).includes(app.id)}
                        onChange={() => handleExcludedAppToggle(app.id)}
                        label={app.name}
                        description={
                          app.category === 'communication'
                            ? 'Pauses during calls'
                            : app.category === 'media'
                              ? 'Pauses during fullscreen playback'
                              : app.category === 'browser'
                                ? 'Pauses during fullscreen videos'
                                : ''
                        }
                        // className={viewMode === 'grid' ? 'flex-col' : ''}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              <div>
                <label htmlFor="preLockWarningMinutes" className="form-label">
                  Warning Time
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <NumberInput
                      id="preLockWarningMinutes"
                      value={localSettings.preLockWarningMinutes ?? 5}
                      onChange={(value) => handleChange('preLockWarningMinutes', value)}
                      min={1}
                      max={30}
                      label="minutes"
                    />
                    <span className="text-sm text-primary font-medium">min</span>
                  </div>
                  <p className="text-sm text-bright-gray-600 dark:text-bright-gray-400 flex-1">
                    Warn me{' '}
                    <span className="font-semibold text-vista-blue-700 dark:text-vista-blue-400">
                      {localSettings.preLockWarningMinutes ?? 5} minute
                      {(localSettings.preLockWarningMinutes ?? 5) !== 1 ? 's' : ''}
                    </span>{' '}
                    before the screen locks
                  </p>
                </div>
                <p className="mt-2 text-xs text-bright-gray-500">Range: 1 to 30 minutes</p>
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
                    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
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
      </div>
    </div>
  );
};
