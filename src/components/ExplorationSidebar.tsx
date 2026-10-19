import React, { useState } from 'react';
import { EvaluatedTarget, PriorityCategory, LayerVisibility, ScoringWeights, IndicatorKey } from '../types';
import { getPriorityStyling, adjustWeightsAutoBalanced } from '../utils/scoring';
import { DEFAULT_WEIGHTS } from '../data/explorationData';
import { Search, Layers, ChevronDown, ChevronRight, SlidersHorizontal, RotateCcw, X } from 'lucide-react';

interface ExplorationSidebarProps {
  targets: EvaluatedTarget[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string) => void;
  layerVisibility: LayerVisibility;
  onToggleLayer: (layerKey: keyof LayerVisibility) => void;
  weights: ScoringWeights;
  onChangeWeights: (newWeights: ScoringWeights) => void;
  onResetWeights: () => void;
}

export const ExplorationSidebar: React.FC<ExplorationSidebarProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  layerVisibility,
  onToggleLayer,
  weights,
  onChangeWeights,
  onResetWeights,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityCategory>('All');
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  const isFiltered = searchQuery.trim() !== '' || priorityFilter !== 'All';
  const areWeightsModified =
    weights.geology_setting !== DEFAULT_WEIGHTS.geology_setting ||
    weights.geochem_anomaly !== DEFAULT_WEIGHTS.geochem_anomaly ||
    weights.structural_context !== DEFAULT_WEIGHTS.structural_context ||
    weights.occurrence_proximity !== DEFAULT_WEIGHTS.occurrence_proximity;

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
  };

  const handleSliderChange = (key: IndicatorKey, val: number) => {
    const balanced = adjustWeightsAutoBalanced(weights, key, val);
    onChangeWeights(balanced);
  };

  const filteredTargets = targets.filter((target) => {
    const matchesSearch =
      target.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'All' || target.priorityCategory === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <aside className="w-72 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 select-none shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">Ranked Targets</span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({filteredTargets.length}/{targets.length})
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-[#c25e1a] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search target or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded px-8 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Priority Segmented Control */}
        <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded border border-slate-200">
          <button
            onClick={() => setPriorityFilter('All')}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
              priorityFilter === 'All'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPriorityFilter('High Priority')}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
              priorityFilter === 'High Priority'
                ? 'bg-white text-[#c25e1a] shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            High
          </button>
          <button
            onClick={() => setPriorityFilter('Moderate Priority')}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
              priorityFilter === 'Moderate Priority'
                ? 'bg-white text-slate-800 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mod
          </button>
          <button
            onClick={() => setPriorityFilter('Low Priority / Needs Data')}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
              priorityFilter === 'Low Priority / Needs Data'
                ? 'bg-white text-slate-600 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            Low
          </button>
        </div>
      </div>

      {/* Quick Weight Tuning Bar (Interactive Demo Core Feature) */}
      <div className="border-b border-slate-200 bg-white">
        <button
          onClick={() => setIsWeightsOpen(!isWeightsOpen)}
          className="w-full p-2 px-3 flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#c25e1a]" />
            <span>Interactive Weights (Total 100%)</span>
          </div>
          <div className="flex items-center gap-2">
            {areWeightsModified && (
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Custom
              </span>
            )}
            {isWeightsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </button>

        {isWeightsOpen && (
          <div className="p-3 pt-1 space-y-2 border-t border-slate-100 bg-slate-50/70 text-[11px]">
            <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1">
              <span>Adjusting one slider auto-balances the rest</span>
              {areWeightsModified && (
                <button
                  onClick={onResetWeights}
                  className="text-[#c25e1a] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Geology Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-700">
                <span>Geology Setting</span>
                <span className="font-mono font-bold text-[#c25e1a]">{weights.geology_setting}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={75}
                step={5}
                value={weights.geology_setting}
                onChange={(e) => handleSliderChange('geology_setting', Number(e.target.value))}
                className="w-full accent-[#c25e1a] h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>

            {/* Geochem Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-700">
                <span>Geochem Anomaly</span>
                <span className="font-mono font-bold text-emerald-700">{weights.geochem_anomaly}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={75}
                step={5}
                value={weights.geochem_anomaly}
                onChange={(e) => handleSliderChange('geochem_anomaly', Number(e.target.value))}
                className="w-full accent-emerald-600 h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>

            {/* Structure Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-700">
                <span>Structural Trap</span>
                <span className="font-mono font-bold text-sky-700">{weights.structural_context}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={75}
                step={5}
                value={weights.structural_context}
                onChange={(e) => handleSliderChange('structural_context', Number(e.target.value))}
                className="w-full accent-sky-600 h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>

            {/* Proximity Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-700">
                <span>Deposit Proximity</span>
                <span className="font-mono font-bold text-slate-700">{weights.occurrence_proximity}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={weights.occurrence_proximity}
                onChange={(e) => handleSliderChange('occurrence_proximity', Number(e.target.value))}
                className="w-full accent-slate-600 h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Target Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredTargets.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs space-y-1">
            <p>No targets match criteria.</p>
            <button
              onClick={handleResetFilters}
              className="text-[#c25e1a] text-[11px] underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredTargets.map((target) => {
            const isSelected = target.id === selectedTargetId;
            const styling = getPriorityStyling(target.priorityCategory);

            return (
              <div
                key={target.id}
                onClick={() => onSelectTarget(target.id)}
                className={`p-2.5 px-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-amber-50/80 border-l-2 border-l-[#c25e1a]'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">
                        #{target.rank}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 truncate">
                        {target.id}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {target.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="truncate">{target.district}</span>
                      <span>·</span>
                      <span className="truncate text-slate-400">{target.geologicalUnit.split('(')[0]}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div
                      className="font-mono font-bold text-sm tabular-nums"
                      style={{ color: styling.hexColor }}
                    >
                      {target.totalScore.toFixed(1)}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                      score
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Collapsible Layer Visibility Section */}
      <div className="border-t border-slate-200 bg-slate-50/70">
        <button
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className="w-full p-2 px-3 flex items-center justify-between text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Map Layers</span>
          </div>
          {isLayersOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {isLayersOpen && (
          <div className="p-3 pt-1 space-y-1.5 border-t border-slate-200/60 text-[11px] text-slate-600 bg-white">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={layerVisibility.targetMarkers}
                onChange={() => onToggleLayer('targetMarkers')}
                className="rounded border-slate-300 text-[#c25e1a] focus:ring-[#c25e1a]"
              />
              <span>Target Priority Markers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={layerVisibility.knownOccurrences}
                onChange={() => onToggleLayer('knownOccurrences')}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
              />
              <span>Known Mines & Deposits (8)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={layerVisibility.roanFormation}
                onChange={() => onToggleLayer('roanFormation')}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-600"
              />
              <span>Lower Roan Ore Fairway</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={layerVisibility.basementDomes}
                onChange={() => onToggleLayer('basementDomes')}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-600"
              />
              <span>Basement Domes Domain</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={layerVisibility.faultsAndStructures}
                onChange={() => onToggleLayer('faultsAndStructures')}
                className="rounded border-slate-300 text-red-600 focus:ring-red-600"
              />
              <span>Regional Shear Faults</span>
            </label>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 px-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between bg-slate-50">
        <span>Zambia Copperbelt</span>
        <span className="font-mono">WGS 84 / Arc 1950</span>
      </div>
    </aside>
  );
};
