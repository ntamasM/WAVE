import Store from 'electron-store'
import { Settings, DEFAULT_SETTINGS } from '../shared/types'

export class SettingsStore {
  private store: Store<any>

  constructor() {
    this.store = new Store({
      schema: {
        workHours: {
          type: 'number',
          default: DEFAULT_SETTINGS.workHours,
          minimum: 0.25,
          maximum: 12
        },
        lockMinutes: {
          type: 'number',
          default: DEFAULT_SETTINGS.lockMinutes,
          minimum: 1,
          maximum: 60
        },
        canSkip: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.canSkip
        },
        startWithWindows: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.startWithWindows
        },
        enableLogging: {
          type: 'boolean',
          default: DEFAULT_SETTINGS.enableLogging
        }
      },
      defaults: DEFAULT_SETTINGS,
      name: 'focuslock-settings'
    })
  }

  getSettings(): Settings {
    return {
      workHours: this.store.get('workHours') as number,
      lockMinutes: this.store.get('lockMinutes') as number,
      canSkip: this.store.get('canSkip') as boolean,
      startWithWindows: this.store.get('startWithWindows') as boolean,
      enableLogging: this.store.get('enableLogging') as boolean
    }
  }

  setSettings(settings: Partial<Settings>): Settings {
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        this.store.set(key, value)
      }
    })

    return this.getSettings()
  }

  getSetting<K extends keyof Settings>(key: K): Settings[K] {
    return this.store.get(key) as Settings[K]
  }

  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.store.set(key, value)
  }
}
