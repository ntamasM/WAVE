export type StandUpPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center-center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface CustomizationSettings {
  backgroundGradient: {
    color1: string;
    color2: string;
    color3: string;
  };
  breakTitle: {
    text: string;
    color: string;
  };
  breakSubtitle: {
    text: string;
    color: string;
  };
  logoUrl: string;
  skipButton: {
    text: string;
    textColor: string;
    backgroundColor: string;
  };
  timerColor: string;
  progressBarColor: string;
}

export interface Settings {
  workHours: number;
  lockMinutes: number;
  showSkipButton: boolean;
  startWithWindows: boolean;
  enableLogging: boolean;
  theme?: 'light' | 'dark';
  customization?: CustomizationSettings;
  standUpEnabled?: boolean; // Whether stand up reminders are enabled
  standUpInterval?: number; // Minutes between stand up reminders (1-120)
  standUpPosition?: StandUpPosition; // Position of the stand up reminder window
  preLockWarningEnabled?: boolean; // Whether to show a warning before the lock screen
  preLockReminders?: number[]; // Minutes before lock for each reminder (up to 3, values: 1, 3, or 5)
  preLockSkipEnabled?: boolean; // Whether the last reminder shows a "Skip Lock" button
}

export const DEFAULT_CUSTOMIZATION: CustomizationSettings = {
  backgroundGradient: {
    color1: '#41AE98',
    color2: '#346B60',
    color3: '#272727',
  },
  breakTitle: {
    text: 'Break Time',
    color: '#FFFFFF',
  },
  breakSubtitle: {
    text: 'Time to rest your eyes and stretch',
    color: '#FFFFFF',
  },
  logoUrl: './Wave--icon.png',
  skipButton: {
    text: 'Skip Break',
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  timerColor: '#FFFFFF',
  progressBarColor: '#60A5FA',
};

export const DEFAULT_SETTINGS: Settings = {
  workHours: 2.0,
  lockMinutes: 5,
  showSkipButton: true,
  startWithWindows: false,
  enableLogging: false,
  theme: 'light',
  customization: DEFAULT_CUSTOMIZATION,
  standUpEnabled: false,
  standUpInterval: 30, // Default to 30 minutes
  standUpPosition: 'center-center',
  preLockWarningEnabled: false,
  preLockReminders: [5],
  preLockSkipEnabled: false,
};
