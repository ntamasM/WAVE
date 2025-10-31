# Toast Notifications

This project uses [react-toastify](https://www.npmjs.com/package/react-toastify) for displaying toast notifications throughout the application.

## Usage

Import the toast utility functions from `src/renderer/lib/toast.ts`:

```tsx
import { showSuccess, showError, showWarning, showInfo, showPromise } from '../lib/toast';
```

## Available Functions

### Basic Notifications

#### `showSuccess(message, options?)`

Display a success toast notification.

```tsx
showSuccess('Settings saved successfully!');
```

#### `showError(message, options?)`

Display an error toast notification.

```tsx
showError('Failed to save settings: Connection timeout');
```

#### `showWarning(message, options?)`

Display a warning toast notification.

```tsx
showWarning('This action cannot be undone');
```

#### `showInfo(message, options?)`

Display an info toast notification.

```tsx
showInfo('No changes to save');
```

### Promise-based Notifications

#### `showPromise(promise, messages, options?)`

Display different notifications based on promise state.

```tsx
showPromise(saveDataAsync(), {
  pending: 'Saving data...',
  success: 'Data saved successfully!',
  error: 'Failed to save data',
});
```

## Custom Options

All toast functions accept an optional `options` parameter to customize behavior:

```tsx
showSuccess('Custom notification', {
  position: 'bottom-center',
  autoClose: 5000,
  hideProgressBar: true,
});
```

### Available Options

- `position`: `'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'`
- `autoClose`: number (milliseconds) or `false`
- `hideProgressBar`: boolean
- `closeOnClick`: boolean
- `pauseOnHover`: boolean
- `draggable`: boolean
- `theme`: `'light' | 'dark' | 'colored'`

## Styling

Toast notifications are styled to match the app's design system using custom CSS in `src/renderer/styles/index.css`. The styles use the app's color palette:

- **Success**: Vista Blue theme
- **Error**: Red theme
- **Warning**: Amber theme
- **Info**: Blue theme

## Examples in the App

### Settings Form

```tsx
// Success notification
await updateSettings(changes);
showSuccess('Settings saved successfully!');

// Error notification
catch (err) {
  const errorMsg = err instanceof Error ? err.message : 'Unknown error';
  showError(`Failed to save settings: ${errorMsg}`);
}

// Info notification
if (Object.keys(changes).length === 0) {
  showInfo('No changes to save');
  return;
}
```

### Controls Component

```tsx
// Pause/Resume
if (status?.phase === 'paused') {
  await window.focusLockAPI.resumeCycle();
  showSuccess('Cycle resumed');
} else {
  await window.focusLockAPI.pauseCycle();
  showInfo('Cycle paused');
}

// Error handling
catch (err) {
  const errorMsg = err instanceof Error ? err.message : 'Unknown error';
  showError(`Failed to pause: ${errorMsg}`);
}
```

## Best Practices

1. **Keep messages concise**: Toast notifications should be brief and clear
2. **Use appropriate types**: Match the notification type to the action result
3. **Handle errors gracefully**: Always catch errors and show user-friendly messages
4. **Avoid spam**: Don't show multiple toasts for the same action
5. **Provide context**: Include relevant details in error messages

## ToastContainer Configuration

The `ToastContainer` is configured in `App.tsx` with the following default settings:

```tsx
<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="light"
/>
```

## Further Reading

For more advanced usage and configuration options, refer to the [official react-toastify documentation](https://fkhadra.github.io/react-toastify/introduction).
