import React, { useEffect, useState } from 'react'
import { formatCompactTime, getPhaseBgColor, getPhaseColor } from '../lib/format'
import type { CycleStatus } from '@/shared/types'

export const StatusCard: React.FC = () => {
  const [status, setStatus] = useState<CycleStatus | null>(null)

  useEffect(() => {
    // Load initial status
    window.focusLockAPI.getCycleStatus().then(setStatus)

    // Listen for updates
    window.focusLockAPI.onCycleUpdate((update) => {
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              ...update,
              endsAt: prev.endsAt
            }
          : null
      )
    })
  }, [])

  if (!status) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  const phaseNames: Record<string, string> = {
    work: 'Working',
    break: 'On Break',
    paused: 'Paused',
    prelockPrompt: 'Break Due Soon'
  }

  const phaseDesc: Record<string, string> = {
    work: 'Focus time remaining before break',
    break: 'Break time remaining',
    paused: 'Cycle paused',
    prelockPrompt: 'Confirm break or continue working'
  }

  const percentage = status.totalMs > 0 ? (status.remainingMs / status.totalMs) * 100 : 0

  return (
    <div className={`rounded-lg shadow-md p-6 ${getPhaseBgColor(status.phase)}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Status</h2>

      {/* Phase Display */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-1">{phaseDesc[status.phase]}</p>
        <p className={`text-4xl font-bold ${getPhaseColor(status.phase)}`}>
          {phaseNames[status.phase]}
        </p>
      </div>

      {/* Timer Display */}
      <div className="mb-6 p-4 bg-white rounded-lg">
        <p className="text-center text-5xl font-mono font-bold text-gray-900">
          {formatCompactTime(status.remainingMs)}
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">Remaining</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status.phase === 'work'
                ? 'bg-green-500'
                : status.phase === 'break'
                  ? 'bg-blue-500'
                  : status.phase === 'prelockPrompt'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}% complete</p>
      </div>

      {/* Time Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white/50 p-3 rounded">
          <p className="text-gray-600">Total Duration</p>
          <p className="font-semibold text-gray-900">{formatCompactTime(status.totalMs)}</p>
        </div>
        <div className="bg-white/50 p-3 rounded">
          <p className="text-gray-600">Elapsed</p>
          <p className="font-semibold text-gray-900">
            {formatCompactTime(status.totalMs - status.remainingMs)}
          </p>
        </div>
      </div>
    </div>
  )
}
