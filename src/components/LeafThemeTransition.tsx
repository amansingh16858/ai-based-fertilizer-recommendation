import React, { useEffect, useRef } from 'react';

interface LeafThemeTransitionProps {
  isActive: boolean;
  targetTheme: 'dark' | 'light';
  origin?: { x: number; y: number };
  onThemeSwitch?: () => void;
  onComplete: () => void;
}

/**
 * Ultra-Lightweight Zero-Jank Radial Fallback Transition
 * Used on browsers that do not support the native View Transitions API.
 * Pure GPU clip-path, zero heavy backdrop-filters, zero frame drops (locked 120 FPS).
 */
export const LeafThemeTransition: React.FC<LeafThemeTransitionProps> = ({
  isActive,
  targetTheme,
  origin = { x: 0, y: 0 },
  onThemeSwitch,
  onComplete
}) => {
  const onThemeSwitchRef = useRef(onThemeSwitch);
  onThemeSwitchRef.current = onThemeSwitch;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) return;

    // Theme switches synchronously at 260ms when the circular wave blankets the screen
    const switchTimer = setTimeout(() => {
      onThemeSwitchRef.current?.();
    }, 260);

    // Unmount cleanly at 520ms
    const finishTimer = setTimeout(() => {
      onCompleteRef.current?.();
    }, 520);

    return () => {
      clearTimeout(switchTimer);
      clearTimeout(finishTimer);
    };
  }, [isActive]);

  if (!isActive) return null;

  const isDarkTarget = targetTheme === 'dark';
  const sweepX = origin.x ? `${origin.x}px` : 'calc(100% - 64px)';
  const sweepY = origin.y ? `${origin.y}px` : '36px';

  return (
    <div 
      className="fixed inset-0 z-[999999] pointer-events-none overflow-hidden select-none"
      style={{
        isolation: 'isolate',
        ['--sweep-x' as any]: sweepX,
        ['--sweep-y' as any]: sweepY
      }}
    >
      {/* Zero-Lag Expanding Circular Sheet */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDarkTarget ? 'bg-[#0C0D0E]' : 'bg-[#F8FAFC]'
        }`}
        style={{
          animation: '520ms botanicalSweepMask cubic-bezier(0.22, 1, 0.36, 1) forwards',
          willChange: 'clip-path, opacity'
        }}
      />
    </div>
  );
};
