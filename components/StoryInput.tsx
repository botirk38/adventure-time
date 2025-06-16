import React, { useState } from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface StoryInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const StoryInput: React.FC<StoryInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      // setPrompt(''); // Optionally clear after submit if preferred by UX
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="story-prompt" className="block text-lg font-semibold text-brand-text mb-2">
          Tell us your story idea to begin...
        </label>
        <textarea
          id="story-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A curious squirrel who found a tiny, glowing map that led to a land of giant vegetables..."
          className="w-full p-3 border-2 border-amber-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 resize-none h-32 bg-white/70 placeholder-brand-soft-text/70"
          rows={4}
          disabled={isLoading}
          aria-label="Story idea input"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        <MagicWandIcon className="w-6 h-6 mr-2" />
        {isLoading ? 'Brewing Magic...' : 'Make Magic!'}
      </button>
    </form>
  );
};
