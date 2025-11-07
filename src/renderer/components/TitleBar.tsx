import React, { useEffect, useState } from 'react';
import { FaHome, FaCog, FaPalette, FaInfoCircle, FaTimes, FaMinus, FaWindowMaximize } from 'react-icons/fa';
import { TitleBarProps, NavigationPage } from '../../types/component.types';

export const TitleBar: React.FC<TitleBarProps> = ({ currentPage, onNavigate }) => {
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    // Resolve the app logo path
    window.waveAPI.resolveLogoPath('./Wave--icon.png').then((resolved) => {
      setLogoUrl(resolved);
    });
  }, []);

  const navItems: Array<{ id: NavigationPage; label: string; icon: typeof FaHome }> = [
    { id: 'home' as const, label: 'Home', icon: FaHome },
    { id: 'settings' as const, label: 'Settings', icon: FaCog },
    { id: 'customization' as const, label: 'Customization', icon: FaPalette },
    { id: 'about' as const, label: 'About', icon: FaInfoCircle },
  ];

  const handleMinimize = () => {
    window.waveAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.waveAPI?.maximizeWindow?.();
  };

  const handleClose = () => {
    window.waveAPI?.closeWindow?.();
  };

  return (
    <div className="bg-bright-gray-950 text-white shadow-xl select-none border-b border-bright-gray-900">
      <div
        className="flex items-center justify-between h-12"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Left: App Logo and Title */}
        <div className="flex items-center gap-3 px-4">
          {logoUrl && <img src={logoUrl} alt="Wave" className="w-6 h-6 object-contain" />}
          <span className="font-bold text-lg text-vista-blue-300">Wave</span>
        </div>

        {/* Center: Navigation */}
        <nav className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    isActive
                      ? 'bg-vista-blue-600 text-white shadow-lg shadow-vista-blue-900/50'
                      : 'text-bright-gray-300 hover:bg-bright-gray-800 hover:text-vista-blue-300'
                  }
                `}
                title={item.label}
              >
                <Icon className="text-base" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Window Controls */}
        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={handleMinimize}
            className="h-12 px-4 hover:bg-bright-gray-800 transition-colors flex items-center justify-center"
            title="Minimize"
          >
            <FaMinus className="text-sm text-bright-gray-300" />
          </button>
          <button
            onClick={handleMaximize}
            className="h-12 px-4 hover:bg-bright-gray-800 transition-colors flex items-center justify-center"
            title="Maximize"
          >
            <FaWindowMaximize className="text-sm text-bright-gray-300" />
          </button>
          <button
            onClick={handleClose}
            className="h-12 px-4 hover:bg-vista-blue-600 transition-colors flex items-center justify-center"
            title="Close"
          >
            <FaTimes className="text-sm text-bright-gray-300 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
