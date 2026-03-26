// Re-export shared formatting utilities
export { formatTime, formatCompactTime } from '../../shared/format';

export function getPhaseColor(phase: string): string {
  switch (phase) {
    case 'work':
      return 'text-green-600';
    case 'break':
      return 'text-blue-600';
    case 'paused':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

export function getPhaseBgColor(phase: string): string {
  switch (phase) {
    case 'work':
      return 'bg-green-50';
    case 'break':
      return 'bg-blue-50';
    case 'paused':
      return 'bg-gray-50';
    default:
      return 'bg-gray-50';
  }
}
