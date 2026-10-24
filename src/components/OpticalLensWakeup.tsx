import React, { useEffect, useState } from 'react';

interface OpticalLensWakeupProps {
  theme: 'dark' | 'light';
}

/**
 * Pure Cinematic Focus Pull / Fast Unblur Wake-up
 * 
 * Clean, frictionless page entrance:
 * - 18px Frosted Glass unblurring smoothly to 0px (700ms)
 * - Zero distracting bubbles or rings in the center
 * - Subtle tactile micro-shimmer grain
 * - Clean unmount with zero layout shifts or performance overhead
 */
export const OpticalLensWakeup: React.FC<OpticalLensWakeupProps> = ({ theme }) => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // 700ms cinematic focus pull + 40ms buffer -> unmount cleanly at 740ms
    const timer = setTimeout(() => {
      setIsActive(false);
    }, 740);

    return () => clearTimeout(timer);
  }, []);

  if (!isActive) return null;

  const isDark = theme === 'dark';

  return (
    <div 
      className="fixed inset-0 z-[999990] pointer-events-none overflow-hidden select-none"
      style={{
        animation: '700ms opticalLensWakeup cubic-bezier(0.22, 1, 0.36, 1) forwards',
        willChange: 'backdrop-filter, opacity'
      }}
    >
      {/* 1. Luminous Ambient Atmosphere */}
      <div 
        className={`absolute inset-0 pointer-events-none ${
          isDark ? 'bg-[#090D14]/20' : 'bg-[#F8FAFC]/20'
        }`}
      />

      {/* 2. Pure Monochromatic Micro-Grain (Diamond Shimmer Dust) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='whiteNoiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23whiteNoiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};
