import { app } from 'electron';
import { appendFile, readdir, stat, unlink, mkdir, access } from 'fs/promises';
import path from 'path';
import type { LogLevel } from '../types/logger.types';

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export class Logger {
  private context: string;
  private logDir: string;
  private static lastCleanup = 0;
  private writeQueue: string[] = [];
  private flushing = false;
  private dirReady: Promise<void>;

  constructor(context: string) {
    this.context = context;
    this.logDir = path.join(app.getPath('userData'), 'logs');

    // Ensure log directory exists asynchronously
    this.dirReady = access(this.logDir).catch(() =>
      mkdir(this.logDir, { recursive: true })
    ).then(() => {}).catch((err) =>
      console.error('Failed to create log directory:', err)
    );
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private write(level: LogLevel, message: string): void {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;

    // Console output (non-blocking)
    if (level === 'error') {
      console.error(logMessage);
    } else if (level === 'warn') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }

    // Queue for async file write
    this.writeQueue.push(logMessage);
    this.flush();

    // Clean up old logs periodically
    const now = Date.now();
    if (now - Logger.lastCleanup > CLEANUP_INTERVAL_MS) {
      Logger.lastCleanup = now;
      this.cleanOldLogs();
    }
  }

  private async flush(): Promise<void> {
    if (this.flushing || this.writeQueue.length === 0) return;
    this.flushing = true;

    try {
      await this.dirReady;
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `wave-${today}.log`);

      // Drain the queue in a single write
      const batch = this.writeQueue.splice(0).join('\n') + '\n';
      await appendFile(logFile, batch);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    } finally {
      this.flushing = false;
      // If more messages arrived during flush, flush again
      if (this.writeQueue.length > 0) {
        this.flush();
      }
    }
  }

  private async cleanOldLogs(): Promise<void> {
    try {
      const files = await readdir(this.logDir);
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.logDir, file);
        const stats = await stat(filePath);
        if (stats.mtime.getTime() < sevenDaysAgo) {
          await unlink(filePath);
        }
      }
    } catch (err) {
      console.error('Failed to clean old logs:', err);
    }
  }

  info(message: string): void {
    this.write('info', message);
  }

  warn(message: string): void {
    this.write('warn', message);
  }

  error(message: string, err?: Error): void {
    this.write('error', err ? `${message}: ${err.message}` : message);
  }

  debug(message: string): void {
    this.write('debug', message);
  }
}
