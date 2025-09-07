import React from 'react';
import { RedoIcon, UndoIcon } from './Icons';

interface HistoryControlsProps {
    currentIndex: number;
    total: number;
    onNavigate: (direction: 'prev' | 'next') => void;
}

const HistoryControls: React.FC<HistoryControlsProps> = ({ currentIndex, total, onNavigate }) => {
    const canGoBack = currentIndex > 0;
    const canGoForward = currentIndex < total - 1;

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={() => onNavigate('prev')}
                disabled={!canGoBack}
                className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous analysis"
            >
                <UndoIcon className="w-5 h-5" />
            </button>
            <span className="font-mono text-sm text-gray-400" aria-live="polite">
                {currentIndex + 1} / {total}
            </span>
            <button
                onClick={() => onNavigate('next')}
                disabled={!canGoForward}
                className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next analysis"
            >
                <RedoIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default HistoryControls;