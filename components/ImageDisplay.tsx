import React from 'react';
import { EditedImageResult } from '../types';
import Spinner from './Spinner';
import { ImageIcon, WarningIcon, DownloadIcon } from './Icons';

interface ImageDisplayProps {
  originalImageUrl: string | null;
  editedImageResult: EditedImageResult | null;
  isLoading: boolean;
  error: string | null;
}

const Placeholder: React.FC<{ title: string, children?: React.ReactNode }> = ({ title, children }) => (
  <div className="w-full aspect-square bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center p-4">
    <div className="text-center text-gray-500">
        {children || <ImageIcon className="h-16 w-16" />}
        <p className="mt-4 font-semibold text-lg text-gray-400">{title}</p>
    </div>
  </div>
);

const ImageCard: React.FC<{ imageUrl: string; title: string }> = ({ imageUrl, title }) => (
    <div className="w-full">
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-300">{title}</h3>
        <div className="aspect-square bg-black rounded-lg overflow-hidden shadow-lg">
            <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        </div>
    </div>
);


const ImageDisplay: React.FC<ImageDisplayProps> = ({ originalImageUrl, editedImageResult, isLoading, error }) => {

  const handleDownload = () => {
    if (!editedImageResult?.imageUrl) return;

    const link = document.createElement('a');
    link.href = editedImageResult.imageUrl;
    
    try {
        const mimeType = editedImageResult.imageUrl.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1] || 'png';
        link.download = `edited-image.${extension}`;
    } catch(e) {
        link.download = `edited-image.png`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="col-span-2 flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-gray-800/50 p-8 rounded-lg">
          <Spinner size="lg" />
          <p className="mt-4 text-xl font-semibold text-indigo-300 animate-pulse">AI is working its magic...</p>
          <p className="text-gray-400 mt-2">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
        return (
             <div className="col-span-2 flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-red-900/20 border border-red-500/50 p-8 rounded-lg">
                <WarningIcon className="h-12 w-12 text-red-400" />
                <p className="mt-4 text-xl font-semibold text-red-300">An Error Occurred</p>
                <p className="text-red-400/80 mt-2 max-w-md">{error}</p>
             </div>
        );
    }
    
    if (!originalImageUrl) {
        return (
            <div className="col-span-2 flex items-center justify-center h-full">
                <div className="text-center text-gray-600 p-8 bg-gray-800/30 rounded-lg">
                    <ImageIcon className="h-24 w-24 mx-auto" />
                    <h2 className="mt-6 text-2xl font-bold text-gray-400">Your Edited Image Will Appear Here</h2>
                    <p className="mt-2 text-gray-500">Upload an image and provide a prompt to get started.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ImageCard imageUrl={originalImageUrl} title="Original" />
            {editedImageResult?.imageUrl ? (
                <div className="relative group">
                  <ImageCard imageUrl={editedImageResult.imageUrl} title="Edited" />
                  <button
                    onClick={handleDownload}
                    className="absolute top-12 right-2 bg-gray-900/60 hover:bg-indigo-600 text-white p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Download edited image"
                    title="Download edited image"
                  >
                    <DownloadIcon className="w-5 h-5" />
                  </button>
                  {editedImageResult.text && (
                      <p className="mt-4 text-sm text-center text-gray-400 p-3 bg-gray-800 rounded-md italic">
                          {`AI says: "${editedImageResult.text}"`}
                      </p>
                  )}
                </div>
            ) : (
                <Placeholder title="Edited Image" />
            )}
        </>
    );
  };
  
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {renderContent()}
    </div>
  );
};

export default ImageDisplay;