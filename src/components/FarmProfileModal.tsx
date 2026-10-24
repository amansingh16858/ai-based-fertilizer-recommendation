import React, { useState } from 'react';
import { X, Sprout, Check, Home, Trees, Tractor } from 'lucide-react';
import { FarmProfile } from '../types';

interface FarmProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmProfile: FarmProfile;
  onSave: (updated: FarmProfile) => void;
}

export const FarmProfileModal: React.FC<FarmProfileModalProps> = ({
  isOpen,
  onClose,
  farmProfile,
  onSave
}) => {
  const [cropName, setCropName] = useState(farmProfile.cropName);
  const [soilType, setSoilType] = useState(farmProfile.soilType);
  const [plotArea, setPlotArea] = useState(farmProfile.plotArea);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      cropName: cropName.trim() || 'Auto-Detect Any Crop', 
      soilType, 
      plotArea, 
      region: 'Local Climate' 
    });
    onClose();
  };

  const scaleOptions = [
    { label: 'Home / Pots', value: '10 Potted Plants', icon: Home },
    { label: 'Small Farm', value: '1 Acre', icon: Trees },
    { label: 'Large Field', value: '5 Acres', icon: Tractor }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-[#141517] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-slate-900 dark:text-neutral-100 transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-neutral-100">
                Your Field & Plant Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-sans">
                Tell us what you are growing so we can calculate exact fertilizer amounts
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1C1D21] text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* 1. Crop Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-neutral-200 mb-1.5 font-sans">
              What are you growing?
            </label>
            <input
              type="text"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="✨ Auto-detect from photo (Default)"
              className="w-full bg-slate-50 dark:bg-[#0E0F11] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
            />
            <span className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5 block font-sans">
              Leave blank to let AgroVeda identify your plant automatically from the photo.
            </span>
          </div>

          {/* 2. Scale Selection with 1-Click Chips */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-neutral-200 mb-2 font-sans">
              How big is your garden or farm?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {scaleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = plotArea === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setPlotArea(opt.value)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-xs'
                        : 'bg-slate-50/70 dark:bg-[#0E0F11] border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-neutral-400 hover:border-slate-400 dark:hover:border-white/20'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 mb-1.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-neutral-500'}`} />
                    <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                    <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-normal mt-0.5">{opt.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Soil Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-neutral-200 mb-1.5 font-sans">
              Soil Type
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-[#0E0F11] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-neutral-100 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer transition-all"
            >
              <option value="Loamy">Standard Garden & Farm Soil (Normal Loam)</option>
              <option value="Clay">Clay Soil (Dense / High Water Retention)</option>
              <option value="Sandy">Sandy Soil (Light / Rapid Drainage)</option>
              <option value="Black Soil">Black Cotton Soil (Rich Clay)</option>
              <option value="Red Soil">Red Loam Soil (Porous & Acidic)</option>
              <option value="Alluvial">Alluvial Basin Soil (Fertile Silt)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/[0.07] mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1B1E] dark:hover:bg-[#222428] text-slate-700 dark:text-neutral-300 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" strokeWidth={2.5} />
              <span>Save Settings</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};