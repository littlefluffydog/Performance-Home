import React, { useState, useCallback, useEffect } from 'react';
import { editImageWithGemini } from './services/geminiService';
import { EditedImageResult } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptControls from './components/PromptControls';
import ImageDisplay from './components/ImageDisplay';
import HistoryControls from './components/HistoryControls';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<EditedImageResult[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentEditedImage = history[historyIndex] ?? null;
  const canUndo = historyIndex > -1;
  const canRedo = historyIndex < history.length - 1;

  const handleImageUpload = useCallback((file: File) => {
    setOriginalImage(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setHistory([]);
    setHistoryIndex(-1);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!originalImage || !prompt.trim()) {
      setError('Please upload an image and enter an editing command.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await editImageWithGemini(originalImage, prompt);
      const newHistory = history.slice(0, historyIndex + 1);
      const updatedHistory = [...newHistory, result];
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(prevIndex => prevIndex - 1);
    }
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(prevIndex => prevIndex + 1);
    }
  }, [canRedo]);

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with text input undo/redo
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      const isModKey = event.metaKey || event.ctrlKey;

      if (isModKey && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      } else if (isModKey && event.key === 'y') {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);


  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 w-full flex flex-col gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-2xl">
          <ImageUploader onImageUpload={handleImageUpload} imageUrl={originalImageUrl} />
          <HistoryControls
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          <PromptControls
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            disabled={!originalImage}
          />
        </div>
        <div className="lg:w-2/3 w-full flex flex-col">
          <ImageDisplay
            originalImageUrl={originalImageUrl}
            editedImageResult={currentEditedImage}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini. Built for visual creativity.</p>
      </footer>
    </div>
  );
};

export default App;