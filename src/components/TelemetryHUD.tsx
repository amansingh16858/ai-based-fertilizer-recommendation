import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplet, 
  Thermometer, 
  Wind, 
  ShieldCheck, 
  AlertTriangle, 
  Wifi, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCw,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SoilTelemetry } from '../types';

interface TelemetryHUDProps {
  telemetry: SoilTelemetry;
  onUpdateMoisture: (val: number) => void;
  onUpdateTemp: (val: number) => void;
  onUpdateHumidity: (val: number) => void;
  isTempOverridden?: boolean;
  isHumidityOverridden?: boolean;
  onResetTempOverride?: () => void;
  onResetHumidityOverride?: () => void;
  isDhtLive?: boolean;
  isProbeConnected?: boolean;
  esp32Ip: string;
  onEsp32IpChange: (ip: string) => void;
  onRefreshTelemetry?: () => void;
  isSampleActive?: boolean;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  telemetry,
  onUpdateMoisture,
  onUpdateTemp,
  onUpdateHumidity,
  isTempOverridden = false,
  isHumidityOverridden = false,
  onResetTempOverride,
  onResetHumidityOverride,
  isDhtLive = false,
  isProbeConnected = false,
  esp32Ip,
  onEsp32IpChange,
  onRefreshTelemetry,
  isSampleActive = false
}) => {
  const [isIpDrawerOpen, setIsIpDrawerOpen] = useState(false);
  const moisture = telemetry.moisturePercent;
  const temp = telemetry.temperatureC;
  const humidity = telemetry.humidityPercent;

  // Smooth transition from previous value to new value (never reset to 0!)
  const [animatedMoisture, setAnimatedMoisture] = useState(moisture);
  const prevMoistureRef = useRef(moisture);

  useEffect(() => {
    const startVal = prevMoistureRef.current;
    const targetVal = moisture;
    prevMoistureRef.current = targetVal;

    // If change is minimal (< 1.0%), lock onto value directly without sweep
    if (Math.abs(targetVal - startVal) < 1.0) {
      setAnimatedMoisture(targetVal);
      return;
    }

    const duration = 350; // Fast and snappy 350ms smooth glide
    const startTime = performance.now();

    const animateSweep = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 2);
      const current = startVal + (targetVal - startVal) * ease;
      setAnimatedMoisture(current);

      if (progress < 1) {
        requestAnimationFrame(animateSweep);
      } else {
        setAnimatedMoisture(targetVal);
      }
    };

    const animId = requestAnimationFrame(animateSweep);
    return () => cancelAnimationFrame(animId);
  }, [moisture]);

  const connectionSourceText = esp32Ip && esp32Ip.trim() !== '' 
    ? esp32Ip.trim() 
    : 'USB Serial (COM3)';

  // Professional AgTech State Awareness:
  // When resting in air on a desk, capacitive reading is at ambient baseline (<= 26%).
  // An enterprise grade instrument detects this and declares "Probe in Air (Standby)",
  // refusing to falsely diagnose air as "dry soil needing irrigation".
  const isProbeInAir = isProbeConnected && moisture <= 26;

  // Semantic Status Styling
  let statusLabel = 'Good Moisture';
  let badgeColor = 'bg-[#F0F4E8] dark:bg-[#19241E] text-[#3E5A1E] dark:text-[#E0EDD1] border-[#4B5C1E]/30';
  let strokeColor = '#4B5C1E';

  if (isProbeInAir) {
    statusLabel = 'Not in Soil';
    badgeColor = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300/60 dark:border-indigo-700/50';
    strokeColor = '#6366F1';
  } else if (moisture < 30) {
    statusLabel = 'Dry Soil (Needs Water)';
    badgeColor = 'bg-[#FEF4E8] dark:bg-[#2A1D12] text-[#9A4B12] dark:text-[#FCD34D] border-[#D97B2E]/30';
    strokeColor = '#D97B2E';
  } else if (moisture > 70) {
    statusLabel = 'Soil is Too Wet';
    badgeColor = 'bg-[#E0F2FE] dark:bg-[#0C2438] text-[#075985] dark:text-[#BAE6FD] border-[#0284C7]/30';
    strokeColor = '#0284C7';
  }

  const isFungalRisk = humidity > 75 && temp > 26;

  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * 0.75;
  const activeDash = Math.max(0, Math.min(totalArc, (animatedMoisture / 100) * totalArc));
  const remainingGap = circumference - activeDash;

  return (
    <div className="flex flex-col gap-3 font-sans">

      {/* Main Soil Moisture Card with Integrated Sensor Connection */}
      <div className="bg-white dark:bg-[#141518] rounded-[22px] p-4 sm:p-5 border border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all">
        
        {/* Header: Droplet + Title + Status + Sensor Link */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
              isProbeInAir
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400'
                : 'bg-sky-50 dark:bg-sky-950/50 border-sky-200/60 dark:border-sky-800/40 text-sky-600 dark:text-sky-400'
            }`}>
              <Droplet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-neutral-100 tracking-tight leading-none whitespace-nowrap">
                  Soil Moisture Sensor
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold ${
                  isProbeInAir 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : moisture < 30 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : moisture > 70 
                    ? 'text-sky-600 dark:text-sky-400' 
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isProbeInAir 
                      ? 'bg-indigo-500 animate-pulse' 
                      : moisture < 30 
                      ? 'bg-amber-500' 
                      : moisture > 70 
                      ? 'bg-sky-500' 
                      : 'bg-emerald-500'
                  }`} />
                  {statusLabel}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
                {isProbeConnected 
                  ? isProbeInAir 
                    ? `Sensor connected (${connectionSourceText}) · Push into soil to test`
                    : `Streaming live soil data via ${connectionSourceText}` 
                  : isSampleActive 
                  ? `Pre-filled from field sample (${moisture}%)`
                  : 'Probe offline — slide below to set manually'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsIpDrawerOpen(!isIpDrawerOpen)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all border flex-shrink-0 ${
              isProbeConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
                : 'bg-slate-100 dark:bg-[#1A1B1E] text-slate-700 dark:text-neutral-200 hover:bg-slate-200 dark:hover:bg-[#222428] border-slate-200/70 dark:border-white/[0.07]'
            }`}
          >
            <Wifi className={`w-3 h-3 ${isProbeConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{isProbeConnected ? 'Probe Connected' : 'Connect ESP32'}</span>
            {isIpDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expandable IP drawer */}
        {isIpDrawerOpen && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E0F11] border border-slate-200/80 dark:border-white/[0.07] flex flex-col gap-1.5 animate-fade-in">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ESP32 IP (e.g. 192.168.1.45)"
                value={esp32Ip}
                onChange={(e) => onEsp32IpChange(e.target.value)}
                className="flex-1 bg-white dark:bg-[#18191C] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              {onRefreshTelemetry && (
                <button
                  type="button"
                  onClick={onRefreshTelemetry}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Sync</span>
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-400">
              Enter ESP32 IP address to stream live telemetry over local Wi-Fi.
            </span>
          </div>
        )}

        {/* Soil Hardware Status Banner */}
        <div className="mb-2">
          {isProbeConnected ? (
            <div className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl border transition-all ${
              isProbeInAir
                ? 'text-indigo-900 dark:text-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-500/30'
                : 'text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300/70 dark:border-emerald-500/30'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isProbeInAir ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
                }`} />
                <span className="font-medium truncate">
                  {isProbeInAir 
                    ? `Sensor is in the air. Push it into soil to check moisture.`
                    : `Live sensor connected. Reading soil moisture.`
                  }
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold flex-shrink-0 ml-2 ${
                isProbeInAir
                  ? 'bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200'
                  : 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
              }`}>
                {isProbeInAir ? 'NOT IN SOIL' : 'IN SOIL'}
              </span>
            </div>
          ) : isSampleActive ? (
            <div className="w-full flex items-center justify-between text-xs text-sky-800 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/30 border border-sky-300/70 dark:border-sky-500/30 p-2.5 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                <span className="font-semibold truncate">Pre-filled from field sample ({moisture}%). You can slide below to adjust anytime.</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-200/60 dark:bg-sky-900/60 font-bold flex-shrink-0 ml-2">SAMPLE DATA</span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-500/30 p-2.5 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 animate-ping" />
                <span className="font-semibold truncate">Probe not connected. Slide the bar below to set your soil moisture, or connect ESP32.</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 font-bold flex-shrink-0 ml-2">MANUAL SLIDER</span>
            </div>
          )}
        </div>

        {/* Progress Ring Gauge (Optimized Golden Viewport - Spacious Apple-grade ring) */}
        <div className="relative flex flex-col items-center justify-center my-1 sm:my-2">
          <svg className="w-40 h-40 xs:w-44 xs:h-44 sm:w-52 sm:h-52" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="moistureGradIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="moistureGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
              <linearGradient id="moistureGradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="moistureGradSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            {/* Ambient Background Track (270 degree arc, starting at 135 deg / 7:30) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${totalArc} ${circumference * 0.25}`}
              strokeDashoffset="0"
              transform="rotate(135 100 100)"
              strokeLinecap="round"
              className="text-slate-100 dark:text-white/[0.07]"
            />
            {/* Dynamic Telemetry Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={`url(#${isProbeInAir ? 'moistureGradIndigo' : moisture < 30 ? 'moistureGradAmber' : moisture > 70 ? 'moistureGradSky' : 'moistureGradEmerald'})`}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${activeDash} ${remainingGap}`}
              strokeDashoffset="0"
              transform="rotate(135 100 100)"
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Value — perfectly centered with ample clearance */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="flex items-baseline">
              <span className="text-[30px] xs:text-[34px] sm:text-[40px] font-extrabold font-sans text-slate-900 dark:text-neutral-50 tracking-tight tabular-nums leading-none">
                {Math.round(animatedMoisture)}
              </span>
              <span className="text-[15px] sm:text-[17px] font-bold text-slate-400 dark:text-neutral-500 ml-0.5 leading-none">
                %
              </span>
            </div>
            
            {/* Precision Status Micro-Badge */}
            <div className="mt-1.5 sm:mt-2">
              {isProbeInAir ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/20 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-[10.5px] font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                  Not in Soil
                </span>
              ) : moisture < 30 ? (
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] sm:text-[10.5px] font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                  Dry Soil
                </span>
              ) : moisture > 70 ? (
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-400/10 border border-sky-500/20 dark:border-sky-400/20 text-sky-700 dark:text-sky-300 text-[10px] sm:text-[10.5px] font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse flex-shrink-0" />
                  Too Wet
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[10.5px] font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  Good Soil
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick 1-Tap Simulation Presets */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5 bg-slate-50 dark:bg-[#0E0F11] p-1 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => onUpdateMoisture(18)}
            className={`flex-1 py-1.5 sm:py-1 px-1.5 rounded-lg text-xs font-semibold transition-all text-center min-h-[38px] sm:min-h-[auto] flex items-center justify-center ${
              moisture <= 25 
                ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Dry (18%)
          </button>
          <button
            type="button"
            onClick={() => onUpdateMoisture(48)}
            className={`flex-1 py-1.5 sm:py-1 px-1.5 rounded-lg text-xs font-semibold transition-all text-center min-h-[38px] sm:min-h-[auto] flex items-center justify-center ${
              moisture > 25 && moisture < 65 
                ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Good (48%)
          </button>
          <button
            type="button"
            onClick={() => onUpdateMoisture(82)}
            className={`flex-1 py-1.5 sm:py-1 px-1.5 rounded-lg text-xs font-semibold transition-all text-center min-h-[38px] sm:min-h-[auto] flex items-center justify-center ${
              moisture >= 65 
                ? 'bg-sky-100/80 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Wet (82%)
          </button>
        </div>

        {/* Calibration Slider */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.07]">
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-neutral-400 font-semibold mb-1">
            <span>Adjust Soil Moisture</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{moisture}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="95"
            step="1"
            value={moisture}
            onChange={(e) => onUpdateMoisture(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-100 dark:bg-[#0E0F11] rounded-full appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500 font-medium mt-1 uppercase tracking-wider">
            <span>0% Dry</span>
            <span>50% Good</span>
            <span>100% Flooded</span>
          </div>
        </div>

      </div>

      {/* 2. Microclimate Grid */}
      <div className="grid grid-cols-2 gap-2.5 font-sans">
        
        {/* Temperature Card */}
        <div className="bg-white dark:bg-[#141517] rounded-xl p-3 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center flex-shrink-0">
                <Thermometer className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Temperature
              </span>
            </div>
            {/* Provenance Badge & Sync Trigger */}
            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded transition-all ${
                isTempOverridden 
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/50'
                  : isDhtLive
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/50'
                  : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-neutral-400 border border-slate-200/60 dark:border-white/[0.06]'
              }`}>
                {isTempOverridden ? 'Manual Set' : isDhtLive ? '● Live DHT11' : '☁ Ambient'}
              </span>
              {isTempOverridden && onResetTempOverride && (
                <button
                  type="button"
                  onClick={onResetTempOverride}
                  title="Sync back to hardware / ambient reading"
                  className="p-1 rounded hover:bg-amber-100/70 dark:hover:bg-amber-950/70 text-amber-600 dark:text-amber-400 transition-all hover:rotate-180 duration-300 flex items-center justify-center"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-neutral-100">{temp.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-sans">°C</span>
          </div>
          <input
            type="range"
            min="15"
            max="45"
            step="0.5"
            value={temp}
            onChange={(e) => onUpdateTemp(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-100 dark:bg-[#0E0F11] rounded-full appearance-none cursor-pointer accent-amber-500 mt-2"
          />
        </div>

        {/* Humidity Card */}
        <div className="bg-white dark:bg-[#141517] rounded-xl p-3 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center flex-shrink-0">
                <Wind className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Humidity
              </span>
            </div>
            {/* Provenance Badge & Sync Trigger */}
            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded transition-all ${
                isHumidityOverridden 
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/50'
                  : isDhtLive
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/50'
                  : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-neutral-400 border border-slate-200/60 dark:border-white/[0.06]'
              }`}>
                {isHumidityOverridden ? 'Manual Set' : isDhtLive ? '● Live DHT11' : '☁ Ambient'}
              </span>
              {isHumidityOverridden && onResetHumidityOverride && (
                <button
                  type="button"
                  onClick={onResetHumidityOverride}
                  title="Sync back to hardware / ambient reading"
                  className="p-1 rounded hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 transition-all hover:rotate-180 duration-300 flex items-center justify-center"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-neutral-100">{humidity.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-sans">% RH</span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            step="1"
            value={humidity}
            onChange={(e) => onUpdateHumidity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-100 dark:bg-[#0E0F11] rounded-full appearance-none cursor-pointer accent-emerald-500 mt-2"
          />
        </div>

      </div>

      {/* 3. Canopy Microclimate Status Card */}
      <div className={`rounded-xl p-2.5 border flex items-center gap-2.5 transition-colors ${
        isFungalRisk 
          ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200' 
          : 'bg-white dark:bg-[#141517] border-slate-200/80 dark:border-white/[0.08] shadow-xs text-slate-700 dark:text-neutral-300'
      }`}>
        <div className={`p-1.5 rounded-lg flex-shrink-0 ${isFungalRisk ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-emerald-50 dark:bg-emerald-950/50'}`}>
          {isFungalRisk ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">
              {isFungalRisk ? 'High Risk of Leaf Mold / Fungus' : 'Weather & Air Conditions Normal'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 flex-shrink-0">
              {telemetry.timestamp}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
            {isFungalRisk 
              ? 'Warm, humid air can breed mildew or fungus spores.' 
              : 'Temperature and humidity are ideal for plant growth.'}
          </p>
        </div>
      </div>

    </div>
  );
};