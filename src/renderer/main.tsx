import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Lock Screen Component
interface LockData {
  lockDurationMs: number;
  canSkip: boolean;
  startTime: number;
}

const LockScreen: React.FC = () => {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [totalMs, setTotalMs] = useState<number>(0);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [skipping, setSkipping] = useState<boolean>(false);

  useEffect(() => {
    // Listen for initialization data
    const handleInit = (data: LockData) => {
      setTotalMs(data.lockDurationMs);
      setRemainingMs(data.lockDurationMs);
      setCanSkip(data.canSkip);
    };

    // Listen for timer updates
    const handleUpdate = (data: { remainingMs: number }) => {
      setRemainingMs(data.remainingMs);
    };

    window.focusLockAPI.onLockInit(handleInit);
    window.focusLockAPI.onLockUpdate(handleUpdate);

    return () => {
      window.focusLockAPI.removeAllListeners('lock:init');
      window.focusLockAPI.removeAllListeners('lock:update');
    };
  }, []);

  const handleSkip = () => {
    if (skipping) return; // Prevent multiple clicks
    setSkipping(true);
    window.focusLockAPI.skipLock();
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
        background: 'linear-gradient(to bottom right, #73C8A9 0%, #373B44 100%)',
      }}
    >
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-40 h-40 mx-auto flex items-center justify-center">
            <img src="./FocusLock.png" alt="FocusLock" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-4">Break Time</h1>
        <p className="text-xl text-white/80 mb-12">Time to rest your eyes and stretch</p>

        {/* Timer */}
        <div className="mb-12">
          <div className="text-8xl font-bold text-white mb-6 font-mono">{formatTime(remainingMs)}</div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Skip Button */}
        {canSkip && (
          <button
            onClick={handleSkip}
            disabled={skipping}
            className={`px-8 py-4 backdrop-blur-lg text-white text-lg font-semibold rounded-xl transition-all duration-200 border-2 border-white/30 ${
              skipping
                ? 'bg-white/10 cursor-not-allowed opacity-50'
                : 'bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95'
            }`}
          >
            {skipping ? 'Closing...' : 'Skip Break'}
          </button>
        )}
      </div>
    </div>
  );
};

// Blank Screen Component for secondary displays
const BlankScreen: React.FC = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to bottom right, #73C8A9 0%, #373B44 100%)',
      }}
    />
  );
};

// Main Router Component
const Router: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const display = urlParams.get('display');

  if (mode === 'lock') {
    // Show content only on primary display (index 0)
    if (display === '0') {
      return <LockScreen />;
    }
    // Show blank screen on secondary displays
    return <BlankScreen />;
  }

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
