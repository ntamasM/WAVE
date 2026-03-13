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
        excludedApps: {
          type: 'array',
          items: {
            type: 'string',
          },
          default: DEFAULT_SETTINGS.excludedApps || [],
        },
        excludedAppsViewMode: {
          type: 'string',
          enum: ['list', 'grid'],
          default: DEFAULT_SETTINGS.excludedAppsViewMode || 'list',
        },
        lastAppScan: {
          type: 'number',
          default: DEFAULT_SETTINGS.lastAppScan || 0,
        },
        appScanInterval: {
          type: 'number',
          default: DEFAULT_SETTINGS.appScanInterval || 30,
          minimum: 0,
          maximum: 30,
        },
        installedApps: {
          type: 'array',
          default: DEFAULT_SETTINGS.installedApps || [],
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
        preLockWarningMinutes: {
          type: 'number',
          default: DEFAULT_SETTINGS.preLockWarningMinutes ?? 5,
          minimum: 1,
          maximum: 30,
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
      excludedApps: this.store.get('excludedApps', DEFAULT_SETTINGS.excludedApps || []) as string[],
      excludedAppsViewMode: this.store.get('excludedAppsViewMode', DEFAULT_SETTINGS.excludedAppsViewMode || 'list') as
        | 'list'
        | 'grid',
      lastAppScan: this.store.get('lastAppScan', DEFAULT_SETTINGS.lastAppScan || 0) as number,
      appScanInterval: this.store.get('appScanInterval', DEFAULT_SETTINGS.appScanInterval || 30) as number,
      installedApps: this.store.get('installedApps', DEFAULT_SETTINGS.installedApps || []) as Array<{
        id: string;
        name: string;
        category: string;
        processNames: string[];
      }>,
      standUpEnabled: this.store.get('standUpEnabled', DEFAULT_SETTINGS.standUpEnabled ?? false) as boolean,
      standUpInterval: this.store.get('standUpInterval', DEFAULT_SETTINGS.standUpInterval ?? 30) as number,
      standUpPosition: this.store.get('standUpPosition', DEFAULT_SETTINGS.standUpPosition ?? 'center-center') as import('../types/settings.types').StandUpPosition,
      preLockWarningEnabled: this.store.get('preLockWarningEnabled', DEFAULT_SETTINGS.preLockWarningEnabled ?? false) as boolean,
      preLockWarningMinutes: this.store.get('preLockWarningMinutes', DEFAULT_SETTINGS.preLockWarningMinutes ?? 5) as number,
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
