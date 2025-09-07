import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WarningIcon, ShieldCheckIcon, ShieldExclamationIcon, RefreshIcon, FileTextIcon } from './Icons';
import Spinner from './Spinner';
import { HistoryEntry } from '../types';

interface AnalysisDisplayProps {
  historyEntry?: HistoryEntry | null;
  isLoading?: boolean;
  error?: string | null;
  analyzingImageUrl?: string | null;
  onReset?: () => void;
  historyControls?: React.ReactNode;
}

const ResultCard: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
  const { result, timestamp, location } = entry;
  const { classification, model, origin, confidence, details, assetType, similarAssets, threatLevel, capabilities } = result;

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

  const threatStyles = {
    NONE: 'bg-gray-500/20 text-gray-300',
    LOW: 'bg-yellow-500/20 text-yellow-300',
    MEDIUM: 'bg-orange-500/20 text-orange-300',
    HIGH: 'bg-red-500/20 text-red-300',
    EXTREME: 'bg-purple-500/20 text-purple-300',
  }

  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; 
  const mapUrl = location && GOOGLE_MAPS_API_KEY ? `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=14&size=600x400&maptype=satellite&markers=color:red%7C${location.lat},${location.lng}&key=${GOOGLE_MAPS_API_KEY}` : null;

  const Icon = classification === 'HOSTILE' ? ShieldExclamationIcon : classification === 'FRIENDLY' ? ShieldCheckIcon : WarningIcon;

  return (
    <div className={`bg-gray-900/50 rounded-lg p-4 md:p-6 space-y-6 border ${classificationBorder[classification]}`}>
      <div className={`flex items-start justify-between gap-3 p-3 rounded-md ${classificationStyles[classification]}`}>
        <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg leading-tight">{classification}</h3>
              <p className="text-sm opacity-80">Confidence: {(confidence * 100).toFixed(0)}%</p>
            </div>
        </div>
        {threatLevel && (
             <span className={`text-xs font-bold px-2 py-1 rounded-full ${threatStyles[threatLevel]}`}>
                THREAT: {threatLevel}
            </span>
        )}
      </div>

      <div>
          <p className="font-semibold text-gray-400 text-sm mb-2">Observation Details</p>
          <div className="space-y-4 text-sm bg-gray-800/50 p-3 rounded-md">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <p className="font-semibold text-gray-400">Timestamp</p>
                      <p className="text-white">{new Date(timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                      <p className="font-semibold text-gray-400">Location</p>
                      <p className="text-white truncate">
                          {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Not available'}
                      </p>
                  </div>
               </div>
               {mapUrl && (
                  <div className="rounded-md overflow-hidden border-2 border-gray-700">
                      <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer" aria-label="View on Google Maps">
                          <img src={mapUrl} alt="Asset Location Map" className="w-full h-auto object-cover"/>
                      </a>
                  </div>
              )}
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
      <div>
        <p className="font-semibold text-gray-400 text-sm">Capabilities</p>
        <p className="text-white/80 text-sm leading-relaxed">{capabilities}</p>
      </div>
       {similarAssets && similarAssets.length > 0 && (
        <div>
          <p className="font-semibold text-gray-400 text-sm">Visually Similar Assets</p>
           <ul className="mt-1 space-y-1">
            {similarAssets.map((asset, index) => (
              <li key={index} className="text-white/80 text-sm bg-gray-800/50 px-2 py-1 rounded-md">{asset}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ historyEntry, isLoading, error, analyzingImageUrl, onReset, historyControls }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
        const canvas = await html2canvas(reportRef.current, {
            backgroundColor: '#1f2937',
            scale: 2,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasAspectRatio = canvas.width / canvas.height;
        let imgWidth = pdfWidth - 20;
        let imgHeight = imgWidth / canvasAspectRatio;
        if (imgHeight > pdfHeight - 20) {
            imgHeight = pdfHeight - 20;
            imgWidth = imgHeight * canvasAspectRatio;
        }
        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = (pdfHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        pdf.save(`tactical-asset-report-${Date.now()}.pdf`);
    } catch (err) {
        console.error("Failed to generate PDF:", err);
        alert("Sorry, there was an error creating the PDF report.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        {analyzingImageUrl && (
            <div className="w-48 h-48 mb-6 rounded-lg overflow-hidden border-2 border-gray-600">
                <img src={analyzingImageUrl} alt="Analyzing asset" className="w-full h-full object-cover" />
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
  
  if (historyEntry) {
      return (
          <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
              <div className="flex justify-end mb-4">{historyControls}</div>
              <div ref={reportRef} className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Tactical Asset ID Report</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <div className="w-full aspect-square relative flex items-center justify-center rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-900">
                        <img src={historyEntry.imageUrl} alt="Asset for analysis" className="w-full h-full object-contain" />
                    </div>
                    <div className="w-full">
                      <h3 className="text-lg font-semibold text-gray-300 mb-3">Analysis Details</h3>
                      <ResultCard entry={historyEntry} />
                    </div>
                </div>
              </div>

              <div className="text-center mt-8 flex flex-wrap justify-center gap-4">
                <button onClick={onReset} className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold text-white transition-colors">
                    <RefreshIcon className="w-5 h-5" />
                    Analyze Another
                </button>
                <button 
                  onClick={handleDownloadPdf} 
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold text-white transition-colors disabled:bg-indigo-500/50 disabled:cursor-wait"
                >
                    {isGeneratingPdf ? <Spinner size="sm" /> : <FileTextIcon className="w-5 h-5" />}
                    {isGeneratingPdf ? 'Generating PDF...' : 'Download Report'}
                </button>
              </div>
          </div>
      );
  }

  return null;
};

export default AnalysisDisplay;