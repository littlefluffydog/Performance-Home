import React, { useState } from 'react';
import Header from './components/Header';
import InputPanel from './components/ImageUploader';
import AnalysisDisplay from './components/ImageDisplay';
import { AnalysisResult } from './types';
import { identifyAsset } from './services/geminiService';
import { SparklesIcon } from './components/Icons';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceFileUrl, setSourceFileUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileCapture = (file: File) => {
    setSourceFile(file);
    setSourceFileUrl(URL.createObjectURL(file));
    setAnalysisResult(null); 
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!sourceFile) {
      setError('Please upload or capture an image to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await identifyAsset(sourceFile);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis failed. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setSourceFile(null);
    if(sourceFileUrl) {
      URL.revokeObjectURL(sourceFileUrl);
    }
    setSourceFileUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }

  const renderContent = () => {
    if (isLoading) {
      return <AnalysisDisplay isLoading={true} sourceImageUrl={sourceFileUrl} />;
    }
    if (error) {
      return <AnalysisDisplay error={error} onReset={handleReset} />;
    }
    if (analysisResult) {
      return <AnalysisDisplay analysisResult={analysisResult} sourceImageUrl={sourceFileUrl} onReset={handleReset} />;
    }
    if (sourceFileUrl) {
      return (
         <div className="w-full text-center p-8">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Asset Preview</h2>
            <div className="max-w-md mx-auto aspect-square mb-6 rounded-lg overflow-hidden border-2 border-gray-600">
                 <img src={sourceFileUrl} alt="Asset for analysis" className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-center gap-4">
                <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                    Change Image
                </button>
                <button
                    onClick={handleAnalyze}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Analyze Asset
                </button>
            </div>
         </div>
      );
    }
    return <InputPanel onFileCapture={handleFileCapture} disabled={isLoading} />;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700/50">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;