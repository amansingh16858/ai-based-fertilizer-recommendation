export type Language = 'en' | 'hi' | 'ta' | 'te';

export interface SoilTelemetry {
  moisturePercent: number; // 0 to 100%
  temperatureC: number;    // in Celsius
  humidityPercent: number; // in RH%
  soilPH?: number;         // 0 to 14
  timestamp: string;
  isSimulated?: boolean;
  isDhtLive?: boolean;
}

export interface FarmProfile {
  cropName: string;
  soilType: 'Loamy' | 'Clay' | 'Sandy' | 'Black Soil' | 'Alluvial' | 'Red Soil';
  plotArea: string; // e.g. "1 Acre" or "10 Potted Plants"
  region: string;
}

export interface VisualSymptomBox {
  label: string;
  simpleMeaning?: string; // 4th-grader plain English translation (e.g. "Yellowing leaf edges")
  confidence: number;
  area: { x: number; y: number; width: number; height: number };
}

export interface VisionAnalysisResult {
  isPlant: boolean;
  rejectionReason?: string;
  cropIdentified: string;
  healthStatus: 'Healthy' | 'Nutrient Deficient' | 'Fungal / Disease' | 'Pest Infestation' | 'Non-Plant / Rejected';
  visualSymptoms: string[];
  suspectedDeficiencies: string[];
  suspectedPathology: string;
  simplePathologyMeaning?: string; // 4th-grader translation of the main diagnosis
  confidenceScore: number;
  severityLevel: 'Mild' | 'Moderate' | 'Severe';
  symptomBoxes?: VisualSymptomBox[];
  executionTimeMs: number;
  tokensUsed?: number;
  modelUsed: string;
  isFallback?: boolean;
  errorMessage?: string;
}

export interface FertilizerDosage {
  name: string;
  type: 'Chemical' | 'Organic' | 'Foliar Spray';
  ratioNPK: string;
  exactDosage: string;
  applicationMethod: string;
  timing: string;
  estimatedCostINR: number;
  safetyWarning?: string;
}

export interface AgronomicPrescription {
  primaryDiagnosis: string;
  simpleSummary?: {
    whatHappened: string;
    whatToDoToday: string;
  };
  multimodalCorrelation: string;
  rootCauseAnalysis: string;
  chemicalPrescription: FertilizerDosage[];
  organicPrescription: FertilizerDosage[];
  irrigationDirective: {
    action: 'Withhold Water' | 'Standard Irrigation' | 'Immediate Deep Watering';
    details: string;
    targetMoisturePercent: number;
  };
  fourteenDaySchedule: {
    day: string;
    task: string;
    type: 'Chemical' | 'Organic' | 'Water' | 'Observation';
  }[];
  totalEstimatedCostINR: {
    chemical: number;
    organic: number;
  };
  academicNotes: {
    stage1Tokens: number;
    stage2Tokens: number;
    totalCostUSD: number;
    totalLatencyMs: number;
    reasoningChainSummary: string;
  };
  isFallback?: boolean;
  snapshotTelemetry?: SoilTelemetry;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  source: 'ESP32' | 'Vision API' | 'Reasoning Engine' | 'System';
  message: string;
}

export interface SampleLeaf {
  id: string;
  title: string;
  crop: string;
  disease: string;
  imageUrl: string;
  defaultTelemetry: SoilTelemetry;
  description: string;
}