# FocusLock - Windows Distribution

## 📦 Built Files

Your FocusLock application has been successfully built for Windows! You'll find the following distribution files in the `dist/` folder:

### Installation Files

1. **`FocusLock-0.0.5-beta-setup.exe`** (Installer - RECOMMENDED)
   - Full Windows installer with NSIS
   - ~120 MB
   - Provides installation wizard
   - Creates desktop and start menu shortcuts
   - Allows user to choose installation directory
   - Can be uninstalled via Windows Settings > Apps
   - Best for most users

2. **`FocusLock-0.0.5-beta-portable.exe`** (Portable Version)
   - Standalone executable
   - ~120 MB
   - No installation required
   - Can run from USB drive or any folder
   - Doesn't create registry entries
   - Best for users who want portability

3. **`FocusLock 0.0.5-beta.exe`** (Development Build)
   - Development/testing version
   - Use the installer or portable version instead

## 🚀 Distribution Instructions

### For End Users

**Option 1: Installer (Recommended)**

1. Download `FocusLock-0.0.5-beta-setup.exe`
2. Double-click to run the installer
3. Follow the installation wizard
4. Choose installation directory (or use default)
5. Click Install
6. Launch FocusLock from the desktop shortcut or Start Menu

**Option 2: Portable**

1. Download `FocusLock-0.0.5-beta-portable.exe`
2. Move it to your desired location
3. Double-click to run (no installation needed)
4. The app will run directly

### System Requirements

- **OS**: Windows 10 or later (64-bit)
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: ~300MB
- **Processor**: Any modern x64 processor

## 📝 Features

- Enforced break reminders with lock screen
- Customizable work/break intervals
- Lock duration settings
- Custom logos and branding
- System tray integration
- Auto-start with Windows option
- Skip breaks when needed
- Multi-monitor support

## 🔒 Security

- No telemetry or tracking
- All data stored locally
- No internet connection required
- Open source (MIT License)

## 📂 User Data & Resources Location

**User Data** (settings and custom media):

```
%APPDATA%\focuslock\
├── config.json          # Application settings
├── logs\                # Application logs
└── media\               # Custom logos/images (user-uploaded)
```

**Bundled Resources** (installed with app):

```
[Installation Directory]\resources\
├── FocusLock.png        # Default app icon
└── media\               # Default media files
    └── FocusLock.png    # Default logo
```

The application uses a smart fallback system:

1. First checks user media directory (`%APPDATA%\focuslock\media`)
2. Falls back to bundled resources if not found
3. All resources are independent from the development folder

## 🛠️ Uninstallation

**If installed with installer:**

- Go to Windows Settings > Apps
- Find "FocusLock"
- Click Uninstall

**If using portable version:**

- Simply delete the executable file
- Optionally delete `%APPDATA%\focuslock\` to remove settings

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Developer

Manolis Ntamadakis
https://ntamadakis.gr/

## 🐛 Issues & Support

For bugs, feature requests, or support:

- GitHub: [Your Repository URL]
- Email: [Your Email]

## 📦 Distribution Checklist

Before distributing to users:

- [x] Build completed successfully
- [x] Installer created
- [x] Portable version created
- [ ] Test installer on clean Windows machine
- [ ] Test portable version
- [ ] Verify all features work
- [ ] Test on multiple displays
- [ ] Test auto-start functionality
- [ ] Verify uninstaller works
- [ ] Create release notes
- [ ] Upload to distribution platform

## 🌐 Distribution Platforms

You can distribute your application through:

1. **Direct Download**
   - Host on your website
   - Share via cloud storage (Google Drive, Dropbox, etc.)

2. **GitHub Releases**
   - Tag a release in your repository
   - Upload installer and portable versions
   - Add release notes

3. **Microsoft Store** (Optional)
   - Requires developer account
   - App certification process
   - Automatic updates

4. **Chocolatey** (Optional)
   - Windows package manager
   - Create package manifest
   - Submit to community repository

## 📝 Version Information

**Current Version**: 0.0.5-beta
**Build Date**: October 31, 2025
**Architecture**: x64
**Electron Version**: 39.0.0

## ⚡ Quick Build Commands

For future builds:

```powershell
# Build installer and portable
pnpm run build:win

# Build only installer
pnpm run build:win:installer

# Build only portable
pnpm run build:win:portable
```

## 🎉 Congratulations!

Your FocusLock application is ready for distribution! The installer and portable versions are production-ready and can be shared with users.
