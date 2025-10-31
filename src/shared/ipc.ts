import { Settings, CycleStatus, CycleUpdate } from './types';

// Strict typing for IPC handlers and listeners

export interface IPCHandlers {
  'settings:get': () => Promise<Settings>;
  'settings:set': (settings: Partial<Settings>) => Promise<Settings>;
  'settings:validate': (settings: Partial<Settings>) => Promise<{ valid: boolean; errors: string[] }>;
  'cycle:status': () => Promise<CycleStatus>;
  'cycle:pause': () => Promise<void>;
  'cycle:resume': () => Promise<void>;
  'cycle:lockNow': () => Promise<void>;
  'cycle:reset': () => Promise<void>;
  'autostart:get': () => Promise<boolean>;
  'autostart:set': (enabled: boolean) => Promise<void>;
  'app:getVersion': () => Promise<string>;
  'logo:getAvailable': () => Promise<string[]>;
  'logo:upload': () => Promise<{ success: boolean; filename?: string; error?: string }>;
  'logo:resolvePath': (path: string) => Promise<string>;
}

export interface IPCListeners {
  'cycle:update': (payload: CycleUpdate) => void;
  'cycle:phase-changed': (phase: string) => void;
  'window:close': () => void;
  'window:show': () => void;
}

export type IPCHandlerKeys = keyof IPCHandlers;
export type IPCListenerKeys = keyof IPCListeners;

export function validateSettingsInput(settings: Partial<Settings>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (settings.workHours !== undefined) {
    if (typeof settings.workHours !== 'number' || settings.workHours < 0.25 || settings.workHours > 12) {
      errors.push('Work hours must be between 0.25 and 12');
    }
  }

  if (settings.lockMinutes !== undefined) {
    if (typeof settings.lockMinutes !== 'number' || settings.lockMinutes < 1 || settings.lockMinutes > 60) {
      errors.push('Lock time must be between 1 and 60 minutes');
    }
  }

  if (settings.canSkip !== undefined && typeof settings.canSkip !== 'boolean') {
    errors.push('canSkip must be a boolean');
  }

  if (settings.startWithWindows !== undefined && typeof settings.startWithWindows !== 'boolean') {
    errors.push('startWithWindows must be a boolean');
  }

  if (settings.enableLogging !== undefined && typeof settings.enableLogging !== 'boolean') {
    errors.push('enableLogging must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
