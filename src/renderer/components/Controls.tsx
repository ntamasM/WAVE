import React, { useState, useEffect } from 'react'
import type { CycleStatus } from '@/shared/types'

export const Controls: React.FC = () => {
  const [status, setStatus] = useState<CycleStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    window.focusLockAPI.getCycleStatus().then(setStatus)

    window.focusLockAPI.onCycleUpdate((update) => {
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              ...update
            }
          : null
      )
    })
  }, [])

  const handlePauseResume = async () => {
    setIsLoading(true)
    try {
      if (status?.phase === 'paused') {
        await window.focusLockAPI.resumeCycle()
      } else {
        await window.focusLockAPI.pauseCycle()
      }
    } catch (err) {
      console.error('Failed to pause/resume:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLockNow = async () => {
    setIsLoading(true)
    try {
      await window.focusLockAPI.lockNow()
    } catch (err) {
      console.error('Failed to lock:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setIsLoading(true)
    try {
      await window.focusLockAPI.resetCycle()
    } catch (err) {
      console.error('Failed to reset:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Controls</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 md:grid-cols-2">
        <button
          onClick={handlePauseResume}
          disabled={isLoading}
          className={`px-4 py-3 rounded-lg font-medium transition ${
            status?.phase === 'paused'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          } disabled:opacity-50`}
        >
          {isLoading ? 'Loading...' : status?.phase === 'paused' ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={handleLockNow}
          disabled={isLoading}
          className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Lock Now'}
        </button>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Reset Cycle'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-medium mb-2">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click the system tray icon to access quick controls</li>
          <li>Pause to temporarily stop the timer</li>
          <li>Lock Now to trigger a break immediately</li>
          <li>Settings are auto-saved</li>
        </ul>
      </div>
    </div>
  )
}
