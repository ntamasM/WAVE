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

  if (settings.standUpEnabled !== undefined && typeof settings.standUpEnabled !== 'boolean') {
    errors.push('standUpEnabled must be a boolean');
  }

  if (settings.standUpInterval !== undefined) {
    if (
      typeof settings.standUpInterval !== 'number' ||
      settings.standUpInterval < 1 ||
      settings.standUpInterval > 120
    ) {
      errors.push('standUpInterval must be between 1 and 120 minutes');
    }
  }

  const validPositions = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center-center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];
  if (settings.standUpPosition !== undefined && !validPositions.includes(settings.standUpPosition)) {
    errors.push(`standUpPosition must be one of: ${validPositions.join(', ')}`);
  }

  if (settings.preLockWarningEnabled !== undefined && typeof settings.preLockWarningEnabled !== 'boolean') {
    errors.push('preLockWarningEnabled must be a boolean');
  }

  if (settings.preLockReminders !== undefined) {
    if (!Array.isArray(settings.preLockReminders)) {
      errors.push('preLockReminders must be an array');
    } else if (settings.preLockReminders.length > 3) {
      errors.push('preLockReminders can have at most 3 entries');
    } else if (!settings.preLockReminders.every((v) => [1, 3, 5].includes(v))) {
      errors.push('preLockReminders values must be 1, 3, or 5');
    }
  }

  if (settings.preLockSkipEnabled !== undefined && typeof settings.preLockSkipEnabled !== 'boolean') {
    errors.push('preLockSkipEnabled must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
