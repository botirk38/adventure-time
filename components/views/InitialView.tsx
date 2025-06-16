import React from "react";
import { Button } from "../ui/button";
import { StoryInput } from "../StoryInput";
import { DiceIcon } from "../icons";

interface InitialViewProps {
    onStorySubmit: (prompt: string) => Promise<void>;
    onRandomizeWorld: () => Promise<void>;
    isLoading: boolean;
}

export const InitialView: React.FC<InitialViewProps> = ({
    onStorySubmit,
    onRandomizeWorld,
    isLoading,
}) => {
    return (
        <div className="space-y-8">
            <StoryInput onSubmit={onStorySubmit} isLoading={isLoading} />

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-amber-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-4 text-brand-soft-text font-medium">OR</span>
                </div>
            </div>

            <Button
                onClick={onRandomizeWorld}
                disabled={isLoading}
                variant="secondary"
                size="xl"
                className="w-full"
            >
                <DiceIcon className="w-6 h-6" />
                Surprise Me! (Random Video Adventure)
            </Button>
        </div>
    );
};
