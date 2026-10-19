import React, { useState } from 'react';
import { EvaluatedTarget, ScoringWeights } from '../types';
import { getPriorityStyling } from '../utils/scoring';
import { X, GitCompare } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TargetComparisonModalProps {
  targets: EvaluatedTarget[];
  initialTargetA: EvaluatedTarget;
  onClose: () => void;
  weights: ScoringWeights;
}

export const TargetComparisonModal: React.FC<TargetComparisonModalProps> = ({
  targets,
  initialTargetA,
  onClose,
  weights,
}) => {
  const [targetAId, setTargetAId] = useState(initialTargetA.id);
  const [targetBId, setTargetBId] = useState(() => {
    const other = targets.find((t) => t.id !== initialTargetA.id);
    return other ? other.id : targets[0].id;
  });

  const targetA = targets.find((t) => t.id === targetAId) || initialTargetA;
  const targetB = targets.find((t) => t.id === targetBId) || targets[1] || initialTargetA;

  const styleA = getPriorityStyling(targetA.priorityCategory);
  const styleB = getPriorityStyling(targetB.priorityCategory);

  const comparisonData = [
    {
      indicator: 'Geological Setting',
      shortKey: 'Geology',
      targetAScore: targetA.indicators.geology_setting.normalizedScore,
      targetBScore: targetB.indicators.geology_setting.normalizedScore,
      targetAWeightContrib: targetA.indicatorContributions.geology_setting,
      targetBWeightContrib: targetB.indicatorContributions.geology_setting,
    },
    {
      indicator: 'Geochemical Anomaly',
      shortKey: 'Geochem',
      targetAScore: targetA.indicators.geochem_anomaly.normalizedScore,
      targetBScore: targetB.indicators.geochem_anomaly.normalizedScore,
      targetAWeightContrib: targetA.indicatorContributions.geochem_anomaly,
      targetBWeightContrib: targetB.indicatorContributions.geochem_anomaly,
    },
    {
      indicator: 'Structural Trap',
      shortKey: 'Structure',
      targetAScore: targetA.indicators.structural_context.normalizedScore,
      targetBScore: targetB.indicators.structural_context.normalizedScore,
      targetAWeightContrib: targetA.indicatorContributions.structural_context,
      targetBWeightContrib: targetB.indicatorContributions.structural_context,
    },
    {
      indicator: 'Occurrence Proximity',
      shortKey: 'Proximity',
      targetAScore: targetA.indicators.occurrence_proximity.normalizedScore,
      targetBScore: targetB.indicators.occurrence_proximity.normalizedScore,
      targetAWeightContrib: targetA.indicatorContributions.occurrence_proximity,
      targetBWeightContrib: targetB.indicatorContributions.occurrence_proximity,
    },
  ];

  const scoreDiff = Math.round((targetA.totalScore - targetB.totalScore) * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#c25e1a]" />
            <span className="text-sm font-bold text-slate-900">Target Multi-Criteria Comparison</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Selectors Bar */}
        <div className="p-3 px-4 bg-slate-50/50 border-b border-slate-200 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#c25e1a] flex items-center justify-between">
              <span>Target A</span>
              <span className="font-mono text-slate-500 font-normal">Rank #{targetA.rank}</span>
            </label>
            <select
              value={targetAId}
              onChange={(e) => setTargetAId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}: {t.name} ({t.totalScore} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
              <span>Target B</span>
              <span className="font-mono text-slate-500 font-normal">Rank #{targetB.rank}</span>
            </label>
            <select
              value={targetBId}
              onChange={(e) => setTargetBId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}: {t.name} ({t.totalScore} pts)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-[#c25e1a] font-bold">{targetA.id}</span>
              <div className="font-bold text-xs text-slate-900 truncate">{targetA.name}</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-[#c25e1a]">{targetA.totalScore}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${styleA.badgeBg} ${styleA.textColor}`}>
                  {targetA.priorityCategory}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Difference</span>
              <div className="text-base font-bold font-mono my-0.5 text-slate-800">
                {scoreDiff > 0 ? `+${scoreDiff} pts (Target A)` : scoreDiff < 0 ? `${scoreDiff} pts (Target B)` : 'Equal'}
              </div>
              <span className="text-[10px] text-slate-400">Under active model weights</span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-600 font-bold">{targetB.id}</span>
              <div className="font-bold text-xs text-slate-900 truncate">{targetB.name}</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-slate-700">{targetB.totalScore}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${styleB.badgeBg} ${styleB.textColor}`}>
                  {targetB.priorityCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Indicator Bar Comparison */}
          <div>
            <span className="font-semibold text-slate-800 text-xs mb-1.5 block">
              Indicator Score Comparison (0–100)
            </span>
            <div className="h-44 w-full bg-slate-50 rounded p-2 border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="shortKey" tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-slate-200 p-2 rounded shadow-md text-xs space-y-1">
                            <p className="font-semibold text-slate-900">{payload[0].payload.indicator}</p>
                            <p className="text-[#c25e1a]">
                              {targetA.id}: {payload[0].value}/100 (+{payload[0].payload.targetAWeightContrib} pts)
                            </p>
                            <p className="text-slate-700">
                              {targetB.id}: {payload[1].value}/100 (+{payload[1].payload.targetBWeightContrib} pts)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="targetAScore" name={targetA.id} fill="#c25e1a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="targetBScore" name={targetB.id} fill="#64748b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Differences Table */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 w-1/4">Criteria</th>
                  <th className="py-2 px-3 text-[#c25e1a]">{targetA.id}</th>
                  <th className="py-2 px-3 text-slate-700">{targetB.id}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-500">Host Lithology</td>
                  <td className="py-2 px-3 text-slate-800">{targetA.hostLithology}</td>
                  <td className="py-2 px-3 text-slate-800">{targetB.hostLithology}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-500">Structural Setting</td>
                  <td className="py-2 px-3 text-slate-800">{targetA.structuralSetting}</td>
                  <td className="py-2 px-3 text-slate-800">{targetB.structuralSetting}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-500">Geochem Assay</td>
                  <td className="py-2 px-3 text-slate-800">{targetA.indicators.geochem_anomaly.rawValue}</td>
                  <td className="py-2 px-3 text-slate-800">{targetB.indicators.geochem_anomaly.rawValue}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-500">Mine Proximity</td>
                  <td className="py-2 px-3 text-slate-800">{targetA.indicators.occurrence_proximity.rawValue}</td>
                  <td className="py-2 px-3 text-slate-800">{targetB.indicators.occurrence_proximity.rawValue}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-500">Data Completeness</td>
                  <td className="py-2 px-3 font-mono text-slate-800">{targetA.dataQuality.completenessScore}%</td>
                  <td className="py-2 px-3 font-mono text-slate-800">{targetB.dataQuality.completenessScore}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
