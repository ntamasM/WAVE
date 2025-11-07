export interface MonitoredApp {
  id: string;
  name: string;
  processNames: string[];
  icon?: string;
  category: 'communication' | 'media' | 'browser';
}

export interface AppState {
  appId: string;
  isRunning: boolean;
  isInCall: boolean;
  isFullscreen: boolean;
}
