import Store from 'electron-store';
import { Settings, DEFAULT_SETTINGS } from '../types/settings.types';

export class SettingsStore {
  private store: Store<Settings>;

  constructor() {
    this.store = new Store({
      schema: {
        workHours: {
          type: 'number',
          default: DEFAULT_SETTINGS.workHours,
          minimum: 0.25,
          maximum: 12,
        },
        lockMinutes: {
          type: 'number',
          default: DEFAULT_SETTINGS.lockMinutes,
          minimum: 1,
          maximum: 60,
        },
        showSkipButton: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.showSkipButton,
        },
        startWithWindows: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.startWithWindows,
        },
        enableLogging: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.enableLogging,
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark'],
          default: DEFAULT_SETTINGS.theme,
        },
        customization: {
          type: 'object',
          default: DEFAULT_SETTINGS.customization,
        },
        standUpEnabled: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.standUpEnabled ?? false,
        },
        standUpInterval: {
          type: 'number',
          default: DEFAULT_SETTINGS.standUpInterval ?? 30,
          minimum: 1,
          maximum: 120,
        },
        standUpPosition: {
          type: 'string',
          enum: [
            'top-left', 'top-center', 'top-right',
            'center-left', 'center-center', 'center-right',
            'bottom-left', 'bottom-center', 'bottom-right',
          ],
          default: DEFAULT_SETTINGS.standUpPosition ?? 'center-center',
        },
        preLockWarningEnabled: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.preLockWarningEnabled ?? false,
        },
        preLockReminders: {
          type: 'array',
          items: { type: 'number', enum: [1, 3, 5] },
          default: DEFAULT_SETTINGS.preLockReminders ?? [5],
        },
        preLockSkipEnabled: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.preLockSkipEnabled ?? false,
        },
      },
      defaults: DEFAULT_SETTINGS,
      name: 'wave-settings',
    });
  }

  getSettings(): Settings {
    return {
      workHours: this.store.get('workHours') as number,
      lockMinutes: this.store.get('lockMinutes') as number,
      showSkipButton: this.store.get('showSkipButton', DEFAULT_SETTINGS.showSkipButton) as boolean,
      startWithWindows: this.store.get('startWithWindows') as boolean,
      enableLogging: this.store.get('enableLogging') as boolean,
      theme: (this.store.get('theme') as 'light' | 'dark') || 'light',
      customization: this.store.get('customization') || DEFAULT_SETTINGS.customization,
      standUpEnabled: this.store.get('standUpEnabled', DEFAULT_SETTINGS.standUpEnabled ?? false) as boolean,
      standUpInterval: this.store.get('standUpInterval', DEFAULT_SETTINGS.standUpInterval ?? 30) as number,
      standUpPosition: this.store.get('standUpPosition', DEFAULT_SETTINGS.standUpPosition ?? 'center-center') as import('../types/settings.types').StandUpPosition,
      preLockWarningEnabled: this.store.get('preLockWarningEnabled', DEFAULT_SETTINGS.preLockWarningEnabled ?? false) as boolean,
      preLockReminders: this.store.get('preLockReminders', DEFAULT_SETTINGS.preLockReminders ?? [5]) as number[],
      preLockSkipEnabled: this.store.get('preLockSkipEnabled', DEFAULT_SETTINGS.preLockSkipEnabled ?? false) as boolean,
    };
  }

  setSettings(settings: Partial<Settings>): Settings {
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        this.store.set(key, value);
      }
    });

    return this.getSettings();
  }

  getSetting<K extends keyof Settings>(key: K): Settings[K] {
    return this.store.get(key) as Settings[K];
  }

  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.store.set(key, value);
  }
}
