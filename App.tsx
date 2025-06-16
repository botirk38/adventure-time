import React, { useState, useEffect, useCallback } from 'react';
import { StoryInput } from './components/StoryInput';
import { StoryDisplay } from './components/StoryDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiKeyMissingBanner } from './components/ApiKeyMissingBanner';
import { VideoBackgroundDisplay } from './components/VideoBackgroundDisplay';
import { SparkleIcon } from './components/icons/SparkleIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { DiceIcon } from './components/icons/DiceIcon'; 
import { MagicWandIcon } from './components/icons/MagicWandIcon';

import { 
  generateStoryFromUserPrompt,
  generateRandomWorldSetting,
  continueStoryInWorld
} from './services/geminiService';

type AppMode = 'initial' | 'world_exploration' | 'story_direct';

const App: React.FC = () => {
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [appMode, setAppMode] = useState<AppMode>('initial');
  
  const [directStory, setDirectStory] = useState<string | null>(null);

  const [worldTheme, setWorldTheme] = useState<string | null>(null);
  const [initialWorldDescription, setInitialWorldDescription] = useState<string | null>(null);
  const [currentSceneVideoUrl, setCurrentSceneVideoUrl] = useState<string | null>(null);
  const [currentSceneVideoMimeType, setCurrentSceneVideoMimeType] = useState<string | undefined>(undefined);
  const [storyParts, setStoryParts] = useState<string[]>([]); 
  const [currentUserAction, setCurrentUserAction] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) { 
      setApiKeyMissing(true);
      console.warn("API_KEY environment variable is not set. Story generation will not work.");
    }
  }, []);

  useEffect(() => {
    // Cleanup for video Object URLs
    const videoUrlToClean = currentSceneVideoUrl; 
    return () => {
      if (videoUrlToClean && videoUrlToClean.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrlToClean);
        // console.log("Revoked video Object URL:", videoUrlToClean);
      }
    };
  }, [currentSceneVideoUrl]);

  const resetToInitial = () => {
    setAppMode('initial');
    setDirectStory(null);
    setWorldTheme(null);
    setInitialWorldDescription(null);
    if (currentSceneVideoUrl && currentSceneVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentSceneVideoUrl); // Clean up before resetting
    }
    setCurrentSceneVideoUrl(null); 
    setCurrentSceneVideoMimeType(undefined);
    setStoryParts([]);
    setCurrentUserAction('');
    setError(null);
    setIsLoading(false);
  };

  const handleDirectStorySubmit = useCallback(async (prompt: string) => {
    if (apiKeyMissing) {
      setError("AI features are disabled. Administrator: Please configure the API key.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Our story wizards are hard at work...');
    setDirectStory(null);
    setError(null);
    setAppMode('story_direct');

    try {
      const generatedStory = await generateStoryFromUserPrompt(prompt);
      setDirectStory(generatedStory);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while crafting your story.');
      }
      setAppMode('initial'); 
      console.error("Error generating direct story:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyMissing]);

  const handleRandomizeWorld = useCallback(async () => {
    if (apiKeyMissing) {
      setError("AI features are disabled. Administrator: Please configure the API key.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Conjuring a new world and its sights (this may take a few minutes)...');
    setError(null);
    setInitialWorldDescription(null);
    if (currentSceneVideoUrl && currentSceneVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentSceneVideoUrl);
    }
    setCurrentSceneVideoUrl(null); 
    setCurrentSceneVideoMimeType(undefined);
    setStoryParts([]);
    
    try {
      const { description, theme, videoUrl, videoMimeType } = await generateRandomWorldSetting();
      setWorldTheme(theme);
      setInitialWorldDescription(description);
      setCurrentSceneVideoUrl(videoUrl); 
      setCurrentSceneVideoMimeType(videoMimeType); 
      setStoryParts([description]); 
      setAppMode('world_exploration');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while creating a new world.');
      }
      console.error("Error randomizing world:", err);
      // Don't reset appMode to initial here, let user see error and retry from current state or reset explicitly
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyMissing, currentSceneVideoUrl]);
  
  const handleContinueStoryInWorld = useCallback(async () => {
    if (apiKeyMissing || !worldTheme || !initialWorldDescription || storyParts.length === 0 || !currentUserAction.trim()) {
      setError("Cannot continue: missing world details, API key, or your action.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Weaving the next part of your adventure and its video (this may take a few minutes)...');
    setError(null);

    try {
      const { nextSceneTextDescription, nextSceneVideoUrl, nextSceneVideoMimeType } = await continueStoryInWorld(
        worldTheme, 
        initialWorldDescription,
        storyParts,
        currentUserAction.trim()
      );
      setStoryParts(prevParts => [...prevParts, `\n\nYour action: ${currentUserAction.trim()}`, `\n\n${nextSceneTextDescription}`]);
      
      if (currentSceneVideoUrl && currentSceneVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentSceneVideoUrl); // Clean up old video before setting new one
      }
      setCurrentSceneVideoUrl(nextSceneVideoUrl); 
      setCurrentSceneVideoMimeType(nextSceneVideoMimeType);
      setCurrentUserAction(''); 
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while continuing the adventure.');
      }
      console.error("Error continuing story in world:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyMissing, worldTheme, initialWorldDescription, storyParts, currentUserAction, currentSceneVideoUrl]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mt-8 flex flex-col items-center justify-center text-brand-primary animate-fadeIn">
          <LoadingSpinner />
          <p className="mt-3 text-lg font-semibold text-center">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-md animate-fadeIn" role="alert">
          <p className="font-bold">Oh no, a hiccup!</p>
          <p>{error}</p>
          <button 
            onClick={resetToInitial}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
            Start over
          </button>
        </div>
      );
    }

    if (appMode === 'initial') {
      return (
        <>
          <StoryInput onSubmit={handleDirectStorySubmit} isLoading={isLoading} />
          <div className="my-6 flex items-center text-brand-soft-text">
            <span className="flex-grow border-t border-amber-300"></span>
            <span className="mx-4 text-sm">OR</span>
            <span className="flex-grow border-t border-amber-300"></span>
          </div>
          <button
            onClick={handleRandomizeWorld}
            disabled={isLoading || apiKeyMissing}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-accent to-orange-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            <DiceIcon className="w-6 h-6 mr-2" />
            Randomize World (Video Adventure!)
          </button>
        </>
      );
    }

    if (appMode === 'world_exploration' && (currentSceneVideoUrl || initialWorldDescription)) {
      // Display current scene text (from storyParts) or initial description if video is still loading or failed.
      const currentSceneText = storyParts.length > 0 ? storyParts[storyParts.length -1] : initialWorldDescription;

      return (
        <div className="animate-fadeIn space-y-6 flex flex-col h-full">
          {currentSceneVideoUrl && (
            <VideoBackgroundDisplay videoSrc={currentSceneVideoUrl} type={currentSceneVideoMimeType} />
          )}
           {!currentSceneVideoUrl && initialWorldDescription && (
            <div className="p-4 bg-amber-50 rounded-lg shadow mb-4">
                <p className="text-brand-text italic text-center">Your world: {initialWorldDescription}</p>
            </div>
          )}

          {/* Overlay for input - ensure it's on top of the video */}
          <div className="mt-auto p-4 sm:p-6 bg-brand-light/80 backdrop-blur-sm rounded-lg shadow-xl ring-1 ring-brand-primary/20 relative z-10">
            {currentSceneText && !currentSceneVideoUrl && ( // Show last text part if video hasn't loaded
                <div className="mb-3 p-2 bg-amber-100/70 rounded text-sm text-brand-text max-h-24 overflow-y-auto">
                    <p>Current Scene: {currentSceneText}</p>
                </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleContinueStoryInWorld(); }} className="space-y-3">
              <div>
                <label htmlFor="user-action" className="block text-lg font-semibold text-brand-text mb-2">
                  What happens next in {worldTheme || "this world"}?
                </label>
                <textarea
                  id="user-action"
                  value={currentUserAction}
                  onChange={(e) => setCurrentUserAction(e.target.value)}
                  placeholder="e.g., Explore the glowing cave, or Talk to the friendly dragon..."
                  className="w-full p-3 border-2 border-amber-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 resize-none bg-white/90 placeholder-brand-soft-text text-brand-text"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !currentUserAction.trim()}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                <MagicWandIcon className="w-6 h-6 mr-2" />
                Continue Adventure!
              </button>
            </form>
          </div>
           <button 
              onClick={resetToInitial}
              className="mt-4 w-full text-sm text-brand-soft-text hover:text-brand-primary py-2 bg-black/10 rounded hover:bg-black/20 transition-colors relative z-10">
              Start a completely new story
            </button>
        </div>
      );
    }

    if (appMode === 'story_direct' && directStory) {
      return (
        <div className="mt-8 animate-fadeIn">
           <h2 className="text-2xl font-bold text-brand-secondary mb-4 flex items-center">
            <BookOpenIcon className="w-7 h-7 mr-3 text-brand-secondary" />
            Your Adventure Unfolds...
          </h2>
          <StoryDisplay story={directStory} />
           <button 
              onClick={resetToInitial}
              className="mt-6 w-full text-center text-sm text-brand-soft-text hover:text-brand-primary py-2">
              Start a new story
            </button>
        </div>
      );
    }
    
    return null; 
  };
  
  // Adjust main container height for world_exploration mode
  const mainContainerClasses = `w-full max-w-2xl bg-brand-light/80 backdrop-blur-md shadow-2xl rounded-xl ring-1 ring-brand-primary/20 p-6 sm:p-10 ${appMode === 'world_exploration' ? 'flex-grow flex flex-col' : ''}`;


  return (
    <div className={`min-h-screen bg-gradient-to-br from-brand-bg via-amber-100 to-orange-100 text-brand-text font-sans flex flex-col items-center p-0 selection:bg-brand-primary selection:text-white ${appMode === 'world_exploration' ? 'relative overflow-hidden' : ''}`}>
      {apiKeyMissing && <ApiKeyMissingBanner />}
      
      <header className={`text-center my-8 sm:my-10 animate-fadeIn ${apiKeyMissing ? 'pt-12' : ''} ${appMode === 'world_exploration' ? 'text-white relative z-10' : ''}`}>
        <div className="flex items-center justify-center space-x-3">
          <SparkleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-brand-primary animate-bounce-sm" />
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight 
            ${appMode === 'world_exploration' ? 'text-white text-shadow-lg [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]' : 'text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary'}`}>
            Story Spark
          </h1>
          <SparkleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-brand-primary animate-bounce-sm [animation-delay:-0.5s]" />
        </div>
        <p className={`mt-3 text-lg sm:text-xl ${appMode === 'world_exploration' ? 'text-amber-100/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]' : 'text-brand-soft-text'}`}>
          {appMode === 'world_exploration' ? `Exploring the world of: ${worldTheme || "Mystery"}` : "Let's weave a magical tale together!"}
        </p>
      </header>

      <main className={mainContainerClasses}>
        {renderContent()}
      </main>

      <footer className={`w-full max-w-2xl text-center py-8 ${appMode === 'world_exploration' ? 'mt-auto text-white/80 relative z-10 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]' : 'mt-8 text-brand-soft-text' } text-sm`}>
          <p>&copy; {new Date().getFullYear()} Story Spark. Powered by imagination & AI.</p>
          {appMode === 'story_direct' && (
            <p className="text-xs mt-1">Story generated with Google Gemini.</p>
          )}
          {appMode === 'world_exploration' && (
             <p className="text-xs mt-1">World description by Google Gemini. Video scenes by Google Veo.</p>
          )}
           {appMode === 'initial' && (
             <p className="text-xs mt-1">AI story generation by Google Gemini. Video adventures by Google Veo.</p>
          )}
      </footer>
    </div>
  );
};

export default App;