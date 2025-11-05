import Store from 'electron-store';
import { Settings, DEFAULT_SETTINGS } from '../shared/types';

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
