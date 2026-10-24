import React from 'react';
import { 
  Sun, 
  Moon, 
  Sliders, 
  ChevronDown, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { FarmProfile } from '../types';

interface HeaderProps {
  farmProfile: FarmProfile;
  onOpenFarmModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: (e: React.MouseEvent) => void;
  isProbeConnected: boolean;
  onOpenApiKeyModal?: () => void;
  onOpenSamplesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  farmProfile,
  onOpenFarmModal,
  theme,
  onToggleTheme,
  isProbeConnected,
  onOpenSamplesModal
}) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`w-full max-w-full select-none sticky top-0 z-30 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/85 dark:bg-[#090A0D]/85 backdrop-blur-md border-b border-slate-200/60 dark:border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.02)]' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-[1520px] w-full mx-auto h-14 sm:h-[72px] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">

        {/* ========================================================================= */}
        {/* ZONE 1: BRAND IDENTITY (PURE MONOLITHIC MARK & WORDMARK)                  */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 group cursor-pointer" title="AgroVeda Intelligence">
          {/* Pure Living Organism Sprout Mark (No Box Background) */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg 
              className="w-5 h-5 sm:w-[24px] sm:h-[24px] transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 animate-plant-sprout animate-plant-breathe" 
              viewBox="0 0 32 32" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Sunlit Emerald Primary Leaf Gradient */}
                <linearGradient id="livingLeafPrimary" x1="6" y1="4" x2="17.5" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="60%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                {/* Rich Depth Secondary Leaf Gradient */}
                <linearGradient id="livingLeafSecondary" x1="16" y1="8" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>

              {/* Left Living Leaf (with subtle organic flutter) */}
              <g className="animate-leaf-left">
                <path 
                  d="M16 28C16 28 15.5 20 10.5 15.5C5.5 11 6 4 6 4C6 4 13 4.5 17.5 9.5C20.5 13 18.5 20 16 28Z" 
                  fill="url(#livingLeafPrimary)" 
                />
              </g>

              {/* Right Companion Leaf (with complementary flex) */}
              <g className="animate-leaf-right">
                <path 
                  d="M16 28C16 28 17.5 21 21.5 17.5C25.5 14 26 8 26 8C26 8 20 8.5 16 13.5" 
                  fill="url(#livingLeafSecondary)" 
                />
              </g>

              {/* Central Bioluminescent Stem Vein */}
              <path 
                d="M16 28C16 22 15 15 8 7" 
                stroke="#FFFFFF" 
                strokeWidth="1.6" 
                strokeLinecap="round" 
                strokeOpacity="0.9" 
              />

              {/* Dewdrop Glimmer Micro-Accent */}
              <circle cx="16" cy="14" r="1.1" fill="#FFFFFF" opacity="0.95" />
            </svg>
          </div>

          {/* Wordmark */}
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[15px] sm:text-[18px] text-slate-900 dark:text-white tracking-tight leading-none">
              AgroVeda
            </span>
            <span className="font-serif italic text-[13.5px] text-slate-500 dark:text-neutral-400 font-normal leading-none hidden md:inline">
              Intelligence
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ZONE 2: FARM PROFILE COMMAND SEGMENT (CROP & PLOT HUD)                     */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center flex-1 min-w-0 max-w-[210px] sm:max-w-[460px]">
          <button
            onClick={onOpenFarmModal}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-full border border-slate-300/90 dark:border-white/12 bg-white/90 dark:bg-[#1A1C20]/90 hover:bg-white dark:hover:bg-[#222429] text-slate-900 dark:text-neutral-100 text-xs sm:text-[13px] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group active:scale-[0.98] cursor-pointer backdrop-blur-md max-w-full"
            title="Configure Farm & Crop Profile"
          >
            <Sliders className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-45 transition-transform flex-shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-neutral-100 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[180px]">{farmProfile.cropName}</span>
            <span className="text-slate-300 dark:text-neutral-600 hidden xs:inline">·</span>
            <span className="text-slate-500 dark:text-neutral-400 text-[11px] sm:text-[12px] whitespace-nowrap hidden xs:inline">{farmProfile.plotArea}</span>
            <ChevronDown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 dark:text-neutral-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors ml-0.5 flex-shrink-0" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ZONE 3: ACTIONS, THEME SWITCHER & CTA                                     */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={(e) => onToggleTheme(e)}
            className="w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-slate-900/[0.04] dark:bg-white/[0.06] hover:bg-slate-900/[0.08] dark:hover:bg-white/[0.10] border border-slate-900/[0.06] dark:border-white/[0.08] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center flex-shrink-0"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-slate-700" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-4 bg-slate-300/70 dark:bg-white/[0.10]" />

          {/* Try Samples CTA */}
          {onOpenSamplesModal && (
            <button
              onClick={onOpenSamplesModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] sm:text-[12px] transition-all shadow-sm hover:shadow-md hover:shadow-emerald-600/20 active:scale-95 group cursor-pointer flex-shrink-0"
              title="Try crop disease samples"
            >
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-100 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Try Samples</span>
              <span className="sm:hidden">Samples</span>
              <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform hidden xs:inline" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};