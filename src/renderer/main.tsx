import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import type { CustomizationSettings } from '../types/settings.types';
import { DEFAULT_CUSTOMIZATION } from '../types/settings.types';
import type { LockData } from '../types/component.types';

const STANDUP_DISMISS_MS = 8000;

// Stand Up Reminder Component (rendered in its own transparent BrowserWindow)
const StandUpReminder: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.waveAPI.dismissStandUp();
    }, STANDUP_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-screen h-screen bg-transparent flex items-center justify-center">
      <div className="flex items-center gap-3 bg-vista-blue-700 text-white rounded-2xl shadow-2xl px-4 py-3 w-full mx-3">
        {/* Bouncing stand up icon */}
        <div className="animate-bounce flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M4.25 14q.15.575.363 1.1t.487 1q.225.375.175.8t-.325.7t-.688.263t-.637-.363q-.525-.8-.888-1.65t-.562-1.8q-.1-.4.163-.725T3.025 13t.763.275t.462.725m.85-6.1q-.275.475-.487 1T4.25 10q-.125.45-.462.725T3.025 11t-.687-.3t-.163-.7q.2-.975.575-1.875t.9-1.65q.225-.325.625-.337t.675.262t.325.7t-.175.8m2.775 10.95q.5.3 1.025.525t1.075.375q.425.125.7.45t.275.75t-.3.675t-.7.175q-.925-.2-1.787-.55T6.5 20.375q-.35-.225-.387-.638t.237-.712q.3-.3.725-.35t.8.175m2.15-14.6q-.55.15-1.062.363t-1.013.512q-.4.225-.837.188t-.738-.338t-.275-.7t.375-.625q.825-.525 1.713-.887t1.837-.563q.375-.075.675.175t.3.675t-.275.75t-.7.45m6.05 14.625q.375-.225.813-.187t.737.337t.275.713t-.375.612q-.8.525-1.7.888t-1.85.562q-.4.075-.712-.175t-.313-.675t.288-.75t.712-.45q.575-.15 1.1-.362t1.025-.513m-2.1-14.625q-.425-.125-.7-.45T13 3.05t.3-.675t.675-.175q.95.2 1.85.563t1.7.887q.35.225.375.625t-.25.7q-.3.3-.725.35T16.1 5.15q-.525-.3-1.05-.525t-1.075-.375m5.775 9.725q.125-.425.463-.7t.762-.275t.687.325t.163.725q-.2.95-.587 1.825T20.35 17.5q-.225.325-.625.35t-.675-.25t-.325-.712t.175-.813q.275-.5.488-1.012t.362-1.088M18.9 7.9q-.225-.375-.175-.8t.325-.7t.675-.25t.625.35q.55.8.925 1.675T21.85 10q.075.4-.188.7t-.687.3t-.763-.275T19.75 10q-.15-.575-.362-1.1t-.488-1M11.975 17q-.425 0-.712-.288T10.975 16v-5.125l-1.875 1.9q-.3.3-.712.3t-.713-.3t-.312-.712t.287-.713l3.625-3.65q.275-.275.7-.275t.7.275l3.575 3.575q.3.3.313.725t-.288.725t-.725.3t-.725-.3l-1.85-1.85V16q0 .425-.287.713t-.713.287"
            />
          </svg>
        </div>

        {/* Text + progress bar */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">Time to stand up!</p>
          <p className="text-xs text-vista-blue-200 mt-0.5">Take a quick stretch break</p>
          <div className="mt-1.5 h-1 bg-vista-blue-500 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ animation: `standup-progress ${STANDUP_DISMISS_MS}ms linear forwards` }}
            />
          </div>
        </div>

        {/* Dismiss button */}
        <button
          className="flex-shrink-0 text-vista-blue-300 hover:text-white text-lg leading-none px-1"
          onClick={() => window.waveAPI.dismissStandUp()}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Pre-Lock Warning Component (rendered in its own transparent BrowserWindow)
const PreLockReminder: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const minutes = parseInt(urlParams.get('minutes') || '5', 10);

  return (
    <div className="w-screen h-screen bg-transparent flex items-center justify-center">
      <div className="flex items-center gap-3 bg-amber-600 text-white rounded-2xl shadow-2xl px-4 py-3 w-full mx-3">
        {/* Warning icon */}
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M1 21L12 2l11 19zm11-3q.425 0 .713-.288T13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18m-1-3h2v-5h-2z"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">Screen locking soon!</p>
          <p className="text-xs text-amber-200 mt-0.5">
            Your screen will lock in {minutes} minute{minutes !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          className="flex-shrink-0 text-amber-300 hover:text-white text-lg leading-none px-1"
          onClick={() => window.waveAPI.dismissPreLock()}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

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

  if (mode === 'standup') {
    return <StandUpReminder />;
  }

  if (mode === 'prelock') {
    return <PreLockReminder />;
  }

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
