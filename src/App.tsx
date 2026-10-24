import React, { useState, useEffect, useRef } from 'react';
import { fetchESP32Telemetry } from './services/esp32Service';
import { 
  runStage1VisionExtraction, 
  runStage2AgronomicReasoning 
} from './services/aiService';
import { Header } from './components/Header';
import { DiagnosticStudio } from './components/DiagnosticStudio';
import { TelemetryHUD } from './components/TelemetryHUD';
import { PrescriptionCard } from './components/PrescriptionCard';
import { FarmProfileModal } from './components/FarmProfileModal';
import { ModelInspectorDrawer } from './components/ModelInspectorDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SampleLeavesModal } from './components/SampleLeavesModal';
import { LeafThemeTransition } from './components/LeafThemeTransition';
import { 
  SoilTelemetry, 
  FarmProfile, 
  SystemLog, 
  VisionAnalysisResult, 
  AgronomicPrescription, 
  SampleLeaf
} from './types';
import { Cpu, Zap, RefreshCw, Camera, ArrowRight } from 'lucide-react';

export function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const urlTheme = new URLSearchParams(window.location.search).get('theme');
      if (urlTheme === 'dark' || urlTheme === 'light') return urlTheme;
      return (localStorage.getItem('agroveda_theme') as 'light' | 'dark') || (localStorage.getItem('agropulse_theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Fallback Transition state
  const [leafTransition, setLeafTransition] = useState<{
    isActive: boolean;
    targetTheme: 'dark' | 'light';
    origin?: { x: number; y: number };
  }>({
    isActive: false,
    targetTheme: 'light',
  });

  // Farm & telemetry state
  const [farmProfile, setFarmProfile] = useState<FarmProfile>({
    cropName: 'Auto-Detect Any Crop',
    soilType: 'Loamy',
    plotArea: '1 Acre',
    region: 'Central Plains'
  });

  const [telemetry, setTelemetry] = useState<SoilTelemetry>({
    moisturePercent: 28.5,
    temperatureC: 31.5,
    humidityPercent: 66.5,
    soilPH: 6.8,
    timestamp: new Date().toLocaleTimeString(),
    isSimulated: true
  });

  const [esp32Ip, setEsp32Ip] = useState<string>('');
  const [isProbeConnected, setIsProbeConnected] = useState<boolean>(false);

  // Diagnostic State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cookingStage, setCookingStage] = useState<1 | 2 | 3>(1);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [prescription, setPrescription] = useState<AgronomicPrescription | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  // Modals & Drawers
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSamplesModalOpen, setIsSamplesModalOpen] = useState(false);
  const [isSampleActive, setIsSampleActive] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Stale request guard & step 3 scroll anchor
  const requestIdRef = useRef(0);
  const step3Ref = useRef<HTMLDivElement>(null);

  const scrollToStep3 = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = step3Ref.current || document.getElementById('step-3-blueprint');
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 60);
    });
  };

  const addLog = (
    message: string, 
    source: SystemLog['source'] = 'System', 
    type: SystemLog['type'] = 'info'
  ) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      source,
      message,
      type
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Sync dark mode class with state
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Manual Overrides for Microclimate (Scenario Testing)
  const [manualTemp, setManualTemp] = useState<number | null>(null);
  const [manualHumidity, setManualHumidity] = useState<number | null>(null);
  const manualTempRef = useRef<number | null>(null);
  const manualHumidityRef = useRef<number | null>(null);
  manualTempRef.current = manualTemp;
  manualHumidityRef.current = manualHumidity;

  // Initial Hardware check & Polling
  useEffect(() => {
    addLog('System online. Ready for multimodal diagnostics.', 'System', 'success');

    let isMounted = true;
    const syncHardware = async () => {
      try {
        const liveTel = await fetchESP32Telemetry(esp32Ip);
        if (!isMounted) return;
        setTelemetry(prev => ({
          ...liveTel,
          temperatureC: manualTempRef.current ?? liveTel.temperatureC,
          humidityPercent: manualHumidityRef.current ?? liveTel.humidityPercent
        }));
        setIsProbeConnected(!liveTel.isSimulated);
      } catch {
        if (isMounted) setIsProbeConnected(false);
      }
    };

    // Run immediately, then poll every 2.5s for live probe streaming
    syncHardware();
    const intervalId = setInterval(syncHardware, 2500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [esp32Ip]);

  const handleUpdateTemp = (val: number) => {
    setManualTemp(val);
    manualTempRef.current = val;
    setTelemetry(prev => ({ ...prev, temperatureC: val }));
  };

  const handleUpdateHumidity = (val: number) => {
    setManualHumidity(val);
    manualHumidityRef.current = val;
    setTelemetry(prev => ({ ...prev, humidityPercent: val }));
  };

  const handleResetTempOverride = async () => {
    setManualTemp(null);
    manualTempRef.current = null;
    try {
      const liveTel = await fetchESP32Telemetry(esp32Ip);
      setTelemetry(prev => ({ ...prev, temperatureC: liveTel.temperatureC }));
      addLog('Temperature synced to live hardware/ambient stream.', 'System', 'info');
    } catch {
      // fallback
    }
  };

  const handleResetHumidityOverride = async () => {
    setManualHumidity(null);
    manualHumidityRef.current = null;
    try {
      const liveTel = await fetchESP32Telemetry(esp32Ip);
      setTelemetry(prev => ({ ...prev, humidityPercent: liveTel.humidityPercent }));
      addLog('Humidity synced to live hardware/ambient stream.', 'System', 'info');
    } catch {
      // fallback
    }
  };

  const handleSelectSample = (sample: SampleLeaf) => {
    requestIdRef.current += 1;
    setIsLoading(false);
    setCurrentImage(sample.imageUrl);
    setIsSampleActive(true);
    setVisionResult(null);
    setPrescription(null);
    setDiagnosticError(null);
    setTelemetry(sample.defaultTelemetry);
    setFarmProfile(prev => ({
      ...prev,
      cropName: sample.crop
    }));
    addLog(`Sample loaded: ${sample.title}. Soil synced to ${sample.defaultTelemetry.moisturePercent}%.`, 'System', 'info');
    if (typeof window !== 'undefined' && window.scrollY > 40) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Run the Two-Stage AI Diagnostic Pipeline
  const handleRunDiagnosis = async () => {
    if (!currentImage) {
      addLog('Please upload or snap a leaf photo first.', 'System', 'warning');
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    // STEP 0: GUARANTEED ACT 1 VIEWPORT LOCK
    // If the user is scrolled down, smoothly glide them back to the top so they are guaranteed
    // to see the leaf cellular scanner and bounding box acquisition every single time!
    if (typeof window !== 'undefined' && window.scrollY > 40) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 380));
      if (thisRequestId !== requestIdRef.current) return;
    }

    setIsLoading(true);
    setCookingStage(1);
    setDiagnosticError(null);
    setPrescription(null);
    setVisionResult(null);

    try {
      setLoadingStep('Stage 1: Scanning leaf cellular structures & identifying pathology...');
      addLog('Dispatching leaf scan to Stage 1 Vision Model...', 'Vision API', 'info');

      // GUARANTEED PERCEPTUAL DWELL TIME FOR ACT 1:
      // The laser sweep and neural reticles run for a guaranteed minimum of 1400ms
      // so that every diagnosis feels premium, deliberate, and satisfyingly thorough.
      const minDwellPromise = new Promise(resolve => setTimeout(resolve, 1400));
      const visionPromise = runStage1VisionExtraction(
        currentImage, 
        (msg) => addLog(msg, 'Vision API', 'info'),
        farmProfile.cropName,
        isSampleActive
      );

      const [stage1Result] = await Promise.all([visionPromise, minDwellPromise]);

      if (thisRequestId !== requestIdRef.current) return;

      setVisionResult(stage1Result);

      if (!stage1Result.isPlant) {
        addLog(`Image rejected: Not a plant leaf (${stage1Result.rejectionReason || 'Unknown subject'}).`, 'Vision API', 'warning');
        setIsLoading(false);
        setLoadingStep('');
        return;
      }

      addLog(`Stage 1 complete: ${stage1Result.cropIdentified} (${stage1Result.suspectedPathology}, ${(stage1Result.confidenceScore * 100).toFixed(0)}% confidence).`, 'Vision API', 'success');

      // Visual latch pause so user sees bounding boxes lock onto the leaf image at the top
      await new Promise(r => setTimeout(r, 600));
      if (thisRequestId !== requestIdRef.current) return;

      // ACT 2: Smoothly glide down to the horizontal synthesis pipeline canvas
      scrollToStep3();

      // STAGE 2: Guaranteed Perceptual Dwell Time for Real Soil Telemetry Fusion
      setCookingStage(2);
      setLoadingStep(`Stage 2: Ingesting probe sensors — Correlating ${telemetry.moisturePercent}% soil moisture (${telemetry.moisturePercent < 30 ? 'Dry Stress' : 'Good Moisture'}) with leaf tissue...`);
      addLog(`Fusing symptoms with Soil Moisture (${telemetry.moisturePercent}%) & Microclimate...`, 'Reasoning Engine', 'info');

      const stage2MinDwell = new Promise(resolve => setTimeout(resolve, 1100));
      const stage2Promise = runStage2AgronomicReasoning(
        stage1Result, 
        telemetry, 
        farmProfile, 
        (msg) => addLog(msg, 'Reasoning Engine', 'info')
      );

      await stage2MinDwell;
      if (thisRequestId !== requestIdRef.current) return;

      // STAGE 3: Final Calibration & Recipe Balancing Dwell Time
      setCookingStage(3);
      setLoadingStep('Stage 3: Calibrating exact water buckets, safe spoon dosages & recovery plan...');
      addLog('Synthesizing customized fertilizer recipe and 14-day schedule...', 'Reasoning Engine', 'info');

      const [stage2Result] = await Promise.all([
        stage2Promise,
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      if (thisRequestId !== requestIdRef.current) return;

      setPrescription(stage2Result);
      addLog('Stage 2 complete: Prescription Plan formulated successfully.', 'Reasoning Engine', 'success');

    } catch (err: any) {
      if (thisRequestId === requestIdRef.current) {
        setDiagnosticError(err.message || 'Diagnostic pipeline failed. Please try again.');
        addLog(`Pipeline error: ${err.message}`, 'System', 'error');
      }
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setIsLoading(false);
        setLoadingStep('');
        setCookingStage(1);
      }
    }
  };

  // Smooth View Transitions Theme Toggle
  const handleThemeSwitch = (targetTheme: 'dark' | 'light') => {
    setTheme(targetTheme);
    localStorage.setItem('agroveda_theme', targetTheme);
    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleTheme = (event: React.MouseEvent) => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const clickX = event.clientX;
    const clickY = event.clientY;

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const isAppearanceTransition = true;
      if (isAppearanceTransition) {
        const x = clickX;
        const y = clickY;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = (document as any).startViewTransition(async () => {
          handleThemeSwitch(nextTheme);
        });

        transition.ready.then(() => {
          const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ];
          document.documentElement.animate(
            {
              clipPath: clipPath,
            },
            {
              duration: 480,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        }).catch(() => {
          handleThemeSwitch(nextTheme);
        });
      } else {
        handleThemeSwitch(nextTheme);
      }
    } else {
      setLeafTransition({
        isActive: true,
        targetTheme: nextTheme,
        origin: { x: clickX, y: clickY },
      });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans bg-luminous-stage text-slate-900 dark:text-neutral-100 ${leafTransition.isActive ? '' : 'transition-colors duration-300'} selection:bg-emerald-500/30 blueprint-grid relative w-full max-w-full overflow-x-hidden`}>
      
      {/* 1. Full-Bleed Sticky Command Header */}
      <Header
        farmProfile={farmProfile}
        onOpenFarmModal={() => setIsFarmModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isProbeConnected={isProbeConnected}
        onOpenSamplesModal={() => setIsSamplesModalOpen(true)}
      />

      {/* 2. Expansive Studio Canvas (Edge-to-Edge with Max Width Container) */}
      <main className="max-w-[1520px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 pb-24 sm:pb-28 lg:pb-28 flex-1 flex flex-col gap-4 sm:gap-6">
        
        {/* ==================================================================== */}
        {/* TIER 1: DUAL-INPUT HERO WORKBENCH (50/50 Desktop Grid)               */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* INPUT 1: LEAF CELLULAR SCANNER (6 of 12 cols - 50% Balanced Split) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-neutral-400">
                  Input 1 · <span className="font-serif italic normal-case tracking-normal font-semibold text-slate-900 dark:text-neutral-200">Leaf Photo Scanner</span>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-neutral-500 font-medium">
                {currentImage ? 'Leaf Ready ✓' : 'Awaiting Photo'}
              </span>
            </div>

            <DiagnosticStudio
              currentImage={currentImage}
              onImageChange={(b64) => {
                requestIdRef.current += 1;
                setIsLoading(false);
                setCurrentImage(b64);
                setIsSampleActive(false);
                setVisionResult(null);
                setPrescription(null);
                setDiagnosticError(null);
              }}
              onClearImage={() => {
                requestIdRef.current += 1;
                setIsLoading(false);
                setCurrentImage(null);
                setIsSampleActive(false);
                setVisionResult(null);
                setPrescription(null);
                setDiagnosticError(null);
                addLog('Leaf photo cleared. Ready for next leaf.', 'System', 'info');
              }}
              isLoading={isLoading}
              loadingStep={loadingStep}
              visionResult={visionResult}
              diagnosticError={diagnosticError}
              onOpenSamplesModal={() => setIsSamplesModalOpen(true)}
              onSelectSample={handleSelectSample}
            />

          </div>

          {/* INPUT 2: SOIL & ENVIRONMENTAL TELEMETRY (6 of 12 cols - 50% Balanced Split) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-neutral-400">
                  Input 2 · <span className="font-serif italic normal-case tracking-normal font-semibold text-slate-900 dark:text-neutral-200">Soil Moisture Sensor</span>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-neutral-500 font-medium">
                {isProbeConnected ? 'Live ESP32 Stream' : isSampleActive ? 'Field Sample Preset' : `${telemetry.moisturePercent}% Manual Reading`}
              </span>
            </div>

            <TelemetryHUD
              telemetry={telemetry}
              isSampleActive={isSampleActive}
              onUpdateMoisture={(val) => {
                setIsSampleActive(false);
                setTelemetry(prev => ({ ...prev, moisturePercent: val }));
              }}
              onUpdateTemp={handleUpdateTemp}
              onUpdateHumidity={handleUpdateHumidity}
              isTempOverridden={manualTemp !== null}
              isHumidityOverridden={manualHumidity !== null}
              onResetTempOverride={handleResetTempOverride}
              onResetHumidityOverride={handleResetHumidityOverride}
              isDhtLive={Boolean(telemetry.isDhtLive)}
              isProbeConnected={isProbeConnected}
              esp32Ip={esp32Ip}
              onEsp32IpChange={setEsp32Ip}
              onRefreshTelemetry={async () => {
                if (!esp32Ip) {
                  addLog('Please enter the ESP32 Soil Probe IP address first.', 'ESP32', 'warning');
                  return;
                }
                addLog(`Syncing soil data from http://${esp32Ip}/telemetry...`, 'ESP32', 'info');
                const live = await fetchESP32Telemetry(esp32Ip);
                setTelemetry(live);
                addLog(`Soil readings updated: ${live.moisturePercent}% moisture.`, 'ESP32', 'success');
              }}
            />

          </div>

        </div>

        {/* ==================================================================== */}
        {/* TIER 2: UNIFIED MULTIMODAL COMMAND BRIDGE (Natural Document Flow)     */}
        {/* ==================================================================== */}
        <div className="relative bg-white dark:bg-[#141518] rounded-[20px] sm:rounded-[22px] p-3.5 sm:p-5 border border-slate-200/90 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex flex-col lg:flex-row items-center justify-between gap-3.5 sm:gap-4 overflow-hidden transition-all">
          
          {/* Synchronized Live Telemetry Evidence Group */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            
            {/* 1. Soil Probe Sensor (Primary Medium) */}
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all ${
              isProbeConnected 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                : 'bg-slate-50 dark:bg-[#1B1D22] border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200 shadow-xs'
            }`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isProbeConnected ? 'bg-emerald-500 animate-pulse' : telemetry.moisturePercent < 30 ? 'bg-amber-500' : telemetry.moisturePercent > 70 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 dark:text-neutral-400 truncate">
                  {isProbeConnected ? 'Live Soil Probe' : 'Soil Sensor'}
                </span>
                <span className="text-xs font-bold font-sans truncate">
                  {telemetry.moisturePercent}% ({telemetry.moisturePercent < 30 ? 'Dry' : telemetry.moisturePercent > 70 ? 'Wet' : 'Good'})
                </span>
              </div>
            </div>

            {/* 2. Microclimate */}
            <div className="col-span-2 sm:col-span-1 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#1B1D22] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 dark:text-neutral-400 truncate">Weather</span>
                <span className="text-xs font-bold font-sans truncate">
                  {telemetry.temperatureC}°C · {telemetry.humidityPercent}% RH
                </span>
              </div>
            </div>

            {/* 3. Visual Leaf Sensor */}
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all ${
              currentImage 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                : 'bg-slate-50 dark:bg-[#1B1D22] border-slate-200 dark:border-white/10 text-slate-500 dark:text-neutral-400'
            }`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${currentImage ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-neutral-600'}`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider font-mono opacity-70 truncate">Leaf Sensor</span>
                <span className="text-xs font-bold font-sans truncate">
                  {currentImage ? `${farmProfile.cropName.split(' ')[0]} (Ready ✓)` : 'No Leaf Photo'}
                </span>
              </div>
            </div>

          </div>

          {/* Single Authoritative Primary Action CTA */}
          <button
            onClick={handleRunDiagnosis}
            disabled={isLoading || !currentImage}
            className={`w-full lg:w-auto min-w-0 sm:min-w-[280px] lg:min-w-[320px] px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base tracking-tight transition-all flex items-center justify-center gap-2.5 sm:gap-3 shadow-lg active:scale-95 group ${
              isLoading
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.25)] cursor-wait'
                : !currentImage
                ? 'bg-slate-100 dark:bg-[#1E2024] text-slate-400 dark:text-neutral-500 border border-slate-200 dark:border-white/10 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400 flex-shrink-0" />
                <span className="font-semibold tracking-wide">
                  {cookingStage === 1
                    ? 'Scanning Leaf Tissue...'
                    : 'Fusing Soil Telemetry & Leaf Data...'}
                </span>
              </>
            ) : !currentImage ? (
              <>
                <Camera className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
                <span>Soil Set to {telemetry.moisturePercent}% • Add Leaf Photo to Finish Plan</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-emerald-200 animate-pulse" />
                <span>Mix Soil ({telemetry.moisturePercent}%) + Leaf to Make Fertilizer Recipe</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

        {/* ==================================================================== */}
        {/* TIER 3: STEP 3 · THE MASTER PLANT CARE PLAN (Full-Width Blueprint)     */}
        {/* ==================================================================== */}
        <div ref={step3Ref} id="step-3-blueprint" className="scroll-mt-20 flex flex-col gap-4 min-h-[460px]">
          
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-neutral-400">
                Step 3 · <span className="font-serif italic normal-case tracking-normal font-semibold text-slate-900 dark:text-neutral-200">Precision Fertilizer Recipe & Water Plan</span>
              </span>
            </div>
            
            {/* 3-Step Mini Progress Pipeline (Soil First, Leaf Second, Plan Third) */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-400 dark:text-neutral-500">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                1. Soil Moisture
              </span>
              <span>—</span>
              <span className={`flex items-center gap-1 ${currentImage ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentImage ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                2. Leaf Vision
              </span>
              <span>—</span>
              <span className={`flex items-center gap-1 ${prescription ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${prescription ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                3. Fertilizer Recipe
              </span>
            </div>
          </div>

          <PrescriptionCard
            prescription={prescription}
            visionResult={visionResult}
            soilTelemetry={telemetry}
            farmProfile={farmProfile}
            isLoading={isLoading}
            cookingStage={cookingStage}
            loadingStep={loadingStep}
            diagnosticError={diagnosticError}
            onRetry={handleRunDiagnosis}
            onOpenSamplesModal={() => setIsSamplesModalOpen(true)}
            currentImage={currentImage}
            isProbeConnected={isProbeConnected}
          />

        </div>

        {/* Studio Footer: Clean, Minimal Industrial Meta Bar */}
        <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-4 border-t border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-500 dark:text-neutral-400 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">AgroVeda Edge AI · Agronomic Neural Engine v2.4</span>
            <span className="text-slate-300 dark:text-neutral-600 hidden sm:inline">·</span>
            <span className="font-mono text-[11px] text-slate-400 dark:text-neutral-500 hidden sm:inline">120 FPS View Transitions</span>
          </div>
          <button
            onClick={() => setIsInspectorOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1A1C20] hover:bg-slate-50 dark:hover:bg-[#222429] text-slate-700 dark:text-neutral-200 border border-slate-300/80 dark:border-white/10 text-xs font-medium transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>System Drawer</span>
          </button>
        </footer>

      </main>

      {/* Universal Sticky Bottom Command Bar (Active on Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-2.5 sm:p-3 bg-white/95 dark:bg-[#0E1013]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-[max(0.65rem,env(safe-area-inset-bottom))]">
        <div className="max-w-[1520px] w-full mx-auto px-2 sm:px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Synchronized Live Telemetry Evidence Group (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* 1. Soil Probe */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isProbeConnected 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200' 
                : 'bg-slate-50 dark:bg-[#1B1D22] border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isProbeConnected ? 'bg-emerald-500 animate-pulse' : telemetry.moisturePercent < 30 ? 'bg-amber-500' : telemetry.moisturePercent > 70 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <span>{isProbeConnected ? 'Live Soil' : 'Soil'}: {telemetry.moisturePercent}% ({telemetry.moisturePercent < 30 ? 'Dry' : telemetry.moisturePercent > 70 ? 'Wet' : 'Good'})</span>
            </div>

            {/* 2. Microclimate */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1B1D22] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{telemetry.temperatureC}°C · {telemetry.humidityPercent}% RH</span>
            </div>

            {/* 3. Visual Sensor */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              currentImage 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200' 
                : 'bg-slate-50 dark:bg-[#1B1D22] border-slate-200 dark:border-white/10 text-slate-500 dark:text-neutral-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${currentImage ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-neutral-600'}`} />
              <span>{currentImage ? `${farmProfile.cropName.split(' ')[0]} (Ready ✓)` : 'No Leaf Photo'}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleRunDiagnosis}
            disabled={isLoading || !currentImage}
            className={`w-full sm:w-auto min-w-[280px] lg:min-w-[320px] py-3 sm:py-3 px-6 rounded-xl font-bold text-sm tracking-tight transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] cursor-pointer ${
              isLoading
                ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 cursor-wait'
                : !currentImage
                ? 'bg-slate-100 dark:bg-[#1E2024] text-slate-400 dark:text-neutral-500 border border-slate-200 dark:border-white/10 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:shadow-emerald-600/40'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 flex-shrink-0" />
                <span className="font-semibold truncate">
                  {cookingStage === 1 ? 'Scanning Foliar Tissue...' : 'Fusing Soil Telemetry...'}
                </span>
              </>
            ) : !currentImage ? (
              <>
                <Camera className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <span>Soil Set to {telemetry.moisturePercent}% • Add Leaf Photo to Finish Plan</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>Mix Soil ({telemetry.moisturePercent}%) + Leaf to Make Fertilizer Recipe</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Floating Inspector Trigger (< 640px viewports, positioned above sticky bar) */}
      <div className="sm:hidden fixed bottom-[72px] right-3.5 z-40">
        <button
          onClick={() => setIsInspectorOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141517]/90 text-neutral-200 text-[11px] font-semibold shadow-lg border border-white/[0.08] backdrop-blur-md"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>System</span>
        </button>
      </div>

      {/* Modals */}
      <FarmProfileModal
        isOpen={isFarmModalOpen}
        onClose={() => setIsFarmModalOpen(false)}
        farmProfile={farmProfile}
        onSave={setFarmProfile}
      />

      <ModelInspectorDrawer
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        logs={logs}
        visionResult={visionResult}
        prescription={prescription}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <SampleLeavesModal
        isOpen={isSamplesModalOpen}
        onClose={() => setIsSamplesModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      {/* Overlays */}
      <LeafThemeTransition
        isActive={leafTransition.isActive}
        targetTheme={leafTransition.targetTheme}
        origin={leafTransition.origin}
        onThemeSwitch={() => handleThemeSwitch(leafTransition.targetTheme)}
        onComplete={() => setLeafTransition(prev => ({ ...prev, isActive: false }))}
      />
    </div>
  );
}
export default App;