
import React, { useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };


  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-400 mb-2">1. Upload Image</label>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative group w-full aspect-square bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors duration-300 flex items-center justify-center cursor-pointer overflow-hidden"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {imageUrl ? (
          <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-500">
            <UploadIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">Click to upload or drag & drop</p>
            <p className="text-xs mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white font-semibold">{imageUrl ? 'Change Image' : 'Select Image'}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
