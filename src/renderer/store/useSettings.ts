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
};

let currentSettings = initialSettings;
const listeners: Set<SettingsListener> = new Set();

const applySettings = async (partial: Partial<Settings>): Promise<Settings> => {
  const validation = await window.waveAPI.validateSettings(partial);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  const updated = await window.waveAPI.setSettings(partial);
  currentSettings = updated;
  listeners.forEach((cb) => cb(updated));
  return updated;
};

export const useSettings = () => {
  const [settings, setSettingsState] = useState<Settings>(currentSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.waveAPI.getSettings().then((loaded) => {
      currentSettings = loaded;
      setSettingsState(loaded);
      setLoading(false);
      listeners.forEach((cb) => cb(loaded));
    });
  }, []);

  const setSettings = useCallback(async (partial: Partial<Settings>) => {
    const updated = await applySettings(partial);
    setSettingsState(updated);
    return updated;
  }, []);

  useEffect(() => {
    const listener = (s: Settings) => setSettingsState(s);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { settings, setSettings, loading };
};

export const updateSettings = async (partial: Partial<Settings>) => {
  return applySettings(partial);
};

export const getSettings = (): Settings => currentSettings;

export const subscribe = (listener: SettingsListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
