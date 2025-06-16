import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MagicWandIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface StoryInputProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

const MIN_PROMPT_LENGTH = 10;
const MAX_PROMPT_LENGTH = 500;

export const StoryInput: React.FC<StoryInputProps> = ({ onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState<string>("");

    const isValidPrompt = useCallback((text: string): boolean => {
        const trimmed = text.trim();
        return trimmed.length >= MIN_PROMPT_LENGTH && trimmed.length <= MAX_PROMPT_LENGTH;
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const trimmedPrompt = prompt.trim();
            if (isValidPrompt(trimmedPrompt) && !isLoading) {
                onSubmit(trimmedPrompt);
            }
        },
        [prompt, isLoading, onSubmit, isValidPrompt],
    );

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
                <Label htmlFor="story-prompt" className="text-lg font-semibold text-brand-text">
                    Describe your story world to explore...
                </Label>
                <Textarea
                    id="story-prompt"
                    value={prompt}
                    onChange={handleInputChange}
                    placeholder="e.g., A magical forest where ancient trees whisper secrets and glowing mushrooms light the path..."
                    className={cn(
                        "min-h-[120px] resize-none bg-white/70 border-2 border-amber-300",
                        "focus:border-primary focus:ring-2 focus:ring-primary/20",
                        "placeholder:text-brand-soft-text/70 text-brand-text",
                        "transition-colors duration-200",
                        !isValidPrompt(prompt) && prompt.trim().length > 0 && "border-red-300 focus:border-red-500",
                    )}
                    disabled={isLoading}
                    rows={4}
                    maxLength={MAX_PROMPT_LENGTH}
                />
                {prompt.trim().length > 0 && (
                    <div className="flex justify-between items-center text-xs">
                        <span
                            className={cn(
                                "transition-colors",
                                isValidPrompt(prompt) ? "text-green-600" : "text-red-500",
                            )}
                        >
                            {prompt.trim().length < MIN_PROMPT_LENGTH
                                ? `Minimum ${MIN_PROMPT_LENGTH} characters required`
                                : isValidPrompt(prompt)
                                  ? "Perfect! Ready to create your world"
                                  : `Maximum ${MAX_PROMPT_LENGTH} characters allowed`}
                        </span>
                        <span className="text-brand-soft-text">
                            {prompt.length}/{MAX_PROMPT_LENGTH}
                        </span>
                    </div>
                )}
            </div>
            <Button
                type="submit"
                disabled={isLoading || !isValidPrompt(prompt)}
                variant="magic"
                size="lg"
                className="w-full"
            >
                <MagicWandIcon className="w-5 h-5" />
                {isLoading ? "Creating Your World..." : "Enter This World!"}
            </Button>
        </form>
    );
};
