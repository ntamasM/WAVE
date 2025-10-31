# Default Media

This folder contains the default media assets bundled with FocusLock.

## User Media Directory

When the application runs, it creates a `media` folder in your user data directory:

**Location**: `%APPDATA%\focuslock\media`

## How It Works

1. On first run, default media from this folder is copied to your user media directory
2. You can add custom images through the app's Customization page
3. The app uses a custom `media://` protocol to serve images securely

## Supported Formats

- PNG
- JPG/JPEG
- SVG
- GIF
