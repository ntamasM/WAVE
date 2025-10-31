import { ipcMain } from 'electron';
import { SettingsStore } from './settings-store';
import { CycleManager } from './cycle-manager';
import { validateSettingsInput } from '../shared/ipc';
import { getAutoStart, setAutoStart } from './autostart';
import { Logger } from './logger';
import { app } from 'electron';

const logger = new Logger('ipc');

export function handleIPC(settingsStore: SettingsStore, cycleManager: CycleManager): void {
  /**
   * Settings endpoints
   */
  ipcMain.handle('settings:get', () => {
    return settingsStore.getSettings();
  });

  ipcMain.handle('settings:set', (_event, partialSettings) => {
    const validation = validateSettingsInput(partialSettings);
    if (!validation.valid) {
      throw new Error(`Settings validation failed: ${validation.errors.join(', ')}`);
    }

    const updated = settingsStore.setSettings(partialSettings);
    cycleManager.updateSettings(updated);

    // If autostart setting changed, update it
    if (partialSettings.startWithWindows !== undefined) {
      setAutoStart(partialSettings.startWithWindows);
    }

    logger.info('Settings updated via IPC');
    return updated;
  });

  ipcMain.handle('settings:validate', (_event, partialSettings) => {
    return validateSettingsInput(partialSettings);
  });

  /**
   * Cycle control endpoints
   */
  ipcMain.handle('cycle:status', () => {
    return cycleManager.getStatus();
  });

  ipcMain.handle('cycle:pause', () => {
    cycleManager.pause();
    logger.info('Cycle paused via IPC');
  });

  ipcMain.handle('cycle:resume', () => {
    cycleManager.resume();
    logger.info('Cycle resumed via IPC');
  });

  ipcMain.handle('cycle:lockNow', async () => {
    await cycleManager.lockNow();
    logger.info('Immediate lock triggered via IPC');
  });

  ipcMain.handle('cycle:reset', () => {
    cycleManager.reset();
    logger.info('Cycle reset via IPC');
  });

  /**
   * Lock window endpoints
   */
  ipcMain.on('lock:skip', () => {
    cycleManager.skipLock();
    logger.info('Lock skipped via IPC');
  });

  /**
   * Autostart endpoints
   */
  ipcMain.handle('autostart:get', () => {
    return getAutoStart();
  });

  ipcMain.handle('autostart:set', (_event, enabled) => {
    setAutoStart(enabled);
    logger.info(`Autostart set to ${enabled} via IPC`);
  });

  /**
   * App endpoints
   */
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });
}
