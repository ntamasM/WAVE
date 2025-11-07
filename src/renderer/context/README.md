# CycleContext

## Overview

The `CycleContext` provides a centralized state management solution for all cycle-related data (phases, timers, status) and app monitoring state across the application. This ensures all components stay synchronized and eliminates duplicate state management.

## Features

- **Centralized State**: Single source of truth for cycle status and app monitoring
- **Real-time Updates**: Automatic sync with main process via IPC
- **Smooth Countdown**: Client-side countdown for seamless timer display
- **Phase Change Detection**: Immediate refresh on pause/resume/work/break transitions
- **App Monitoring**: Track running apps, call status, and fullscreen state
- **Proper Cleanup**: Prevents memory leaks with isMounted flag pattern

## Usage

### 1. Wrap your app with CycleProvider

```tsx
import { CycleProvider } from './context/CycleContext';

function App() {
  return <CycleProvider>{/* Your app components */}</CycleProvider>;
}
```

### 2. Use the hook in any component

```tsx
import { useCycle } from '../context/CycleContext';

function MyComponent() {
  const {
    status,
    displayTime,
    isLoading,
    appStates,
    isAnyAppInCall,
    isAnyAppFullscreen,
    refreshStatus,
    refreshAppStates,
  } = useCycle();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Phase: {status?.phase}</p>
      <p>Time: {formatTime(displayTime)}</p>
      <p>Apps in call: {isAnyAppInCall ? 'Yes' : 'No'}</p>
      <p>Apps fullscreen: {isAnyAppFullscreen ? 'Yes' : 'No'}</p>
      <button onClick={refreshStatus}>Refresh Status</button>
      <button onClick={refreshAppStates}>Refresh Apps</button>
    </div>
  );
}
```

## API

### Context Value

```typescript
interface CycleContextType {
  // Current cycle status from main process
  status: CycleStatus | null;

  // Client-side countdown time (smooth 1-second updates)
  displayTime: number;

  // Loading state during initial fetch
  isLoading: boolean;

  // Array of all monitored app states
  appStates: AppState[];

  // Quick check: is any app currently in a call
  isAnyAppInCall: boolean;

  // Quick check: is any app currently fullscreen
  isAnyAppFullscreen: boolean;

  // Manually refresh status from main process
  refreshStatus: () => Promise<void>;

  // Manually refresh app states from main process
  refreshAppStates: () => Promise<void>;
}
```

### CycleStatus Type

```typescript
interface CycleStatus {
  phase: 'work' | 'break' | 'paused' | 'locking';
  remainingMs: number;
  totalMs: number;
  cycleNumber: number;
  totalCycles: number;
}
```

### AppState Type

```typescript
interface AppState {
  appId: string;
  isRunning: boolean;
  isInCall: boolean;
  isFullscreen: boolean;
}
```

## How It Works

1. **Initialization**: Fetches initial status and app states from main process
2. **IPC Listeners**:
   - `onCycleUpdate`: Backend sends updates every second
   - `onPhaseChanged`: Backend notifies on phase transitions (also refreshes app states)
3. **App State Polling**: Polls app states every 5 seconds for real-time monitoring
4. **Client-side Countdown**: Smooth display updates between backend syncs
5. **Pause Handling**: Countdown stops when `phase === 'paused'`
6. **Cleanup**: `isMounted` flag prevents state updates after unmount

## App Monitoring

The context now tracks the state of monitored applications:

- **Running Apps**: Detects which apps are currently running
- **Call Detection**: Monitors communication apps (Teams, Zoom, etc.) for active calls
- **Fullscreen Detection**: Detects when apps enter fullscreen mode
- **Auto Pause**: When apps are in call or fullscreen, the cycle may be paused (based on settings)

### Polling Strategy

- Initial fetch on mount
- Refresh on every phase change
- Automatic polling every 5 seconds
- Manual refresh via `refreshAppStates()`

## Benefits

### Before (Without Context)

- ❌ Each component had its own state and listeners
- ❌ Duplicate IPC subscriptions
- ❌ State desynchronization between components
- ❌ Complex cleanup logic in every component
- ❌ No centralized app monitoring visibility

### After (With Context)

- ✅ Single state management in one place
- ✅ One set of IPC listeners for entire app
- ✅ Automatic synchronization across all components
- ✅ Centralized app monitoring with derived states
- ✅ Real-time app status tracking
- ✅ Simplified component code
- ✅ Better performance (fewer listeners)

## Components Using Context

- `StatusCard.tsx` - Displays current phase and timer
- `Controls.tsx` - Pause/resume/reset buttons
- `AppMonitorStatus.tsx` - Shows active monitored apps and their states
- Any future component needing cycle or app monitoring state

## Related Files

- `src/renderer/context/CycleContext.tsx` - Context implementation
- `src/types/cycle.types.ts` - Cycle type definitions
- `src/types/app-monitor.types.ts` - App monitoring type definitions
- `src/shared/ipc.ts` - IPC channel definitions
- `src/main/cycle-manager.ts` - Backend cycle logic
- `src/main/app-monitor.ts` - Backend app monitoring logic
