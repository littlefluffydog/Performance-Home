import React from 'react';
import { WarningIcon, ShieldCheckIcon, ShieldExclamationIcon, RefreshIcon } from './Icons';
import Spinner from './Spinner';
import { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  analysisResult?: AnalysisResult | null;
  isLoading?: boolean;
  error?: string | null;
  sourceImageUrl?: string | null;
  onReset?: () => void;
}

const ResultCard: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const { classification, model, origin, confidence, details, assetType } = result;

  const classificationStyles = {
    HOSTILE: 'bg-red-500/10 text-red-400 border-red-500/30',
    FRIENDLY: 'bg-green-500/10 text-green-400 border-green-500/30',
    UNKNOWN: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };
  
  const classificationBorder = {
    HOSTILE: 'border-red-500/50',
    FRIENDLY: 'border-green-500/50',
    UNKNOWN: 'border-gray-500/50',
  };

  const Icon = classification === 'HOSTILE' ? ShieldExclamationIcon : classification === 'FRIENDLY' ? ShieldCheckIcon : WarningIcon;

  return (
    <div className={`bg-gray-900/50 rounded-lg p-4 md:p-6 space-y-4 border ${classificationBorder[classification]}`}>
      <div className={`flex items-center gap-3 p-3 rounded-md ${classificationStyles[classification]}`}>
        <Icon className="w-8 h-8 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-lg leading-tight">{classification}</h3>
          <p className="text-sm opacity-80">Confidence: {(confidence * 100).toFixed(0)}%</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-semibold text-gray-400">Model</p>
          <p className="text-white">{model}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-400">Type</p>
          <p className="text-white">{assetType}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="font-semibold text-gray-400">Origin</p>
          <p className="text-white">{origin}</p>
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-400 text-sm">Details</p>
        <p className="text-white/80 text-sm leading-relaxed">{details}</p>
      </div>
    </div>
  );
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysisResult, isLoading, error, sourceImageUrl, onReset }) => {

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        {sourceImageUrl && (
            <div className="w-48 h-48 mb-6 rounded-lg overflow-hidden border-2 border-gray-600">
                <img src={sourceImageUrl} alt="Analyzing asset" className="w-full h-full object-cover" />
            </div>
        )}
        <Spinner size="lg" />
        <p className="mt-4 text-lg font-semibold text-gray-300">Analyzing Asset...</p>
        <p className="text-gray-400">AI is performing identification and classification.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-red-400 p-8 min-h-[400px]">
        <WarningIcon className="w-12 h-12" />
        <p className="mt-4 font-semibold text-lg">Analysis Error</p>
        <p className="mt-1 text-sm text-gray-400 max-w-md">{error}</p>
         <button onClick={onReset} className="mt-6 flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold text-white transition-colors">
            <RefreshIcon className="w-5 h-5" />
            Try Again
        </button>
      </div>
    );
  }
  
  if (analysisResult && sourceImageUrl) {
      return (
          <div className="w-full p-4 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="w-full aspect-square relative flex items-center justify-center rounded-lg overflow-hidden border-2 border-gray-700">
                      <img src={sourceImageUrl} alt="Asset for analysis" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-full">
                    <h2 className="text-lg font-semibold text-gray-300 mb-3">Analysis Report</h2>
                    <ResultCard result={analysisResult} />
                  </div>
              </div>
              <div className="text-center mt-8">
                <button onClick={onReset} className="flex items-center gap-2 px-6 py-3 mx-auto bg-gray-700 hover:bg-gray-600 rounded-md font-semibold text-white transition-colors">
                    <RefreshIcon className="w-5 h-5" />
                    Analyze Another Asset
                </button>
              </div>
          </div>
      );
  }

  return null; // Should not be reached in the new workflow
};

export default AnalysisDisplay;