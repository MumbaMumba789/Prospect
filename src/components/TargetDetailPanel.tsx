import React, { useState } from 'react';
import { EvaluatedTarget, ScoringWeights } from '../types';
import { getPriorityStyling } from '../utils/scoring';
import { X, GitCompare, ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TargetDetailPanelProps {
  target: EvaluatedTarget;
  weights: ScoringWeights;
  onClose: () => void;
  onCompare: (target: EvaluatedTarget) => void;
}

export const TargetDetailPanel: React.FC<TargetDetailPanelProps> = ({
  target,
  weights,
  onClose,
  onCompare,
}) => {
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);
  const styling = getPriorityStyling(target.priorityCategory);

  const indicators = [
    {
      key: 'geology_setting',
      label: 'Geological Setting',
      subtext: target.indicators.geology_setting.rawValue,
      score: target.indicators.geology_setting.normalizedScore,
      weight: weights.geology_setting,
      contrib: target.indicatorContributions.geology_setting,
      barColor: 'bg-[#c25e1a]',
    },
    {
      key: 'geochem_anomaly',
      label: 'Geochemical Anomaly',
      subtext: target.indicators.geochem_anomaly.rawValue,
      score: target.indicators.geochem_anomaly.normalizedScore,
      weight: weights.geochem_anomaly,
      contrib: target.indicatorContributions.geochem_anomaly,
      barColor: 'bg-emerald-600',
    },
    {
      key: 'structural_context',
      label: 'Structural Trap',
      subtext: target.indicators.structural_context.rawValue,
      score: target.indicators.structural_context.normalizedScore,
      weight: weights.structural_context,
      contrib: target.indicatorContributions.structural_context,
      barColor: 'bg-sky-600',
    },
    {
      key: 'occurrence_proximity',
      label: 'Deposit Proximity',
      subtext: target.indicators.occurrence_proximity.rawValue,
      score: target.indicators.occurrence_proximity.normalizedScore,
      weight: weights.occurrence_proximity,
      contrib: target.indicatorContributions.occurrence_proximity,
      barColor: 'bg-slate-500',
    },
  ];

  return (
    <aside className="w-80 h-full bg-white border-l border-slate-200 flex flex-col text-slate-800 select-none overflow-y-auto shadow-[-2px_0_4px_rgba(0,0,0,0.02)]">
      {/* 1. Target ID and Priority Category & 2. Priority Score */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900">
                {target.id}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] text-slate-500 font-medium">Rank #{target.rank}</span>
              <span className="text-slate-300">·</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${styling.badgeBg} ${styling.borderColor} ${styling.textColor}`}
              >
                {target.priorityCategory}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{target.name}</h2>
            <p className="text-[11px] text-slate-500">
              {target.district} District · {target.province} Province
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close target details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Score Header */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-baseline justify-between">
          <span className="text-[11px] font-medium text-slate-600">Exploration Score</span>
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl font-bold font-mono tracking-tight"
              style={{ color: styling.hexColor }}
            >
              {target.totalScore.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* 3. Short explanation of why the target ranks as it does */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
            Ranking Rationale
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/80">
            {target.geologicalRationale}
          </p>
        </div>

        {/* 4. Compact visualisation of contributing geological indicators */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Scoring Contributions
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Total: 100%</span>
          </div>

          <div className="space-y-2">
            {indicators.map((ind) => (
              <div key={ind.key} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700 font-medium">{ind.label}</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    <span className="font-bold text-slate-900">{ind.score}</span>
                    <span className="text-slate-400 text-[10px] ml-1">
                      ({ind.weight}% &rarr; +{ind.contrib.toFixed(1)})
                    </span>
                  </span>
                </div>
                {/* Clean indicator progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className={`h-full ${ind.barColor} rounded-full`}
                    style={{ width: `${ind.score}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 truncate" title={ind.subtext}>
                  {ind.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Supporting evidence and data-quality warnings (clean and collapsible) */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <button
            onClick={() => setIsEvidenceExpanded(!isEvidenceExpanded)}
            className="w-full p-2.5 px-3 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <span>Geological Evidence & Data Status</span>
            {isEvidenceExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {isEvidenceExpanded ? (
            <div className="p-3 space-y-2 text-[11px] border-t border-slate-200 bg-white">
              <div>
                <span className="text-slate-500 font-medium">Host Unit:</span>{' '}
                <span className="text-slate-800">{target.geologicalUnit}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Lithology:</span>{' '}
                <span className="text-slate-800">{target.hostLithology}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Structure:</span>{' '}
                <span className="text-slate-800">{target.structuralSetting}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Deposit Model:</span>{' '}
                <span className="text-slate-800">{target.mineralizationStyle}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Data Completeness:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {target.dataQuality.completenessScore}%
                </span>
              </div>

              {target.dataQuality.missingData.length > 0 ? (
                <div className="p-2 rounded bg-amber-50 border border-amber-200/80 text-[10px] text-amber-900 space-y-0.5">
                  <div className="font-semibold flex items-center gap-1 text-amber-800">
                    <AlertCircle className="w-3 h-3 text-amber-700" />
                    <span>Evidence Gaps:</span>
                  </div>
                  <div>{target.dataQuality.missingData.join(', ')}</div>
                </div>
              ) : (
                <div className="text-emerald-700 text-[10px] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Key baseline datasets complete</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2 px-3 text-[11px] text-slate-600 flex items-center justify-between bg-white">
              <span className="truncate max-w-[180px]">{target.hostLithology}</span>
              <span className="text-slate-400 font-mono text-[10px]">
                {target.dataQuality.completenessScore}% data
              </span>
            </div>
          )}
        </div>

        {/* 6. Recommended next steps */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
            Recommended Follow-Up Steps
          </span>
          <ul className="space-y-1 text-[11px] text-slate-700">
            {target.followUpActions.map((action, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[#c25e1a] font-bold mt-0.5">•</span>
                <span className="leading-snug">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Compare Action Button */}
        <div className="pt-2">
          <button
            onClick={() => onCompare(target)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-300 shadow-2xs"
          >
            <GitCompare className="w-3.5 h-3.5 text-slate-500" />
            <span>Compare Target</span>
          </button>
        </div>

        {/* Minimal Disclaimer Footnote */}
        <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-200 pt-2 text-center">
          Demonstration prototype. Synthetic exploration indicators.
        </p>
      </div>
    </aside>
  );
};
