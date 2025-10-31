import { join } from 'path';
import { is } from '@electron-toolkit/utils';

/**
 * Get the path to the app-media directory (private app assets like logos).
 * In development: uses __dirname relative path to assets/app-media folder
 * In production: uses process.resourcesPath/app-media (installed app location)
 *
 * @param isDirname - The __dirname value from the calling module
 * @returns The absolute path to the app-media directory
 */
export function getAppMediaPath(isDirname: string): string {
  if (is.dev) {
    // In development, assets are relative to the compiled dist folder
    return join(isDirname, '../../assets/app-media');
  } else {
    // In production, app-media is in the app's resources folder
    return join(process.resourcesPath, 'app-media');
  }
}

/**
 * Get the path to the media directory (user-accessible default media).
 * In development: uses __dirname relative path to assets/media folder
 * In production: uses process.resourcesPath/media (installed app location)
 *
 * @param isDirname - The __dirname value from the calling module
 * @returns The absolute path to the media directory
 */
export function getMediaPath(isDirname: string): string {
  if (is.dev) {
    // In development, assets are relative to the compiled dist folder
    return join(isDirname, '../../assets/media');
  } else {
    // In production, media is in the app's resources folder
    return join(process.resourcesPath, 'media');
  }
}

/**
 * Get the path to a specific app asset file (logo, icon, etc.).
 *
 * @param isDirname - The __dirname value from the calling module
 * @param relativePath - The relative path from the app-media directory (e.g., 'FocusLock.png' or 'FocusLock.svg')
 * @returns The absolute path to the asset file
 */
export function getAppAssetPath(isDirname: string, relativePath: string): string {
  const appMediaPath = getAppMediaPath(isDirname);
  return join(appMediaPath, relativePath);
}
