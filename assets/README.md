# Assets Folder

This folder contains all assets used by the WAVE application.

## Structure

- **app-media/** - Private application assets (logos, icons, etc.)
  - These files are used internally by the application
  - Contains the app logo (Wave.png, Wave.svg)
- **media/** - Default user media
  - Contains default images bundled with the app
  - These files are copied to the user's media directory on first run
  - Users can add their own custom media through the app's Customization settings

## Build Process

During the build process:

- `app-media/` is bundled to `resources/app-media/` in the installed app
- `media/` is bundled to `resources/media/` in the installed app
- The app icon is used for the application window and installer
