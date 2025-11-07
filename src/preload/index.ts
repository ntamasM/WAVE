import { contextBridge, ipcRenderer } from 'electron';
import type { IPCHandlers } from '../shared/ipc';

/**
 * Secure preload script that exposes only a minimal, typed API via contextBridge.
 * No direct node APIs or ipcRenderer are exposed to the renderer.
 */

const api = {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: Parameters<IPCHandlers['settings:set']>[0]) => ipcRenderer.invoke('settings:set', settings),
  validateSettings: (settings: Parameters<IPCHandlers['settings:validate']>[0]) =>
    ipcRenderer.invoke('settings:validate', settings),

  // Cycle control
  getCycleStatus: () => ipcRenderer.invoke('cycle:status'),
  pauseCycle: () => ipcRenderer.invoke('cycle:pause'),
  resumeCycle: () => ipcRenderer.invoke('cycle:resume'),
  lockNow: () => ipcRenderer.invoke('cycle:lockNow'),
  resetCycle: () => ipcRenderer.invoke('cycle:reset'),

  // Autostart
  getAutoStart: () => ipcRenderer.invoke('autostart:get'),
  setAutoStart: (enabled: boolean) => ipcRenderer.invoke('autostart:set', enabled),

  // App
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // External URLs
  openExternal: (url: string) => ipcRenderer.invoke('app:openExternal', url),

  // Logs
  openLogsFolder: () => ipcRenderer.invoke('app:openLogsFolder'),

  // Lock window
  skipLock: () => ipcRenderer.send('lock:skip'),

  // Logo management
  getAvailableLogos: () => ipcRenderer.invoke('logo:getAvailable'),
  uploadLogo: () => ipcRenderer.invoke('logo:upload'),
  resolveLogoPath: (path: string) => ipcRenderer.invoke('logo:resolvePath', path),

  // App monitoring
  getAvailableApps: () => ipcRenderer.invoke('apps:getAvailable'),
  scanInstalledApps: () => ipcRenderer.invoke('apps:scan'),
  getAppStates: () => ipcRenderer.invoke('apps:getStates'),

  // Event listeners
  onCycleUpdate: (callback: (payload: import('../shared/types').CycleUpdate) => void) => {
    ipcRenderer.on('cycle:update', (_event, payload) => callback(payload));
  },
  onPhaseChanged: (callback: (phase: string) => void) => {
    ipcRenderer.on('cycle:phase-changed', (_event, phase) => callback(phase));
  },
  onWindowClose: (callback: () => void) => {
    ipcRenderer.on('window:close', () => callback());
  },
  onWindowShow: (callback: () => void) => {
    ipcRenderer.on('window:show', () => callback());
  },
  // Lock window listeners
  onLockInit: (callback: (data: { lockDurationMs: number; showSkipButton: boolean; startTime: number }) => void) => {
    ipcRenderer.on('lock:init', (_event, data) => callback(data));
  },
  onLockUpdate: (callback: (data: { remainingMs: number }) => void) => {
    ipcRenderer.on('lock:update', (_event, data) => callback(data));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// Expose to renderer via contextBridge
contextBridge.exposeInMainWorld('waveAPI', api);

// TypeScript type support in renderer
declare global {
  interface Window {
    waveAPI: typeof api;
  }
}
