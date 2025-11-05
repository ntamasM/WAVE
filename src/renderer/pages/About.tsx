import React, { useEffect, useState } from 'react';
import { FaGlobe, FaHeart, FaCode, FaLock, FaWindows } from 'react-icons/fa';

export const About: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    // Resolve the app logo path
    window.focusLockAPI.resolveLogoPath('./FocusLock.png').then((resolved) => {
      setLogoUrl(resolved);
    });
  }, []);

  const handleOpenExternal = (url: string) => {
    window.focusLockAPI.openExternal(url);
  };
  return (
    <div className="page-container max-w-3xl mx-auto">
      <div className="section-card p-8 space-y-8">
        {/* App Info */}
        <div className="text-center">
          <div className="bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-2xl p-6 inline-block mb-4">
            {logoUrl && <img src={logoUrl} alt="WAVE" className="w-24 h-24 object-contain mx-auto" />}
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">WAVE</h1>
          <p className="text-secondary text-lg">
            Work And Vital Energy - Enforce focus through automated OS-level breaks
          </p>
          <p className="text-sm text-muted mt-2 font-medium">Version 0.0.15</p>
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
            displaying a timer and optional skip button.
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
              <span>Multi-Monitor Lock Windows on all displays simultaneously</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaLock className="icon-primary mt-1 flex-shrink-0" />
              <span>Beautiful Lock Screen with branded gradient and timer countdown</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaCode className="icon-primary mt-1 flex-shrink-0" />
              <span>Smart Skip Prompt with configurable pre-lock confirmation</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaWindows className="icon-primary mt-1 flex-shrink-0" />
              <span>Autostart with Windows in the background (system tray)</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-vista-blue-50 dark:bg-vista-blue-900/20 rounded-lg">
              <FaCode className="icon-primary mt-1 flex-shrink-0" />
              <span>Sleep/Resume Aware with wall-clock time adjustments</span>
            </li>
          </ul>
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
              <p className="text-secondary">Electron + electron-vite</p>
            </div>
            <div className="bg-bright-gray-50 dark:bg-bright-gray-700 p-4 rounded-xl border border-bright-gray-200 dark:border-bright-gray-600 transition-colors duration-200">
              <p className="font-semibold text-primary mb-1">UI Framework</p>
              <p className="text-secondary">React 18 + Tailwind CSS</p>
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
                <span>Portfolio: ntamadakis.gr</span>
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

        {/* License */}
        <div className="divider pt-6 text-center">
          <p className="text-sm text-muted">Released under the MIT License</p>
          <p className="text-xs text-muted mt-2">© 2025 Manolis Ntamadakis. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
