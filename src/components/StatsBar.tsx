import React from 'react';
import { EvaluatedTarget, LayerVisibility } from '../types';
import { MapPin, Target, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface StatsBarProps {
  targets: EvaluatedTarget[];
  layerVisibility: LayerVisibility;
}

export const StatsBar: React.FC<StatsBarProps> = ({ targets, layerVisibility }) => {
  const highPriorityCount = targets.filter((t) => t.priorityCategory === 'High Priority').length;
  const moderatePriorityCount = targets.filter((t) => t.priorityCategory === 'Moderate Priority').length;
  const activeLayersCount = Object.values(layerVisibility).filter(Boolean).length;

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
      {/* Project Study Area & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-100">Study Area:</span>
          <span>Central & Western Copperbelt Domain, Zambia</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <span>Mine-Tech Pre-Incubation</span>
          <span>·</span>
          <span className="text-amber-400/90 font-medium">Demonstration MVP</span>
        </div>
      </div>

      {/* Demonstration Statistics Indicators */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Targets Assessed:</span>
          <span className="font-bold text-slate-100 tabular-nums">{targets.length}</span>
          <span className="text-slate-500 font-sans text-[10px]">(Demo)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">High Priority:</span>
          <span className="font-bold text-amber-400 tabular-nums">{highPriorityCount}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Moderate:</span>
          <span className="font-bold text-cyan-400 tabular-nums">{moderatePriorityCount}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Active Layers:</span>
          <span className="font-bold text-emerald-400 tabular-nums">{activeLayersCount}/6</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
          <span>Data: Synthetic / Open Index</span>
        </div>
      </div>
    </div>
  );
};
