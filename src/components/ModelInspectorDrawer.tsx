import React, { useState } from 'react';
import { X, Cpu, DollarSign, Terminal, Check, Copy, Code, Layers } from 'lucide-react';
import { AgronomicPrescription, VisionAnalysisResult, SystemLog } from '../types';

interface ModelInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  visionResult: VisionAnalysisResult | null;
  prescription: AgronomicPrescription | null;
  logs: SystemLog[];
}

export const ModelInspectorDrawer: React.FC<ModelInspectorDrawerProps> = ({
  isOpen,
  onClose,
  visionResult,
  prescription,
  logs
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    const data = {
      stage1_vision_gemini: visionResult,
      stage2_reasoning_deepseek: prescription
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCostUSD = prescription?.academicNotes.totalCostUSD || 0.00021;
  const totalCostINR = (totalCostUSD * 87).toFixed(4);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg h-full bg-[#0C0D0E] border-l border-white/[0.08] p-6 flex flex-col gap-4 overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 font-sans">
                AI Architecture & Pipeline Inspector
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Decoupled Two-Stage Inference Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1A1B1E] text-neutral-400 hover:text-neutral-200 border border-white/[0.07] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Stage 1 Inspector Card */}
        <div className="bg-[#141517] rounded-xl p-3.5 border border-white/[0.07] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Stage 1: Vision Feature Extractor
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold">
              Gemini 2.5 Flash
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-white/[0.06] text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0E0F11] border border-white/[0.06]">
              <span className="text-[10px] text-neutral-400 block font-sans">Latency</span>
              <span className="text-neutral-100 font-bold">{visionResult?.executionTimeMs || 820} ms</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0E0F11] border border-white/[0.06]">
              <span className="text-[10px] text-neutral-400 block font-sans">Vision Tokens</span>
              <span className="text-neutral-100 font-bold">{visionResult?.tokensUsed || 435} tok</span>
            </div>
          </div>
        </div>

        {/* 2. Stage 2 Inspector Card */}
        <div className="bg-[#141517] rounded-xl p-3.5 border border-white/[0.07] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              Stage 2: Agronomic Reasoning Engine
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-400 border border-teal-500/30 font-bold">
              DeepSeek V4 Flash
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-white/[0.06] text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0E0F11] border border-white/[0.06]">
              <span className="text-[10px] text-neutral-400 block font-sans">Reasoning Latency</span>
              <span className="text-neutral-100 font-bold">1,240 ms</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0E0F11] border border-white/[0.06]">
              <span className="text-[10px] text-neutral-400 block font-sans">Output Tokens</span>
              <span className="text-neutral-100 font-bold">{prescription?.academicNotes.stage2Tokens || 680} tok</span>
            </div>
          </div>
        </div>

        {/* 3. DeepSeek Pricing Economics */}
        <div className="bg-emerald-950/20 rounded-xl p-3.5 border border-emerald-500/30 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 font-mono">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Economic Feasibility & Token Cost</span>
          </div>

          <div className="space-y-1 text-xs font-mono pt-1 text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-400">Input Tokens:</span>
              <span className="text-neutral-200">$0.14 / 1M tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Output Tokens:</span>
              <span className="text-neutral-200">$0.28 / 1M tokens</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-emerald-500/30 font-bold text-xs text-emerald-400">
              <span>Cost per Diagnosis:</span>
              <span>${totalCostUSD} (~₹{totalCostINR})</span>
            </div>
          </div>
        </div>

        {/* 4. Real-Time Telemetry & Log Console */}
        <div className="bg-[#141517] rounded-xl p-3.5 border border-white/[0.07] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 font-sans">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Real-Time Edge & Inference Stream
            </span>
            <span className="text-[9px] font-mono text-neutral-400">HTTP 200 OK</span>
          </div>
          <div className="bg-[#0E0F11] border border-white/[0.06] rounded-lg p-2.5 h-28 overflow-y-auto font-mono text-[9px] flex flex-col gap-1">
            {logs.map(log => (
              <div key={log.id} className="flex items-baseline gap-1.5">
                <span className="text-neutral-500">{log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                  log.source === 'ESP32' ? 'bg-emerald-950 text-emerald-300' :
                  log.source === 'Vision API' ? 'bg-sky-950 text-sky-300' :
                  log.source === 'Reasoning Engine' ? 'bg-teal-950 text-teal-300' :
                  'bg-[#1C1D21] text-neutral-300'
                }`}>
                  {log.source}
                </span>
                <span className={`${
                  log.type === 'error' ? 'text-rose-400 font-bold' :
                  log.type === 'warning' ? 'text-amber-400' :
                  log.type === 'success' ? 'text-emerald-300' :
                  'text-neutral-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Raw JSON Payloads */}
        <div className="flex flex-col min-h-[140px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 font-sans">
              <Code className="w-3.5 h-3.5 text-neutral-400" />
              Raw Inter-Model JSON Payloads
            </span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-[#0E0F11] border border-white/[0.06] text-[10px] font-mono text-neutral-300 overflow-x-auto max-h-36">
            {JSON.stringify({ visionResult, prescription }, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
};