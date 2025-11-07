import { useEffect, useState, useCallback } from 'react';
import type { Settings } from '../../types/settings.types';
import type { SettingsListener } from '../../types/store.types';

/**
 * Zustand-like store hook using React context
 * For simplicity, we use useState with a shared hook pattern
 */

const initialSettings: Settings = {
  workHours: 2.0,
  lockMinutes: 5,
  showSkipButton: true,
  startWithWindows: true,
  enableLogging: true,
  theme: 'light',
  excludedApps: [],
};

let currentSettings = initialSettings;
const listeners: Set<SettingsListener> = new Set();

export const useSettings = () => {
  const [settings, setSettingsState] = useState<Settings>(currentSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load settings from main process
    window.waveAPI.getSettings().then((loaded) => {
      currentSettings = loaded;
      setSettingsState(loaded);
      setLoading(false);
      listeners.forEach((cb) => cb(loaded));
    });
  }, []);

  const setSettings = useCallback(async (partial: Partial<Settings>) => {
    try {
      const validation = await window.waveAPI.validateSettings(partial);
      if (!validation.valid) {
        throw new Error(validation.errors.join('; '));
      }

      const updated = await window.waveAPI.setSettings(partial);
      currentSettings = updated;
      setSettingsState(updated);
      listeners.forEach((cb) => cb(updated));
      return updated;
    } catch (err) {
      console.error('Failed to set settings:', err);
      throw err;
    }
  }, []);

  // Subscribe to changes
  useEffect(() => {
    const listener = (s: Settings) => setSettingsState(s);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { settings, setSettings, loading };
};

// External setter for use in other modules
export const updateSettings = async (partial: Partial<Settings>) => {
  try {
    const validation = await window.waveAPI.validateSettings(partial);
    if (!validation.valid) {
      throw new Error(validation.errors.join('; '));
    }

    const updated = await window.waveAPI.setSettings(partial);
    currentSettings = updated;
    listeners.forEach((cb) => cb(updated));
    return updated;
  } catch (err) {
    console.error('Failed to update settings:', err);
    throw err;
  }
};

export const getSettings = (): Settings => currentSettings;

export const subscribe = (listener: SettingsListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
