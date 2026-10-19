export type PriorityCategory = 'High Priority' | 'Moderate Priority' | 'Low Priority / Needs Data';

export type IndicatorKey = 'geology_setting' | 'occurrence_proximity' | 'geochem_anomaly' | 'structural_context';

export interface ScoringWeights {
  geology_setting: number;
  occurrence_proximity: number;
  geochem_anomaly: number;
  structural_context: number;
}

export interface IndicatorDetail {
  rawValue: string;
  normalizedScore: number; // 0 to 100
  notes: string;
  unit?: string;
}

export interface DataQualityInfo {
  completenessScore: number; // percentage (0-100)
  validationStatus: 'Preliminary' | 'Partially Validated' | 'Needs Resurvey';
  missingData: string[];
  surveyDensity: string;
  lastSourceYear: number;
  sourceDataset: string;
}

export interface TargetRecord {
  id: string;
  name: string;
  district: string;
  province: 'Copperbelt' | 'North-Western';
  coordinates: {
    lat: number;
    lng: number;
  };
  utmCoords: string;
  geologicalUnit: string;
  hostLithology: string;
  structuralSetting: string;
  mineralizationStyle: string;
  indicators: Record<IndicatorKey, IndicatorDetail>;
  dataQuality: DataQualityInfo;
  geologicalRationale: string;
  followUpActions: string[];
  syntheticLabel: boolean;
}

export interface EvaluatedTarget extends TargetRecord {
  totalScore: number;
  priorityCategory: PriorityCategory;
  indicatorContributions: Record<IndicatorKey, number>;
  rank: number;
}

export interface KnownDeposit {
  id: string;
  name: string;
  district: string;
  type: string;
  status: 'Producing Mine' | 'Historical Mine' | 'Advanced Deposit';
  coords: { lat: number; lng: number };
  notes: string;
}

export interface GeologicalFeature {
  id: string;
  name: string;
  type: 'roan_formation' | 'basement_dome' | 'fault_shear' | 'geochem_contour';
  geometryType: 'Polygon' | 'LineString';
  coordinates: [number, number][] | [number, number][][];
  description: string;
  ageOrStratum?: string;
}

export interface LayerVisibility {
  roanFormation: boolean;
  basementDomes: boolean;
  faultsAndStructures: boolean;
  knownOccurrences: boolean;
  geochemAnomalies: boolean;
  targetMarkers: boolean;
}
