import { Settings } from './settings.types';
import { CycleStatus, CycleUpdate } from './cycle.types';

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
  'apps:getAvailable': () => Promise<Array<{ id: string; name: string; category: string }>>;
  'apps:scan': () => Promise<Array<{ id: string; name: string; category: string }>>;
  'apps:getStates': () => Promise<
    Array<{ appId: string; isRunning: boolean; isInCall: boolean; isFullscreen: boolean }>
  >;
}

export interface IPCListeners {
  'cycle:update': (payload: CycleUpdate) => void;
  'cycle:phase-changed': (phase: string) => void;
  'window:close': () => void;
  'window:show': () => void;
}

export type IPCHandlerKeys = keyof IPCHandlers;
export type IPCListenerKeys = keyof IPCListeners;
