import { app } from 'electron'
import { Logger } from './logger'

const logger = new Logger('autostart')

export function setAutoStart(enabled: boolean): void {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true,
      args: []
    })
    logger.info(`Autostart set to ${enabled}`)
  } catch (err) {
    logger.error('Failed to set autostart', err as Error)
  }
}

export function getAutoStart(): boolean {
  try {
    return app.getLoginItemSettings().openAtLogin
  } catch (err) {
    logger.error('Failed to get autostart status', err as Error)
    return false
  }
}
