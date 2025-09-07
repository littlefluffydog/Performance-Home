import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import InputPanel from './components/ImageUploader';
import AnalysisDisplay from './components/ImageDisplay';
import { identifyAsset } from './services/geminiService';
import { AnalysisResult } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);

  const handleFileCapture = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    
    const imageUrl = URL.createObjectURL(file);
    setSourceImageUrl(imageUrl);

    try {
      const result = await identifyAsset(file);
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setAnalysisResult(null);
    if (sourceImageUrl) {
      URL.revokeObjectURL(sourceImageUrl);
    }
    setSourceImageUrl(null);
  }, [sourceImageUrl]);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        {!analysisResult && !isLoading && !error ? (
          <InputPanel onFileCapture={handleFileCapture} disabled={isLoading} />
        ) : (
          <AnalysisDisplay 
            isLoading={isLoading}
            error={error}
            analysisResult={analysisResult}
            sourceImageUrl={sourceImageUrl}
            onReset={handleReset}
          />
        )}
      </main>
      <footer className="text-center py-4 text-xs text-gray-500">
        <p>This tool is for demonstration purposes only. Information may be inaccurate. Do not use for operational decisions.</p>
      </footer>
    </div>
  );
};

export default App;
