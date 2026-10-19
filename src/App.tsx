import React, { useState, useMemo } from 'react';
import { EvaluatedTarget, LayerVisibility, ScoringWeights } from './types';
import {
  DEFAULT_WEIGHTS,
  GEOLOGICAL_FEATURES,
  KNOWN_DEPOSITS,
  SYNTHETIC_TARGETS,
} from './data/explorationData';
import { evaluateAllTargets, exportTargetsToCSV } from './utils/scoring';
import { Header } from './components/Header';
import { ExplorationSidebar } from './components/ExplorationSidebar';
import { ExplorationMap } from './components/ExplorationMap';
import { TargetRankingTable } from './components/TargetRankingTable';
import { TargetDetailPanel } from './components/TargetDetailPanel';
import { TargetComparisonModal } from './components/TargetComparisonModal';
import { ScoringConfigPanel } from './components/ScoringConfigPanel';
import { MethodologyView } from './components/MethodologyView';
import { HowProspectWorksModal } from './components/HowProspectWorksModal';
import { X, Table2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'rankings' | 'methodology'>('dashboard');
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>('ZM-CB-001');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [comparisonTarget, setComparisonTarget] = useState<EvaluatedTarget | null>(null);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    roanFormation: true,
    basementDomes: true,
    faultsAndStructures: true,
    knownOccurrences: true,
    geochemAnomalies: true,
    targetMarkers: true,
  });

  // Calculate dynamic scores based on current model weights
  const evaluatedTargets = useMemo(() => {
    return evaluateAllTargets(SYNTHETIC_TARGETS, weights);
  }, [weights]);

  // Selected target
  const selectedTarget = useMemo(() => {
    if (!selectedTargetId) return evaluatedTargets[0];
    return evaluatedTargets.find((t) => t.id === selectedTargetId) || evaluatedTargets[0];
  }, [evaluatedTargets, selectedTargetId]);

  const handleToggleLayer = (key: keyof LayerVisibility) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOpenCompare = (target?: EvaluatedTarget) => {
    if (target) {
      setComparisonTarget(target);
    } else if (selectedTarget) {
      setComparisonTarget(selectedTarget);
    } else {
      setComparisonTarget(evaluatedTargets[0]);
    }
    setIsCompareModalOpen(true);
  };

  const handleExportCSV = () => {
    exportTargetsToCSV(evaluatedTargets, weights);
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Clean Light Top Navigation Bar */}
      <Header
        currentView={currentView}
        onChangeView={setCurrentView}
        onExportCSV={handleExportCSV}
        onOpenCompare={() => handleOpenCompare()}
        onOpenWeights={() => setIsWeightsModalOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        targetCount={evaluatedTargets.length}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* VIEW 1: Clean GIS Exploration Workspace */}
        {currentView === 'dashboard' && (
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Sleek Target Navigation Sidebar with Working Weights & Filter Reset */}
            <ExplorationSidebar
              targets={evaluatedTargets}
              selectedTargetId={selectedTargetId}
              onSelectTarget={(id) => setSelectedTargetId(id)}
              layerVisibility={layerVisibility}
              onToggleLayer={handleToggleLayer}
              weights={weights}
              onChangeWeights={setWeights}
              onResetWeights={handleResetWeights}
            />

            {/* Central Interactive Map */}
            <div className="flex-1 relative h-full overflow-hidden">
              <ExplorationMap
                targets={evaluatedTargets}
                selectedTargetId={selectedTargetId}
                onSelectTarget={(id) => setSelectedTargetId(id)}
                knownDeposits={KNOWN_DEPOSITS}
                geologicalFeatures={GEOLOGICAL_FEATURES}
                layerVisibility={layerVisibility}
                onToggleLayer={handleToggleLayer}
              />
            </div>

            {/* Right Target Detail Inspector (Clean, Collapsible) */}
            {selectedTargetId && selectedTarget && (
              <TargetDetailPanel
                target={selectedTarget}
                weights={weights}
                onClose={() => setSelectedTargetId(null)}
                onCompare={(t) => handleOpenCompare(t)}
              />
            )}
          </div>
        )}

        {/* VIEW 2: Clean Target Prioritisation Table */}
        {currentView === 'rankings' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-[#c25e1a]" />
                    <span>Target Prioritisation Table</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Transparent mineral systems evaluation for 10 demonstration targets in Zambia.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-[#c25e1a] hover:bg-[#a34e15] text-white transition-colors cursor-pointer shadow-xs"
                >
                  Export CSV
                </button>
              </div>

              <TargetRankingTable
                targets={evaluatedTargets}
                selectedTargetId={selectedTargetId}
                onSelectTarget={(id) => {
                  setSelectedTargetId(id);
                  setCurrentView('dashboard');
                }}
                onCompareTarget={(target) => handleOpenCompare(target)}
                weights={weights}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: Methodology & Data Specifications */}
        {currentView === 'methodology' && (
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <MethodologyView selectedTarget={selectedTarget} weights={weights} />
          </div>
        )}
      </main>

      {/* Target Comparison Modal */}
      {isCompareModalOpen && comparisonTarget && (
        <TargetComparisonModal
          targets={evaluatedTargets}
          initialTargetA={comparisonTarget}
          onClose={() => setIsCompareModalOpen(false)}
          weights={weights}
        />
      )}

      {/* "How Prospect Works" Student & Judge Briefing Modal */}
      {isHowItWorksOpen && (
        <HowProspectWorksModal onClose={() => setIsHowItWorksOpen(false)} />
      )}

      {/* Model Weights Calibration Modal */}
      {isWeightsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs select-none">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-slate-900">Scoring Model Weights</h3>
                <p className="text-[11px] text-slate-500">Adjust indicator contribution weights (sum to 100%)</p>
              </div>
              <button
                onClick={() => setIsWeightsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[75vh] overflow-y-auto">
              <ScoringConfigPanel
                weights={weights}
                onChangeWeights={setWeights}
                onResetDefaults={handleResetWeights}
              />
            </div>
            <div className="p-3 px-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsWeightsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#c25e1a] hover:bg-[#a34e15] text-white rounded cursor-pointer transition-colors shadow-xs"
              >
                Apply Weights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
