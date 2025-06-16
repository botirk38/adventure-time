import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { BookOpenIcon, VolumeIcon } from "../icons";
import { AudioPlayer } from "../AudioPlayer";
import { generateSceneNarration } from "../../services/geminiService";

interface SceneTextCollapsibleProps {
    currentSceneText: string | null;
}

export const SceneTextCollapsible: React.FC<SceneTextCollapsibleProps> = ({ currentSceneText }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);

    // Cleanup audio URL when component unmounts
    useEffect(() => {
        const currentAudioUrl = audioUrl;
        return () => {
            if (currentAudioUrl && currentAudioUrl.startsWith("blob:")) {
                URL.revokeObjectURL(currentAudioUrl);
            }
        };
    }, [audioUrl]);

    // Reset when scene text changes
    useEffect(() => {
        setAudioUrl((prevAudioUrl) => {
            if (prevAudioUrl && prevAudioUrl.startsWith("blob:")) {
                URL.revokeObjectURL(prevAudioUrl);
            }
            return null;
        });
        setAudioError(null);
    }, [currentSceneText]);

    if (!currentSceneText) return null;

    const handleGenerateNarration = async () => {
        if (!currentSceneText || isGeneratingAudio) return;

        setIsGeneratingAudio(true);
        setAudioError(null);

        try {
            const { audioUrl: newAudioUrl } = await generateSceneNarration(currentSceneText);

            // Clean up previous audio URL
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            setAudioUrl(newAudioUrl);
        } catch (error) {
            console.error("Failed to generate narration:", error);
            setAudioError(error instanceof Error ? error.message : "Failed to generate narration");
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    return (
        <div className="absolute top-4 right-4 z-20">
            <Collapsible defaultOpen={false}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 rounded-full bg-black/80 border border-amber-400/40 backdrop-blur-md text-white hover:text-amber-300 hover:bg-amber-400/20 shadow-xl"
                    >
                        <BookOpenIcon className="h-4 w-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute top-12 right-0 w-80">
                    <Card className="bg-black/80 border-amber-400/40 backdrop-blur-md shadow-xl ring-2 ring-amber-400/20">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-sm font-semibold text-white/90">Current Scene</h3>
                                <Button
                                    onClick={handleGenerateNarration}
                                    disabled={isGeneratingAudio}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-amber-400/20 border border-amber-400/40 text-white hover:text-amber-300 hover:bg-amber-400/30"
                                >
                                    <VolumeIcon className="h-3 w-3 mr-1" />
                                    {isGeneratingAudio ? "Creating..." : "Narrate"}
                                </Button>
                            </div>

                            {audioUrl && (
                                <div className="mb-3">
                                    <AudioPlayer audioUrl={audioUrl} className="bg-black/30 rounded-lg p-2" />
                                </div>
                            )}

                            {audioError && (
                                <div className="mb-3 p-2 bg-red-900/20 border border-red-400/40 rounded-lg">
                                    <p className="text-xs text-red-300">Error: {audioError}</p>
                                </div>
                            )}

                            <blockquote className="border-l-4 border-amber-400/80 pl-4 text-white/90">
                                <p className="text-sm leading-relaxed italic font-medium text-shadow-sm">
                                    {currentSceneText}
                                </p>
                            </blockquote>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};
