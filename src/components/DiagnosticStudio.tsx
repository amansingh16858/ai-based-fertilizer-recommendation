import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Video, 
  Zap, 
  RefreshCw, 
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Sun
} from 'lucide-react';
import { SAMPLE_LEAVES } from './SampleLeavesModal';
import { SampleLeaf, VisionAnalysisResult } from '../types';

interface DiagnosticStudioProps {
  currentImage: string | null;
  onImageChange: (base64: string) => void;
  onClearImage?: () => void;
  onRunDiagnosis?: () => void;
  isLoading: boolean;
  loadingStep: string;
  visionResult: VisionAnalysisResult | null;
  diagnosticError?: string | null;
  onOpenSamplesModal: () => void;
  onSelectSample?: (sample: SampleLeaf) => void;
}

export const DiagnosticStudio: React.FC<DiagnosticStudioProps> = ({
  currentImage,
  onImageChange,
  onClearImage,
  onRunDiagnosis,
  isLoading,
  loadingStep,
  visionResult,
  diagnosticError,
  onOpenSamplesModal,
  onSelectSample
}) => {
  const [sourceMode, setSourceMode] = useState<'upload' | 'webcam'>('upload');
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('contain');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [brightnessBoost, setBrightnessBoost] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically ensure upload mode when currentImage is provided
  useEffect(() => {
    if (currentImage) {
      setSourceMode('upload');
    }
  }, [currentImage]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (sourceMode === 'webcam') {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
        .then((s) => {
          stream = s;
          setIsWebcamActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setIsWebcamActive(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [sourceMode]);

  const captureWebcamSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // HDR color grade for rich leaf contrast and vibrant chlorophyll/symptoms
        if (brightnessBoost) {
          ctx.filter = 'brightness(1.18) contrast(1.16) saturate(1.24)';
        } else {
          ctx.filter = 'contrast(1.08) saturate(1.12)';
        }
        
        // Natural mirror flip so captured photo identically matches mirror preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onImageChange(dataUrl);
        setSourceMode('upload');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-3 font-sans">
      
      {/* Main Optical Card */}
      <div className="bg-white dark:bg-[#141518] rounded-[24px] border border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">

        {/* Top control bar — source mode + sample shortcut */}
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
          
          {/* Segmented source tabs — minimal, inset style */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-[#0E0F11] rounded-lg border border-slate-200/50 dark:border-white/[0.05]">
            <button
              onClick={() => setSourceMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                sourceMode === 'upload' 
                  ? 'bg-white dark:bg-[#1C1D21] text-slate-900 dark:text-neutral-100 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-300'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload</span>
            </button>
            <button
              onClick={() => setSourceMode('webcam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                sourceMode === 'webcam' 
                  ? 'bg-white dark:bg-[#1C1D21] text-slate-900 dark:text-neutral-100 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-300'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Camera</span>
            </button>
          </div>

          {/* Sample leaves shortcut */}
          <button
            onClick={onOpenSamplesModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#1A1B1E] dark:hover:bg-[#222428] border border-slate-200/70 dark:border-white/[0.06] text-slate-600 dark:text-neutral-300 font-semibold text-[12px] transition-all"
            title="Try real diseased crop samples"
          >
            <Sparkles className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            <span>Sample Leaves</span>
          </button>
        </div>

        {/* Scanner Viewport — strictly bounded hero focal point */}
        <div className="relative w-full h-[340px] sm:h-[350px] lg:h-[360px] bg-slate-50/70 dark:bg-[#090A0C] flex items-center justify-center transition-all blueprint-grid overflow-hidden">

          {/* Optical Scanner Laser & HUD Layer while loading */}
          {isLoading && (
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none">
              {/* Ambient scanning mesh grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] animate-scanner-grid pointer-events-none" />

              {/* Bi-directional laser sweep beam with phosphor curtain */}
              <div className="absolute left-0 right-0 animate-laser-sweep pointer-events-none z-10">
                {/* Upper diffuse glow trail */}
                <div className="w-full h-16 bg-gradient-to-t from-emerald-400/20 via-emerald-500/5 to-transparent" />
                
                {/* Ultra-luminous surgical laser line */}
                <div className="relative w-full h-[2.5px] bg-gradient-to-r from-transparent via-[#B8F234] to-transparent shadow-[0_0_12px_#10B981,0_0_24px_#B8F234,0_0_4px_#ffffff]" />
                
                {/* Lower light curtain */}
                <div className="w-full h-8 bg-gradient-to-b from-emerald-400/15 via-emerald-500/5 to-transparent" />
              </div>

              {/* Neural feature targeting reticles that pulse during scanning */}
              <div className="absolute top-[28%] left-[36%] w-16 h-16 border border-dashed border-[#B8F234]/80 rounded-lg animate-optical-pulse flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(184,242,52,0.2)]">
                <span className="text-[9px] font-mono font-bold text-[#B8F234] bg-black/60 px-1 rounded w-max leading-tight">BAND: 480nm</span>
                <span className="text-[8px] font-mono text-emerald-300 self-end">SAMPLING</span>
              </div>

              <div className="absolute top-[56%] right-[24%] w-20 h-14 border border-dashed border-emerald-400/80 rounded-lg animate-optical-pulse [animation-delay:0.7s] flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="text-[9px] font-mono font-bold text-emerald-300 bg-black/60 px-1 rounded w-max leading-tight">CHLOROPHYLL</span>
                <span className="text-[8px] font-mono text-[#B8F234] self-end">VECTOR 0.91</span>
              </div>

              {/* Floating Real-Time Vision Telemetry HUD pill */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/50 text-white shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                <div className="w-2 h-2 rounded-full bg-[#B8F234] animate-ping" />
                <span className="text-xs font-mono font-semibold tracking-wide text-emerald-300 whitespace-nowrap">
                  {loadingStep || 'Analyzing leaf cellular tissue...'}
                </span>
              </div>
            </div>
          )}

          {/* Precision surgical viewfinder corner brackets */}
          <div className={`absolute top-3.5 left-3.5 w-6 h-6 border-t-2 border-l-2 transition-all duration-300 rounded-tl-sm pointer-events-none z-20 ${
            isLoading 
              ? 'border-[#B8F234] shadow-[0_0_10px_rgba(184,242,52,0.8)]' 
              : (sourceMode === 'webcam' || currentImage)
              ? 'border-[#B8F234] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
              : 'border-slate-300 dark:border-white/20'
          }`} />
          <div className={`absolute top-3.5 right-3.5 w-6 h-6 border-t-2 border-r-2 transition-all duration-300 rounded-tr-sm pointer-events-none z-20 ${
            isLoading 
              ? 'border-[#B8F234] shadow-[0_0_10px_rgba(184,242,52,0.8)]' 
              : (sourceMode === 'webcam' || currentImage)
              ? 'border-[#B8F234] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
              : 'border-slate-300 dark:border-white/20'
          }`} />
          <div className={`absolute bottom-3.5 left-3.5 w-6 h-6 border-b-2 border-l-2 transition-all duration-300 rounded-bl-sm pointer-events-none z-20 ${
            isLoading 
              ? 'border-[#B8F234] shadow-[0_0_10px_rgba(184,242,52,0.8)]' 
              : (sourceMode === 'webcam' || currentImage)
              ? 'border-[#B8F234] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
              : 'border-slate-300 dark:border-white/20'
          }`} />
          <div className={`absolute bottom-3.5 right-3.5 w-6 h-6 border-b-2 border-r-2 transition-all duration-300 rounded-br-sm pointer-events-none z-20 ${
            isLoading 
              ? 'border-[#B8F234] shadow-[0_0_10px_rgba(184,242,52,0.8)]' 
              : (sourceMode === 'webcam' || currentImage)
              ? 'border-[#B8F234] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
              : 'border-slate-300 dark:border-white/20'
          }`} />

          {/* Webcam live stream */}
          {sourceMode === 'webcam' && (
            <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]" 
                style={{
                  filter: brightnessBoost 
                    ? 'brightness(1.18) contrast(1.16) saturate(1.24)' 
                    : 'contrast(1.08) saturate(1.12)'
                }}
              />

              {/* Camera Tuning Controls (Brightness Boost) */}
              <div className="absolute top-3.5 right-11 z-30 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBrightnessBoost(!brightnessBoost)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border transition-all cursor-pointer ${
                    brightnessBoost
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                      : 'bg-black/60 hover:bg-black/80 text-white/80 border-white/15'
                  }`}
                  title={brightnessBoost ? 'Low-light boost is ON (+20% brighter)' : 'Turn on low-light boost'}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>{brightnessBoost ? 'Bright ON' : 'Bright'}</span>
                </button>
              </div>
              
              {/* Focus reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-dashed border-[#B8F234]/70 animate-reticle-pulse flex items-center justify-center shadow-[0_0_20px_rgba(184,242,52,0.15)]">
                  <div className="w-2 h-2 rounded-full bg-[#B8F234] animate-ping" />
                </div>
              </div>

              <div className="absolute bottom-5 left-0 right-0 flex justify-center z-20">
                <button
                  onClick={captureWebcamSnapshot}
                  className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[15px] shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Leaf Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Uploaded image display */}
          {sourceMode === 'upload' && currentImage && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#070D09] overflow-hidden">
              <img
                src={currentImage}
                alt="Target Crop Leaf"
                className={`w-full h-full transition-all duration-300 select-none ${
                  imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'
                }`}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Non-plant notice */}
              {visionResult && !visionResult.isPlant && (
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between p-3.5 px-5 rounded-full bg-[#0B100D]/85 backdrop-blur-md border border-slate-700/80 text-white shadow-floating">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-xs sm:text-[13px]">
                      {visionResult.rejectionReason?.includes('animal') || visionResult.rejectionReason?.includes('dog')
                        ? '🐾 Companion photo detected (Not a leaf)'
                        : visionResult.rejectionReason?.includes('face') || visionResult.rejectionReason?.includes('human')
                        ? '🧑 Person photo detected (Not a leaf)'
                        : '🌱 Non-plant photo detected'}
                    </span>
                  </div>
                  <button
                    onClick={onOpenSamplesModal}
                    className="text-xs sm:text-[13px] font-bold text-[#B8F234] hover:underline"
                  >
                    Pick a leaf →
                  </button>
                </div>
              )}

              {/* Diagnostic / Token Exhausted Error Banner */}
              {diagnosticError && (
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between p-3.5 px-5 rounded-full bg-[#1C130D]/90 backdrop-blur-md border border-amber-500/50 text-white shadow-floating animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-xs sm:text-[13px] font-semibold">
                      {diagnosticError}
                    </span>
                  </div>
                  <button
                    onClick={onOpenSamplesModal}
                    className="text-xs sm:text-[13px] font-bold text-[#B8F234] hover:underline whitespace-nowrap pl-2 cursor-pointer"
                  >
                    Try Sample Leaf →
                  </button>
                </div>
              )}

              {/* Symptom bounding boxes with 4th-grader plain English translation */}
              {visionResult && visionResult.isPlant && visionResult.symptomBoxes && visionResult.symptomBoxes.map((box, idx) => (
                <div
                  key={idx}
                  style={{
                    left: `${box.area.x}%`,
                    top: `${box.area.y}%`,
                    width: `${box.area.width}%`,
                    height: `${box.area.height}%`
                  }}
                  className="absolute border-2 border-[#B8F234]/90 bg-[#B8F234]/10 rounded-lg pointer-events-none z-10 flex flex-col justify-start overflow-visible"
                >
                  <div className="bg-white/95 dark:bg-[#121417]/95 backdrop-blur-md text-[#1A1A1A] dark:text-neutral-100 px-3 py-1.5 rounded-br-xl shadow-md border-r border-b border-[#B8F234]/50 flex flex-col gap-0.5 w-max max-w-[240px]">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold leading-tight">
                      <span className="w-2 h-2 rounded-full bg-[#75B800] dark:bg-[#B8F234] flex-shrink-0 animate-pulse" />
                      <span className="truncate">{box.label}</span>
                    </div>
                    {box.simpleMeaning && (
                      <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 leading-tight pl-3.5 block">
                        ↳ {box.simpleMeaning}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state — Luminous Apple Studio Dropzone */}
          {sourceMode === 'upload' && !currentImage && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center py-5 px-4 sm:py-6 sm:px-6 text-center transition-all duration-300 w-full h-full ${
                isDragging
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-500'
                  : 'bg-transparent border-2 border-dashed border-slate-300/70 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/50'
              }`}
            >
              {/* Camera icon — refined sleek focal point */}
              <div className="relative mb-2 sm:mb-2.5">
                <div className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-xl sm:rounded-2xl bg-white dark:bg-[#1A1C20] border border-slate-200/90 dark:border-white/10 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
                </div>
                {/* Live dot */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1A1C20] animate-ping" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1A1C20]" />
              </div>

              {/* Display-scale headline — high-contrast focal text */}
              <h3 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mb-1.5 sm:mb-2 tracking-tight leading-[1.2]">
                {isDragging ? 'Drop your leaf photo here' : (
                  <>Take a photo of your{' '}
                    <span className="font-serif italic font-normal text-emerald-600 dark:text-emerald-400">sick leaf</span>
                  </>
                )}
              </h3>

              <p className="text-xs sm:text-[14px] text-slate-600 dark:text-neutral-400 max-w-[320px] mb-3.5 sm:mb-4 leading-relaxed">
                <span className="hidden sm:inline">Hold close to a spotted or yellow leaf, or drag an image here.</span>
                <span className="sm:hidden">Hold close to a spotted or yellow leaf, or choose a photo.</span>
              </p>

              {/* Primary + secondary CTA pair */}
              <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-3 w-full max-w-[290px] xs:max-w-none justify-center">
                <button
                  type="button"
                  onClick={() => setSourceMode('webcam')}
                  className="w-full xs:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-[13px] shadow-sm hover:shadow-md hover:shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer min-h-[40px] sm:min-h-[auto]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Use Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full xs:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white dark:bg-[#1A1B1E] hover:bg-slate-50 dark:hover:bg-[#222428] text-slate-950 dark:text-neutral-100 font-bold text-xs sm:text-[13px] border border-slate-300 dark:border-white/15 shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer min-h-[40px] sm:min-h-[auto]"
                >
                  <Upload className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
                  <span>Choose Photo</span>
                </button>
              </div>

              {/* Format hint */}
              <p className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-mono tracking-wider uppercase font-semibold">
                PNG · JPG · WEBP · HEIC
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Bottom bar — quick samples + vision result */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3 border-t border-slate-100 dark:border-white/[0.05]">
          
          {/* Quick sample crop tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 scrollbar-none py-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
            <span className="text-xs text-slate-400 dark:text-neutral-500 whitespace-nowrap font-medium flex-shrink-0">Try:</span>
            {SAMPLE_LEAVES.slice(0, 5).map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setSourceMode('upload');
                  if (onSelectSample) onSelectSample(sample);
                  else onImageChange(sample.imageUrl);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 dark:bg-[#1A1B1E] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-neutral-300 border border-slate-200/70 dark:border-white/[0.07] transition-all whitespace-nowrap active:scale-95 cursor-pointer flex-shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {sample.crop.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Image-loaded sub-controls / vision result */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-1">
            {currentImage && (
              <button
                type="button"
                onClick={() => setImageFit(prev => prev === 'cover' ? 'contain' : 'cover')}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium transition-colors flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1A1B1E] border border-slate-200/80 dark:border-white/10"
                title={imageFit === 'cover' ? "Fit whole leaf without cropping" : "Fill viewfinder"}
              >
                {imageFit === 'cover' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{imageFit === 'cover' ? 'Fit' : 'Fill'}</span>
              </button>
            )}

            {currentImage && !visionResult && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3" />
                  Change
                </button>
                {onClearImage && (
                  <button
                    type="button"
                    onClick={onClearImage}
                    className="text-[11px] text-slate-400 hover:text-red-400 transition-colors font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </>
            )}

            {visionResult && visionResult.isPlant && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{visionResult.cropIdentified}</span>
                <span className="font-mono text-slate-400 dark:text-neutral-500">({(visionResult.confidenceScore * 100).toFixed(0)}%)</span>
              </div>
            )}

            {visionResult && !visionResult.isPlant && (
              <div className="flex items-center gap-1.5 text-amber-500 text-[11px] font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Not a Leaf</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};