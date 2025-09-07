
import React, { useState, useCallback } from 'react';
import { editImageWithGemini } from './services/geminiService';
import { EditedImageResult } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptControls from './components/PromptControls';
import ImageDisplay from './components/ImageDisplay';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImageResult, setEditedImageResult] = useState<EditedImageResult | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setOriginalImage(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setEditedImageResult(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!originalImage || !prompt.trim()) {
      setError('Please upload an image and enter an editing command.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageResult(null);

    try {
      const result = await editImageWithGemini(originalImage, prompt);
      setEditedImageResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 w-full flex flex-col gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-2xl">
          <ImageUploader onImageUpload={handleImageUpload} imageUrl={originalImageUrl} />
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
            editedImageResult={editedImageResult}
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
