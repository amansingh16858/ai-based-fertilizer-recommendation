import React from 'react';
import { X, Sparkles, ArrowRight, Check } from 'lucide-react';
import { SampleLeaf, SoilTelemetry } from '../types';
import { SAMPLE_IMAGES } from '../data/sampleLeavesData';

interface SampleLeavesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleLeaf) => void;
}

export const SAMPLE_LEAVES: SampleLeaf[] = [
  {
    id: 'local-tomato-blight',
    title: 'Tomato — Early Blight & Thirsty Dirt',
    crop: 'Tomato (Solanum lycopersicum)',
    disease: 'Brown Ring Spots & Yellow Curled Edges',
    imageUrl: SAMPLE_IMAGES.tomato,
    defaultTelemetry: {
      moisturePercent: 26.5,
      temperatureC: 31.0,
      humidityPercent: 62.0,
      timestamp: 'Field Sample'
    },
    description: 'Target-like brown spots with yellow curled edges. Dry dirt (26.5%) stops the plant from drinking plant food.'
  },
  {
    id: 'local-mango-scorch',
    title: 'Mango — Leaf Bug Blisters',
    crop: 'Mango (Mangifera indica)',
    disease: 'Dark Bumpy Leaf Blisters',
    imageUrl: SAMPLE_IMAGES.mango,
    defaultTelemetry: {
      moisturePercent: 32.0,
      temperatureC: 33.5,
      humidityPercent: 56.0,
      timestamp: 'Field Sample'
    },
    description: 'Dark bumpy spots formed by tiny flies laying eggs inside the leaf. Spray natural neem oil to stop baby bugs from eating the leaf.'
  },
  {
    id: 'local-hibiscus-chlorosis',
    title: 'Hibiscus — Iron Food Shortage',
    crop: 'Hibiscus (Hibiscus rosa-sinensis)',
    disease: 'Yellow Leaf with Dark Green Veins',
    imageUrl: SAMPLE_IMAGES.hibiscus,
    defaultTelemetry: {
      moisturePercent: 42.0,
      temperatureC: 28.5,
      humidityPercent: 66.0,
      timestamp: 'Field Sample'
    },
    description: 'Yellow leaf where veins stay dark green. This means the plant is starving for iron food.'
  },
  {
    id: 'local-corn-nitrogen',
    title: 'Corn (Maize) — Nitrogen Food Shortage',
    crop: 'Maize (Zea mays)',
    disease: 'V-Shaped Yellow Stripe Down Center',
    imageUrl: SAMPLE_IMAGES.corn,
    defaultTelemetry: {
      moisturePercent: 24.0,
      temperatureC: 33.0,
      humidityPercent: 55.0,
      timestamp: 'Field Sample'
    },
    description: 'V-shaped yellow mark from the leaf tip down the center vein because the plant needs nitrogen food.'
  },
  {
    id: 'local-potato-blight',
    title: 'Potato — Late Blight & Soaked Dirt',
    crop: 'Potato (Solanum tuberosum)',
    disease: 'Dark Rotting Spots from Overwatering',
    imageUrl: SAMPLE_IMAGES.potato,
    defaultTelemetry: {
      moisturePercent: 82.0,
      temperatureC: 24.5,
      humidityPercent: 88.0,
      timestamp: 'Field Sample'
    },
    description: 'Dark rotting wet spots. The dirt is soaked in water (82%), creating mold and fungus that damage leaves.'
  },
  {
    id: 'healthy-control',
    title: 'Healthy Plant — Benchmark Control',
    crop: 'Capsicum / Pepper',
    disease: 'No Disease Detected (Healthy Vigor)',
    imageUrl: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
    defaultTelemetry: {
      moisturePercent: 52.0,
      temperatureC: 28.0,
      humidityPercent: 62.0,
      timestamp: 'Sample Data'
    },
    description: 'Healthy, strong dark green leaf with perfect 52% soil moisture.'
  }
];

export const SampleLeavesModal: React.FC<SampleLeavesModalProps> = ({
  isOpen,
  onClose,
  onSelectSample
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-[#141517] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto font-sans">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.07]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-neutral-100">
              Try Real Plant Leaves
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1C1D21] text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-neutral-400 font-sans">
          Tap any sample plant to see how AgroVeda detects leaf problems and calculates the right fertilizer recipe.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {SAMPLE_LEAVES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="group p-3.5 rounded-xl bg-slate-50/60 dark:bg-[#0E0F11] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/50 dark:hover:border-emerald-400/40 cursor-pointer transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2.5 bg-[#090A0B]">
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-emerald-300 border border-white/20">
                    {sample.crop.split(' ')[0]}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {sample.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                  {sample.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 dark:border-white/[0.06] text-[10px] font-mono">
                <span className="text-slate-400 dark:text-neutral-400">Moisture: {sample.defaultTelemetry.moisturePercent}%</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span>Load Sample</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
