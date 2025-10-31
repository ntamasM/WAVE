import { join } from 'path';
import { is } from '@electron-toolkit/utils';

/**
 * Get the path to the resources directory.
 * In development: uses __dirname relative path to resources folder
 * In production: uses process.resourcesPath (installed app location)
 *
 * @param isDirname - The __dirname value from the calling module
 * @returns The absolute path to the resources directory
 */
export function getResourcesPath(isDirname: string): string {
  if (is.dev) {
    // In development, resources are relative to the compiled dist folder
    return join(isDirname, '../../resources');
  } else {
    // In production, resources are in the app's resources folder
    // process.resourcesPath points to the app.asar/resources directory
    return process.resourcesPath;
  }
}

/**
 * Get the path to a specific resource file.
 *
 * @param isDirname - The __dirname value from the calling module
 * @param relativePath - The relative path from the resources directory (e.g., 'FocusLock.png' or 'media/logo.png')
 * @returns The absolute path to the resource file
 */
export function getResourcePath(isDirname: string, relativePath: string): string {
  const resourcesPath = getResourcesPath(isDirname);
  return join(resourcesPath, relativePath);
}

/**
 * Get the path to the media resources directory.
 *
 * @param isDirname - The __dirname value from the calling module
 * @returns The absolute path to the media directory in resources
 */
export function getMediaResourcesPath(isDirname: string): string {
  return getResourcePath(isDirname, 'media');
}
