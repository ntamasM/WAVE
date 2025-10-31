import { ipcMain, BrowserWindow, shell, app, dialog } from 'electron';
import { SettingsStore } from './settings-store';
import { CycleManager } from './cycle-manager';
import { validateSettingsInput } from '../shared/ipc';
import { getAutoStart, setAutoStart } from './autostart';
import { Logger } from './logger';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

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

  /**
   * Window control endpoints
   */
  ipcMain.handle('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
    logger.info('Window minimized via IPC');
  });

  ipcMain.handle('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
    logger.info('Window maximize toggled via IPC');
  });

  ipcMain.handle('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
    logger.info('Window closed via IPC');
  });

  /**
   * External URL endpoint
   */
  ipcMain.handle('app:openExternal', async (_event, url: string) => {
    try {
      await shell.openExternal(url);
      logger.info(`Opened external URL: ${url}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to open external URL: ${url}`, new Error(errorMsg));
      throw error;
    }
  });

  /**
   * Open logs folder
   */
  ipcMain.handle('app:openLogsFolder', async () => {
    try {
      const logsPath = path.join(app.getPath('userData'), 'logs');
      await shell.openPath(logsPath);
      logger.info('Opened logs folder');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to open logs folder', new Error(errorMsg));
      throw error;
    }
  });

  /**
   * Skip break during prelock prompt
   */
  ipcMain.handle('cycle:skipBreak', () => {
    cycleManager.skipBreak();
    logger.info('Break skipped via IPC');
  });

  /**
   * Logo management endpoints
   */
  ipcMain.handle('logo:getAvailable', async () => {
    try {
      const mediaDir = path.join(app.getPath('userData'), 'media');

      // Ensure media directory exists
      if (!existsSync(mediaDir)) {
        await fs.mkdir(mediaDir, { recursive: true });
        return [];
      }

      const files = await fs.readdir(mediaDir);
      const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.svg', '.gif'].includes(ext);
      });

      // Return relative paths that can be used in the app
      return imageFiles.map((file) => `./${file}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get available media', new Error(errorMsg));
      return [];
    }
  });

  ipcMain.handle('logo:upload', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'gif'] }],
        title: 'Select Logo Image',
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false };
      }

      const sourcePath = result.filePaths[0];
      const fileName = path.basename(sourcePath);
      const mediaDir = path.join(app.getPath('userData'), 'media');

      // Ensure media directory exists
      if (!existsSync(mediaDir)) {
        await fs.mkdir(mediaDir, { recursive: true });
      }

      const destPath = path.join(mediaDir, fileName);

      // Copy the file
      await fs.copyFile(sourcePath, destPath);

      logger.info(`Logo uploaded: ${fileName}`);
      return { success: true, filename: `./${fileName}` };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to upload logo', new Error(errorMsg));
      return { success: false, error: errorMsg };
    }
  });

  ipcMain.handle('logo:resolvePath', (_, relativePath: string) => {
    try {
      logger.info(`Resolving logo path: ${relativePath}`);

      // Clean up the path (strip leading/trailing slashes and whitespace)
      const cleanPath = relativePath
        .trim()
        .replace(/^\.?\/+/, '')
        .replace(/\/+$/, '');

      // If it's an absolute URL or path, return as is
      if (
        relativePath.startsWith('http://') ||
        relativePath.startsWith('https://') ||
        relativePath.startsWith('media://')
      ) {
        logger.info(`Already absolute: ${relativePath}`);
        return relativePath;
      }

      // Return media:// protocol URL (the protocol handler will resolve the actual file)
      const resolved = `media://${cleanPath}`;
      logger.info(`Resolved ${relativePath} to ${resolved}`);
      return resolved;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to resolve logo path', new Error(errorMsg));
      return relativePath; // Return original path as fallback
    }
  });
}
