import React from 'react';
import { TargetIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <TargetIcon className="h-8 w-8 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Tactical Asset ID</h1>
        </div>
        <a 
          href="https://ai.google.dev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
        >
          Powered by Gemini
        </a>
      </div>
    </header>
  );
};

export default Header;
