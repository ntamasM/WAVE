import React, { useEffect, useState } from 'react';
import { FaGlobe, FaHeart, FaCode, FaLock, FaWindows, FaArrowUp, FaBell, FaPalette, FaClock, FaGithub, FaStar, FaSyncAlt } from 'react-icons/fa';

const GITHUB_REPO_URL = 'https://github.com/ntamasM/WAVE';

export const About: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    window.waveAPI.resolveLogoPath('./Wave--icon.png').then((resolved) => {
      setLogoUrl(resolved);
    });
    window.waveAPI.getVersion().then((v) => {
      setVersion(v);
    });
  }, []);

  const handleOpenExternal = (url: string) => {
    window.waveAPI.openExternal(url);
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <div className="section-card p-8 space-y-8">
        {/* App Info */}
        <div className="text-center">
          {logoUrl && <img src={logoUrl} alt="WAVE" className="w-32 h-32 object-contain mx-auto mb-2" />}
          <h1 className="text-4xl font-bold text-primary mb-2">WAVE</h1>
          <p className="text-secondary text-lg">
            Work And Vital Energy — Enforce focus through automated OS-level breaks
          </p>
          <p className="text-sm text-muted mt-2 font-medium">Version {version || '1.0.0'}</p>
          <p className="text-xs text-muted mt-1">
            Free &amp; open source &middot;{' '}
            <button
              onClick={() => handleOpenExternal(`${GITHUB_REPO_URL}/blob/main/LICENSE`)}
              className="text-accent hover:underline cursor-pointer"
            >
              MIT License
            </button>
          </p>
        </div>

        {/* Description */}
        <div className="divider pt-6">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <FaLock className="icon-primary" />
            About WAVE
          </h2>
          <p className="text-secondary leading-relaxed mb-4">
            WAVE (Work And Vital Energy) is a minimalist Windows productivity utility designed for professionals who
            struggle with taking regular breaks. Instead of soft overlays that can be dismissed, it uses fullscreen lock
            windows on all displays to enforce breaks.
          </p>
          <p className="text-secondary leading-relaxed">
            After configurable work periods, fullscreen lock windows appear on all monitors for a set break duration,
            displaying a countdown timer and optional skip button. The lock screen is fully customizable with gradient
            backgrounds, custom logos, and personalized text — and a live preview on the Customization page lets you see
            every change in real time. Stand-up reminders and pre-lock warnings keep you in the loop without hijacking
            your keyboard, and the app updates itself automatically in the background so you always have the latest fixes.
          </p>
        </div>

        {/* Features */}
        <div className="divider pt-6">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <FaCode className="icon-primary" />
            Key Features
          </h2>
          <ul className="space-y-3 text-secondary">
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaWindows className="icon-primary mt-1 flex-shrink-0" />
              <span>
                <strong>Multi-Monitor Lock</strong> — Fullscreen lock windows on all displays simultaneously, covering
                taskbar and everything else
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaPalette className="icon-primary mt-1 flex-shrink-0" />
              <span>
                <strong>Customizable Lock Screen</strong> — Gradient backgrounds, custom logo, personalized title and
                subtitle, timer and progress bar colors, skip button styling, all with a live preview that updates as
                you edit
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaBell className="icon-primary mt-1 flex-shrink-0" />
              <span>
                <strong>Pre-Lock Warnings</strong> — Up to 3 reminders before the lock screen (at 5, 3, and 1 minutes),
                with optional skip button on the last reminder to reset the countdown
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaArrowUp className="icon-primary mt-1 flex-shrink-0" />
              <span>
                <strong>Stand Up Reminders</strong> — Periodic overlay notifications to stand up and stretch, with 9
                screen positions and auto-dismiss
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaClock className="icon-primary mt-1 flex-shrink-0" />
              <span>
                <strong>Sleep/Resume Aware</strong> — Uses wall-clock time so system sleep doesn&apos;t cheat the cycle
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaWindows className="icon-primary mt-1 flex-shrink-0" />
              <span>
                <strong>System Integration</strong> — Autostart with Windows, system tray with live timer, dark/light
                theme, diagnostic logging
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaSyncAlt className="icon-primary mt-1 flex-shrink-0" />
              <span>
                <strong>Automatic Updates</strong> — Powered by Velopack. New versions are downloaded and applied in the
                background, so you stay on the latest release without lifting a finger
              </span>
            </li>
          </ul>
        </div>

        {/* Hidden Features / Keyboard Shortcuts */}
        <div className="divider pt-6">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <FaCode className="icon-primary" />
            Keyboard Shortcuts
          </h2>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/30 p-5 rounded-xl border-2 border-amber-200 dark:border-amber-700 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-primary mb-3">Skip Lock</h3>
            <div className="flex items-center gap-3 text-secondary">
              <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm shadow-sm">
                Ctrl
              </kbd>
              <span className="text-lg font-bold">+</span>
              <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm shadow-sm">
                Shift
              </kbd>
              <span className="text-lg font-bold">+</span>
              <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm shadow-sm">
                U
              </kbd>
              <span className="text-lg font-bold">+</span>
              <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm shadow-sm">
                L
              </kbd>
            </div>
            <p className="text-sm text-secondary mt-3 leading-relaxed">
              Press this key combination at any time to instantly skip the lock screen, even when the lock window is
              active.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="divider pt-6">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <FaCode className="icon-primary" />
            Tech Stack
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-bright-gray-50 dark:bg-bright-gray-700 p-4 rounded-xl border border-bright-gray-200 dark:border-bright-gray-600 transition-colors duration-200">
              <p className="font-semibold text-primary mb-1">Runtime</p>
              <p className="text-secondary">Electron 39 + electron-vite</p>
            </div>
            <div className="bg-bright-gray-50 dark:bg-bright-gray-700 p-4 rounded-xl border border-bright-gray-200 dark:border-bright-gray-600 transition-colors duration-200">
              <p className="font-semibold text-primary mb-1">UI Framework</p>
              <p className="text-secondary">React 18 + Tailwind CSS v3</p>
            </div>
            <div className="bg-bright-gray-50 dark:bg-bright-gray-700 p-4 rounded-xl border border-bright-gray-200 dark:border-bright-gray-600 transition-colors duration-200">
              <p className="font-semibold text-primary mb-1">Language</p>
              <p className="text-secondary">TypeScript</p>
            </div>
            <div className="bg-bright-gray-50 dark:bg-bright-gray-700 p-4 rounded-xl border border-bright-gray-200 dark:border-bright-gray-600 transition-colors duration-200">
              <p className="font-semibold text-primary mb-1">Platform</p>
              <p className="text-secondary">Windows 10+</p>
            </div>
          </div>
        </div>

        {/* Support the project */}
        <div className="divider pt-6">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <FaGithub className="icon-primary" />
            Support the Project
          </h2>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-700 transition-colors duration-200">
            <p className="text-secondary leading-relaxed mb-4">
              WAVE is free and open source. If it helps you take better breaks, please consider giving it a star on
              GitHub — it's the easiest way to help the project grow.
            </p>
            <button
              onClick={() => handleOpenExternal(GITHUB_REPO_URL)}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <FaStar className="text-lg" />
              <span>Star on GitHub</span>
            </button>
            <button
              onClick={() => handleOpenExternal(GITHUB_REPO_URL)}
              className="ml-3 inline-flex items-center gap-3 px-5 py-2.5 rounded-lg font-medium text-primary bg-white dark:bg-bright-gray-700 border border-bright-gray-200 dark:border-bright-gray-600 hover:bg-bright-gray-50 dark:hover:bg-bright-gray-600 transition cursor-pointer"
            >
              <FaGithub className="text-lg" />
              <span>View Source</span>
            </button>
          </div>
        </div>

        {/* Developer */}
        <div className="divider pt-6">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <FaCode className="icon-primary" />
            Developer
          </h2>
          <div className="bg-gradient-to-br from-vista-blue-50 to-vista-blue-100 dark:from-vista-blue-900/20 dark:to-vista-blue-900/30 p-6 rounded-xl border-2 border-vista-blue-200 dark:border-vista-blue-700 transition-colors duration-200">
            <p className="text-xl font-semibold text-primary mb-4">Manolis Ntamadakis</p>
            <div className="space-y-3">
              <button
                onClick={() => handleOpenExternal('https://ntamadakis.gr/')}
                className="flex items-center gap-3 text-accent hover:text-vista-blue-800 dark:hover:text-vista-blue-300 transition font-medium cursor-pointer"
              >
                <FaGlobe className="text-xl" />
                <span>ntamadakis.gr</span>
              </button>
              <button
                onClick={() => handleOpenExternal('https://ntamadakis.gr/support-me')}
                className="flex items-center gap-3 text-accent hover:text-vista-blue-800 dark:hover:text-vista-blue-300 transition font-medium cursor-pointer"
              >
                <FaHeart className="text-xl" />
                <span>Support Me</span>
              </button>
            </div>
          </div>
        </div>

        {/* Open Source / License */}
        <div className="divider pt-6 text-center">
          <p className="text-sm text-secondary">
            <strong>WAVE is free and open source software</strong> — released under the{' '}
            <button
              onClick={() => handleOpenExternal(`${GITHUB_REPO_URL}/blob/main/LICENSE`)}
              className="text-accent hover:underline cursor-pointer font-medium"
            >
              MIT License
            </button>
            .
          </p>
          <p className="text-xs text-muted mt-2">
            Source code:{' '}
            <button
              onClick={() => handleOpenExternal(GITHUB_REPO_URL)}
              className="text-accent hover:underline cursor-pointer"
            >
              github.com/ntamasM/WAVE
            </button>
          </p>
          <p className="text-xs text-muted mt-2">&copy; 2025-{new Date().getFullYear()} Manolis Ntamadakis</p>
        </div>
      </div>
    </div>
  );
};

export default About;
