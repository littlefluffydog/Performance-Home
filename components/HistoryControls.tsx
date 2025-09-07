import React from 'react';
import { UndoIcon, RedoIcon } from './Icons';

interface HistoryControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const HistoryControls: React.FC<HistoryControlsProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  const baseButtonClasses = "p-2 rounded-md border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const enabledButtonClasses = "bg-gray-700/50 border-gray-600 hover:bg-gray-700 text-gray-300";
  const disabledButtonClasses = "bg-gray-800 border-gray-700 text-gray-500";

  return (
    <div>
        <div className="flex items-center justify-between gap-4">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`w-full flex justify-center items-center gap-2 ${baseButtonClasses} ${canUndo ? enabledButtonClasses : disabledButtonClasses}`}
                aria-label="Undo last edit"
                title="Undo (Ctrl+Z)"
            >
                <UndoIcon className="w-5 h-5" />
                <span>Undo</span>
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`w-full flex justify-center items-center gap-2 ${baseButtonClasses} ${canRedo ? enabledButtonClasses : disabledButtonClasses}`}
                aria-label="Redo last edit"
                title="Redo (Ctrl+Y)"
            >
                <RedoIcon className="w-5 h-5" />
                <span>Redo</span>
            </button>
        </div>
    </div>
  );
};

export default HistoryControls;
