import fs from 'fs'
import path from 'path'

export class Logger {
  private context: string
  private logDir: string

  constructor(context: string) {
    this.context = context
    // Log to user data directory
    const app = require('electron').app
    this.logDir = path.join(app.getPath('userData'), 'logs')

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString()
  }

  private write(level: string, message: string): void {
    const timestamp = this.getTimestamp()
    const logMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`

    // Console output
    if (level === 'error') {
      console.error(logMessage)
    } else if (level === 'warn') {
      console.warn(logMessage)
    } else {
      console.log(logMessage)
    }

    // File output (daily rolling)
    try {
      const today = new Date().toISOString().split('T')[0]
      const logFile = path.join(this.logDir, `focuslock-${today}.log`)

      fs.appendFileSync(logFile, logMessage + '\n')

      // Clean up old logs (keep last 7 days)
      this.cleanOldLogs()
    } catch (err) {
      console.error('Failed to write to log file:', err)
    }
  }

  private cleanOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir)
      const now = Date.now()
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

      files.forEach((file) => {
        const filePath = path.join(this.logDir, file)
        const stats = fs.statSync(filePath)
        if (stats.mtime.getTime() < sevenDaysAgo) {
          fs.unlinkSync(filePath)
        }
      })
    } catch (err) {
      console.error('Failed to clean old logs:', err)
    }
  }

  info(message: string): void {
    this.write('info', message)
  }

  warn(message: string): void {
    this.write('warn', message)
  }

  error(message: string, err?: Error): void {
    this.write('error', err ? `${message}: ${err.message}` : message)
  }

  debug(message: string): void {
    this.write('debug', message)
  }
}
