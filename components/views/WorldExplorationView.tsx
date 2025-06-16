import React from "react";
import { Card, CardContent } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { VideoBackgroundDisplay } from "../VideoBackgroundDisplay";
import { LoadingSpinner } from "../LoadingSpinner";
import { SceneTextCollapsible } from "./SceneTextCollapsible";
import { ActionControls } from "./ActionControls";
import { AlertIcon } from "../icons";

interface WorldExplorationViewProps {
    currentSceneVideoUrl: string | null;
    currentSceneVideoMimeType: string | undefined;
    initialWorldDescription: string | null;
    currentSceneText: string | null;
    currentUserAction: string;
    onUserActionChange: (action: string) => void;
    onContinueStory: () => Promise<void>;
    onResetToInitial: () => void;
    worldTheme: string | null;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
}

export const WorldExplorationView: React.FC<WorldExplorationViewProps> = ({
    currentSceneVideoUrl,
    currentSceneVideoMimeType,
    initialWorldDescription,
    currentSceneText,
    currentUserAction,
    onUserActionChange,
    onContinueStory,
    onResetToInitial,
    worldTheme,
    isLoading,
    loadingMessage,
    error,
}) => {
    return (
        <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
            {/* Full-screen video background */}
            {currentSceneVideoUrl && (
                <VideoBackgroundDisplay
                    videoSrc={currentSceneVideoUrl}
                    type={currentSceneVideoMimeType}
                />
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
                            <p className="text-lg font-semibold text-center text-shadow-lg">
                                {loadingMessage}
                            </p>
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
                                        onClick={onResetToInitial}
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

            {/* Scene text collapsible - only show when not loading or error */}
            {!isLoading && !error && (
                <SceneTextCollapsible currentSceneText={currentSceneText} />
            )}

            {/* Action controls - only show when not loading or error */}
            {!isLoading && !error && (
                <ActionControls
                    currentUserAction={currentUserAction}
                    onUserActionChange={onUserActionChange}
                    onContinueStory={onContinueStory}
                    onResetToInitial={onResetToInitial}
                    worldTheme={worldTheme}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};
