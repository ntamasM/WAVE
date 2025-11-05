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
}

export interface CycleStatus {
  phase: 'work' | 'break' | 'paused' | 'locking';
  endsAt: number | null;
  remainingMs: number;
  totalMs: number;
}

export interface CycleUpdate {
  phase: 'work' | 'break' | 'paused' | 'locking';
  remainingMs: number;
  totalMs: number;
}

export const DEFAULT_CUSTOMIZATION: CustomizationSettings = {
  backgroundGradient: {
    color1: '#73C8A9',
    color2: '#389477',
    color3: '#373B44',
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
};
