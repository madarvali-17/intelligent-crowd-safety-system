export interface QuadrantDensities {
  North: number;
  South: number;
  West: number;
  East: number;
}

export interface DensityEstimationState {
  imageName: string;
  imageSize: string;
  imageUrl: string;
  predictedCount: number;
  securityGuardsNeeded: number;
  medicalStaffNeeded: number;
  busiestDirection: string;
  quadrantDensities: QuadrantDensities;
}

export interface CongestionForecastState {
  pastCounts: number[];
  pastCountsString: string;
  readingsCollected: number;
  neededReadings: number;
  predictedCount: number;
}

export interface ActivityRecognitionState {
  videoName: string;
  videoSize: string;
  videoUrl: string;
  predictedActivity: 'FIGHTING' | 'RUNNING' | 'NORMAL';
  confidence: number;
  probabilities: {
    fighting: number;
    normal: number;
  };
}

export interface AlertLogItem {
  id: number;
  timestamp: string;
  reason: string;
  current_count: number;
  predicted_count: number;
  direction: string;
  anomaly_label: string;
  anomaly_confidence: number;
  security_guards: number;
  medical_staff: number;
}

export interface ThreatDetectionItem {
  id: string;
  label: string;
  type: 'person' | 'weapon' | 'fallen';
  confidence: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in percentages 0..100
}

export interface FlaggedTrackItem {
  id: string;
  trackId: number;
  behavior: 'running' | 'fighting' | 'weapon_overlap';
  frame: number;
  timestamp: string;
  cropUrl?: string;
}
