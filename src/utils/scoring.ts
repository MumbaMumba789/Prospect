import { EvaluatedTarget, IndicatorKey, PriorityCategory, ScoringWeights, TargetRecord } from '../types';

export const INDICATOR_METADATA: Record<IndicatorKey, { label: string; description: string; unitHint: string }> = {
  geology_setting: {
    label: 'Geological Setting Compatibility',
    description: 'Favorability of the mapped host rock lithology and stratigraphic contact (e.g., Lower Roan Ore Shale / Footwall quartzite vs basement).',
    unitHint: 'Stratigraphic ranking & contact proximity',
  },
  geochem_anomaly: {
    label: 'Geochemical Anomaly Strength',
    description: 'Tenor and coherence of Cu-Co (or Cu-Au) geochemical anomalies in surface soil, stream sediment, or termite mound assays.',
    unitHint: 'ppm Cu / Co vs local baseline',
  },
  structural_context: {
    label: 'Structural Context & Deformation',
    description: 'Proximity to anticlinal closures, shear zones, fold hinges, or reactivated basement faults that localize mineralizing fluids.',
    unitHint: 'Fault proximity & fold strain intensity',
  },
  occurrence_proximity: {
    label: 'Proximity to Documented Occurrences',
    description: 'Spatial distance and along-strike continuity relative to confirmed economic mines and catalogued mineral occurrences.',
    unitHint: 'Kilometres to nearest deposit',
  },
};

/**
 * Calculates the total score and indicator breakdown for a single target based on weights.
 */
export function calculateTargetScore(
  target: TargetRecord,
  weights: ScoringWeights
): { totalScore: number; priorityCategory: PriorityCategory; indicatorContributions: Record<IndicatorKey, number> } {
  const sumWeights =
    weights.geology_setting +
    weights.occurrence_proximity +
    weights.geochem_anomaly +
    weights.structural_context;

  const validSum = sumWeights > 0 ? sumWeights : 100;

  const contribGeology = (weights.geology_setting * target.indicators.geology_setting.normalizedScore) / validSum;
  const contribProximity = (weights.occurrence_proximity * target.indicators.occurrence_proximity.normalizedScore) / validSum;
  const contribGeochem = (weights.geochem_anomaly * target.indicators.geochem_anomaly.normalizedScore) / validSum;
  const contribStructure = (weights.structural_context * target.indicators.structural_context.normalizedScore) / validSum;

  const rawTotal = contribGeology + contribProximity + contribGeochem + contribStructure;
  const totalScore = Math.round(rawTotal * 10) / 10;

  let priorityCategory: PriorityCategory = 'Moderate Priority';
  if (totalScore >= 75) {
    priorityCategory = 'High Priority';
  } else if (totalScore < 50) {
    priorityCategory = 'Low Priority / Needs Data';
  }

  return {
    totalScore,
    priorityCategory,
    indicatorContributions: {
      geology_setting: Math.round(contribGeology * 10) / 10,
      occurrence_proximity: Math.round(contribProximity * 10) / 10,
      geochem_anomaly: Math.round(contribGeochem * 10) / 10,
      structural_context: Math.round(contribStructure * 10) / 10,
    },
  };
}

/**
 * Evaluates and ranks all targets based on current scoring weights.
 */
export function evaluateAllTargets(
  targets: TargetRecord[],
  weights: ScoringWeights
): EvaluatedTarget[] {
  const evaluated = targets.map((target) => {
    const calc = calculateTargetScore(target, weights);
    return {
      ...target,
      totalScore: calc.totalScore,
      priorityCategory: calc.priorityCategory,
      indicatorContributions: calc.indicatorContributions,
      rank: 0,
    };
  });

  // Sort by score descending
  evaluated.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks
  return evaluated.map((t, index) => ({
    ...t,
    rank: index + 1,
  }));
}

/**
 * Dynamically adjusts one weight and proportionately balances other weights so the sum is strictly 100%.
 */
export function adjustWeightsAutoBalanced(
  currentWeights: ScoringWeights,
  changedKey: IndicatorKey,
  newValue: number
): ScoringWeights {
  const clampedNew = Math.min(85, Math.max(5, Math.round(newValue)));
  const remaining = 100 - clampedNew;

  const otherKeys = (Object.keys(currentWeights) as IndicatorKey[]).filter(
    (k) => k !== changedKey
  );
  const currentOtherSum = otherKeys.reduce((sum, k) => sum + currentWeights[k], 0);

  const updated: ScoringWeights = { ...currentWeights, [changedKey]: clampedNew };

  if (currentOtherSum <= 0) {
    const split = Math.floor(remaining / otherKeys.length);
    let leftOver = remaining;
    otherKeys.forEach((k, idx) => {
      if (idx === otherKeys.length - 1) {
        updated[k] = Math.max(0, leftOver);
      } else {
        updated[k] = split;
        leftOver -= split;
      }
    });
  } else {
    let accumulated = 0;
    otherKeys.forEach((k, idx) => {
      if (idx === otherKeys.length - 1) {
        updated[k] = Math.max(0, remaining - accumulated);
      } else {
        const portion = Math.round((currentWeights[k] / currentOtherSum) * remaining);
        updated[k] = Math.max(0, portion);
        accumulated += updated[k];
      }
    });
  }

  return updated;
}

/**
 * Generates and triggers download of target rankings as CSV.
 */
export function exportTargetsToCSV(targets: EvaluatedTarget[], weights: ScoringWeights): void {
  const headers = [
    'Rank',
    'Target ID',
    'Target Name',
    'District',
    'Province',
    'Latitude',
    'Longitude',
    'UTM Coordinates',
    'Priority Category',
    'Total Score (0-100)',
    'Geology Setting Score',
    'Geology Contribution (pts)',
    'Geochem Anomaly Score',
    'Geochem Contribution (pts)',
    'Structural Context Score',
    'Structural Contribution (pts)',
    'Occurrence Proximity Score',
    'Proximity Contribution (pts)',
    'Host Lithology',
    'Mineralization Style',
    'Data Completeness (%)',
    'Validation Status',
    'Geological Rationale',
    'Follow-up Investigations',
    'Synthetic Flag',
  ];

  const rows = targets.map((t) => [
    t.rank,
    `"${t.id}"`,
    `"${t.name}"`,
    `"${t.district}"`,
    `"${t.province}"`,
    t.coordinates.lat.toFixed(4),
    t.coordinates.lng.toFixed(4),
    `"${t.utmCoords}"`,
    `"${t.priorityCategory}"`,
    t.totalScore.toFixed(1),
    t.indicators.geology_setting.normalizedScore,
    t.indicatorContributions.geology_setting.toFixed(1),
    t.indicators.geochem_anomaly.normalizedScore,
    t.indicatorContributions.geochem_anomaly.toFixed(1),
    t.indicators.structural_context.normalizedScore,
    t.indicatorContributions.structural_context.toFixed(1),
    t.indicators.occurrence_proximity.normalizedScore,
    t.indicatorContributions.occurrence_proximity.toFixed(1),
    `"${t.hostLithology.replace(/"/g, '""')}"`,
    `"${t.mineralizationStyle.replace(/"/g, '""')}"`,
    t.dataQuality.completenessScore,
    `"${t.dataQuality.validationStatus}"`,
    `"${t.geologicalRationale.replace(/"/g, '""')}"`,
    `"${t.followUpActions.join('; ').replace(/"/g, '""')}"`,
    'TRUE (Illustrative Demonstration Data)',
  ]);

  const csvContent = [
    '# PROSPECT - Zambia Mineral Exploration Intelligence Platform',
    `# Export Date: ${new Date().toISOString().split('T')[0]}`,
    `# Active Weights: Geology ${weights.geology_setting}%, Geochem ${weights.geochem_anomaly}%, Structure ${weights.structural_context}%, Proximity ${weights.occurrence_proximity}%`,
    '# Disclaimer: Demonstration prototype. Target records and scores are synthetic and do not constitute verified mineral discoveries.',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `prospect_zambia_copper_targets_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get color tokens and labels for priority categories.
 */
export function getPriorityStyling(category: PriorityCategory): {
  textColor: string;
  badgeBg: string;
  borderColor: string;
  markerColor: string;
  hexColor: string;
} {
  switch (category) {
    case 'High Priority':
      return {
        textColor: 'text-amber-900',
        badgeBg: 'bg-amber-50',
        borderColor: 'border-amber-200',
        markerColor: 'bg-amber-600',
        hexColor: '#c25e1a', // Professional copper-orange
      };
    case 'Moderate Priority':
      return {
        textColor: 'text-slate-700',
        badgeBg: 'bg-slate-100',
        borderColor: 'border-slate-200',
        markerColor: 'bg-slate-600',
        hexColor: '#475569', // Muted slate
      };
    case 'Low Priority / Needs Data':
    default:
      return {
        textColor: 'text-slate-500',
        badgeBg: 'bg-slate-50',
        borderColor: 'border-slate-200',
        markerColor: 'bg-slate-400',
        hexColor: '#94a3b8',
      };
  }
}
