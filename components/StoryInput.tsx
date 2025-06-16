import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MagicWandIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface StoryInputProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

export const StoryInput: React.FC<StoryInputProps> = ({ onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
                <Label htmlFor="story-prompt" className="text-lg font-semibold text-brand-text">
                    Tell us your story idea to begin...
                </Label>
                <Textarea
                    id="story-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A curious squirrel who found a tiny, glowing map that led to a land of giant vegetables..."
                    className={cn(
                        "min-h-[120px] resize-none bg-white/70 border-2 border-amber-300",
                        "focus:border-primary focus:ring-2 focus:ring-primary/20",
                        "placeholder:text-brand-soft-text/70 text-brand-text",
                        "transition-colors duration-200",
                    )}
                    disabled={isLoading}
                    rows={4}
                />
            </div>
            <Button type="submit" disabled={isLoading || !prompt.trim()} variant="magic" size="lg" className="w-full">
                <MagicWandIcon className="w-5 h-5" />
                {isLoading ? "Brewing Magic..." : "Make Magic!"}
            </Button>
        </form>
    );
};
