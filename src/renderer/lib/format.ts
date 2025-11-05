export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function formatCompactTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

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
