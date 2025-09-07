export interface Location {
  lat: number;
  lng: number;
}

export interface AnalysisResult {
  model: string;
  origin: string;
  classification: 'FRIENDLY' | 'HOSTILE' | 'UNKNOWN';
  confidence: number;
  details: string;
  assetType: string;
  similarAssets: string[];
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  capabilities: string;
}

export interface HistoryEntry {
  result: AnalysisResult;
  imageUrl: string;
  timestamp: string; // ISO 8601 date string
  location?: Location;
}
