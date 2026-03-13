"use strict";
const electron = require("electron");
const api = {
  // Settings
  getSettings: () => electron.ipcRenderer.invoke("settings:get"),
  setSettings: (settings) => electron.ipcRenderer.invoke("settings:set", settings),
  validateSettings: (settings) => electron.ipcRenderer.invoke("settings:validate", settings),
  // Cycle control
  getCycleStatus: () => electron.ipcRenderer.invoke("cycle:status"),
  pauseCycle: () => electron.ipcRenderer.invoke("cycle:pause"),
  resumeCycle: () => electron.ipcRenderer.invoke("cycle:resume"),
  lockNow: () => electron.ipcRenderer.invoke("cycle:lockNow"),
  resetCycle: () => electron.ipcRenderer.invoke("cycle:reset"),
  // Autostart
  getAutoStart: () => electron.ipcRenderer.invoke("autostart:get"),
  setAutoStart: (enabled) => electron.ipcRenderer.invoke("autostart:set", enabled),
  // App
  getVersion: () => electron.ipcRenderer.invoke("app:getVersion"),
  // Window controls
  minimizeWindow: () => electron.ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => electron.ipcRenderer.invoke("window:maximize"),
  closeWindow: () => electron.ipcRenderer.invoke("window:close"),
  // External URLs
  openExternal: (url) => electron.ipcRenderer.invoke("app:openExternal", url),
  // Logs
  openLogsFolder: () => electron.ipcRenderer.invoke("app:openLogsFolder"),
  // Lock window
  skipLock: () => electron.ipcRenderer.send("lock:skip"),
  // Logo management
  getAvailableLogos: () => electron.ipcRenderer.invoke("logo:getAvailable"),
  uploadLogo: () => electron.ipcRenderer.invoke("logo:upload"),
  resolveLogoPath: (path) => electron.ipcRenderer.invoke("logo:resolvePath", path),
  // App monitoring
  getAvailableApps: () => electron.ipcRenderer.invoke("apps:getAvailable"),
  scanInstalledApps: () => electron.ipcRenderer.invoke("apps:scan"),
  getAppStates: () => electron.ipcRenderer.invoke("apps:getStates"),
  // Event listeners
  onCycleUpdate: (callback) => {
    electron.ipcRenderer.on("cycle:update", (_event, payload) => callback(payload));
  },
  onPhaseChanged: (callback) => {
    electron.ipcRenderer.on("cycle:phase-changed", (_event, phase) => callback(phase));
  },
  onWindowClose: (callback) => {
    electron.ipcRenderer.on("window:close", () => callback());
  },
  onWindowShow: (callback) => {
    electron.ipcRenderer.on("window:show", () => callback());
  },
  // Lock window listeners
  onLockInit: (callback) => {
    electron.ipcRenderer.on("lock:init", (_event, data) => callback(data));
  },
  onLockUpdate: (callback) => {
    electron.ipcRenderer.on("lock:update", (_event, data) => callback(data));
  },
  // Stand up reminder
  dismissStandUp: () => electron.ipcRenderer.send("standup:dismiss"),
  // Pre-lock warning
  dismissPreLock: () => electron.ipcRenderer.send("prelock:dismiss"),
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
};
electron.contextBridge.exposeInMainWorld("waveAPI", api);
