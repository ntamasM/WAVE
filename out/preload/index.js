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
  // Lock window
  skipLock: () => electron.ipcRenderer.send("lock:skip"),
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
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
};
electron.contextBridge.exposeInMainWorld("focusLockAPI", api);
