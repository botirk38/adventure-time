import React, { useState, useEffect, useCallback } from "react";

import { Card, CardContent } from "./components/ui/card";
import { SparkleIcon } from "./components/icons";
import { InitialView } from "./components/views/InitialView";
import { WorldExplorationView } from "./components/views/WorldExplorationView";
import { LoadingState, ErrorState } from "./components/views/SharedStates";

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
    const renderContent = () => {
        if (state.isLoading) return <LoadingState message={state.loadingMessage} />;
        if (state.error) return <ErrorState error={state.error} onReset={resetToInitial} />;
        if (state.appMode === "initial") {
            return (
                <InitialView
                    onStorySubmit={handleStorySubmit}
                    onRandomizeWorld={handleRandomizeWorld}
                    isLoading={state.isLoading}
                />
            );
        }
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
            <WorldExplorationView
                currentSceneVideoUrl={state.currentSceneVideoUrl}
                currentSceneVideoMimeType={state.currentSceneVideoMimeType}
                initialWorldDescription={state.initialWorldDescription}
                currentSceneText={currentSceneText}
                currentUserAction={state.currentUserAction}
                onUserActionChange={(action) => updateState({ currentUserAction: action })}
                onContinueStory={handleContinueStoryInWorld}
                onResetToInitial={resetToInitial}
                worldTheme={state.worldTheme}
                isLoading={state.isLoading}
                loadingMessage={state.loadingMessage}
                error={state.error}
            />
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
