import React, { useCallback, useRef, useState, useEffect } from 'react';
import { UploadIcon, CameraIcon } from './Icons';
import Spinner from './Spinner';

interface InputPanelProps {
  onFileCapture: (file: File) => void;
  disabled: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ onFileCapture, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);


  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsCameraStarting(true);
    try {
      if(streamRef.current) stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted and you are using a secure (HTTPS) connection.");
      setIsCameraMode(false);
    } finally {
        setIsCameraStarting(false);
    }
  },[stopCamera]);
  
  useEffect(() => {
    if (isCameraMode) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraMode, startCamera, stopCamera]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileCapture(file);
    }
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileCapture(file);
    }
  }, [onFileCapture, disabled]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onFileCapture(file);
        setIsCameraMode(false);
      }
    }, 'image/jpeg');
  };

  if (isCameraMode) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Live Camera Feed</h2>
            <div className="relative max-w-md mx-auto aspect-square mb-6 rounded-lg overflow-hidden border-2 border-gray-600 bg-gray-900 flex items-center justify-center">
                <video ref={videoRef} playsInline className="w-full h-full object-cover" />
                {isCameraStarting && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
                        <Spinner />
                        <p className="mt-2 text-sm text-gray-400">Starting camera...</p>
                    </div>
                )}
            </div>
             <div className="flex justify-center gap-4">
                <button
                    onClick={() => setIsCameraMode(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleCapture} 
                    disabled={disabled || isCameraStarting}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Capture Frame
                </button>
            </div>
        </div>
    );
  }

  return (
    <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full p-8 text-center"
    >
      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Identify a Tactical Asset</h2>
      <p className="text-gray-400 mb-8 max-w-xl mx-auto">Upload an image or use your device's camera to get an AI-powered identification and classification report.</p>

      <div className="max-w-md mx-auto p-8 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors duration-300">
        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
        <p className="mt-4 text-gray-400">Drag & drop an image here</p>
        <p className="mt-1 text-sm text-gray-500">or</p>
         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
        <div className="mt-6 flex justify-center gap-4">
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-6 py-2 text-sm font-semibold text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
                Select File
            </button>
             <button
                onClick={() => setIsCameraMode(true)}
                disabled={disabled}
                className="px-6 py-2 text-sm font-semibold text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
                Use Camera
            </button>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
