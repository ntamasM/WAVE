import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import type { CustomizationSettings } from '../types/settings.types';
import { DEFAULT_CUSTOMIZATION } from '../types/settings.types';
import type { LockData } from '../types/component.types';

// Lock Screen Component
const LockScreen: React.FC = () => {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [totalMs, setTotalMs] = useState<number>(0);
  const [showSkipButton, setShowSkipButton] = useState<boolean>(false);
  const [skipping, setSkipping] = useState<boolean>(false);
  const [customization, setCustomization] = useState<CustomizationSettings>(DEFAULT_CUSTOMIZATION);
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string>(DEFAULT_CUSTOMIZATION.logoUrl);

  useEffect(() => {
    // Load customization settings
    window.waveAPI.getSettings().then(async (settings) => {
      if (settings.customization) {
        setCustomization(settings.customization);
        // Resolve logo path
        if (settings.customization.logoUrl) {
          const resolved = await window.waveAPI.resolveLogoPath(settings.customization.logoUrl);
          setResolvedLogoUrl(resolved);
        }
      }
    });

    // Listen for initialization data
    const handleInit = (data: LockData) => {
      setTotalMs(data.lockDurationMs);
      setRemainingMs(data.lockDurationMs);
      setShowSkipButton(data.showSkipButton);
    };

    // Listen for timer updates
    const handleUpdate = (data: { remainingMs: number }) => {
      setRemainingMs(data.remainingMs);
    };

    window.waveAPI.onLockInit(handleInit);
    window.waveAPI.onLockUpdate(handleUpdate);

    return () => {
      window.waveAPI.removeAllListeners('lock:init');
      window.waveAPI.removeAllListeners('lock:update');
    };
  }, []);

  const handleSkip = () => {
    if (skipping) return; // Prevent multiple clicks
    setSkipping(true);
    window.waveAPI.skipLock();
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalMs > 0 ? ((totalMs - remainingMs) / totalMs) * 100 : 0;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        background: `linear-gradient(135deg, ${customization.backgroundGradient.color1} 0%, ${customization.backgroundGradient.color2} 50%, ${customization.backgroundGradient.color3} 100%)`,
      }}
    >
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-8">
          <img src={resolvedLogoUrl} alt="WAVE" className="w-40 h-40 mx-auto object-contain rounded-3xl shadow-2xl" />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold mb-4 drop-shadow-lg" style={{ color: customization.breakTitle.color }}>
          {customization.breakTitle.text}
        </h1>
        <p className="text-2xl mb-12 font-medium" style={{ color: customization.breakSubtitle.color }}>
          {customization.breakSubtitle.text}
        </p>

        {/* Timer */}
        <div className="mb-12">
          <div
            className="text-9xl font-bold mb-8 font-mono drop-shadow-2xl"
            style={{ color: customization.timerColor }}
          >
            {formatTime(remainingMs)}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto bg-white/20 backdrop-blur-sm rounded-full h-5 overflow-hidden shadow-lg border-2 border-white/30">
            <div
              className="h-full transition-all duration-1000 ease-linear shadow-inner"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: customization.progressBarColor,
              }}
            />
          </div>
        </div>

        {/* Skip Button */}
        {showSkipButton && (
          <button
            onClick={handleSkip}
            disabled={skipping}
            className="px-10 py-5 backdrop-blur-xl text-xl font-bold rounded-2xl transition-all duration-200 border-3 border-white/40 shadow-2xl hover:scale-105 active:scale-95 hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              color: customization.skipButton.textColor,
              backgroundColor: skipping ? 'rgba(255, 255, 255, 0.1)' : customization.skipButton.backgroundColor,
            }}
          >
            {skipping ? 'Closing...' : customization.skipButton.text}
          </button>
        )}
      </div>
    </div>
  );
};

// Blank Screen Component for secondary displays
const BlankScreen: React.FC = () => {
  const [customization, setCustomization] = useState<CustomizationSettings>(DEFAULT_CUSTOMIZATION);

  useEffect(() => {
    console.log('[BlankScreen] Component mounted, loading settings...');
    // Load customization settings
    window.waveAPI.getSettings().then((settings) => {
      console.log('[BlankScreen] Settings loaded:', settings);
      if (settings.customization) {
        setCustomization(settings.customization);
        console.log('[BlankScreen] Customization applied:', settings.customization.backgroundGradient);
      }
    });
  }, []);

  console.log('[BlankScreen] Rendering with gradient:', customization.backgroundGradient);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(135deg, ${customization.backgroundGradient.color1} 0%, ${customization.backgroundGradient.color2} 50%, ${customization.backgroundGradient.color3} 100%)`,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};

// Main Router Component
const Router: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const display = urlParams.get('display');
  const isPrimary = urlParams.get('isPrimary') === 'true';

  console.log('[WAVE Router]', { mode, display, isPrimary, url: window.location.href });

  if (mode === 'lock') {
    // Show timer content only on primary display
    if (isPrimary) {
      console.log('[WAVE] Rendering LockScreen (Primary Display)');
      return <LockScreen />;
    }
    // Show gradient on all secondary displays
    console.log('[WAVE] Rendering BlankScreen (Secondary Display)');
    return <BlankScreen />;
  }

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
