# Types Directory

This directory contains all TypeScript type definitions and interfaces used throughout the WAVE application.

## Structure

### `index.ts`

Main entry point that re-exports all types. Import from here for convenience:

```typescript
import { Settings, CycleStatus, MonitoredApp } from '../types';
```

### `settings.types.ts`

Contains all settings-related types:

- `CustomizationSettings` - UI customization options (colors, text, etc.)
- `Settings` - Main application settings
- `DEFAULT_CUSTOMIZATION` - Default customization values
- `DEFAULT_SETTINGS` - Default application settings

### `cycle.types.ts`

Contains work/break cycle-related types:

- `CyclePhase` - Type union for cycle phases: 'work' | 'break' | 'paused' | 'locking'
- `CycleStatus` - Current status of the work/break cycle
- `CycleUpdate` - Payload for cycle update events
- `CycleState` - Internal state management for cycle

### `app-monitor.types.ts`

Contains application monitoring types:

- `MonitoredApp` - Definition of an application to monitor
- `AppState` - Runtime state of a monitored application

### `ipc.types.ts`

Contains IPC (Inter-Process Communication) types:

- `IPCHandlers` - Handler definitions for main process
- `IPCListeners` - Listener definitions for renderer process
- `IPCHandlerKeys` - Type-safe keys for handlers
- `IPCListenerKeys` - Type-safe keys for listeners

### `component.types.ts`

Contains React component prop types:

- `LayoutProps` - Props for Layout component
- `NavigationPage` - Type union for navigation pages
- `NavigationProps` - Props for Navigation component
- `TitleBarProps` - Props for TitleBar component
- `NumberInputProps` - Props for NumberInput component
- `SeparatorProps` - Props for Separator component
- `LockData` - Lock screen data structure

### `store.types.ts`

Contains state management types:

- `SettingsListener` - Callback type for settings changes

## Migration

The types were previously scattered across the codebase:

- `src/shared/ipc.ts` - IPC validation logic remains, types moved here
- Component files - Component-specific types moved to `component.types.ts`
- Main process files - Process-specific types moved to dedicated files

## Usage

### Recommended Import Pattern

```typescript
// Import from the main index for commonly used types
import { Settings, CycleStatus } from '../types';

// Or import from specific files for better tree-shaking
import { Settings } from '../types/settings.types';
import { CycleStatus } from '../types/cycle.types';
```
