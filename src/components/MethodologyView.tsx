import React from 'react';
import { EvaluatedTarget, ScoringWeights } from '../types';
import { getPriorityStyling } from '../utils/scoring';
import { BookOpen, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface MethodologyViewProps {
  selectedTarget: EvaluatedTarget;
  weights: ScoringWeights;
}

export const MethodologyView: React.FC<MethodologyViewProps> = ({
  selectedTarget,
  weights,
}) => {
  const styling = getPriorityStyling(selectedTarget.priorityCategory);

  const indicators = [
    {
      name: 'Geological Setting Compatibility',
      weight: `${weights.geology_setting}%`,
      observed: selectedTarget.indicators.geology_setting.rawValue,
      rating: `${selectedTarget.indicators.geology_setting.normalizedScore}/100`,
      contribution: `+${selectedTarget.indicatorContributions.geology_setting.toFixed(1)} pts`,
      role: 'Evaluates host lithology against proven Lower Roan ore horizons vs basement.',
    },
    {
      name: 'Geochemical Anomaly Strength',
      weight: `${weights.geochem_anomaly}%`,
      observed: selectedTarget.indicators.geochem_anomaly.rawValue,
      rating: `${selectedTarget.indicators.geochem_anomaly.normalizedScore}/100`,
      contribution: `+${selectedTarget.indicatorContributions.geochem_anomaly.toFixed(1)} pts`,
      role: 'Measures Cu-Co soil and stream sediment concentration relative to background.',
    },
    {
      name: 'Structural Context & Trap',
      weight: `${weights.structural_context}%`,
      observed: selectedTarget.indicators.structural_context.rawValue,
      rating: `${selectedTarget.indicators.structural_context.normalizedScore}/100`,
      contribution: `+${selectedTarget.indicatorContributions.structural_context.toFixed(1)} pts`,
      role: 'Focuses on anticlinal closures, dome flanks, and dilatant shear fault zones.',
    },
    {
      name: 'Proximity to Documented Occurrences',
      weight: `${weights.occurrence_proximity}%`,
      observed: selectedTarget.indicators.occurrence_proximity.rawValue,
      rating: `${selectedTarget.indicators.occurrence_proximity.normalizedScore}/100`,
      contribution: `+${selectedTarget.indicatorContributions.occurrence_proximity.toFixed(1)} pts`,
      role: 'Measures spatial distance to verified producing mines and historical deposits.',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-7 text-slate-800">
      {/* Title */}
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#c25e1a]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Mine-Tech Pre-Incubation Programme · Technical Methodology</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Geology-Informed Target Ranking Methodology
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Transparent multi-criteria evaluation approach for prioritising copper exploration targets across the Zambian Copperbelt and Domes regions.
        </p>
      </div>

      {/* 1. How target ranking works */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900">1. How Target Ranking Works</h2>
        <p className="text-xs text-slate-700 leading-relaxed">
          Prospect calculates exploration target priority using an empirical weighted sum of four mineral system components: host lithology compatibility, geochemical anomaly tenor, structural trap geometry, and proximity to documented occurrences. Each indicator is normalized to a 0–100 scale based on geological criteria, multiplied by its assigned weight, and summed to yield an overall score from 0 to 100:
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800 text-center">
          Score = (w_geo × S_geo + w_chem × S_chem + w_struct × S_struct + w_prox × S_prox) ÷ 100
        </div>
        <p className="text-[11px] text-slate-500">
          Thresholds: High Priority (&ge;75 pts), Moderate Priority (50–74 pts), Low Priority / Needs Data (&lt;50 pts).
        </p>
      </section>

      {/* 2. Scoring indicators */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">2. Scoring Indicators & Current Weights</h2>
          <span className="text-[11px] font-mono text-slate-500">Active Model Weights</span>
        </div>

        <div className="border border-slate-200 rounded overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2 px-3">Indicator Name</th>
                <th className="py-2 px-3">Weight</th>
                <th className="py-2 px-3">Demo Observation ({selectedTarget.id})</th>
                <th className="py-2 px-3 text-right">Rating</th>
                <th className="py-2 px-3 text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {indicators.map((ind, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{ind.name}</div>
                    <div className="text-[10px] text-slate-500">{ind.role}</div>
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-800">{ind.weight}</td>
                  <td className="py-2 px-3 text-slate-700">{ind.observed}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-800">{ind.rating}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-[#c25e1a]">{ind.contribution}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 text-[11px] font-semibold text-slate-800">
              <tr>
                <td className="py-2 px-3">Total Multi-Criteria Score</td>
                <td className="py-2 px-3 font-mono">100%</td>
                <td className="py-2 px-3 font-sans text-slate-500" colSpan={2}>
                  Active Target: {selectedTarget.name}
                </td>
                <td className="py-2 px-3 text-right font-mono text-sm font-bold" style={{ color: styling.hexColor }}>
                  {selectedTarget.totalScore.toFixed(1)} / 100
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 3. Why this target received its score */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900">
          3. Why Target {selectedTarget.id} Received Its Score ({selectedTarget.totalScore}/100)
        </h2>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">{selectedTarget.name}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${styling.badgeBg} ${styling.borderColor} ${styling.textColor}`}
            >
              {selectedTarget.priorityCategory} · Rank #{selectedTarget.rank}
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {selectedTarget.geologicalRationale}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500 font-medium">Mapped Lithology:</span>{' '}
              <span className="text-slate-800">{selectedTarget.hostLithology}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Structural Setting:</span>{' '}
              <span className="text-slate-800">{selectedTarget.structuralSetting}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Geochemical Assay:</span>{' '}
              <span className="text-slate-800">{selectedTarget.indicators.geochem_anomaly.rawValue}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Known Mine Distance:</span>{' '}
              <span className="text-slate-800">{selectedTarget.indicators.occurrence_proximity.rawValue}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Data status and limitations */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-bold text-slate-900">4. Data Status and Limitations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Public Geoscience Layers</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Base reference positions for the 8 operating mines (Nchanga, Konkola, Kansanshi, Mufulira, Lumwana, Chambishi, Luanshya, Sentinel) and general regional tectonic boundaries represent verified public records from the Geological Survey Department of Zambia and published literature.
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Synthetic Demonstration Targets</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              The 10 demonstration targets (ZM-CB-001 through ZM-CB-010) and their specific soil assay numbers are synthetic illustrative records created for this Mine-Tech MVP. They do not constitute discovered copper deposits.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 space-y-1">
          <span className="font-semibold text-slate-800">Spatial Validation Note:</span>
          <p className="leading-relaxed">
            Future commercial validation against real concession data must account for spatial autocorrelation. Exploration models should withhold entire geological camps (spatial block cross-validation) rather than random sample points to avoid circular data leakage.
          </p>
        </div>
      </section>
    </div>
  );
};
