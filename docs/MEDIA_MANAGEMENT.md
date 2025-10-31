# Media Management - Technical Documentation

## Overview

FocusLock uses a custom `media://` protocol to serve media assets (logos, images) securely within Electron's sandbox environment. This approach resolves Content Security Policy issues while maintaining security.

## Architecture Changes

### Previous Approach (❌ Removed)

- Attempted to use `file://` protocol directly
- Failed due to Electron sandbox security restrictions
- Caused "Not allowed to load local resource" errors

### Current Approach (✅ Implemented)

- Uses custom `media://` protocol with proper registration
- Works with Electron's sandbox and CSP requirements
- Secure file serving with automatic fallback logic

## Directory Structure

```
resources/
  └── media/               # Bundled media assets (shipped with app)
      ├── FocusLock.png    # Default logo
      └── README.md

%APPDATA%/focuslock/
  └── media/               # User media directory (created at runtime)
      └── (user files)     # User-uploaded logos and images
```

## How It Works

1. **Initialization**:
   - On app start, `initializeMediaDirectory()` creates `%APPDATA%\focuslock\media`
   - Copies default logo if it doesn't exist

2. **Path Resolution**:
   - When app needs an image, it calls `logo:resolvePath` IPC handler
   - Handler converts relative paths to `media://` protocol URLs
   - Returns `media://filename.png` format

3. **Protocol Handler**:
   - Registered with `protocol.handle('media', ...)`
   - Receives requests for `media://` URLs
   - Checks user media directory first
   - Falls back to bundled resources if not found
   - Uses `net.fetch` to serve the file

4. **Upload Flow**:
   - User clicks "Upload Logo" button
   - File picker dialog opens
   - Selected file is copied to user media directory
   - Returns relative path (e.g., `./my-logo.png`)

## CSP Configuration

### HTML Meta Tag

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: media:"
/>
```

### Runtime CSP Override

```typescript
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  const headers = { ...details.responseHeaders };
  headers['Content-Security-Policy'] = [
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: media:;",
  ];
  callback({ responseHeaders: headers });
});
```

### Protocol Registration

```typescript
// Before app.ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: false,
      bypassCSP: false,
    },
  },
]);
```

## IPC Handlers

### `logo:resolvePath`

Converts relative paths to `media://` protocol URLs.

**Input**: `./my-logo.png` or `my-logo.png`  
**Output**: `media://my-logo.png`

### `logo:getAvailable`

Lists all image files in user media directory.

**Returns**: Array of relative paths, e.g., `['./FocusLock.png', './custom-logo.png']`

### `logo:upload`

Opens file picker and copies selected file to media directory.

**Returns**: `{ success: true, filename: './uploaded-file.png' }`

## Usage in Renderer

```typescript
// Get logo path
const logoPath = await window.api.logo.resolvePath('./FocusLock.png');

// Use in img tag
<img src={logoPath} alt="Logo" />

// Get available logos
const logos = await window.api.logo.getAvailable();

// Upload new logo
const result = await window.api.logo.upload();
if (result.success) {
  console.log('Uploaded:', result.filename);
}
```

## Benefits

1. **Security**: Works within Electron's sandbox security model
2. **Compatibility**: Custom protocol properly registered with privileges
3. **Automatic Fallback**: Checks user directory first, then bundled resources
4. **CSP Compliant**: Proper Content Security Policy without bypassing security
5. **User-friendly**: Clear separation of bundled vs user media
6. **Maintainable**: Clean protocol handler with error logging

## How the Protocol Works

The `media://` protocol handler:

1. **Receives Request**: e.g., `media://logo.png`
2. **Strips Protocol**: Extracts filename `logo.png`
3. **Checks User Directory**: `%APPDATA%/focuslock/media/logo.png`
4. **Fallback to Resources**: `resources/media/logo.png` if not in user dir
5. **Serves File**: Uses `net.fetch` with `file://` internally (allowed in main process)
6. **Returns Response**: Image data to renderer process

This approach maintains security by:

- Only allowing access to specific directories
- Running file access in main process (privileged)
- Serving to renderer via controlled protocol
- Not exposing full file system paths to renderer

## Migration Notes

- Old `file://` direct URLs no longer work due to sandbox restrictions
- All media must be loaded via `media://` protocol
- `logos` directory renamed to `media` for clarity
- Protocol automatically handles user vs bundled media
