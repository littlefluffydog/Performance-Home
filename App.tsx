import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import InputPanel from './components/ImageUploader';
import AnalysisDisplay from './components/ImageDisplay';
import { identifyAsset } from './services/geminiService';
import { HistoryEntry, Location } from './types';
import HistoryControls from './components/HistoryControls';

// Helper function to get the user's current location, wrapped in a Promise.
const getCurrentLocation = (): Promise<Location | undefined> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      resolve(undefined);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn(`Geolocation error: ${error.message}`);
        resolve(undefined); // Resolve with undefined on error (e.g., permission denied)
      },
      { timeout: 10000 }
    );
  });
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [analyzingImageUrl, setAnalyzingImageUrl] = useState<string | null>(null);

  const handleFileCapture = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    const imageUrl = URL.createObjectURL(file);
    setAnalyzingImageUrl(imageUrl);

    // Get location and identify asset concurrently for efficiency.
    const [location, result] = await Promise.all([
        getCurrentLocation(),
        identifyAsset(file).catch(err => {
            console.error(err);
            return err as Error;
        })
    ]);

    setIsLoading(false);
    setAnalyzingImageUrl(null);

    if (result instanceof Error) {
        setError(result.message || "An unknown error occurred during analysis.");
        URL.revokeObjectURL(imageUrl);
        return;
    }

    const newEntry: HistoryEntry = {
      result,
      imageUrl,
      timestamp: new Date().toISOString(),
      location,
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      return [...newHistory, newEntry];
    });
    // Set the current index to the newly added item.
    setCurrentHistoryIndex(prev => prev >= 0 ? prev + 1 : 0);

  }, [currentHistoryIndex]);

  const handleReset = useCallback(() => {
    setCurrentHistoryIndex(-1); 
    setError(null);
    setIsLoading(false);
  }, []);

  const handleHistoryNav = (direction: 'prev' | 'next') => {
      if (direction === 'prev' && currentHistoryIndex > 0) {
          setCurrentHistoryIndex(currentHistoryIndex - 1);
      }
      if (direction === 'next' && currentHistoryIndex < history.length - 1) {
          setCurrentHistoryIndex(currentHistoryIndex + 1);
      }
  };

  const currentEntry = history[currentHistoryIndex];

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        {!currentEntry && !isLoading && !error ? (
          <InputPanel onFileCapture={handleFileCapture} disabled={isLoading} />
        ) : (
          <AnalysisDisplay 
            isLoading={isLoading}
            error={error}
            historyEntry={currentEntry}
            analyzingImageUrl={analyzingImageUrl}
            onReset={handleReset}
            historyControls={
                history.length > 1 && !isLoading && !error && (
                    <HistoryControls
                        currentIndex={currentHistoryIndex}
                        total={history.length}
                        onNavigate={handleHistoryNav}
                    />
                )
            }
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