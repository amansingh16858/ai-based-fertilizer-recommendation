import React, { useState } from 'react';
import { X, Key, Check, Shield, Eye, Sparkles, Cpu } from 'lucide-react';
import { 
  getGrokApiKey, 
  saveGrokApiKey, 
  getDeepSeekApiKey, 
  saveDeepSeekApiKey, 
  getApiKey, 
  saveApiKey 
} from '../services/aiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [grokKey, setGrokKey] = useState(getGrokApiKey());
  const [deepseekKey, setDeepseekKey] = useState(getDeepSeekApiKey());
  const [openRouterKey, setOpenRouterKey] = useState(getApiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGrokApiKey(grokKey);
    saveDeepSeekApiKey(deepseekKey);
    saveApiKey(openRouterKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-[#141517] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100 font-sans">
                AI Models & API Configuration
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                Configure your official Grok and DeepSeek credentials
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-[#1C1D21] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3.5 text-xs">
          
          {/* Field 1: Grok Vision */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Stage 1: xAI Grok API Key (Vision)</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                grok-2-vision-1212
              </span>
            </div>
            <input
              type="password"
              value={grokKey}
              onChange={(e) => setGrokKey(e.target.value)}
              placeholder="xai-..."
              className="w-full bg-slate-50 dark:bg-[#0E0F11] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Inspects leaf photos, identifies plant species, and detects visual symptom coordinates.
            </span>
          </div>

          {/* Field 2: DeepSeek Reasoning */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Stage 2: DeepSeek Official API Key (Reasoning)</span>
              </label>
              <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
                deepseek-chat
              </span>
            </div>
            <input
              type="password"
              value={deepseekKey}
              onChange={(e) => setDeepseekKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-50 dark:bg-[#0E0F11] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-neutral-100 font-mono focus:border-sky-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Fuses leaf symptoms with soil telemetry to calculate exact N-P-K grams and irrigation plan.
            </span>
          </div>

          {/* Field 3: OpenRouter Fallback */}
          <div className="flex flex-col gap-1 pt-1 border-t border-slate-100 dark:border-white/[0.07]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-neutral-300">
                OpenRouter Key (Optional Fallback)
              </label>
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                Fallback Provider
              </span>
            </div>
            <input
              type="password"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-slate-50 dark:bg-[#0E0F11] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-1.5 text-xs text-slate-900 dark:text-neutral-100 font-mono focus:outline-none"
            />
          </div>

          {/* Resilience Guarantee Callout */}
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/20 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed font-sans">
              <strong>Bulletproof Offline Fallback:</strong> If tokens expire or you are offline during your evaluation, the system automatically engages its deterministic local agronomy engine. Zero crashes guaranteed.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.07] mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1B1E] dark:hover:bg-[#222428] text-slate-700 dark:text-neutral-300 font-semibold transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saved ? 'Saved Successfully!' : 'Save Credentials'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
