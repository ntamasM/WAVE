import { Settings } from '../types/settings.types';

// Strict typing for IPC handlers and listeners
// Type definitions moved to src/types/ipc.types.ts
export * from '../types/ipc.types';

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

  if (settings.showSkipButton !== undefined && typeof settings.showSkipButton !== 'boolean') {
    errors.push('showSkipButton must be a boolean');
  }

  if (settings.startWithWindows !== undefined && typeof settings.startWithWindows !== 'boolean') {
    errors.push('startWithWindows must be a boolean');
  }

  if (settings.enableLogging !== undefined && typeof settings.enableLogging !== 'boolean') {
    errors.push('enableLogging must be a boolean');
  }

  if (settings.excludedApps !== undefined) {
    if (!Array.isArray(settings.excludedApps)) {
      errors.push('excludedApps must be an array');
    } else if (!settings.excludedApps.every((app) => typeof app === 'string')) {
      errors.push('excludedApps must be an array of strings');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
