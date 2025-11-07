import React from 'react';
import { useSettings } from '../store/useSettings';
import { updateSettings } from '../store/useSettings';
import { useState, useEffect } from 'react';
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
} from 'react-icons/fa';
import { showSuccess, showError, showInfo } from '../lib/toast';
import { NumberInput } from './NumberInput';

export const SettingsForm: React.FC = () => {
  const { settings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [availableApps, setAvailableApps] = useState<Array<{ id: string; name: string; category: string }>>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Separate state for hours and minutes
  const [workHours, setWorkHours] = useState(Math.floor(settings.workHours));
  const [workMinutes, setWorkMinutes] = useState(Math.round((settings.workHours % 1) * 60));

  // Update localSettings when settings change (on load)
  React.useEffect(() => {
    setLocalSettings(settings);
    setWorkHours(Math.floor(settings.workHours));
    setWorkMinutes(Math.round((settings.workHours % 1) * 60));
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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="page-header">
        <h2 className="section-title">
          <FaCog className="icon-primary" />
          Settings
        </h2>
        <p className="section-description">Manage your focus and break preferences to optimize your productivity.</p>
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
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  id="showSkipButton"
                  checked={localSettings.showSkipButton}
                  onChange={(e) => handleChange('showSkipButton', e.target.checked)}
                  className="form-checkbox"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="showSkipButton" className="form-label cursor-pointer">
                  Show skip button
                </label>
                <p className="text-secondary">Display a skip button during breaks to allow ending the break early</p>
              </div>
            </div>

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
                        onClick={() => setViewMode('list')}
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
                        onClick={() => setViewMode('grid')}
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
                      className="btn-secondary flex items-center gap-2"
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
                  className={`max-h-80 overflow-y-auto ${
                    viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-2'
                  }`}
                >
                  {availableApps.map((app) => (
                    <div
                      key={app.id}
                      className={`relative flex items-start p-3 rounded border border-bright-gray-200 dark:border-bright-gray-700 hover:bg-bright-gray-50 dark:hover:bg-bright-gray-700 transition-colors ${
                        viewMode === 'grid' ? 'flex-col' : ''
                      }`}
                    >
                      <div className="flex h-6 items-center">
                        <input
                          type="checkbox"
                          id={`app-${app.id}`}
                          checked={(localSettings.excludedApps || []).includes(app.id)}
                          onChange={() => handleExcludedAppToggle(app.id)}
                          className="form-checkbox"
                        />
                      </div>
                      <div className={`text-sm leading-6 ${viewMode === 'grid' ? 'mt-2' : 'ml-3'}`}>
                        <label htmlFor={`app-${app.id}`} className="font-medium text-primary cursor-pointer">
                          {app.name}
                        </label>
                        <p className="text-xs text-secondary capitalize mt-1">
                          {app.category === 'communication' && 'Pauses during calls'}
                          {app.category === 'media' && 'Pauses during fullscreen playback'}
                          {app.category === 'browser' && 'Pauses during fullscreen videos'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  id="startWithWindows"
                  checked={localSettings.startWithWindows}
                  onChange={(e) => handleChange('startWithWindows', e.target.checked)}
                  className="form-checkbox"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="startWithWindows" className="form-label cursor-pointer">
                  Launch on Windows startup
                </label>
                <p className="text-secondary">Automatically start WAVE when Windows boots up</p>
              </div>
            </div>

            {/* Enable Logging */}
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  id="enableLogging"
                  checked={localSettings.enableLogging}
                  onChange={(e) => handleChange('enableLogging', e.target.checked)}
                  className="form-checkbox"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="enableLogging" className="form-label cursor-pointer">
                  Enable diagnostic logging
                </label>
                <p className="text-secondary">Save logs for troubleshooting (7-day retention)</p>
              </div>
            </div>

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

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-x-3 divider pt-6">
        <button
          type="button"
          onClick={() => {
            setLocalSettings(settings);
            setWorkHours(Math.floor(settings.workHours));
            setWorkMinutes(Math.round((settings.workHours % 1) * 60));
            showInfo('Settings reset to saved values');
          }}
          className="btn-secondary"
        >
          Reset
        </button>
        <button onClick={handleSave} className="btn-primary">
          <FaSave className="-ml-0.5 h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};
