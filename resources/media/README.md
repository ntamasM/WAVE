# Media Folder

This folder contains the default media assets bundled with FocusLock.

## User Media Directory

When the application runs, it creates a `media` folder in your user data directory where you can add your own logos and images:

**Location**: `%APPDATA%\focuslock\media`

### Adding Custom Media

1. **Using the App**:
   - Go to Customization settings
   - Click "Upload Logo" to add images through the file picker
   - Files will be automatically copied to your user media directory

2. **Manual Method**:
   - Navigate to `%APPDATA%\focuslock\media`
   - Copy your image files directly to this folder
   - Supported formats: PNG, JPG, JPEG, SVG, GIF

### How Media is Loaded

- The app uses a custom `media://` protocol to serve images securely
- The protocol handler first checks your user media directory (`%APPDATA%\focuslock\media`)
- If a file is not found there, it falls back to this bundled media folder
- This approach works with Electron's sandbox security model

### Default Assets

- `FocusLock.png` - The default application logo
