import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { MagicWandIcon, HomeIcon } from "../icons";
import { cn } from "../../lib/utils";

interface ActionControlsProps {
    currentUserAction: string;
    onUserActionChange: (action: string) => void;
    onContinueStory: () => Promise<void>;
    onResetToInitial: () => void;
    worldTheme: string | null;
    isLoading: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
    currentUserAction,
    onUserActionChange,
    onContinueStory,
    onResetToInitial,
    worldTheme,
    isLoading,
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onContinueStory();
    };

    return (
        <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="max-w-2xl mx-auto bg-black/60 border-white/20 backdrop-blur-md shadow-xl">
                <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-2">
                            <label
                                htmlFor="user-action"
                                className="block text-sm font-semibold text-white/90 text-shadow-sm"
                            >
                                What happens next in {worldTheme || "this world"}?
                            </label>
                            <textarea
                                id="user-action"
                                value={currentUserAction}
                                onChange={(e) => onUserActionChange(e.target.value)}
                                placeholder="e.g., Explore the glowing cave, or Talk to the friendly dragon..."
                                className={cn(
                                    "w-full p-3 border border-white/30 rounded-lg shadow-sm",
                                    "focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50",
                                    "transition-all duration-200 resize-none",
                                    "bg-black/40 backdrop-blur-sm placeholder-white/50 text-white text-sm",
                                    "hover:border-white/40",
                                )}
                                rows={2}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={isLoading || !currentUserAction.trim()}
                                variant="magic"
                                size="sm"
                                className="flex-1 text-sm text-shadow hover:glow-amber"
                            >
                                <MagicWandIcon className="w-4 h-4" />
                                Continue Adventure!
                            </Button>
                            <Button
                                onClick={onResetToInitial}
                                variant="ghost"
                                size="sm"
                                className="text-white/80 hover:text-white bg-black/30 hover:bg-black/50 border border-white/20 hover:border-white/40 text-sm"
                            >
                                <HomeIcon className="w-3 h-3" />
                                Exit
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
