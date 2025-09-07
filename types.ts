export interface AnalysisResult {
  model: string;
  origin: string;
  classification: 'FRIENDLY' | 'HOSTILE' | 'UNKNOWN';
  confidence: number;
  details: string;
  assetType: string;
}
