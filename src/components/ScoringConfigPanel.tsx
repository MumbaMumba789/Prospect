import React from 'react';
import { ScoringWeights } from '../types';
import { PRESET_WEIGHT_PROFILES } from '../data/explorationData';
import { RotateCcw } from 'lucide-react';

interface ScoringConfigPanelProps {
  weights: ScoringWeights;
  onChangeWeights: (newWeights: ScoringWeights) => void;
  onResetDefaults: () => void;
}

export const ScoringConfigPanel: React.FC<ScoringConfigPanelProps> = ({
  weights,
  onChangeWeights,
  onResetDefaults,
}) => {
  const totalWeight =
    weights.geology_setting +
    weights.geochem_anomaly +
    weights.structural_context +
    weights.occurrence_proximity;

  const handleSliderChange = (key: keyof ScoringWeights, val: number) => {
    onChangeWeights({
      ...weights,
      [key]: val,
    });
  };

  const applyPreset = (presetKey: string) => {
    if (PRESET_WEIGHT_PROFILES[presetKey]) {
      onChangeWeights(PRESET_WEIGHT_PROFILES[presetKey].weights);
    }
  };

  const normalizeTo100 = () => {
    if (totalWeight === 0) return;
    const ratio = 100 / totalWeight;
    const g = Math.round(weights.geology_setting * ratio);
    const c = Math.round(weights.geochem_anomaly * ratio);
    const s = Math.round(weights.structural_context * ratio);
    const p = 100 - (g + c + s);
    onChangeWeights({
      geology_setting: g,
      geochem_anomaly: c,
      structural_context: s,
      occurrence_proximity: Math.max(0, p),
    });
  };

  return (
    <div className="bg-white rounded-lg text-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-900">Indicator Weight Configuration</span>
        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Reset to default balanced weights"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Preset Profiles */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
          Exploration Model Presets
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(PRESET_WEIGHT_PROFILES).map(([key, profile]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="p-2 text-left rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs cursor-pointer group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-[#c25e1a] line-clamp-1">
                {profile.name.split('(')[0]}
              </div>
              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {profile.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Weight Sliders */}
      <div className="space-y-3 pt-1">
        {/* Geology Setting */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">Geological Setting (Host Lithology)</span>
            <span className="font-mono font-bold text-[#c25e1a]">{weights.geology_setting}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={weights.geology_setting}
            onChange={(e) => handleSliderChange('geology_setting', Number(e.target.value))}
            className="w-full accent-[#c25e1a] bg-slate-200 h-1.5 rounded cursor-pointer"
          />
          <div className="text-[10px] text-slate-500">
            Lower Roan Ore Shale and quartzite vs basement inliers
          </div>
        </div>

        {/* Geochem Anomaly */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">Geochemical Anomaly Strength</span>
            <span className="font-mono font-bold text-emerald-700">{weights.geochem_anomaly}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={weights.geochem_anomaly}
            onChange={(e) => handleSliderChange('geochem_anomaly', Number(e.target.value))}
            className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded cursor-pointer"
          />
          <div className="text-[10px] text-slate-500">
            Soil B-horizon, stream sediment, and termite Cu-Co ppm tenors
          </div>
        </div>

        {/* Structural Context */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">Structural Context & Trap</span>
            <span className="font-mono font-bold text-sky-700">{weights.structural_context}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={weights.structural_context}
            onChange={(e) => handleSliderChange('structural_context', Number(e.target.value))}
            className="w-full accent-sky-600 bg-slate-200 h-1.5 rounded cursor-pointer"
          />
          <div className="text-[10px] text-slate-500">
            Fold hinges, synclinal closures, and reactivated shear faults
          </div>
        </div>

        {/* Occurrence Proximity */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">Proximity to Known Occurrences</span>
            <span className="font-mono font-bold text-slate-700">{weights.occurrence_proximity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={weights.occurrence_proximity}
            onChange={(e) => handleSliderChange('occurrence_proximity', Number(e.target.value))}
            className="w-full accent-slate-600 bg-slate-200 h-1.5 rounded cursor-pointer"
          />
          <div className="text-[10px] text-slate-500">
            Proximity to confirmed economic mines and mineral occurrences
          </div>
        </div>
      </div>

      {/* Weight Balance Status */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Total Sum:</span>
          <span
            className={`font-mono font-bold tabular-nums ${
              totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {totalWeight}%
          </span>
        </div>
        {totalWeight !== 100 && (
          <button
            onClick={normalizeTo100}
            className="px-2 py-0.5 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer border border-slate-300"
          >
            Balance to 100%
          </button>
        )}
      </div>
    </div>
  );
};
