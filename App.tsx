import React, { useState, useEffect, useCallback } from "react";
import { StoryInput } from "./components/StoryInput";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { VideoBackgroundDisplay } from "./components/VideoBackgroundDisplay";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { SparkleIcon, DiceIcon, MagicWandIcon, HomeIcon, AlertIcon } from "./components/icons";
import { cn } from "./lib/utils";

import {
    generateRandomWorldSetting,
    generateWorldSettingFromPrompt,
    continueStoryInWorld,
} from "./services/geminiService";

// Types
type AppMode = "initial" | "world_exploration";

interface AppState {
    appMode: AppMode;
    worldTheme: string | null;
    initialWorldDescription: string | null;
    currentSceneVideoUrl: string | null;
    currentSceneVideoMimeType: string | undefined;
    storyParts: string[];
    currentUserAction: string;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
}

// Constants
const LOADING_MESSAGES = {
    CREATING_WORLD: "Conjuring your story world and its sights (this may take a few minutes)...",
    RANDOM_WORLD: "Conjuring a random world and its sights (this may take a few minutes)...",
    CONTINUING_STORY: "Weaving the next part of your adventure and its video (this may take a few minutes)...",
} as const;

const ERROR_MESSAGES = {
    WORLD_CREATION: "An unexpected error occurred while creating your story world.",
    RANDOM_WORLD: "An unexpected error occurred while creating a new world.",
    STORY_CONTINUATION: "An unexpected error occurred while continuing the adventure.",
    MISSING_DETAILS: "Cannot continue: missing world details or your action.",
} as const;

const App: React.FC = () => {
    // State management
    const [state, setState] = useState<AppState>({
        appMode: "initial",
        worldTheme: null,
        initialWorldDescription: null,
        currentSceneVideoUrl: null,
        currentSceneVideoMimeType: undefined,
        storyParts: [],
        currentUserAction: "",
        isLoading: false,
        loadingMessage: "",
        error: null,
    });

    // Cleanup video URLs when they change
    useEffect(() => {
        const videoUrlToClean = state.currentSceneVideoUrl;
        return () => {
            if (videoUrlToClean?.startsWith("blob:")) {
                URL.revokeObjectURL(videoUrlToClean);
            }
        };
    }, [state.currentSceneVideoUrl]);

    // Helper functions
    const updateState = useCallback((updates: Partial<AppState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetToInitial = useCallback(() => {
        if (state.currentSceneVideoUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(state.currentSceneVideoUrl);
        }

        setState({
            appMode: "initial",
            worldTheme: null,
            initialWorldDescription: null,
            currentSceneVideoUrl: null,
            currentSceneVideoMimeType: undefined,
            storyParts: [],
            currentUserAction: "",
            isLoading: false,
            loadingMessage: "",
            error: null,
        });
    }, [state.currentSceneVideoUrl]);

    // Event handlers
    const handleStorySubmit = useCallback(
        async (prompt: string) => {
            if (!prompt?.trim()) {
                updateState({ error: "Please enter a story idea to continue." });
                return;
            }

            if (state.currentSceneVideoUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(state.currentSceneVideoUrl);
            }

            updateState({
                isLoading: true,
                loadingMessage: LOADING_MESSAGES.CREATING_WORLD,
                error: null,
                initialWorldDescription: null,
                currentSceneVideoUrl: null,
                currentSceneVideoMimeType: undefined,
                storyParts: [],
            });

            try {
                const { description, theme, videoUrl, videoMimeType } = await generateWorldSettingFromPrompt(prompt);

                updateState({
                    worldTheme: theme,
                    initialWorldDescription: description,
                    currentSceneVideoUrl: videoUrl,
                    currentSceneVideoMimeType: videoMimeType,
                    storyParts: [description],
                    appMode: "world_exploration",
                    isLoading: false,
                });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.WORLD_CREATION;
                updateState({
                    error: errorMessage,
                    isLoading: false,
                });
                console.error("Error creating story world:", err);
            }
        },
        [state.currentSceneVideoUrl, updateState],
    );

    const handleRandomizeWorld = useCallback(async () => {
        if (state.currentSceneVideoUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(state.currentSceneVideoUrl);
        }

        updateState({
            isLoading: true,
            loadingMessage: LOADING_MESSAGES.RANDOM_WORLD,
            error: null,
            initialWorldDescription: null,
            currentSceneVideoUrl: null,
            currentSceneVideoMimeType: undefined,
            storyParts: [],
        });

        try {
            const { description, theme, videoUrl, videoMimeType } = await generateRandomWorldSetting();

            updateState({
                worldTheme: theme,
                initialWorldDescription: description,
                currentSceneVideoUrl: videoUrl,
                currentSceneVideoMimeType: videoMimeType,
                storyParts: [description],
                appMode: "world_exploration",
                isLoading: false,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.RANDOM_WORLD;
            updateState({
                error: errorMessage,
                isLoading: false,
            });
            console.error("Error randomizing world:", err);
        }
    }, [state.currentSceneVideoUrl, updateState]);

    const handleContinueStoryInWorld = useCallback(async () => {
        const { worldTheme, initialWorldDescription, storyParts, currentUserAction, currentSceneVideoUrl } = state;

        if (!worldTheme || !initialWorldDescription || storyParts.length === 0 || !currentUserAction.trim()) {
            updateState({ error: ERROR_MESSAGES.MISSING_DETAILS });
            return;
        }

        updateState({
            isLoading: true,
            loadingMessage: LOADING_MESSAGES.CONTINUING_STORY,
            error: null,
        });

        try {
            const { nextSceneTextDescription, nextSceneVideoUrl, nextSceneVideoMimeType } = await continueStoryInWorld(
                worldTheme,
                initialWorldDescription,
                storyParts,
                currentUserAction.trim(),
            );

            if (currentSceneVideoUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(currentSceneVideoUrl);
            }

            updateState({
                storyParts: [
                    ...storyParts,
                    `\n\nYour action: ${currentUserAction.trim()}`,
                    `\n\n${nextSceneTextDescription}`,
                ],
                currentSceneVideoUrl: nextSceneVideoUrl,
                currentSceneVideoMimeType: nextSceneVideoMimeType,
                currentUserAction: "",
                isLoading: false,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.STORY_CONTINUATION;
            updateState({
                error: errorMessage,
                isLoading: false,
            });
            console.error("Error continuing story in world:", err);
        }
    }, [state, updateState]);

    // Render helpers
    const renderLoadingState = () => (
        <div className="mt-8 flex flex-col items-center justify-center text-primary animate-fade-in">
            <LoadingSpinner />
            <p className="mt-3 text-lg font-semibold text-center text-brand-text">{state.loadingMessage}</p>
        </div>
    );

    const renderErrorState = () => (
        <Alert variant="destructive" className="mt-6 animate-fade-in">
            <AlertIcon className="h-4 w-4" />
            <AlertTitle>Oh no, a hiccup!</AlertTitle>
            <AlertDescription className="mt-2">
                {state.error}
                <Button onClick={resetToInitial} variant="destructive" size="sm" className="mt-3">
                    Start over
                </Button>
            </AlertDescription>
        </Alert>
    );

    const renderInitialMode = () => (
        <div className="space-y-8">
            <StoryInput onSubmit={handleStorySubmit} isLoading={state.isLoading} />

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
                disabled={state.isLoading}
                variant="secondary"
                size="xl"
                className="w-full"
            >
                <DiceIcon className="w-6 h-6" />
                Surprise Me! (Random Video Adventure)
            </Button>
        </div>
    );

    const renderContent = () => {
        if (state.isLoading) return renderLoadingState();
        if (state.error) return renderErrorState();
        if (state.appMode === "initial") return renderInitialMode();
        if (state.appMode === "world_exploration" && (state.currentSceneVideoUrl || state.initialWorldDescription)) {
            return null; // Full-screen mode handled in main render
        }
        return null;
    };

    // Full-screen world exploration mode
    if (state.appMode === "world_exploration" && (state.currentSceneVideoUrl || state.initialWorldDescription)) {
        const currentSceneText =
            state.storyParts.length > 0 ? state.storyParts[state.storyParts.length - 1] : state.initialWorldDescription;

        return (
            <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
                {/* Full-screen video background */}
                {state.currentSceneVideoUrl && (
                    <VideoBackgroundDisplay
                        videoSrc={state.currentSceneVideoUrl}
                        type={state.currentSceneVideoMimeType}
                    />
                )}

                {/* Fallback background when no video */}
                {!state.currentSceneVideoUrl && state.initialWorldDescription && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                        <div className="text-center p-8 max-w-2xl">
                            <p className="text-white text-xl italic">Your world: {state.initialWorldDescription}</p>
                        </div>
                    </div>
                )}

                {/* Loading overlay */}
                {state.isLoading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                        <Card className="bg-black/60 border-white/20 text-white p-8">
                            <CardContent className="flex flex-col items-center space-y-4 p-0">
                                <LoadingSpinner />
                                <p className="text-lg font-semibold text-center text-shadow-lg">
                                    {state.loadingMessage}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Error overlay */}
                {state.error && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <Card className="max-w-md mx-4">
                            <CardContent className="p-6">
                                <Alert variant="destructive">
                                    <AlertIcon className="h-4 w-4" />
                                    <AlertTitle>Oh no, a hiccup!</AlertTitle>
                                    <AlertDescription className="mt-2">
                                        {state.error}
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
                {!state.isLoading && !state.error && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-transparent backdrop-blur-sm z-10">
                        {/* Current scene text display */}
                        {currentSceneText && (
                            <>
                                <blockquote className="mt-6 border-l-2 pl-6 italic">
                                    <span className="text-shadow">{currentSceneText}</span>
                                </blockquote>
                            </>
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
                                            What happens next in {state.worldTheme || "this world"}?
                                        </label>
                                        <textarea
                                            id="user-action"
                                            value={state.currentUserAction}
                                            onChange={(e) => updateState({ currentUserAction: e.target.value })}
                                            placeholder="e.g., Explore the glowing cave, or Talk to the friendly dragon..."
                                            className={cn(
                                                "w-full p-3 border-2 border-white/30 rounded-lg shadow-sm",
                                                "focus:ring-2 focus:ring-amber-400 focus:border-amber-400",
                                                "transition-colors duration-200 resize-none",
                                                "bg-black/40 backdrop-blur-sm placeholder-white/60 text-white",
                                            )}
                                            rows={3}
                                            disabled={state.isLoading}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={state.isLoading || !state.currentUserAction.trim()}
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
            <header className="text-center my-8 sm:my-10 animate-fade-in">
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
                <p className="text-xs mt-1">AI story generation by Google Gemini. Video adventures by Google Veo.</p>
            </footer>
        </div>
    );
};

export default App;
