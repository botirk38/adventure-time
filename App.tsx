import React, { useState, useEffect, useCallback } from "react";
import { StoryInput } from "./components/StoryInput";
import { StoryDisplay } from "./components/StoryDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ApiKeyMissingBanner } from "./components/ApiKeyMissingBanner";
import { VideoBackgroundDisplay } from "./components/VideoBackgroundDisplay";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { SparkleIcon, BookOpenIcon, DiceIcon, MagicWandIcon, HomeIcon, AlertIcon } from "./components/icons";
import { cn } from "./lib/utils";

import {
    generateStoryFromUserPrompt,
    generateRandomWorldSetting,
    continueStoryInWorld,
    generateStoryAndGoalFromUserPrompt,
} from "./services/geminiService";

/*
END THE STORY WHEN THE GOAL IS ACHEIVED.
*/


type AppMode = "initial" | "world_exploration" | "story_direct";

const App: React.FC = () => {
    const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
    const [appMode, setAppMode] = useState<AppMode>("initial");

    const [goalAchieved, setGoalAchieved] = useState<boolean>(false);
    const [directStory, setDirectStory] = useState<string | null>(null);
    const [goal, setGoal] = useState<string | null>(null);
    const [directStoryParts, setDirectStoryParts] = useState<string[]>([]);
    const [directStoryAction, setDirectStoryAction] = useState<string>('');

    const [worldTheme, setWorldTheme] = useState<string | null>(null);
    const [initialWorldDescription, setInitialWorldDescription] = useState<string | null>(null);
    const [currentSceneVideoUrl, setCurrentSceneVideoUrl] = useState<string | null>(null);
    const [currentSceneVideoMimeType, setCurrentSceneVideoMimeType] = useState<string | undefined>(undefined);
    const [storyParts, setStoryParts] = useState<string[]>([]);
    const [currentUserAction, setCurrentUserAction] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>("");
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
            if (videoUrlToClean && videoUrlToClean.startsWith("blob:")) {
                URL.revokeObjectURL(videoUrlToClean);
                // console.log("Revoked video Object URL:", videoUrlToClean);
            }
        };
    }, [currentSceneVideoUrl]);

    const resetToInitial = () => {
        setAppMode("initial");
        setDirectStory(null);
        setWorldTheme(null);
        setInitialWorldDescription(null);
        if (currentSceneVideoUrl && currentSceneVideoUrl.startsWith("blob:")) {
            URL.revokeObjectURL(currentSceneVideoUrl); // Clean up before resetting
        }
        setCurrentSceneVideoUrl(null);
        setCurrentSceneVideoMimeType(undefined);
        setStoryParts([]);
        setCurrentUserAction("");
        setError(null);
        setIsLoading(false);
    };

    const handleDirectStorySubmit = useCallback(async (prompt: string) => {
        if (apiKeyMissing) {
            setError("AI features are disabled. Administrator: Please configure the API key.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage("Our story wizards are hard at work...");
        setDirectStory(null);
        setDirectStoryParts([]);
        setDirectStoryAction('');
        setError(null);
        setAppMode("story_direct");

        try {
            const [generatedStory, generatedGoal] = await generateStoryAndGoalFromUserPrompt(prompt);
            setGoal(generatedGoal);
            setDirectStory(generatedStory);
            setDirectStoryParts([generatedStory]);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred while crafting your story.");
            }
            setAppMode("initial");
            console.error("Error generating direct story:", err);
        } finally {
            setIsLoading(false);
        }
    }, [apiKeyMissing]);

    const handleContinueDirectStory = useCallback(async () => {
        if (apiKeyMissing || !directStory || !directStoryAction.trim()) {
            setError("Cannot continue: missing story, API key, or your action.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage("Weaving the next part of your story...");
        setError(null);

        try {
            const continuationPrompt = `
Previous story:
${directStoryParts.join('\n\n')}

The character/user wants to: "${directStoryAction.trim()}"

Continue the story in 1-2 engaging paragraphs, maintaining the same style and tone.
`;
            const {story: nextPart, achieved: goalFinished} = await generateStoryFromUserPrompt(continuationPrompt, goal);
            setGoalAchieved((goalFinished))
            setDirectStoryParts((prevParts: string[]) => [...prevParts, `\n\nYour action: ${directStoryAction.trim()}`, `\n\n${nextPart}`]);
            setDirectStory((prevParts: string | null) => prevParts ? prevParts + `\n\nYour action: ${directStoryAction.trim()}\n\n${nextPart}` : nextPart);
            setDirectStoryAction('');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred while continuing the story.");
            }
            console.error("Error continuing direct story:", err);
        } finally {
            setIsLoading(false);
        }
    }, [apiKeyMissing, directStory, directStoryParts, directStoryAction]);

    const handleRandomizeWorld = useCallback(async () => {
        if (apiKeyMissing) {
            setError("AI features are disabled. Administrator: Please configure the API key.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage("Conjuring a new world and its sights (this may take a few minutes)...");
        setError(null);
        setInitialWorldDescription(null);
        if (currentSceneVideoUrl && currentSceneVideoUrl.startsWith("blob:")) {
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
            setAppMode("world_exploration");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred while creating a new world.");
            }
            console.error("Error randomizing world:", err);
            // Don't reset appMode to initial here, let user see error and retry from current state or reset explicitly
        } finally {
            setIsLoading(false);
        }
    }, [apiKeyMissing, currentSceneVideoUrl]);

    const handleContinueStoryInWorld = useCallback(async () => {
        if (
            apiKeyMissing ||
            !worldTheme ||
            !initialWorldDescription ||
            storyParts.length === 0 ||
            !currentUserAction.trim()
        ) {
            setError("Cannot continue: missing world details, API key, or your action.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage("Weaving the next part of your adventure and its video (this may take a few minutes)...");
        setError(null);

        try {
            const { nextSceneTextDescription, nextSceneVideoUrl, nextSceneVideoMimeType } = await continueStoryInWorld(
                worldTheme,
                initialWorldDescription,
                storyParts,
                currentUserAction.trim(),
            );
            setStoryParts((prevParts: string[]) => [
                ...prevParts,
                `\n\nYour action: ${currentUserAction.trim()}` + 
                `\n\n${nextSceneTextDescription}`,
            ]);

            if (currentSceneVideoUrl && currentSceneVideoUrl.startsWith("blob:")) {
                URL.revokeObjectURL(currentSceneVideoUrl); // Clean up old video before setting new one
            }
            setCurrentSceneVideoUrl(nextSceneVideoUrl);
            setCurrentSceneVideoMimeType(nextSceneVideoMimeType);
            setCurrentUserAction("");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred while continuing the adventure.");
            }
            console.error("Error continuing story in world:", err);
        } finally {
            setIsLoading(false);
        }
    }, [apiKeyMissing, worldTheme, initialWorldDescription, storyParts, currentUserAction, currentSceneVideoUrl]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="mt-8 flex flex-col items-center justify-center text-primary animate-fade-in">
                    <LoadingSpinner />
                    <p className="mt-3 text-lg font-semibold text-center text-brand-text">{loadingMessage}</p>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive" className="mt-6 animate-fade-in">
                    <AlertIcon className="h-4 w-4" />
                    <AlertTitle>Oh no, a hiccup!</AlertTitle>
                    <AlertDescription className="mt-2">
                        {error}
                        <Button onClick={resetToInitial} variant="destructive" size="sm" className="mt-3">
                            Start over
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        }

        if (appMode === "initial") {
            return (
                <div className="space-y-8">
                    <StoryInput onSubmit={handleDirectStorySubmit} isLoading={isLoading} />

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-amber-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-background px-4 text-brand-soft-text font-medium">OR</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleRandomizeWorld}
                        disabled={isLoading || apiKeyMissing}
                        variant="secondary"
                        size="xl"
                        className="w-full"
                    >
                        <DiceIcon className="w-6 h-6" />
                        Randomize World (Video Adventure!)
                    </Button>
                </div>
            );
        }

        if (appMode === "world_exploration" && (currentSceneVideoUrl || initialWorldDescription)) {
            // Return early for full-screen mode - this will be handled in the main render
            return null;
        }

        if (appMode === "story_direct" && directStory) {
            return (
                <div className="mt-8 animate-fade-in space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpenIcon className="w-8 h-8 text-secondary" />
                        <h2 className="text-2xl font-bold text-brand-secondary">Your Adventure Unfolds...</h2>
                        <h1>{goal}</h1>
                    </div>
                    <div>
                        <p>was the goal achieved?</p>
                        {goalAchieved && <h1>YOU ACHIEVED THE GOAL</h1>}
                    </div>
                    <StoryDisplay story={directStory} />

                    <Card className="bg-brand-light/90 border-amber-200">
                        <CardContent className="p-6">
                            <form onSubmit={(e) => { e.preventDefault(); handleContinueDirectStory(); }} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="story-action" className="block text-lg font-semibold text-brand-text">
                                        What happens next in your story?
                                    </label>
                                    <textarea
                                        id="story-action"
                                        value={directStoryAction}
                                        onChange={(e) => setDirectStoryAction(e.target.value)}
                                        placeholder="e.g., The adventurer decides to explore the ancient ruins, or The wizard attempts to decipher the mysterious scroll..."
                                        className={cn(
                                            "w-full p-3 border-2 border-amber-300 rounded-lg shadow-sm",
                                            "focus:ring-2 focus:ring-brand-primary focus:border-brand-primary",
                                            "transition-colors duration-200 resize-none",
                                            "bg-white/90 placeholder-brand-soft-text text-brand-text"
                                        )}
                                        rows={3}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !directStoryAction.trim()}
                                        variant="magic"
                                        size="lg"
                                        className="flex-1"
                                    >
                                        <MagicWandIcon className="w-5 h-5 mr-2" />
                                        Continue Story!
                                    </Button>
                                    <Button
                                        onClick={resetToInitial}
                                        variant="ghost"
                                        size="lg"
                                        className="text-brand-soft-text hover:text-brand-primary"
                                    >
                                        <HomeIcon className="w-4 h-4 mr-2" />
                                        Start New Story
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return null;
    };

    // Special full-screen mode for world exploration
    if (appMode === "world_exploration" && (currentSceneVideoUrl || initialWorldDescription)) {
        const currentSceneText = storyParts.length > 0 ? storyParts[storyParts.length - 1] : initialWorldDescription;

        return (
            <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
                {apiKeyMissing && <ApiKeyMissingBanner />}

                {/* Full-screen video background */}
                {currentSceneVideoUrl && (
                    <VideoBackgroundDisplay videoSrc={currentSceneVideoUrl} type={currentSceneVideoMimeType} />
                )}

                {/* Fallback background when no video */}
                {!currentSceneVideoUrl && initialWorldDescription && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                        <div className="text-center p-8 max-w-2xl">
                            <p className="text-white text-xl italic">Your world: {initialWorldDescription}</p>
                        </div>
                    </div>
                )}

                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                        <Card className="bg-black/60 border-white/20 text-white p-8">
                            <CardContent className="flex flex-col items-center space-y-4 p-0">
                                <LoadingSpinner />
                                <p className="text-lg font-semibold text-center text-shadow-lg">{loadingMessage}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Error overlay */}
                {error && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <Card className="max-w-md mx-4">
                            <CardContent className="p-6">
                                <Alert variant="destructive">
                                    <AlertIcon className="h-4 w-4" />
                                    <AlertTitle>Oh no, a hiccup!</AlertTitle>
                                    <AlertDescription className="mt-2">
                                        {error}
                                        <Button
                                            onClick={resetToInitial}
                                            variant="destructive"
                                            size="sm"
                                            className="mt-3 w-full"
                                        >
                                            Start over
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Bottom overlay for controls - only show when not loading or error */}
                {!isLoading && !error && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-overlay-bottom backdrop-blur-sm z-10">
                        {/* Current scene text display */}
                        {currentSceneText && (
                            <Card className="mb-4 bg-black/40 border-white/20 max-w-4xl mx-auto">
                                <CardContent className="p-4">
                                    <p className="text-white text-sm leading-relaxed max-h-20 overflow-y-auto scrollbar-overlay">
                                        <span className="font-semibold text-amber-300 text-shadow">
                                            Current Scene:{" "}
                                        </span>
                                        <span className="text-shadow">{currentSceneText}</span>
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action input form */}
                        <Card className="max-w-4xl mx-auto bg-black/40 border-white/20">
                            <CardContent className="p-6">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleContinueStoryInWorld();
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="user-action"
                                            className="block text-lg font-semibold text-white text-shadow-lg"
                                        >
                                            What happens next in {worldTheme || "this world"}?
                                        </label>
                                        <textarea
                                            id="user-action"
                                            value={currentUserAction}
                                            onChange={(e) => setCurrentUserAction(e.target.value)}
                                            placeholder="e.g., Explore the glowing cave, or Talk to the friendly dragon..."
                                            className={cn(
                                                "w-full p-3 border-2 border-white/30 rounded-lg shadow-sm",
                                                "focus:ring-2 focus:ring-amber-400 focus:border-amber-400",
                                                "transition-colors duration-200 resize-none",
                                                "bg-black/40 backdrop-blur-sm placeholder-white/60 text-white",
                                            )}
                                            rows={3}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={isLoading || !currentUserAction.trim()}
                                            variant="magic"
                                            size="lg"
                                            className="flex-1 text-shadow hover:glow-amber"
                                        >
                                            <MagicWandIcon className="w-5 h-5" />
                                            Continue Adventure!
                                        </Button>
                                        <Button
                                            onClick={resetToInitial}
                                            variant="ghost"
                                            size="lg"
                                            className="text-white/80 hover:text-white bg-black/30 hover:bg-black/50 border border-white/20 hover:border-white/40"
                                        >
                                            <HomeIcon className="w-4 h-4" />
                                            Exit World
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-bg via-amber-100 to-orange-100 text-brand-text font-sans flex flex-col items-center p-0 selection:bg-brand-primary selection:text-white">
            {apiKeyMissing && <ApiKeyMissingBanner />}

            <header className={cn("text-center my-8 sm:my-10 animate-fade-in", apiKeyMissing && "pt-12")}>
                <div className="flex items-center justify-center space-x-3">
                    <SparkleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-bounce-sm" />
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                        Story Spark
                    </h1>
                    <SparkleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-bounce-sm [animation-delay:-0.5s]" />
                </div>
                <p className="mt-3 text-lg sm:text-xl text-brand-soft-text">Let's weave a magical tale together!</p>
            </header>

            <Card className="w-full max-w-2xl bg-brand-light/80 backdrop-blur-md shadow-2xl ring-1 ring-primary/20">
                <CardContent className="p-6 sm:p-10">{renderContent()}</CardContent>
            </Card>

            <footer className="w-full max-w-2xl text-center py-8 mt-8 text-brand-soft-text text-sm">
                <p>&copy; {new Date().getFullYear()} Story Spark. Powered by imagination & AI.</p>
                {appMode === "story_direct" && <p className="text-xs mt-1">Story generated with Google Gemini.</p>}
                {appMode === "initial" && (
                    <p className="text-xs mt-1">
                        AI story generation by Google Gemini. Video adventures by Google Veo.
                    </p>
                )}
            </footer>
        </div>
    );
};

export default App;
