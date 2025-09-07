
import React from 'react';
import Spinner from './Spinner';

interface PromptControlsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const PromptControls: React.FC<PromptControlsProps> = ({
  prompt,
  onPromptChange,
  onSubmit,
  isLoading,
  disabled
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">
          2. Describe Your Edit
        </label>
        <textarea
          id="prompt"
          rows={4}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., 'add a pair of sunglasses to the person' or 'make the background a futuristic city'"
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          disabled={disabled || isLoading}
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading || disabled || !prompt.trim()}
        className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Generating...</span>
          </>
        ) : (
          <span>Apply Edit</span>
        )}
      </button>
    </div>
  );
};

export default PromptControls;
