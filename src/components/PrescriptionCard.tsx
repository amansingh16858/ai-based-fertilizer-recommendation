import React, { useState } from 'react';
import { 
  FileText, 
  Share2, 
  Copy, 
  Check, 
  FlaskConical, 
  Leaf, 
  Calendar, 
  AlertOctagon, 
  Sparkles, 
  Droplet, 
  ArrowUpRight, 
  RefreshCw, 
  AlertTriangle,
  Cpu,
  CheckCircle2,
  Activity,
  Zap,
  Camera,
  HeartHandshake,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AgronomicPrescription, FarmProfile, SoilTelemetry, VisionAnalysisResult } from '../types';
import { generatePrescriptionPDF } from '../services/pdfService';

interface PrescriptionCardProps {
  prescription: AgronomicPrescription | null;
  visionResult: VisionAnalysisResult | null;
  soilTelemetry: SoilTelemetry;
  farmProfile: FarmProfile;
  isLoading: boolean;
  loadingStep?: string;
  cookingStage?: 1 | 2 | 3;
  diagnosticError?: string | null;
  onRetry?: () => void;
  onOpenSamplesModal?: () => void;
  currentImage?: string | null;
  isProbeConnected?: boolean;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  visionResult,
  soilTelemetry,
  farmProfile,
  isLoading,
  loadingStep = 'Analyzing...',
  cookingStage = 1,
  diagnosticError,
  onRetry,
  onOpenSamplesModal,
  currentImage = null,
  isProbeConnected = false
}) => {
  const [activeTab, setActiveTab] = useState<'chemical' | 'organic'>('chemical');
  const [copied, setCopied] = useState(false);
  const [showScienceNotes, setShowScienceNotes] = useState(false);

  const activeMoisture = prescription?.snapshotTelemetry 
    ? prescription.snapshotTelemetry.moisturePercent 
    : soilTelemetry.moisturePercent;

  const handleCopy = () => {
    if (!prescription) return;
    const text = `AGROVEDA PLANT CARE PLAN
Plant: ${farmProfile.cropName}
Diagnosis: ${prescription.primaryDiagnosis}
Action Needed: ${prescription.irrigationDirective.action} - ${prescription.irrigationDirective.details}
Chemical: ${prescription.chemicalPrescription.map(p => `${p.name}: ${p.exactDosage}`).join(', ')}
Organic: ${prescription.organicPrescription.map(p => `${p.name}: ${p.exactDosage}`).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!prescription) return;
    const text = encodeURIComponent(
      `🌱 *AgroVeda AI Crop Plan*\n\n` +
      `🌿 *Plant:* ${farmProfile.cropName}\n` +
      `🔍 *Diagnosis:* ${prescription.primaryDiagnosis}\n\n` +
      `💧 *Step 1 (Watering):* ${prescription.irrigationDirective.action} — ${prescription.irrigationDirective.details}\n\n` +
      `🧪 *Step 2 (Plant Food):*\n` +
      prescription.chemicalPrescription.map(c => `• ${c.name} (${c.ratioNPK}): ${c.exactDosage}`).join('\n') +
      `\n\nGenerated with AgroVeda AI`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // 1. LIVE SYNTHESIS PIPELINE CANVAS (Cohesive $100B SaaS Design)
  if (isLoading) {
    const isStage1Done = cookingStage >= 2 || Boolean(visionResult && visionResult.isPlant);
    const progressPercent = cookingStage === 1 ? 35 : cookingStage === 2 ? 72 : 100;
    const estTimeText = cookingStage === 1 ? '~2s remaining' : cookingStage === 2 ? '~1s remaining' : 'Formulating...';

    return (
      <div className="w-full bg-white dark:bg-[#141518] rounded-[24px] p-6 sm:p-8 border border-slate-200/90 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col gap-6 font-sans relative overflow-hidden animate-fade-in transition-colors">
        
        {/* Top Header Bar: Clean Editorial Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/[0.07]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                  Plant Diagnosis
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-600" />
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Matching leaf photo with soil data
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 tracking-tight mt-0.5">
                Creating Your Plant Care Plan
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900 dark:text-neutral-200">
                {progressPercent}% Complete
              </span>
              <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                {estTimeText}
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{cookingStage >= 3 ? 'Finalizing' : 'Analyzing'}</span>
            </div>
          </div>
        </div>

        {/* The 3 Connected Pipeline Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          
          {/* NODE 1: Leaf Foliage Cellular Vision */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
            isStage1Done
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-500/30'
              : 'bg-slate-50/80 dark:bg-[#1A1C20] border-slate-200/80 dark:border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className={`w-4 h-4 ${isStage1Done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>1. LEAF VISION</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isStage1Done 
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-slate-200/60 dark:bg-neutral-800 text-slate-500'
              }`}>
                {isStage1Done ? 'Identified ✓' : 'Scanning...'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                {visionResult?.cropIdentified || farmProfile.cropName}
              </h4>
              <p className="text-xs text-slate-600 dark:text-neutral-300 font-medium mt-0.5">
                {visionResult?.suspectedPathology || 'Scanning leaf tissue for pathology...'}
              </p>
              {visionResult?.simplePathologyMeaning && (
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                  ↳ {visionResult.simplePathologyMeaning}
                </p>
              )}
            </div>
          </div>

          {/* NODE 2: Soil & Microclimate Sensor Ingestion */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
            cookingStage >= 2
              ? 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-300/80 dark:border-sky-500/30 shadow-xs'
              : 'bg-slate-50/80 dark:bg-[#1A1C20] border-slate-200/80 dark:border-white/10 opacity-70'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-400">
                <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>2. SOIL TELEMETRY</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                cookingStage >= 3
                  ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300'
                  : cookingStage >= 2
                  ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 animate-pulse'
                  : 'bg-slate-200/60 dark:bg-neutral-800 text-slate-500'
              }`}>
                {cookingStage >= 3 ? 'Correlated ✓' : cookingStage >= 2 ? 'Ingesting...' : 'Queued'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                {soilTelemetry.moisturePercent}% Soil Moisture
              </h4>
              <p className="text-xs text-slate-600 dark:text-neutral-300 font-medium mt-0.5">
                {soilTelemetry.temperatureC}°C Air Temperature · {soilTelemetry.humidityPercent}% RH
              </p>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                {soilTelemetry.moisturePercent < 30 ? 'Dry rootzone stress detected' : soilTelemetry.moisturePercent > 70 ? 'Waterlogged soil condition' : 'Balanced rootzone hydration'}
              </p>
            </div>
          </div>

          {/* NODE 3: Agronomic Care Plan Synthesis */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
            cookingStage >= 3
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-500/30'
              : 'bg-slate-50/80 dark:bg-[#1A1C20] border-slate-200/80 dark:border-white/10 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>3. CARE PLAN</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                cookingStage >= 3
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-200/60 dark:bg-neutral-800 text-slate-500'
              }`}>
                {cookingStage >= 3 ? 'Balancing...' : 'Queued'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                Targeted Recovery Plan
              </h4>
              <p className="text-xs text-slate-600 dark:text-neutral-300 font-medium mt-0.5">
                Exact bucket watering & safe spoon fertilizer measures
              </p>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                Formulating chemical and organic remedies...
              </p>
            </div>
          </div>

        </div>

        {/* Progress Bar & Sub-details */}
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-neutral-300">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{loadingStep || 'Synthesizing plant care plan...'}</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{progressPercent}%</span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-100 dark:bg-[#1C1E23] rounded-full overflow-hidden border border-slate-200/80 dark:border-white/10">
            <div 
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-neutral-500 pt-0.5">
            <span>Input: {visionResult?.cropIdentified || farmProfile.cropName} Foliage + {soilTelemetry.moisturePercent}% Soil Moisture</span>
            <span>Agronomic Safety Guardrails Active</span>
          </div>
        </div>

      </div>
    );
  }

  // 2. HERO ZOOM DELIGHTFUL REJECTION CARD ($100B SaaS Experience)
  if (visionResult && !visionResult.isPlant) {
    const rawReason = (visionResult.rejectionReason || '').toLowerCase();
    const isAnimal = rawReason.includes('animal') || rawReason.includes('dog') || rawReason.includes('cat') || rawReason.includes('pet');
    const isHuman = rawReason.includes('face') || rawReason.includes('human') || rawReason.includes('person') || rawReason.includes('man') || rawReason.includes('woman');

    let headline = '10/10 Good Boy, but... 🐶';
    let quote = '“You look adorable, but our AI doctor only prescribes plant food and water to crop leaves, not puppies! 🐾🌱”';
    let notice = 'Detected: Companion / Pet (Not a Plant Leaf)';

    if (isHuman) {
      headline = 'Looking sharp, but... 🧑‍🌾';
      quote = '“You look fantastic, but we only prescribe plant food and fertilizer to sick garden and crop leaves! 🌱”';
      notice = 'Detected: Person / Face (Not a Plant Leaf)';
    } else if (!isAnimal) {
      headline = 'Nice setup, but... 🪴';
      quote = '“We love the room decor, but our plant doctor needs to see a real green plant leaf to formulate food! 🌱”';
      notice = 'Detected: Indoor Room / Furniture / Object';
    }

    return (
      <div className="bg-white dark:bg-[#121915] rounded-panel p-8 border border-[#E8E0D2] dark:border-white/10 shadow-floating flex flex-col items-center justify-center text-center min-h-[440px] gap-5 font-sans animate-in zoom-in-95 duration-500">
        
        {/* Hero Zoomed Companion with Ambient Glow */}
        <div className="relative group my-2">
          <div className="absolute inset-0 bg-[#D97B2E]/20 dark:bg-[#D97B2E]/10 rounded-full blur-2xl transform scale-125 pointer-events-none"></div>
          <img 
            src="/assets/confused-pup.png" 
            alt="Puzzled Companion" 
            className="relative w-44 h-auto max-h-52 object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.18)] transition-transform duration-500 transform group-hover:scale-105 group-hover:-rotate-1"
          />
        </div>

        {/* Dynamic Context-Aware Meme Headline with Large, Readable Typography */}
        <div className="flex flex-col gap-2 max-w-md">
          <h3 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-slate-100 font-display tracking-tight">
            {headline}
          </h3>
          <p className="text-sm sm:text-base text-[#4A4A4A] dark:text-slate-200 font-sans leading-relaxed px-4">
            {quote}
          </p>
        </div>

        {/* Clear Detection Notice Pill with Comfortable Sizing */}
        <div className="py-2 px-5 rounded-full bg-[#FEF4E8] dark:bg-[#2A1D12] border border-[#D97B2E]/30 text-xs sm:text-sm text-[#9A4B12] dark:text-[#FCD34D] font-semibold flex items-center justify-center gap-2 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97B2E] flex-shrink-0 animate-pulse"></span>
          <span>{notice}</span>
        </div>

        {/* Primary Action Button */}
        {onOpenSamplesModal && (
          <button
            onClick={onOpenSamplesModal}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#B8F234] hover:bg-[#A4DE23] text-[#1A1A1A] font-extrabold text-sm shadow-lime-glow transition-all active:scale-95 mt-1 font-display group"
          >
            <Camera className="w-4.5 h-4.5 transition-transform group-hover:rotate-12" />
            <span>Try a Real Plant Leaf</span>
          </button>
        )}
      </div>
    );
  }

  // 3. ERROR / TOKEN EXHAUSTED STATE
  if (diagnosticError) {
    return (
      <div className="bg-white dark:bg-[#141518] rounded-[24px] p-6 sm:p-8 border border-amber-300 dark:border-amber-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center min-h-[380px] gap-4 font-sans animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-1.5 max-w-md">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-neutral-100">
            {diagnosticError.includes('Token') || diagnosticError.includes('API') ? 'AI Token Exhausted' : 'Diagnosis Interrupted'}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-300 leading-relaxed font-medium">
            {diagnosticError}
          </p>
        </div>
        <div className="py-2.5 px-5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-500/40 text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
          ⚠️ Please integrate API key in .env or switch to Sample Leaves
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {onOpenSamplesModal && (
            <button
              onClick={onOpenSamplesModal}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Try Verified Sample Leaves →
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2024] dark:hover:bg-[#25282E] text-slate-800 dark:text-neutral-200 font-bold text-xs sm:text-sm transition-all border border-slate-200 dark:border-white/10 active:scale-95 cursor-pointer"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. EMPTY STANDBY — awaiting leaf photo
  if (!prescription || !visionResult) {
    return (
      <div className="bg-white dark:bg-[#141518] rounded-[20px] sm:rounded-[24px] p-4 sm:p-9 border border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[360px] font-sans">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500">
                Awaiting Inputs to Synthesize
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-400 dark:text-neutral-500">Standby</span>
            </div>
          </div>

          <h3 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-neutral-100 mb-2 tracking-tight leading-snug">
            Your Custom <span className="font-serif italic font-normal text-emerald-600 dark:text-emerald-400">Plant Care Plan</span>
          </h3>
          <p className="text-xs sm:text-[15px] text-slate-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            AgroVeda combines your leaf photo with live soil moisture to calculate the exact watering, fertilizer amounts, and recovery schedule for your plant.
          </p>
        </div>

        {/* Readiness checklist — 3 columns on desktop */}
        <div className="my-4 sm:my-6 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
          
          {/* Row 1: Leaf Photo */}
          <div className={`flex items-center justify-between p-3.5 sm:p-5 rounded-[16px] sm:rounded-[18px] border transition-all ${
            currentImage
              ? 'bg-slate-50/80 dark:bg-[#0E0F11] border-emerald-200/80 dark:border-emerald-900/40'
              : 'bg-slate-50/50 dark:bg-[#0E0F11]/60 border-slate-200/60 dark:border-white/[0.05]'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                currentImage
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#1C1D21] text-slate-400 dark:text-neutral-500 border border-slate-200 dark:border-white/[0.06]'
              }`}>
                {currentImage ? (
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Camera className="w-5 h-5" strokeWidth={1.8} />
                )}
              </div>
              <div>
                <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-neutral-100 leading-none mb-1">1. Leaf Photo</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {currentImage ? 'Loaded in Step 1 ✓' : 'Add leaf photo in Step 1'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                currentImage ? 'bg-emerald-500' : 'bg-rose-400'
              }`} />
              <span className={`text-xs font-bold ${
                currentImage ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}>
                {currentImage ? 'Ready' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Row 2: Soil & Weather */}
          <div className="flex items-center justify-between p-4 sm:p-5 rounded-[18px] bg-slate-50/80 dark:bg-[#0E0F11] border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Check className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-neutral-100 leading-none mb-1">2. Soil & Weather</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {isProbeConnected
                    ? 'ESP32 Wi-Fi active'
                    : `Moisture: ${soilTelemetry.moisturePercent}% (${soilTelemetry.moisturePercent < 30 ? 'Dry' : soilTelemetry.moisturePercent > 70 ? 'Wet' : 'Good'})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Ready</span>
            </div>
          </div>

          {/* Row 3: Plant Doctor AI */}
          <div className="flex items-center justify-between p-4 sm:p-5 rounded-[18px] bg-slate-50/80 dark:bg-[#0E0F11] border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Check className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-neutral-100 leading-none mb-1">3. Agronomic Engine</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Multimodal reasoning online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Ready</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs sm:text-[13px] text-slate-500 dark:text-neutral-400 font-medium">
            Want to test right now? Select an example leaf to preview a full plant care plan:
          </span>
          {onOpenSamplesModal && (
            <button
              type="button"
              onClick={onOpenSamplesModal}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1B1E] dark:hover:bg-[#24262B] text-slate-900 dark:text-neutral-100 text-xs sm:text-[13px] font-bold border border-slate-300/80 dark:border-white/10 transition-all whitespace-nowrap cursor-pointer shadow-xs hover:shadow-sm active:scale-95"
            >
              Browse Example Leaves →
            </button>
          )}
        </div>

      </div>
    );
  }

  // 5. THE HERO PRESCRIPTION CARD (Full-Width Master Blueprint)
  return (
    <div className="flex flex-col gap-5" id="prescription-master-card">
      <div className="bg-white dark:bg-[#141518] rounded-[20px] sm:rounded-[24px] p-4 sm:p-9 border border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col gap-5 sm:gap-6 font-sans animate-fade-in">
        
        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] sm:text-xs font-bold tracking-wider px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Agronomic Recovery Blueprint
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                {(visionResult.confidenceScore * 100).toFixed(0)}% Confidence
              </span>
            </div>

            <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-neutral-100 tracking-tight leading-snug">
              {prescription.primaryDiagnosis}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1 font-medium font-sans">
              Diagnosed Crop: <strong className="text-slate-950 dark:text-white font-bold">{visionResult.cropIdentified}</strong> • Severity: <span className="text-amber-600 dark:text-amber-400 font-bold">{visionResult.severityLevel}</span>
            </p>
          </div>

          {/* Header Action Shortcuts */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end pt-1 sm:pt-0">
            <button
              onClick={() => generatePrescriptionPDF(prescription, visionResult, prescription.snapshotTelemetry || soilTelemetry, farmProfile)}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1B1E] dark:hover:bg-[#222428] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-200 transition-all cursor-pointer"
              title="Share via WhatsApp"
            >
              <Share2 className="w-4 h-4 text-slate-600 dark:text-neutral-300" />
            </button>
          </div>
        </div>

        {/* Quick Overview Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 dark:from-emerald-500/15 dark:via-teal-500/15 dark:to-sky-500/15 border border-emerald-500/30 dark:border-emerald-500/30 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Quick Overview
              </span>
              <span className="text-xs text-slate-600 dark:text-neutral-400 font-medium">
                Immediate diagnosis & action plan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What Happened */}
            <div className="p-4 sm:p-4.5 rounded-xl bg-white/90 dark:bg-[#121316]/90 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-slate-950 dark:text-white font-bold text-sm">
                <span className="text-base">📌</span>
                <span>What Happened to Your Plant:</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-neutral-200 leading-relaxed font-sans font-medium">
                {prescription.simpleSummary?.whatHappened || prescription.rootCauseAnalysis}
              </p>
            </div>

            {/* What To Do Today */}
            <div className="p-4 sm:p-4.5 rounded-xl bg-white/90 dark:bg-[#121316]/90 border border-emerald-500/30 dark:border-emerald-500/30 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <span className="text-base">⚡</span>
                <span>What To Do Today:</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-neutral-200 leading-relaxed font-sans font-medium">
                {prescription.simpleSummary?.whatToDoToday || `${prescription.irrigationDirective.action}: ${prescription.irrigationDirective.details}`}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Body: Left (Context & Watering) vs Right (Food Recipe) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Why It Happened + Watering Directive (5 of 12) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Soil & Moisture Insight */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0E0F11] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <span>💡</span> Why Soil Moisture Caused This
                </span>
                <span className="text-xs font-mono font-bold bg-white dark:bg-[#1A1B1E] px-3 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-200">
                  {activeMoisture}% Moisture
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed font-normal font-sans">
                {prescription.multimodalCorrelation}
              </p>
            </div>

            {/* STEP 1: WATERING ADVICE */}
            <div className="p-5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-500/20 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 shadow-xs flex-shrink-0 mt-0.5">
                <Droplet className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-base text-slate-900 dark:text-neutral-100">
                  💧 Step 1: {prescription.irrigationDirective.action}
                </span>
                <p className="text-sm text-slate-600 dark:text-neutral-300 mt-1 leading-relaxed font-sans">
                  {prescription.irrigationDirective.details}
                </p>
              </div>
            </div>

            {/* Collapsible Lab & Agronomist Science Notes (For Professors & Viva) */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#0E0F11] shadow-xs transition-all">
              <button
                type="button"
                onClick={() => setShowScienceNotes(!showScienceNotes)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-200 block">
                      🔬 View Agronomist Science Notes
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Technical mechanisms & chemical ratios
                    </span>
                  </div>
                </div>
                {showScienceNotes ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
                )}
              </button>

              {showScienceNotes && (
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs flex flex-col gap-3 font-sans bg-slate-50/50 dark:bg-[#121316]/50">
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold block mb-1">
                      Botanical Root Cause Analysis:
                    </strong>
                    <p className="text-slate-600 dark:text-neutral-300 leading-relaxed">
                      {prescription.rootCauseAnalysis}
                    </p>
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold block mb-1">
                      Cross-Telemetry Chemical Correlation:
                    </strong>
                    <p className="text-slate-600 dark:text-neutral-300 leading-relaxed">
                      {prescription.multimodalCorrelation}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Step 2 Plant Food Recipes (7 of 12) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                🌱 Step 2: Feed Your Plant (Choose Recipe)
              </span>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-[#0E0F11] rounded-xl border border-slate-200/60 dark:border-white/[0.06] mb-2 shadow-xs">
              <button
                onClick={() => setActiveTab('chemical')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'chemical'
                    ? 'bg-white dark:bg-[#1C1D21] text-slate-950 dark:text-neutral-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Fast-Acting Chemical Recipe</span>
              </button>
              <button
                onClick={() => setActiveTab('organic')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'organic'
                    ? 'bg-white dark:bg-[#1C1D21] text-slate-950 dark:text-neutral-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Natural & Organic Alternative</span>
              </button>
            </div>

            {/* Dosage Cards */}
            {activeTab === 'chemical' ? (
              <div className="flex flex-col gap-3">
                {prescription.chemicalPrescription.map((item, idx) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0E0F11] border border-slate-200/80 dark:border-white/[0.06] flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-950 dark:text-neutral-100">
                        {item.name}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/40 font-bold shadow-xs">
                        {item.ratioNPK}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                      <span className="text-slate-500 dark:text-neutral-400 font-medium">How much to use:</span>
                      <span className="font-bold text-base text-slate-900 dark:text-neutral-100">{item.exactDosage}</span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-neutral-300 font-sans">
                      👉 {item.applicationMethod} ({item.timing})
                    </p>

                    {item.safetyWarning && (
                      <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 p-2.5 rounded-lg flex items-center gap-2 font-medium mt-1">
                        <AlertOctagon className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>{item.safetyWarning}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {prescription.organicPrescription.map((item, idx) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0E0F11] border border-slate-200/80 dark:border-white/[0.06] flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                        {item.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/40">
                        {item.ratioNPK || 'Natural / Organic'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                      <span className="text-slate-500 dark:text-neutral-400 font-medium">How much to use:</span>
                      <span className="font-bold text-base text-slate-900 dark:text-neutral-100">{item.exactDosage}</span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-neutral-300 font-sans">
                      👉 {item.applicationMethod} ({item.timing})
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* STEP 3: 14-DAY RECOVERY CALENDAR (Full-Width Row, 4 Columns) */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/[0.07]">
          <span className="text-sm font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            14-Day Plant Recovery Schedule
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {prescription.fourteenDaySchedule.map((sch, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0E0F11] border border-slate-200/80 dark:border-white/[0.06] text-xs shadow-xs">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block mb-1.5 text-sm">{sch.day}</span>
                <span className="text-slate-700 dark:text-neutral-300 leading-relaxed font-medium">{sch.task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.07]">
          <button
            onClick={() => generatePrescriptionPDF(prescription, visionResult, prescription.snapshotTelemetry || soilTelemetry, farmProfile)}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer group"
          >
            <FileText className="w-4 h-4" />
            <span>DOWNLOAD COMPLETE PDF PLAN</span>
            <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1B1E] dark:hover:bg-[#222428] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-neutral-200 font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              title="Share via WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1B1E] dark:hover:bg-[#222428] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-200 transition-all shadow-xs cursor-pointer flex items-center justify-center"
              title="Copy Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-neutral-400" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};