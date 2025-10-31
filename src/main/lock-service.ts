import { spawn } from 'child_process'
import { Logger } from './logger'

const logger = new Logger('lock-service')

export class LockService {
  static async lockWorkstation(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const process = spawn('rundll32.exe', ['user32.dll,LockWorkStation'], {
          detached: true,
          stdio: 'ignore'
        })

        process.on('error', (err) => {
          logger.error('Failed to lock workstation', err)
          reject(err)
        })

        // Detach child process so parent doesn't wait
        process.unref()

        // Resolve immediately since rundll32 doesn't block
        resolve()
      } catch (err) {
        logger.error('Failed to spawn lock process', err as Error)
        reject(err)
      }
    })
  }
}
