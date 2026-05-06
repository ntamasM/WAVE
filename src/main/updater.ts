import { Notification } from 'electron';
import { UpdateManager } from 'velopack';
import { Logger } from './logger';
import type { UpdateInfo } from 'velopack';

const logger = new Logger('updater');

export const UPDATE_URL = 'https://github.com/ntamasM/WAVE';

export function createUpdateManager(): UpdateManager {
  return new UpdateManager(UPDATE_URL);
}

export async function checkAndApplyUpdatesSilently(): Promise<void> {
  try {
    const um = createUpdateManager();
    const info: UpdateInfo | null = await um.checkForUpdatesAsync();
    if (!info) {
      logger.info('No updates available');
      return;
    }
    logger.info(`Update available: ${info.targetFullRelease?.version ?? 'unknown'}`);
    await um.downloadUpdateAsync(info);
    await um.waitExitThenApplyUpdate(info);
    logger.info('Update downloaded — will apply on next quit');
    new Notification({
      title: 'WAVE Update Ready',
      body: 'A new version has been downloaded and will install when you quit WAVE.',
    }).show();
  } catch (e) {
    logger.warn(`Background update check failed: ${String(e)}`);
  }
}
