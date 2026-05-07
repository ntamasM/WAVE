import React, { useEffect, useRef, useState } from 'react';
import type { CustomizationSettings } from '../../types/settings.types';
import { LockScreenView } from './LockScreenView';

const PREVIEW_WIDTH = 1280;
const PREVIEW_HEIGHT = 720;
const DEMO_TOTAL_MS = 10 * 60 * 1000;
const DEMO_REMAINING_MS = 5 * 60 * 1000 + 23 * 1000;

export interface LockScreenPreviewProps {
  customization: CustomizationSettings;
  resolvedLogoUrl: string;
}

export const LockScreenPreview: React.FC<LockScreenPreviewProps> = ({ customization, resolvedLogoUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setScale(w / PREVIEW_WIDTH);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl shadow-lg border-2 border-bright-gray-200 dark:border-bright-gray-700 bg-bright-gray-100 dark:bg-bright-gray-800"
      style={{ aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }}
    >
      <div
        className="absolute top-0 left-0 pointer-events-none select-none"
        style={{
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <LockScreenView
          customization={customization}
          resolvedLogoUrl={resolvedLogoUrl}
          remainingMs={DEMO_REMAINING_MS}
          totalMs={DEMO_TOTAL_MS}
          showSkipButton={true}
          fullScreen={false}
        />
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium tracking-wide pointer-events-none">
        Live Preview
      </div>
    </div>
  );
};

export default LockScreenPreview;
