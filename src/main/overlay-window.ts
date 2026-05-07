import { BrowserWindow } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { getAppAssetPath } from './resources';
import type { OverlayWindowOptions } from '../types/window.types';

/**
 * Creates a frameless, transparent, always-on-top overlay BrowserWindow.
 * Shared factory for PreLockWindow and StandUpWindow.
 */
export function createOverlayWindow(dirname: string, options: OverlayWindowOptions): BrowserWindow {
  const iconPath = getAppAssetPath(dirname, 'Wave--icon.png');

  const win = new BrowserWindow({
    width: options.width,
    height: options.height,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    focusable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: join(dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    icon: iconPath,
    title: options.title,
  });

  win.setAlwaysOnTop(true, 'screen-saver', 1);

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?${options.queryParams}`);
  } else {
    win.loadURL(`file://${join(dirname, '../renderer/index.html')}?${options.queryParams}`);
  }

  return win;
}
