import React from 'react';
import type { CustomizationSettings } from '../../types/settings.types';
import { formatLockTime } from '../../shared/format';

export interface LockScreenViewProps {
  customization: CustomizationSettings;
  resolvedLogoUrl: string;
  remainingMs: number;
  totalMs: number;
  showSkipButton: boolean;
  onSkip?: () => void;
  skipping?: boolean;
  fullScreen?: boolean;
}

export const LockScreenView: React.FC<LockScreenViewProps> = ({
  customization,
  resolvedLogoUrl,
  remainingMs,
  totalMs,
  showSkipButton,
  onSkip,
  skipping = false,
  fullScreen = true,
}) => {
  const progressPercent = totalMs > 0 ? ((totalMs - remainingMs) / totalMs) * 100 : 0;
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center p-8'
    : 'w-full h-full flex items-center justify-center p-8';

  return (
    <div
      className={containerClass}
      style={{
        background: `linear-gradient(135deg, ${customization.backgroundGradient.color1} 0%, ${customization.backgroundGradient.color2} 50%, ${customization.backgroundGradient.color3} 100%)`,
      }}
    >
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          {resolvedLogoUrl && (
            <img
              src={resolvedLogoUrl}
              alt="WAVE"
              className="w-40 h-40 mx-auto object-contain rounded-3xl shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>

        <h1 className="text-6xl font-bold mb-4 drop-shadow-lg" style={{ color: customization.breakTitle.color }}>
          {customization.breakTitle.text}
        </h1>
        <p className="text-2xl mb-12 font-medium" style={{ color: customization.breakSubtitle.color }}>
          {customization.breakSubtitle.text}
        </p>

        <div className="mb-12">
          <div
            className="text-9xl font-bold mb-8 font-mono drop-shadow-2xl"
            style={{ color: customization.timerColor }}
          >
            {formatLockTime(remainingMs)}
          </div>

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

        {showSkipButton && (
          <button
            onClick={onSkip}
            disabled={skipping || !onSkip}
            className="px-10 py-5 backdrop-blur-xl text-xl font-bold rounded-2xl transition-all duration-200 border-3 border-white/40 shadow-2xl hover:scale-105 active:scale-95 hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-90"
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

export default LockScreenView;
