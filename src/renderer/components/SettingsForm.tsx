import React from 'react';
import { useSettings } from '../store/useSettings';
import { updateSettings } from '../store/useSettings';
import { useState } from 'react';

export interface ValidationError {
  field: string;
  message: string;
}

export const SettingsForm: React.FC = () => {
  const { settings } = useSettings();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  // Update localSettings when settings change (on load)
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (field: keyof typeof settings, value: any) => {
    setLocalSettings({
      ...localSettings,
      [field]: value,
    });
    setErrors(errors.filter((e) => e.field !== field));
  };

  const handleSave = async () => {
    try {
      setSaved(false);
      setErrors([]);

      const changes: Record<string, any> = {};
      Object.keys(localSettings).forEach((key) => {
        if (localSettings[key as keyof typeof settings] !== settings[key as keyof typeof settings]) {
          changes[key] = localSettings[key as keyof typeof settings];
        }
      });

      if (Object.keys(changes).length === 0) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        return;
      }

      await updateSettings(changes);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setErrors([{ field: 'general', message: errorMsg }]);
    }
  };

  const generalError = errors.find((e) => e.field === 'general');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {generalError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {generalError.message}
        </div>
      )}

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Settings saved successfully!
        </div>
      )}

      {/* Work Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Work Duration (hours)</label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="0.25"
            max="12"
            step="0.25"
            value={localSettings.workHours}
            onChange={(e) => handleChange('workHours', parseFloat(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-gray-600">
            Work for {Math.floor(localSettings.workHours)}h{Math.round((localSettings.workHours % 1) * 60)}m before lock
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Between 0.25 (15 min) and 12 hours</p>
      </div>

      {/* Lock Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Break Duration (minutes)</label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="60"
            value={localSettings.lockMinutes}
            onChange={(e) => handleChange('lockMinutes', parseInt(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-gray-600">
            Lock screen for {localSettings.lockMinutes} minute{localSettings.lockMinutes !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Between 1 and 60 minutes</p>
      </div>

      {/* Can Skip */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="canSkip"
          checked={localSettings.canSkip}
          onChange={(e) => handleChange('canSkip', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="canSkip" className="ml-3 block text-sm font-medium text-gray-700">
          Show prompt before lock (allows skipping once)
        </label>
      </div>

      {/* Start with Windows */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="startWithWindows"
          checked={localSettings.startWithWindows}
          onChange={(e) => handleChange('startWithWindows', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="startWithWindows" className="ml-3 block text-sm font-medium text-gray-700">
          Start FocusLock with Windows
        </label>
      </div>

      {/* Enable Logging */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="enableLogging"
          checked={localSettings.enableLogging}
          onChange={(e) => handleChange('enableLogging', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enableLogging" className="ml-3 block text-sm font-medium text-gray-700">
          Enable diagnostic logging
        </label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
